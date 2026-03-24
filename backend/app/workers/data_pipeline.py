"""Background data pipeline worker.

Polls Kalshi Demo API endpoints (/markets and /trades) at a configurable
interval, then upserts the results into PostgreSQL.

Uses APScheduler for reliable, non-blocking periodic execution.
"""

import logging
from datetime import datetime, timezone

import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.auth.kalshi_auth import sign_request
from app.config import settings
from app.models.database import SessionLocal
from app.models.schemas import Market, Trade

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


async def _fetch_markets(client: httpx.AsyncClient) -> list[dict]:
    """Fetch markets from the Kalshi API.

    Args:
        client: Async HTTP client.

    Returns:
        List of market dictionaries from the API response.
    """
    path = "/trade-api/v2/markets"
    url = f"{settings.kalshi_base_url.rstrip('/')}/markets"

    try:
        headers = sign_request("GET", path)
    except RuntimeError:
        headers = {"Content-Type": "application/json"}
        logger.warning("Signing unavailable; making unsigned request.")

    try:
        response = await client.get(url, headers=headers, params={"limit": 100})
        response.raise_for_status()
        data = response.json()
        return data.get("markets", [])
    except httpx.HTTPError:
        logger.exception("Failed to fetch markets from Kalshi API.")
        return []


async def _fetch_trades(client: httpx.AsyncClient, ticker: str = "") -> list[dict]:
    """Fetch recent trades from the Kalshi API.

    Args:
        client: Async HTTP client.
        ticker: Optional ticker to filter trades.

    Returns:
        List of trade dictionaries from the API response.
    """
    path = "/trade-api/v2/markets/trades"
    url = f"{settings.kalshi_base_url.rstrip('/')}/markets/trades"

    try:
        headers = sign_request("GET", path)
    except RuntimeError:
        headers = {"Content-Type": "application/json"}
        logger.warning("Signing unavailable; making unsigned request.")

    params: dict = {"limit": 100}
    if ticker:
        params["ticker"] = ticker

    try:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("trades", [])
    except httpx.HTTPError:
        logger.exception("Failed to fetch trades from Kalshi API.")
        return []


def _upsert_markets(markets_data: list[dict]) -> int:
    """Upsert market records into PostgreSQL.

    Args:
        markets_data: List of market dictionaries from the API.

    Returns:
        Number of rows upserted.
    """
    if not markets_data:
        return 0

    db = SessionLocal()
    count = 0
    try:
        for m in markets_data:
            stmt = pg_insert(Market).values(
                ticker=m.get("ticker", ""),
                event_ticker=m.get("event_ticker", ""),
                title=m.get("title", ""),
                subtitle=m.get("subtitle"),
                yes_price=m.get("yes_price", 0),
                no_price=m.get("no_price", 0),
                yes_bid=m.get("yes_bid", 0),
                yes_ask=m.get("yes_ask", 0),
                volume=m.get("volume", 0),
                open_interest=m.get("open_interest", 0),
                status=m.get("status", "open"),
                category=m.get("category"),
                close_time=m.get("close_time"),
                last_synced_at=datetime.now(timezone.utc),
            ).on_conflict_do_update(
                index_elements=["ticker"],
                set_={
                    "title": m.get("title", ""),
                    "subtitle": m.get("subtitle"),
                    "yes_price": m.get("yes_price", 0),
                    "no_price": m.get("no_price", 0),
                    "yes_bid": m.get("yes_bid", 0),
                    "yes_ask": m.get("yes_ask", 0),
                    "volume": m.get("volume", 0),
                    "open_interest": m.get("open_interest", 0),
                    "status": m.get("status", "open"),
                    "category": m.get("category"),
                    "close_time": m.get("close_time"),
                    "last_synced_at": datetime.now(timezone.utc),
                },
            )
            db.execute(stmt)
            count += 1
        db.commit()
        logger.info("Upserted %d markets.", count)
    except Exception:
        db.rollback()
        logger.exception("Failed to upsert markets.")
    finally:
        db.close()

    return count


def _upsert_trades(trades_data: list[dict]) -> int:
    """Upsert trade records into PostgreSQL.

    Args:
        trades_data: List of trade dictionaries from the API.

    Returns:
        Number of rows upserted.
    """
    if not trades_data:
        return 0

    db = SessionLocal()
    count = 0
    try:
        for t in trades_data:
            traded_at = t.get("created_time") or datetime.now(timezone.utc).isoformat()
            stmt = pg_insert(Trade).values(
                trade_id=t.get("trade_id", ""),
                ticker=t.get("ticker", ""),
                price=t.get("yes_price", t.get("price", 0)),
                count=t.get("count", 1),
                side=t.get("side", "yes"),
                taker_side=t.get("taker_side"),
                traded_at=traded_at,
            ).on_conflict_do_nothing(index_elements=["trade_id"])
            db.execute(stmt)
            count += 1
        db.commit()
        logger.info("Upserted %d trades.", count)
    except Exception:
        db.rollback()
        logger.exception("Failed to upsert trades.")
    finally:
        db.close()

    return count


async def poll_kalshi_data() -> None:
    """Main polling function: fetches markets and trades, upserts to DB."""
    logger.info("Starting Kalshi data poll cycle...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        markets = await _fetch_markets(client)
        _upsert_markets(markets)

        trades = await _fetch_trades(client)
        _upsert_trades(trades)

    logger.info("Poll cycle complete.")


def _sync_poll_wrapper() -> None:
    """Synchronous wrapper for the async poll function (APScheduler compat)."""
    import asyncio

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                pool.submit(asyncio.run, poll_kalshi_data()).result()
        else:
            loop.run_until_complete(poll_kalshi_data())
    except RuntimeError:
        asyncio.run(poll_kalshi_data())


def start_pipeline() -> None:
    """Start the background data pipeline scheduler."""
    interval = settings.poll_interval_seconds
    scheduler.add_job(
        _sync_poll_wrapper,
        "interval",
        seconds=interval,
        id="kalshi_data_pipeline",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Data pipeline started (polling every %ds).", interval)


def stop_pipeline() -> None:
    """Gracefully shut down the pipeline scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Data pipeline stopped.")
