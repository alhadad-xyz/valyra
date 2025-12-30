"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import health_router, auth, listings_router, users_router, upload, agent_router, valuation_router
from app import __version__

# Create FastAPI application
app = FastAPI(
    title="Valyra Backend API",
    description="AI-powered M&A marketplace for digital assets on Base L2",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import asyncio
from app.services.indexer import indexer

# Startup event
@app.on_event("startup")
async def startup_event():
    """Execute on application startup."""
    print(f"🚀 Valyra Backend API v{__version__} starting...")
    print(f"📊 Environment: {settings.environment}")
    print(f"🔗 Database: {str(settings.database_url).split('@')[1] if '@' in str(settings.database_url) else 'configured'}")
    
    # Start Indexer
    asyncio.create_task(indexer.start())


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown."""
    print("👋 Valyra Backend API shutting down...")


# Register routers
app.include_router(health_router, prefix=settings.api_v1_prefix)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(listings_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)
app.include_router(upload.router, prefix=settings.api_v1_prefix)
app.include_router(agent_router, prefix=settings.api_v1_prefix)
app.include_router(valuation_router, prefix=settings.api_v1_prefix)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Valyra Backend API",
        "version": __version__,
        "docs": "/docs",
        "health": f"{settings.api_v1_prefix}/health"
    }
