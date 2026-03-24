<h1 align="center">
  <br>
  <strong>KalshIQ</strong>
  <br>
  <sub>Quantitative Research &amp; Execution Platform</sub>
  <br>
</h1>

<p align="center">
  <em>A professional-grade trading platform for Kalshi event contracts, combining real-time market data, model-driven fair-price estimation, and edge analysis in a high-density dashboard.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/UI-shadcn%2Fui-000?style=flat-square" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/ML-XGBoost-blue?style=flat-square" alt="XGBoost" />
</p>

---

## Architecture

```
KalshIQ/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── auth/              # RSA-PSS Kalshi API authentication
│   │   │   └── kalshi_auth.py
│   │   ├── engine/            # "The Brain" — model engine
│   │   │   └── model_engine.py
│   │   ├── models/            # SQLAlchemy ORM + Pydantic schemas
│   │   │   ├── database.py
│   │   │   ├── schemas.py
│   │   │   └── pydantic_schemas.py
│   │   ├── routes/            # API endpoints
│   │   │   ├── markets.py
│   │   │   ├── trades.py
│   │   │   └── recommendations.py
│   │   ├── workers/           # Background data pipeline
│   │   │   └── data_pipeline.py
│   │   ├── config.py
│   │   └── main.py
│   ├── alembic/               # Database migrations
│   └── requirements.txt
├── frontend/                  # Next.js dashboard
│   └── src/
│       ├── app/               # App Router pages
│       ├── components/
│       │   ├── dashboard/     # Trading dashboard components
│       │   └── ui/            # shadcn/ui components
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # API client, utilities
│       └── types/             # TypeScript type definitions
└── .agent/rules/              # Coding standards
```

## Core Features

| Feature | Description |
|---------|-------------|
| **RSA-PSS Auth** | Secure Kalshi API authentication using private key signing — no secrets exposed |
| **Data Pipeline** | Background worker polls `/markets` and `/trades` endpoints, upserts to PostgreSQL |
| **Model Engine** | Pluggable "Brain" with fair-price estimation, sentiment analysis, and XGBoost prediction stubs |
| **Edge Indicator** | Visual delta between model prediction and market price — color-coded BUY/SELL/HOLD signals |
| **Recommendation Sidebar** | Top opportunities ranked by absolute edge with confidence scoring |
| **Low-Latency Updates** | 5-second polling with optimistic UI and skeleton loading states |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database URL and Kalshi API credentials
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard at `http://localhost:3000`.

## The Model Engine

The `model_engine.py` module ("The Brain") is designed for easy extension:

- **`calculate_fair_price()`** — Replace the stub with a trained XGBoost/LightGBM model.
- **`run_sentiment_analysis()`** — Plug in OpenAI or a local LLM for event-text sentiment.
- **`run_xgboost_prediction()`** — Load a serialized model and run feature-engineered inference.
- **`compute_edge()`** — Orchestrates the above to output edge and trading signals.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KALSHI_API_KEY_ID` | Kalshi API key identifier | — |
| `KALSHI_PRIVATE_KEY_PATH` | Path to RSA private key file | — |
| `KALSHI_BASE_URL` | API base URL | `https://demo-api.kalshi.co/trade-api/v2` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://kalshiq:kalshiq@localhost:5432/kalshiq` |
| `POLL_INTERVAL_SECONDS` | Pipeline polling interval | `30` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

## Tech Stack

- **Backend**: FastAPI · SQLAlchemy · Alembic · APScheduler · httpx · cryptography
- **Frontend**: Next.js 15 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui
- **ML**: XGBoost · scikit-learn (placeholder for production models)
- **Database**: PostgreSQL with UPSERT-based data pipeline

## License

Private — All rights reserved.
