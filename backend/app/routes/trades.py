"""Trades API routes."""

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.pydantic_schemas import TradeResponse, TradesListResponse
from app.models.schemas import Trade

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/trades", tags=["Trades"])


@router.get("", response_model=TradesListResponse)
def list_trades(
    ticker: str | None = Query(None, description="Filter by market ticker"),
    side: str | None = Query(None, description="Filter by side (yes/no)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> TradesListResponse:
    """List recent trades with optional filtering."""
    query = db.query(Trade)

    if ticker:
        query = query.filter(Trade.ticker == ticker)
    if side:
        query = query.filter(Trade.side == side)

    total = query.count()
    trades = query.order_by(Trade.traded_at.desc()).offset(offset).limit(limit).all()

    results = [
        TradeResponse(
            trade_id=t.trade_id,
            ticker=t.ticker,
            price=t.price,
            count=t.count,
            side=t.side,
            taker_side=t.taker_side,
            traded_at=t.traded_at,
        )
        for t in trades
    ]

    return TradesListResponse(trades=results, total=total)
