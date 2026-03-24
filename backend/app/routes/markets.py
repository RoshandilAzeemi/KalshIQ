"""Markets API routes."""

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.engine.model_engine import compute_edge
from app.models.database import get_db
from app.models.pydantic_schemas import MarketResponse, MarketsListResponse
from app.models.schemas import Market

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/markets", tags=["Markets"])


@router.get("", response_model=MarketsListResponse)
def list_markets(
    status: str | None = Query(None, description="Filter by market status"),
    category: str | None = Query(None, description="Filter by category"),
    search: str | None = Query(None, description="Search in title"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> MarketsListResponse:
    """List all markets with computed edge indicators."""
    query = db.query(Market)

    if status:
        query = query.filter(Market.status == status)
    if category:
        query = query.filter(Market.category == category)
    if search:
        query = query.filter(Market.title.ilike(f"%{search}%"))

    total = query.count()
    markets = query.order_by(Market.volume.desc()).offset(offset).limit(limit).all()

    results = []
    for m in markets:
        edge = compute_edge(
            ticker=m.ticker,
            yes_price=m.yes_price,
            volume=m.volume,
            open_interest=m.open_interest,
        )
        results.append(
            MarketResponse(
                ticker=m.ticker,
                event_ticker=m.event_ticker,
                title=m.title,
                subtitle=m.subtitle,
                yes_price=m.yes_price,
                no_price=m.no_price,
                yes_bid=m.yes_bid,
                yes_ask=m.yes_ask,
                volume=m.volume,
                open_interest=m.open_interest,
                status=m.status,
                category=m.category,
                close_time=m.close_time,
                fair_price=edge.fair_price,
                edge_pct=edge.edge_pct,
                signal=edge.signal,
                last_synced_at=m.last_synced_at,
            )
        )

    return MarketsListResponse(markets=results, total=total)


@router.get("/{ticker}", response_model=MarketResponse)
def get_market(
    ticker: str,
    db: Session = Depends(get_db),
) -> MarketResponse:
    """Get a single market with edge computation."""
    market = db.query(Market).filter(Market.ticker == ticker).first()
    if not market:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail=f"Market '{ticker}' not found.")

    edge = compute_edge(
        ticker=market.ticker,
        yes_price=market.yes_price,
        volume=market.volume,
        open_interest=market.open_interest,
    )

    return MarketResponse(
        ticker=market.ticker,
        event_ticker=market.event_ticker,
        title=market.title,
        subtitle=market.subtitle,
        yes_price=market.yes_price,
        no_price=market.no_price,
        yes_bid=market.yes_bid,
        yes_ask=market.yes_ask,
        volume=market.volume,
        open_interest=market.open_interest,
        status=market.status,
        category=market.category,
        close_time=market.close_time,
        fair_price=edge.fair_price,
        edge_pct=edge.edge_pct,
        signal=edge.signal,
        last_synced_at=market.last_synced_at,
    )
