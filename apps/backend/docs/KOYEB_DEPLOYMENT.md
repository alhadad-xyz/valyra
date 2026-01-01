# Koyeb Deployment Guide for Valyra Backend

This guide walks you through deploying the Valyra backend to Koyeb with a managed PostgreSQL database.

## 📋 Prerequisites

1. **Koyeb Account**: Sign up at [koyeb.com](https://www.koyeb.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Environment Variables**: Have all required API keys ready

## 🚀 Quick Start

### Deploy Using Koyeb Dashboard

1. **Go to Koyeb Dashboard**
   - Visit [app.koyeb.com](https://app.koyeb.com)
   - Click "Create App"

2. **Connect GitHub Repository**
   - Select "GitHub" as deployment method
   - Authorize Koyeb to access your repository
   - Select `alhadad-xyz/valyra` repository
   - **Build Context**: Leave empty or set to `/` (Root directory)

3. **Configure Build Settings**
   - **Builder**: Docker
   - **Dockerfile location**: `apps/backend/Dockerfile`
   - **Privileged**: Uncheck
   - **Build command**: (leave empty)

4. **Configure Service**
   - **Service name**: `valyra-backend`
   - **Instance type**: Free (Nano) or Starter
   - **Regions**: Choose closest to your users
   - **Port**: 8000
   - **Health check path**: `/health`

5. **Add PostgreSQL Database**
   - Click "Add Database"
   - Select "PostgreSQL"
   - **Database name**: `valyra`
   - **Plan**: Free or Starter
   - Koyeb will automatically inject `DATABASE_URL`

6. **Set Environment Variables**
   
   Click "Environment Variables" and add:
   
   ```bash
   # API Keys (REQUIRED)
   GEMINI_API_KEY=your-gemini-api-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   SECRET_KEY=your-secret-key-min-32-chars
   
   # App Configuration
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   API_V1_PREFIX=/api/v1
   
   # Web3
   BASE_RPC_URL=https://mainnet.base.org
   BASE_CHAIN_ID=8453
   
   # Security
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Platform
   PLATFORM_FEE_PERCENTAGE=2.5
   
   # CORS (update with your frontend domain)
   CORS_ORIGINS=https://your-frontend-domain.com
   
   # Optional
   COINBASE_AGENTKIT_KEY=your-coinbase-key
   PINATA_API_KEY=your-pinata-key
   PINATA_SECRET_KEY=your-pinata-secret
   ```

7. **Deploy**
   - Click "Deploy"
   - Koyeb will build and deploy automatically
   - Wait for deployment to complete (~2-5 minutes)

8. **Database Migrations**
   
   Migrations are run automatically on every deployment! 🚀
   
   The `Dockerfile` is configured to run `alembic upgrade head` before starting the application, so your database schema will always be up to date.

## 🔍 Verification

### Check Deployment Status

1. **Dashboard**
   - Go to your app in Koyeb dashboard
   - Check deployment status (should be "Healthy")

2. **Logs**
   - Click "Logs" tab
   - Verify no errors
   - Look for "Uvicorn running on http://0.0.0.0:8000"

3. **Health Check**
   ```bash
   curl https://valyra-backend-<your-org>.koyeb.app/api/v1/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-12-15T02:13:00Z"
   }
   ```

4. **API Documentation**
   - Swagger UI: `https://valyra-backend-<your-org>.koyeb.app/docs`
   - ReDoc: `https://valyra-backend-<your-org>.koyeb.app/redoc`

5. **Database Connection**
   - Check logs for database connection messages
   - Verify no connection errors
   - Test an API endpoint that uses the database

## 🔧 Configuration Details

### Dockerfile

The `Dockerfile` handles the build process:
- Uses Python 3.11 slim image
- Installs Poetry for dependency management
- Installs production dependencies only
- Exposes port 8000
- Runs uvicorn server

### Environment Variables

| Variable | Description | Auto-Set | Required |
|----------|-------------|----------|----------|
| `PORT` | Application port | ✅ Koyeb | ✅ |
| `KOYEB` | Platform indicator | ✅ Koyeb | ⬜ |
| `DATABASE_URL` | PostgreSQL connection | ✅ Koyeb | ✅ |
| `KOYEB_PUBLIC_DOMAIN` | Public service URL | ✅ Koyeb | ⬜ |
| `GEMINI_API_KEY` | Google Gemini API | ⬜ Manual | ✅ |
| `SUPABASE_URL` | Supabase project URL | ⬜ Manual | ✅ |
| `SUPABASE_KEY` | Supabase anon key | ⬜ Manual | ✅ |
| `SECRET_KEY` | JWT secret | ⬜ Manual | ✅ |

## 🔄 Continuous Deployment

Koyeb automatically deploys when you push to the connected branch (default: `main`).

### Disable Auto-Deploy

1. Go to app settings
2. Navigate to "Deployments"
3. Toggle off "Auto-deploy"

### Manual Deploy

1. Go to app dashboard
2. Click "Redeploy"
3. Select "Latest commit"

### Deploy from Different Branch

1. Go to app settings
2. Change "Branch" field
3. Save changes

## 🔐 Custom Domain

### Add Custom Domain

1. Go to app settings
2. Click "Domains"
3. Click "Add domain"
4. Enter your domain (e.g., `api.valyra.com`)
5. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: api
   Value: <your-app>.koyeb.app
   ```
6. Wait for SSL certificate (automatic, ~5 minutes)

### Update CORS

After adding custom domain, update `CORS_ORIGINS`:
```bash
CORS_ORIGINS=https://valyra.com,https://www.valyra.com
```

## 🐛 Troubleshooting

### Build Fails

**Issue**: Docker build fails

**Solution**: Check Dockerfile syntax
```bash
# Test build locally
docker build -t valyra-backend apps/backend
```

**Issue**: Poetry installation fails

**Solution**: Check `pyproject.toml` for incompatible versions
```bash
# View build logs in Koyeb dashboard
# Update dependencies if needed
```

### Database Connection Error

**Issue**: Cannot connect to PostgreSQL

**Solution**: Verify `DATABASE_URL` is set
1. Go to app settings → Environment Variables
2. Check `DATABASE_URL` is present
3. Verify database service is running

**Issue**: Connection timeout

**Solution**: Ensure database is in the same region as app

### Application Won't Start

**Issue**: Port binding error

**Solution**: Ensure using `$PORT` environment variable
```python
# In your code
import os
port = int(os.getenv("PORT", 8000))
```

**Issue**: Import errors

**Solution**: Verify all dependencies in `pyproject.toml`
```bash
# Check build logs for missing packages
# Add to [tool.poetry.dependencies]
```

### Health Check Fails

**Issue**: Koyeb shows service as unhealthy

**Solution**: 
1. Verify `/health` endpoint exists and returns 200
2. Check health check path in app settings
3. View logs for startup errors

### Free Tier Limitations

**Issue**: Service is slow or unavailable

**Solution**: Free tier has limitations
- 512 MB RAM
- 0.1 vCPU
- Sleeps after inactivity
- Upgrade to Starter plan ($5/month) for better performance

## 📊 Monitoring

### View Logs

1. **Real-time Logs**
   - Go to app → "Logs" tab
   - Auto-refreshes
   - Filter by log level

2. **Download Logs**
   - Click "Download" button
   - Export as text file

### Metrics

1. Go to app → "Metrics" tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response time
   - HTTP status codes

### Alerts

Set up alerts via:
1. App settings → "Notifications"
2. Add webhook URL
3. Configure alert conditions

### External Monitoring

Consider adding:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **APM**: New Relic, DataDog

## 💰 Cost Breakdown

### Free Tier

**Web Service (Free)**
- 512 MB RAM
- 0.1 vCPU
- Sleeps after inactivity
- 100 GB bandwidth/month

**PostgreSQL (Free)**
- 256 MB storage
- Shared resources
- Limited connections

**Total**: Free

### Starter Tier

**Web Service ($5/month)**
- 2 GB RAM
- 1 vCPU
- Always on
- 100 GB bandwidth/month

**PostgreSQL ($5/month)**
- 1 GB storage
- Dedicated resources
- More connections

**Total**: $10/month

### Production Tier

**Web Service ($20/month)**
- 4 GB RAM
- 2 vCPU
- 400 GB bandwidth/month

**PostgreSQL ($20/month)**
- 10 GB storage
- High availability
- Point-in-time recovery

**Total**: $40/month

## 🔗 Useful Features

### Koyeb CLI

Install and use the CLI:
```bash
# Install
curl -fsSL https://cli.koyeb.com/install.sh | sh

# Login
koyeb login

# List apps
koyeb apps list

# View logs
koyeb logs valyra-backend

# Execute command
koyeb exec valyra-backend -- python manage.py migrate

# Scale service
koyeb scale valyra-backend --instances 2
```

### Environment Groups

Share environment variables across services:
1. Go to "Environment Variables"
2. Create group (e.g., "Production")
3. Add variables
4. Link to services

### Secrets Management

Store sensitive data securely:
1. Go to "Secrets"
2. Create secret
3. Reference in environment variables: `@secret:name`

### Preview Deployments

Automatic deployments for pull requests:
1. Enable in app settings
2. Each PR gets a unique URL
3. Automatically deleted when PR closes

## 📚 Additional Resources

- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Koyeb CLI Reference](https://www.koyeb.com/docs/cli)
- [FastAPI on Koyeb](https://www.koyeb.com/tutorials/deploy-fastapi-on-koyeb)
- [PostgreSQL on Koyeb](https://www.koyeb.com/docs/databases/postgresql)
- [Koyeb Community](https://community.koyeb.com/)

## 🆘 Support

- **Koyeb Status**: [status.koyeb.com](https://status.koyeb.com)
- **Koyeb Community**: [community.koyeb.com](https://community.koyeb.com)
- **GitHub Issues**: Report bugs in the Valyra repository

---

**Next Steps**: After successful deployment, update your frontend to use the Koyeb backend URL and test the full application flow.
