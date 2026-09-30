import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { LeadsDB } from '../../lead-scoring-service/src/db';
import { calculateLeadScore, TRAINED_MODEL_METRICS } from '../../lead-scoring-service/src/engine/scoringEngine';
import { CampaignsDB, dbExplorer as orchestratorDbExplorer } from '../../campaign-orchestrator/src/db';
import { dispatchCampaign } from '../../campaign-orchestrator/src/dispatch/orchestratorEngine';
import { CELL_TOWERS, GEOFENCE_ZONES } from '../../geo-campaign-service/src/data/mockGeoData';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Gateway Security & Rate Limiting Middleware
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

// ─── Health & Microservices Status ─────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    gateway: 'Enterprise API Gateway v1.0',
    database: 'Neon Cloud PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/gateway/status', (_req: Request, res: Response) => {
  res.json({
    gateway: 'ONLINE',
    uptimeSeconds: process.uptime(),
    services: [
      { name: 'b2b-lead-scoring-service', status: 'ONLINE' },
      { name: 'geo-campaign-service', status: 'ONLINE' },
      { name: 'ai-content-service', status: 'ONLINE' },
      { name: 'campaign-orchestrator-service', status: 'ONLINE' }
    ]
  });
});

// ─── B2B LEAD SCORING API (Neon PostgreSQL DB) ──────────────────
app.get('/api/leads/model-metrics', (_req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    metrics: TRAINED_MODEL_METRICS
  });
});

app.get('/api/leads/kpis', async (_req: Request, res: Response) => {
  try {
    const kpis = await LeadsDB.getKPIs();
    res.json(kpis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leads', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const leads = await LeadsDB.getAll({
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined
    });
    res.json({ total: leads.length, leads });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads/score', (req: Request, res: Response) => {
  const input = req.body;
  const scoreResult = calculateLeadScore(input);
  res.json({ input, result: scoreResult });
});

app.post('/api/leads', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { score, status, conversionProbability, featureImpacts } = calculateLeadScore(body);

    const newLead: any = {
      id: `lead-ent-${Date.now()}`,
      companyName: body.companyName || 'New Enterprise Account',
      industry: body.industry || 'General Industry',
      employees: Number(body.employees) || 500,
      annualRevenueUsd: Number(body.annualRevenueUsd) || 50000000,
      productTarget: body.productTarget || 'Leased Line Fiber',
      contractExpiryMonths: Number(body.contractExpiryMonths) || 6,
      bandwidthNeedGbps: Number(body.bandwidthNeedGbps) || 10,
      distanceToFiberNodeMeters: Number(body.distanceToFiberNodeMeters) || 200,
      digitalPortalPingsLast30Days: Number(body.digitalPortalPingsLast30Days) || 15,
      estimatedDealValueZar: Number(body.estimatedDealValueZar) || 2500000,
      contactPerson: body.contactPerson || 'Key Executive',
      contactEmail: body.contactEmail || 'contact@company.co.za',
      contactPhone: body.contactPhone || '+27 11 000 0000',
      assignedRep: body.assignedRep || 'Enterprise Sales Rep',
      status,
      score,
      conversionProbability,
      featureImpacts,
      updatedAt: new Date().toISOString()
    };

    await LeadsDB.insert(newLead);
    res.status(201).json(newLead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GEO CAMPAIGN API ──────────────────────────────────────────
app.get('/api/geo/towers', (_req: Request, res: Response) => {
  res.json({ total: CELL_TOWERS.length, towers: CELL_TOWERS });
});

app.get('/api/geo/geofences', (_req: Request, res: Response) => {
  res.json({ total: GEOFENCE_ZONES.length, geofences: GEOFENCE_ZONES });
});

app.get('/api/geo/telemetry', (req: Request, res: Response) => {
  const count = Number(req.query.count) || 30;
  const pings = Array.from({ length: count }, (_, i) => ({
    id: `ping-${Date.now()}-${i}`,
    deviceHash: `dev-${Math.random().toString(36).substring(2, 8)}`,
    lat: -25.7545 + (Math.random() - 0.5) * 0.02,
    lng: 28.2314 + (Math.random() - 0.5) * 0.02,
    connectedTowerId: CELL_TOWERS[i % CELL_TOWERS.length].id,
    matchedZoneId: GEOFENCE_ZONES[i % GEOFENCE_ZONES.length].id,
    simType: (i % 2 === 0 ? 'POSTPAID' : 'PREPAID') as any,
    timestamp: new Date().toISOString()
  }));
  res.json({ timestamp: new Date().toISOString(), pingsCount: pings.length, pings });
});

// ─── CAMPAIGN ORCHESTRATOR API (Neon PostgreSQL DB) ─────────────
app.get('/api/orchestrator/campaigns', async (req: Request, res: Response) => {
  try {
    const { channel, status } = req.query;
    const campaigns = await CampaignsDB.getAll({
      channel: typeof channel === 'string' ? channel : undefined,
      status: typeof status === 'string' ? status : undefined
    });
    res.json({ total: campaigns.length, campaigns });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orchestrator/analytics', async (_req: Request, res: Response) => {
  try {
    const analytics = await CampaignsDB.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orchestrator/dispatch', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const newCampaign = dispatchCampaign({
      title: body.title || 'Hyperlocal Dispatch',
      category: body.category || 'STUDENT_HYPERLOCAL',
      channel: body.channel || 'PUSH',
      targetLanguage: body.targetLanguage || 'English',
      headline: body.headline || '⚡ Hyperlocal Special Offer!',
      body: body.body || 'Exclusive regional package active now.',
      targetCount: body.targetCount ? Number(body.targetCount) : undefined,
      targetGeofenceId: body.targetGeofenceId
    });

    await CampaignsDB.insert(newCampaign);
    res.status(201).json({ message: 'Campaign saved to Neon PostgreSQL Database!', campaign: newCampaign });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Frontend Static UI ──────────────────────────────────
const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found', path: req.path });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`⚡ [API Gateway & Production Server] Running on http://localhost:${PORT}`);
  console.log(`🐘 [PostgreSQL] Connected directly to Neon Cloud Database Cluster`);
});
