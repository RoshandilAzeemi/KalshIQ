"""Recommendations API routes — model engine output."""

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.engine.model_engine import compute_edge
from app.models.database import get_db
from app.models.pydantic_schemas import (
    RecommendationResponse,
    RecommendationsListResponse,
)
from app.models.schemas import Market

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("", response_model=RecommendationsListResponse)
def list_recommendations(
    signal: str | None = Query(None, description="Filter by signal (BUY/SELL/HOLD)"),
    min_edge: float | None = Query(None, description="Minimum absolute edge %"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> RecommendationsListResponse:
    """Get model engine recommendations ranked by absolute edge.

    Computes edge on-the-fly from the latest market data.
    """
    markets = (
        db.query(Market)
        .filter(Market.status == "open")
        .order_by(Market.volume.desc())
        .limit(200)
        .all()
    )

    recommendations = []
    for m in markets:
        edge = compute_edge(
            ticker=m.ticker,
            yes_price=m.yes_price,
            volume=m.volume,
            open_interest=m.open_interest,
        )

        if signal and edge.signal != signal.upper():
            continue
        if min_edge is not None and abs(edge.edge_pct) < min_edge:
            continue

        recommendations.append(
            RecommendationResponse(
                ticker=m.ticker,
                market_price=edge.market_price,
                fair_price=edge.fair_price,
                edge_pct=edge.edge_pct,
                signal=edge.signal,
                confidence=edge.confidence,
                reasoning=edge.reasoning,
                is_active=True,
                updated_at=m.last_synced_at,
            )
        )

    # Sort by absolute edge descending
    recommendations.sort(key=lambda r: abs(r.edge_pct), reverse=True)
    recommendations = recommendations[:limit]

    return RecommendationsListResponse(
        recommendations=recommendations,
        total=len(recommendations),
    )
