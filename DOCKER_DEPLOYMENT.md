# Docker Deployment Guide
## Gayatri Homeo Clinic Management System

This guide covers deploying the application using Docker containers for development and production environments.

---

## Prerequisites

- **Docker Desktop** 20.10+ ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **Git** for cloning the repository

---

## Quick Start

### 1. Create Environment File

```bash
# Copy the template
copy .env.template .env

# Edit .env and set required values
notepad .env
```

**Required environment variables:**

```env
# Strong database password
DB_PASSWORD=your_secure_password_here

# Generate Flask secret key with Python:
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_generated_secret_key_here
```

> [!IMPORTANT]
> Use strong, randomly generated values for production deployments!

### 2. Build and Start

```bash
# Build all services and start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Database**: localhost:5432

On first access, you'll see the setup wizard to create your admin user.

---

## Service Architecture

The application consists of three Docker services:

### 1. **postgres** - PostgreSQL 16 Database
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Volume**: postgres_data (persistent storage)
- **Features**: Optimized performance settings, automatic initialization

### 2. **backend** - Flask Python API
- **Build**: backend/Dockerfile
- **Port**: 5000
- **Runtime**: Gunicorn (4 workers, 2 threads)
- **Features**: Health checks, automatic database connection

### 3. **frontend** - React + Nginx
- **Build**: frontend/Dockerfile (multi-stage)
- **Port**: 80
- **Features**: Optimized production build, gzip compression, API proxying

---

## Management Commands

### Starting and Stopping

```bash
# Start all services
docker-compose up -d

# Stop all services (preserves data)
docker-compose down

# Stop and remove volumes (DESTROYS DATA!)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Rebuilding

```bash
# Rebuild all services
docker-compose build

# Rebuild and restart specific service
docker-compose up -d --build backend

# Force rebuild without cache
docker-compose build --no-cache
```

### Service Status

```bash
# Check status of all services
docker-compose ps

# View resource usage
docker stats
```

---

## Database Operations

### Database Backup

```bash
# Create a backup
docker-compose exec postgres pg_dump -U homeopathy_user homeopathy_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Or with custom filename
docker-compose exec postgres pg_dump -U homeopathy_user homeopathy_db > my_backup.sql
```

### Database Restore

```bash
# Restore from backup
type backup.sql | docker-compose exec -T postgres psql -U homeopathy_user -d homeopathy_db

# Or using PowerShell
Get-Content backup.sql | docker-compose exec -T postgres psql -U homeopathy_user -d homeopathy_db
```

### Access PostgreSQL Shell

```bash
# Connect to database
docker-compose exec postgres psql -U homeopathy_user -d homeopathy_db

# Common SQL commands:
# \dt              - List tables
# \d table_name    - Describe table
# \q               - Quit
```

### Reset Database (Fresh Start)

```bash
# Stop services
docker-compose down

# Remove database volume (DESTROYS ALL DATA!)
docker volume rm gayatri-homeo-clinic_postgres_data

# Start again (will reinitialize database)
docker-compose up -d
```

---

## Development Mode

For development with hot reload:

### Backend Hot Reload

Uncomment the volume mount in `docker-compose.yml`:

```yaml
backend:
  volumes:
    - ./backend/app:/app/app  # Uncomment this line
```

Then restart:
```bash
docker-compose restart backend
```

Changes to Python files will trigger automatic reload.

### Frontend Development

For frontend development, use Vite's dev server locally instead of Docker:

```bash
cd frontend
npm install
npm run dev
```

This provides faster hot module replacement (HMR).

---

## Executing Commands in Containers

### Backend Commands

```bash
# Access backend shell
docker-compose exec backend bash

# Run Python directly
docker-compose exec backend python -c "import secrets; print(secrets.token_hex(32))"

# Install additional Python packages
docker-compose exec backend pip install package-name
```

### Database Commands

```bash
# Run SQL script
docker-compose exec -T postgres psql -U homeopathy_user -d homeopathy_db < script.sql

# Check database size
docker-compose exec postgres psql -U homeopathy_user -d homeopathy_db -c "SELECT pg_database_size('homeopathy_db');"
```

---

## Troubleshooting

### Services Won't Start

**Check logs for errors:**
```bash
docker-compose logs
```

**Common issues:**
- Missing `.env` file → Create from `.env.template`
- Port conflicts → Stop conflicting services or change ports
- Permission errors → Run as administrator on Windows

### Database Connection Failed

**Check if PostgreSQL is healthy:**
```bash
docker-compose ps
docker-compose exec postgres pg_isready -U homeopathy_user
```

**Verify DATABASE_URL is correct:**
```bash
docker-compose exec backend printenv DATABASE_URL
```

### Frontend Can't Reach Backend

**Test backend health:**
```bash
curl http://localhost:5000/api/health
```

**Check nginx logs:**
```bash
docker-compose logs frontend
```

**Verify proxy configuration** in `frontend/nginx.conf`.

### Container Keeps Restarting

**View exit logs:**
```bash
docker-compose logs --tail=50 backend
```

**Common causes:**
- Missing environment variables
- Failed health checks
- Application errors

**Disable health checks temporarily** to debug:
```yaml
# Comment out healthcheck in docker-compose.yml
# healthcheck:
#   test: [...]
```

### Permission Issues on Volumes

**On Windows, ensure Docker Desktop has access to the drive:**
- Settings → Resources → File Sharing
- Add your project directory

### Clean Slate (Nuclear Option)

```bash
# Stop everything
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove dangling volumes and networks
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up -d --build
```

---

## Production Deployment

### Security Best Practices

1. **Strong Passwords**
   ```bash
   # Generate strong password
   python -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*') for _ in range(32)))"
   ```

2. **Secret Key Rotation**
   - Change `SECRET_KEY` periodically
   - Invalidates all sessions
   - Update `.env` and restart: `docker-compose restart backend`

3. **Database Backups**
   - Schedule regular backups (daily recommended)
   - Store backups securely off-site
   - Test restore procedure

4. **Network Security**
   - Use HTTPS in production (add reverse proxy like Traefik or Nginx)
   - Don't expose database port externally (remove `ports:` from postgres service)
   - Use firewall rules

5. **Update Images Regularly**
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```

### Performance Tuning

**PostgreSQL Settings** (already configured in docker-compose.yml):
- `shared_buffers=256MB` - Memory for caching
- `effective_cache_size=1GB` - Available system memory
- `maintenance_work_mem=64MB` - Memory for maintenance
- `max_connections=100` - Connection limit

**Gunicorn Settings** (configured in backend Dockerfile):
- 4 workers (adjust based on CPU cores: 2-4 × CPU_CORES)
- 2 threads per worker
- 120s timeout for long operations

### Monitoring

**Resource Usage:**
```bash
docker stats --no-stream
```

**Log Sizes:**
```bash
docker system df
```

**Configure log rotation** to prevent disk fill-up.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_PASSWORD` | ✅ Yes | - | PostgreSQL password |
| `SECRET_KEY` | ✅ Yes | - | Flask session encryption key |
| `VITE_API_URL` | ❌ No | http://localhost:5000 | Backend API URL for frontend |

---

## Port Mapping

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| Frontend | 80 | 80 | Web application |
| Backend | 5000 | 5000 | REST API |
| PostgreSQL | 5432 | 5432 | Database |

---

## File Structure

```
gayatri-homeo-clinic/
├── docker-compose.yml          # Multi-service orchestration
├── .env                        # Environment variables (create from template)
├── .env.template               # Template for environment variables
├── backend/
│   ├── Dockerfile             # Backend container image
│   ├── .dockerignore          # Excludes from Docker build
│   ├── init.sql               # Database initialization
│   ├── requirements.txt       # Python dependencies
│   └── app/
│       └── routes/
│           └── health.py      # Health check endpoint
├── frontend/
│   ├── Dockerfile             # Frontend multi-stage build
│   ├── nginx.conf             # Nginx production config
│   └── .dockerignore          # Excludes from Docker build
└── DOCKER_DEPLOYMENT.md       # This file
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

---

## Support

For issues specific to the Docker deployment, check:
1. Service logs: `docker-compose logs -f`
2. Health checks: `docker-compose ps`
3. This troubleshooting guide

For application-specific issues, refer to the main project documentation.
