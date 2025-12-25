# Deployment Guide

This guide covers deploying the Mermaid Diagram Renderer to production for use with ChatGPT.

## Prerequisites

- Domain with HTTPS support (required by OpenAI Apps)
- Node.js 20+ runtime environment
- Git repository (for automated deployments)

## Platform-Specific Instructions

### Vercel (Recommended for Next.js)

Vercel provides the easiest deployment for Next.js applications.

#### Steps:

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy via CLI**:
```bash
cd chatgpt-mermaid
vercel
```

3. **Or Deploy via Git**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Import project at [vercel.com/new](https://vercel.com/new)
   - Vercel auto-detects Next.js configuration

4. **Configure MCP Server**:
   - The MCP server needs to run separately
   - Use a service like Railway or Render for the MCP server
   - Set `API_BASE_URL` environment variable to your Vercel URL

#### Vercel Configuration:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

### Railway

Railway supports both Next.js and the MCP server in a single deployment.

#### Steps:

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **Deploy via CLI**:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

3. **Or Deploy via GitHub**:
   - Connect your GitHub repository
   - Railway auto-deploys on push

4. **Environment Variables**:
   - `API_BASE_URL`: Set to your Railway app URL

5. **Configure Processes**:

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "pnpm start",
    "healthcheckPath": "/"
  }
}
```

For MCP server, create a second service:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "pnpm mcp:start"
  }
}
```

---

### Render

Render provides good support for full-stack Node.js applications.

#### Steps:

1. **Create Render Account**: [render.com](https://render.com)

2. **Create Web Service**:
   - Connect your Git repository
   - Select "Node" environment
   - Build command: `pnpm install && pnpm build && pnpm mcp:build`
   - Start command: `pnpm start`

3. **Create Second Service for MCP**:
   - Same repository
   - Build command: `pnpm install && pnpm mcp:build`
   - Start command: `pnpm mcp:start`
   - Set environment variable: `API_BASE_URL=https://your-nextjs-service.onrender.com`

4. **Configure Health Check**:
   - Path: `/`
   - Expected status: 200

---

### Docker Deployment

For custom hosting or cloud platforms.

#### Dockerfile for Next.js:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### Dockerfile for MCP Server:

```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm mcp:build
ENV API_BASE_URL=http://nextjs-service:3000
CMD ["node", "dist/mcp/index.js"]
```

#### Docker Compose:

```yaml
version: '3.8'

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  mcp:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    environment:
      - API_BASE_URL=http://nextjs:3000
    depends_on:
      - nextjs
    restart: unless-stopped
```

---

## Environment Variables

### Required:

- `API_BASE_URL`: Base URL of your deployed Next.js application
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`

### Optional:

- `NODE_ENV`: Set to `production` in production
- `PORT`: Port for Next.js server (default: 3000)

---

## Post-Deployment

### 1. Verify API Endpoints

Test that your API is accessible:

```bash
# Replace with your deployed URL
DEPLOYED_URL="https://your-domain.com"

# Test verify endpoint
curl -X POST "$DEPLOYED_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD\n  A --> B"}'

# Expected: {"ok":true}
```

### 2. Configure MCP Server

Update your MCP configuration with the deployed URL:

```json
{
  "mcpServers": {
    "mermaid-diagram-renderer": {
      "command": "node",
      "args": ["dist/mcp/index.js"],
      "env": {
        "API_BASE_URL": "https://your-domain.com"
      }
    }
  }
}
```

### 3. Test MCP Connection

Ensure the MCP server can reach your API:

```bash
# Set environment variable
export API_BASE_URL="https://your-domain.com"

# Run MCP server
node dist/mcp/index.js
```

### 4. Submit to OpenAI

Once deployed and tested:

1. Gather information:
   - Deployed Next.js URL
   - MCP server configuration
   - Tool schemas (from `APP_MANIFEST.md`)

2. Visit OpenAI Apps submission portal

3. Provide:
   - App name: "Mermaid Diagram Renderer"
   - Description: See `APP_MANIFEST.md`
   - MCP endpoint configuration
   - Privacy policy (included in `APP_MANIFEST.md`)

---

## Monitoring

### Health Checks

Implement health check endpoints if needed:

**Create** `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

### Logging

Current logging (stderr only):
- MCP server logs to stderr
- Next.js API logs to console

For production monitoring, consider:
- CloudWatch (AWS)
- Stackdriver (GCP)
- Application Insights (Azure)
- Datadog
- Sentry for error tracking

### Rate Limiting

Current rate limits:
- 100 requests/hour per IP
- In-memory storage

For distributed deployments, consider:
- Redis-backed rate limiting
- Cloudflare rate limiting
- API Gateway throttling

---

## SSL/HTTPS

HTTPS is **required** for OpenAI Apps.

### Free SSL Options:

1. **Vercel/Railway/Render**: Automatic SSL
2. **Let's Encrypt**: Free SSL certificates
3. **Cloudflare**: Free SSL proxy

---

## Scaling Considerations

### Horizontal Scaling

For high traffic:

1. **Load Balancer**: Distribute requests across multiple instances
2. **Redis Rate Limiting**: Share rate limit state
3. **CDN**: Cache static assets (landing page)

### Vertical Scaling

Current resource usage:
- Memory: ~100-200MB per instance
- CPU: Moderate (Mermaid rendering)
- Disk: Minimal (no storage)

Recommended production specs:
- 512MB - 1GB RAM
- 1-2 vCPUs
- 10GB disk

---

## Security Checklist

- [x] HTTPS enabled
- [x] Security headers configured
- [x] SVG sanitization active
- [x] Rate limiting enabled
- [x] Input validation on all endpoints
- [x] No sensitive data logged
- [x] Dependencies up to date
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities

---

## Troubleshooting

### MCP Server Can't Reach API

**Symptom**: MCP tools fail with connection errors

**Solution**:
- Verify `API_BASE_URL` is set correctly
- Check network/firewall rules
- Ensure Next.js server is running
- Test API endpoint manually

### High Memory Usage

**Symptom**: Server crashes or slow performance

**Solution**:
- Increase instance memory
- Check for memory leaks
- Consider reducing rate limit window
- Monitor concurrent requests

### Rate Limit Issues

**Symptom**: Users hit rate limits frequently

**Solution**:
- Increase limits in `src/lib/rate-limit.ts`
- Implement Redis-backed rate limiting
- Use authenticated rate limiting
- Add rate limit headers documentation

---

## Rollback Procedure

If deployment fails:

1. **Vercel**: Revert to previous deployment in dashboard
2. **Railway**: Rollback via CLI: `railway rollback`
3. **Docker**: Redeploy previous image tag
4. **Git-based**: Revert commit and push

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review error logs
- Test locally first
- Verify environment variables
- Check network connectivity

For code issues:
- See [README.md](./README.md)
- Review [QUICKSTART.md](./QUICKSTART.md)
- Check GitHub issues

