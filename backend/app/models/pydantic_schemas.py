"""Pydantic response models for API serialization."""

from datetime import datetime

from pydantic import BaseModel, Field


class MarketResponse(BaseModel):
    """Serialized market data with model engine annotations."""

    ticker: str
    event_ticker: str
    title: str
    subtitle: str | None = None
    yes_price: float
    no_price: float
    yes_bid: float
    yes_ask: float
    volume: int
    open_interest: int
    status: str
    category: str | None = None
    close_time: datetime | None = None
    fair_price: float | None = None
    edge_pct: float | None = None
    signal: str | None = None
    last_synced_at: datetime | None = None

    model_config = {"from_attributes": True}


class TradeResponse(BaseModel):
    """Serialized trade record."""

    trade_id: str
    ticker: str
    price: float
    count: int
    side: str
    taker_side: str | None = None
    traded_at: datetime

    model_config = {"from_attributes": True}


class RecommendationResponse(BaseModel):
    """Serialized model engine recommendation."""

    ticker: str
    market_price: float
    fair_price: float
    edge_pct: float
    signal: str
    confidence: float
    reasoning: str | None = None
    is_active: bool = True
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class MarketsListResponse(BaseModel):
    """Paginated list of markets."""

    markets: list[MarketResponse]
    total: int


class TradesListResponse(BaseModel):
    """Paginated list of trades."""

    trades: list[TradeResponse]
    total: int


class RecommendationsListResponse(BaseModel):
    """List of recommendations."""

    recommendations: list[RecommendationResponse]
    total: int


class HealthResponse(BaseModel):
    """API health check response."""

    status: str = "ok"
    version: str = "0.1.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
