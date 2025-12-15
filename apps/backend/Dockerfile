FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy dependency files from monorepo
COPY apps/backend/pyproject.toml apps/backend/poetry.lock* ./

# Configure Poetry to not create virtual environment
RUN poetry config virtualenvs.create false

# Copy application code from monorepo first
COPY apps/backend/ .

# Install dependencies only (no need to install as package for an application)
RUN poetry install --only main --no-interaction --no-ansi --no-root

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
