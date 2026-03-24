"""KalshIQ — FastAPI Application Entry Point.

Quantitative Research and Execution Platform for Kalshi event contracts.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.pydantic_schemas import HealthResponse
from app.routes import markets, recommendations, trades
from app.workers.data_pipeline import start_pipeline, stop_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: start/stop background workers."""
    logger.info("KalshIQ starting up...")
    start_pipeline()
    yield
    logger.info("KalshIQ shutting down...")
    stop_pipeline()


app = FastAPI(
    title="KalshIQ",
    description="Quantitative Research and Execution Platform for Kalshi event contracts.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(markets.router)
app.include_router(trades.router)
app.include_router(recommendations.router)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse()
