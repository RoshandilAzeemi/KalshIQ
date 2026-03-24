"""SQLAlchemy ORM models for KalshIQ database tables."""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class Market(Base):
    """Represents a Kalshi event contract market."""

    __tablename__ = "markets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    event_ticker: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    subtitle: Mapped[str | None] = mapped_column(Text, nullable=True)
    yes_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    no_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    yes_bid: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    yes_ask: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    volume: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    open_interest: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="open")
    category: Mapped[str | None] = mapped_column(String(128), nullable=True)
    close_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return f"<Market ticker={self.ticker} yes={self.yes_price} no={self.no_price}>"


class Trade(Base):
    """Represents a single trade execution on a Kalshi market."""

    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trade_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    ticker: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    side: Mapped[str] = mapped_column(String(8), nullable=False)  # "yes" or "no"
    taker_side: Mapped[str | None] = mapped_column(String(8), nullable=True)
    traded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return f"<Trade id={self.trade_id} ticker={self.ticker} price={self.price}>"


class Recommendation(Base):
    """Model engine output: fair prices, edge calculations, and trade signals."""

    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    market_price: Mapped[float] = mapped_column(Float, nullable=False)
    fair_price: Mapped[float] = mapped_column(Float, nullable=False)
    edge_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    signal: Mapped[str] = mapped_column(String(8), nullable=False, default="HOLD")
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return f"<Recommendation ticker={self.ticker} signal={self.signal} edge={self.edge_pct}%>"
