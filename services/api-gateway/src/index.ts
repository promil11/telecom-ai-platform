import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Service Registry Configuration
const SERVICES = {
  LEAD_SCORING: { name: 'b2b-lead-scoring-service', url: 'http://localhost:5001', pathPrefix: '/api/leads' },
  GEO_CAMPAIGN: { name: 'geo-campaign-service', url: 'http://localhost:5002', pathPrefix: '/api/geo' },
  AI_CONTENT: { name: 'ai-content-service', url: 'http://localhost:5003', pathPrefix: '/api/content' },
  ORCHESTRATOR: { name: 'campaign-orchestrator-service', url: 'http://localhost:5004', pathPrefix: '/api/orchestrator' }
};

// Simple rate limiter & JWT token middleware mock
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const gatewaySecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 500;

  const current = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + windowMs };

  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count += 1;
  }

  rateLimitMap.set(clientIp, current);

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current.count));
  res.setHeader('X-Gateway-Node', 'telco-api-gateway-01');

  if (current.count > maxRequests) {
    return res.status(429).json({ error: 'Too Many Requests', message: 'Rate limit exceeded' });
  }

  next();
};

app.use(gatewaySecurityMiddleware);

// Gateway Health & Services Matrix
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    gateway: 'Enterprise API Gateway v1.0',
    timestamp: new Date().toISOString(),
    services: Object.values(SERVICES).map(s => ({ name: s.name, prefix: s.pathPrefix, target: s.url }))
  });
});

app.get('/api/gateway/status', async (req: Request, res: Response) => {
  const serviceStatuses = await Promise.all(
    Object.values(SERVICES).map(async (svc) => {
      try {
        const check = await fetch(`${svc.url}/health`).then(r => r.json());
        return { name: svc.name, status: 'ONLINE', details: check };
      } catch (err: any) {
        return { name: svc.name, status: 'OFFLINE', error: err.message };
      }
    })
  );

  res.json({
    gateway: 'ONLINE',
    uptimeSeconds: process.uptime(),
    services: serviceStatuses
  });
});

// Proxy helper function with SSE streaming support
const proxyRequest = (targetBaseUrl: string) => {
  return async (req: Request, res: Response) => {
    const targetUrl = `${targetBaseUrl}${req.originalUrl}`;

    // Handle Event Stream (SSE)
    if (req.originalUrl.includes('/stream') || req.headers.accept === 'text/event-stream') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const proxyReq = http.request(targetUrl, { method: req.method }, (proxyRes) => {
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('SSE Proxy error:', err);
        res.end();
      });

      req.on('close', () => {
        proxyReq.destroy();
      });
      return;
    }
    
    try {
      const options: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': req.ip || '127.0.0.1',
          'Authorization': req.headers.authorization || 'Bearer mock-jwt-token-telecom-admin'
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, options);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: `Failed to communicate with downstream microservice: ${targetBaseUrl}`,
        details: error.message
      });
    }
  };
};

// Route Requests to Downstream Microservices
app.use('/api/leads*', proxyRequest(SERVICES.LEAD_SCORING.url));
app.use('/api/geo*', proxyRequest(SERVICES.GEO_CAMPAIGN.url));
app.use('/api/content*', proxyRequest(SERVICES.AI_CONTENT.url));
app.use('/api/orchestrator*', proxyRequest(SERVICES.ORCHESTRATOR.url));

app.listen(PORT, () => {
  console.log(`⚡ [API Gateway] Running on http://localhost:${PORT}`);
});
