# Valyra Backend API

AI-powered M&A marketplace backend built with FastAPI, running on Base L2.

## 🚀 Features

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **PostgreSQL** - Primary database (Supabase)
- **Google Gemini** - AI valuation and analysis
- **Web3** - Blockchain integration with Base L2
- **Pytest** - Testing framework

## 📋 Prerequisites

- Python 3.11+
- Poetry (dependency management)
- PostgreSQL database (or Supabase account)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd apps/backend
poetry install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `GEMINI_API_KEY` - Google Gemini API key
- `SECRET_KEY` - Secret key for JWT tokens

### 3. Run Database Migrations

```bash
# Create initial migration
poetry run alembic revision --autogenerate -m "Initial schema"

# Apply migrations
poetry run alembic upgrade head
```

### 4. Start Development Server

```bash
poetry run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test file
poetry run pytest tests/test_health.py -v
```

## 📁 Project Structure

```
apps/backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── offer.py
│   │   ├── escrow.py
│   │   └── verification.py
│   ├── routes/              # API endpoints
│   │   └── health.py
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── middleware/          # Custom middleware
├── alembic/                 # Database migrations
├── tests/                   # Test suite
├── pyproject.toml           # Poetry dependencies
└── .env.example             # Environment template
```

## 🗄️ Database Schema

### Core Tables

- **users** - Platform users (buyers and sellers)
- **listings** - Digital assets for sale
- **offers** - Buyer offers on listings
- **escrows** - On-chain escrow tracking
- **verification_records** - Asset verification history

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_KEY` | Supabase anon key | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `SECRET_KEY` | JWT secret key | ✅ |
| `BASE_RPC_URL` | Base L2 RPC endpoint | ✅ |
| `PINATA_API_KEY` | IPFS Pinata API key | ⬜ |
| `ARWEAVE_WALLET_PATH` | Arweave wallet file path | ⬜ |

## 🚢 Deployment

### Koyeb

Koyeb provides easy deployment with Docker, free tier, and automatic scaling.

#### Quick Setup

**Using Koyeb Dashboard:**

1. Push code to GitHub
2. Go to [Koyeb Dashboard](https://app.koyeb.com)
3. Click "Create App"
4. Connect GitHub repository
5. Set build context: `apps/backend`
6. Add PostgreSQL database
7. Set environment variables
8. Click "Deploy"

**📖 For detailed instructions, see [KOYEB_DEPLOYMENT.md](./KOYEB_DEPLOYMENT.md)**

#### Environment Variables

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `PORT` | Application port | ✅ |
| `DATABASE_URL` | PostgreSQL connection | ✅ |
| `KOYEB` | Platform indicator | ✅ |
| All others from `.env.example` | API keys, config | ⬜ |

---

### Docker

```bash
# Build image
docker build -t valyra-backend .

# Run container
docker run -p 8000:8000 --env-file .env valyra-backend
```

## 📝 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   poetry run pytest
   ```

3. **Format code**
   ```bash
   poetry run black app tests
   poetry run ruff check app tests
   ```

4. **Create migration if needed**
   ```bash
   poetry run alembic revision --autogenerate -m "Description"
   poetry run alembic upgrade head
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature"
   git push origin feature/your-feature
   ```

## 🔗 Related Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 📄 License

MIT
