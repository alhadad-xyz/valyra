# Valuation Agent

A comprehensive Python uAgent that continuously polls the ListingRegistry canister for new and updated business listings, triggers valuations via the ValuationEngine canister, and caches results in Redis.

## Features

- **Continuous Polling**: Polls ListingRegistry every 5 minutes for new/updated listings
- **Smart Caching**: Uses Redis to cache valuation results and avoid unnecessary API calls  
- **Error Handling**: Robust retry logic with exponential backoff
- **Health Monitoring**: Built-in health check endpoint and Prometheus metrics
- **Structured Logging**: JSON-structured logs for better observability
- **Configuration**: Environment variable-based configuration
- **Docker Support**: Ready-to-deploy with Docker Compose

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│ ListingRegistry │◄───┤ ValuationAgent   ├───►│ ValuationEngine │
│    Canister     │    │                  │    │    Canister     │
│                 │    │                  │    │                 │
└─────────────────┘    └─────────┬────────┘    └─────────────────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │                 │
                       │     Redis       │
                       │     Cache       │
                       │                 │
                       └─────────────────┘
```

## Requirements

- Python 3.11+
- Redis server
- Access to ICP canisters (ListingRegistry and ValuationEngine)

## Installation

1. **Clone and Setup Environment**
   ```bash
   cd agents/
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Redis**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   
   # Or using local Redis installation
   redis-server
   ```

## Configuration

All configuration is done via environment variables. See `.env.example` for available options:

| Variable | Default | Description |
|----------|---------|-------------|
| `LISTING_REGISTRY_URL` | `http://localhost:4943/api/v2/canisters/listing_registry` | ListingRegistry canister URL |
| `VALUATION_ENGINE_URL` | `http://localhost:4943/api/v2/canisters/valuation_engine` | ValuationEngine canister URL |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `POLLING_INTERVAL` | `300` | Polling interval in seconds (5 minutes) |
| `MAX_RETRIES` | `3` | Maximum number of retries for failed requests |
| `CACHE_TTL` | `3600` | Cache time-to-live in seconds (1 hour) |
| `HEALTH_CHECK_PORT` | `8080` | Port for health check endpoint |
| `METRICS_PORT` | `8090` | Port for Prometheus metrics |

## Running

### Development
```bash
python valuation_agent.py
```

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

This starts:
- Valuation Agent on ports 8080 (health), 8090 (metrics), 8001 (uAgent)
- Redis server on port 6379

## API Endpoints

### Health Check
```bash
GET http://localhost:8080/health
```

Returns agent status, Redis connectivity, and processing statistics.

### Metrics
```bash  
GET http://localhost:8090/metrics
```

Prometheus-formatted metrics including:
- `valuation_agent_listings_processed_total` - Total listings processed
- `valuation_agent_valuation_requests_total` - Total valuation requests
- `valuation_agent_polling_duration_seconds` - Polling cycle duration
- `valuation_agent_cached_valuations` - Number of cached valuations
- `valuation_agent_redis_operations_total` - Redis operation counters

## Data Flow

1. **Polling**: Agent calls `list_ids` on ListingRegistry every 5 minutes
2. **Processing**: For each listing ID:
   - Fetches detailed listing data via `get_deal`
   - Checks Redis cache for existing valuation
   - If no cache or listing updated since last valuation:
     - Calls ValuationEngine `calculate_valuation_from_deal`
     - Caches result in Redis
3. **Monitoring**: Logs operations and updates metrics

## Monitoring

### Health Monitoring
The agent provides a comprehensive health check at `/health` that includes:
- Overall status (healthy/degraded)
- Redis connectivity
- Last polling time
- Processing statistics
- Error counts

### Metrics Collection
Prometheus metrics are exposed on port 8090, tracking:
- Processing throughput
- Error rates
- Response times
- Cache hit/miss rates
- Redis operations

### Logging
Structured JSON logging includes:
- Timestamp and log level
- Processing events and durations
- Error details with context
- Performance metrics

## Error Handling

The agent implements robust error handling:

- **Retry Logic**: Failed requests are retried up to 3 times with exponential backoff
- **Circuit Breaker**: Redis failures are gracefully handled without stopping the agent
- **Graceful Degradation**: Agent continues operating even if Redis is unavailable
- **Error Tracking**: All errors are logged and counted for monitoring

## Testing

Run the test suite:
```bash
pytest tests/ -v
```

Tests cover:
- Agent initialization
- Listing retrieval and processing
- Valuation engine integration
- Cache operations
- Error handling scenarios
- Health check endpoints

## Deployment

### Docker Deployment
1. Ensure your ICP canisters are accessible from the container
2. Update `docker-compose.yml` with correct canister URLs
3. Run: `docker-compose up -d`

### Production Considerations
- Set up proper Redis persistence and clustering
- Configure log aggregation (ELK stack, etc.)
- Set up monitoring alerts on key metrics
- Use secrets management for sensitive configuration
- Consider running multiple agent instances for high availability

## Troubleshooting

### Common Issues

**Agent not processing listings**
- Check ListingRegistry connectivity
- Verify Redis is running and accessible
- Check logs for authentication/permission errors

**High error rates**
- Monitor canister response times
- Check Redis memory usage
- Verify network connectivity to canisters

**Memory issues**
- Adjust cache TTL settings
- Monitor Redis memory usage
- Consider implementing cache eviction policies

### Debug Commands
```bash
# Check agent health
curl http://localhost:8080/health

# View metrics
curl http://localhost:8090/metrics

# Check Redis cache
redis-cli keys "valuation:*"

# View agent logs
docker-compose logs valuation-agent
```

## Architecture Decisions

### Why Redis?
- High-performance caching layer
- Reduces load on ValuationEngine canister
- Supports expiration and memory management
- Industry-standard for this use case

### Why uAgents Framework?
- Purpose-built for autonomous agent development
- Built-in wallet and identity management
- Event-driven architecture
- Good integration with blockchain ecosystems

### Why 5-minute Polling?
- Balances freshness with system load
- Allows for timely valuation updates
- Configurable for different environments
- Reasonable default for most use cases