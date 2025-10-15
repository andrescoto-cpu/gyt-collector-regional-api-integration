# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- SSL certificates (key.pem and cert.pem)
- Akros API credentials

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=production
PORT=443

# Akros API Configuration
AKROS_API_URL=https://api.akros.com
AKROS_CLIENT_ID=your_client_id
AKROS_CLIENT_SECRET=your_client_secret
AKROS_TOKEN_URL=https://api.akros.com/oauth/token
AKROS_API_ENDPOINT=/api/v1/payments

# SSL Configuration
SSL_KEY_PATH=./certs/key.pem
SSL_CERT_PATH=./certs/cert.pem

# Logging
LOG_LEVEL=info
```

## SSL Certificates

### Development (Self-Signed)

Generate self-signed certificates for development:

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes
```

### Production

Obtain proper SSL certificates from a Certificate Authority (CA) or use Let's Encrypt:

```bash
# Using Let's Encrypt (example)
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/key.pem
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/cert.pem
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

1. Build and start the service:

```bash
docker-compose up -d
```

2. Check logs:

```bash
docker-compose logs -f
```

3. Stop the service:

```bash
docker-compose down
```

### Method 2: Docker

1. Build the image:

```bash
docker build -t gyt-collector .
```

2. Run the container:

```bash
docker run -d \
  --name gyt-collector \
  -p 443:443 \
  -v $(pwd)/certs:/usr/src/app/certs:ro \
  -v $(pwd)/logs:/usr/src/app/logs \
  --env-file .env \
  gyt-collector
```

### Method 3: Node.js (Direct)

1. Install dependencies:

```bash
npm ci --only=production
```

2. Start the service:

```bash
NODE_ENV=production npm start
```

## Verification

1. Check service health:

```bash
curl -k https://localhost:443/health
```

Expected response:
```json
{"status":"OK","timestamp":"2025-10-15T18:45:00.000Z"}
```

2. Test payment endpoint:

```bash
curl -k -X POST https://localhost:443/api/collector/payment \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><request><amount>100</amount></request>'
```

## Monitoring

### Logs

Logs are stored in:
- `error.log` - Error messages only
- `combined.log` - All log messages

View logs in real-time:

```bash
# Docker
docker-compose logs -f

# Direct
tail -f combined.log
```

### Health Checks

The service includes a health check endpoint at `/health`. Configure your monitoring system to check this endpoint regularly.

For Docker:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:443/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Troubleshooting

### Port Already in Use

If port 443 is already in use:

1. Find the process:
```bash
sudo lsof -i :443
```

2. Stop the conflicting service or change PORT in .env

### Certificate Errors

If you see certificate errors:

1. Verify certificate files exist:
```bash
ls -l certs/
```

2. Check file permissions:
```bash
chmod 600 certs/key.pem
chmod 644 certs/cert.pem
```

3. Validate certificate:
```bash
openssl x509 -in certs/cert.pem -text -noout
```

### Connection to Akros API Failed

1. Check network connectivity:
```bash
ping api.akros.com
```

2. Verify credentials in .env
3. Check logs for detailed error messages

### High Memory Usage

If the service consumes too much memory:

1. Limit Docker memory:
```yaml
services:
  gyt-collector:
    mem_limit: 512m
```

2. Adjust Node.js heap size:
```bash
NODE_OPTIONS="--max-old-space-size=256" npm start
```

## Scaling

### Horizontal Scaling

Use a load balancer (nginx, HAProxy) to distribute traffic across multiple instances:

```bash
# Start multiple instances
docker-compose up -d --scale gyt-collector=3
```

Configure nginx upstream:
```nginx
upstream gyt_collector {
    server localhost:8443;
    server localhost:8444;
    server localhost:8445;
}
```

### Vertical Scaling

Increase container resources:

```yaml
services:
  gyt-collector:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Backup and Recovery

### Configuration Backup

Regularly backup:
- `.env` file (without committing to version control)
- SSL certificates
- Log files (if needed for compliance)

### Recovery

1. Restore .env and certificates
2. Redeploy using deployment method of choice
3. Verify with health check

## Security Hardening

1. Use firewall rules to restrict access:
```bash
sudo ufw allow from <banco-gyt-ip> to any port 443
```

2. Enable log rotation:
```bash
# Install logrotate configuration
sudo cp deployment/logrotate.conf /etc/logrotate.d/gyt-collector
```

3. Regular security updates:
```bash
# Update base Docker image
docker pull node:18-alpine
docker-compose build --no-cache
docker-compose up -d
```

## Production Checklist

- [ ] SSL certificates installed and valid
- [ ] Environment variables configured
- [ ] Firewall rules configured
- [ ] Health monitoring configured
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Security hardening applied
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment and monitoring
