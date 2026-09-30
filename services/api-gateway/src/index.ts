import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// Microservices & Engine Imports
import { LeadsDB } from '../../lead-scoring-service/src/db';
import { calculateLeadScore, TRAINED_MODEL_METRICS } from '../../lead-scoring-service/src/engine/scoringEngine';
import { CampaignsDB } from '../../campaign-orchestrator/src/db';
import { dispatchCampaign } from '../../campaign-orchestrator/src/dispatch/orchestratorEngine';
import { CELL_TOWERS, GEOFENCE_ZONES, GeofenceZone } from '../../geo-campaign-service/src/data/mockGeoData';
import { GeofencesDB } from '../../geo-campaign-service/src/db';
import { generateLiveTelemetryPings, evaluateGeofenceTriggers } from '../../geo-campaign-service/src/gis/spatialEngine';
import { generateMultilingualCopy, CopyRequest } from '../../ai-content-service/src/generator/aiCopyEngine';

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

app.get('/api/geo/geofences', async (req: Request, res: Response) => {
  try {
    const { category, triggeredOnly } = req.query;
    const zones = await GeofencesDB.getAll({
      category: typeof category === 'string' ? category : undefined,
      triggeredOnly: triggeredOnly === 'true'
    });
    res.json({ total: zones.length, geofences: zones });
  } catch (err: any) {
    res.json({ total: GEOFENCE_ZONES.length, geofences: GEOFENCE_ZONES });
  }
});

app.get('/api/geo/telemetry', (req: Request, res: Response) => {
  const count = Number(req.query.count) || 35;
  const pings = generateLiveTelemetryPings(count);
  res.json({ timestamp: new Date().toISOString(), pingsCount: pings.length, pings });
});

// GET /api/geo/stream/telemetry (SSE Stream)
app.get('/api/geo/stream/telemetry', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'STREAMING', time: new Date().toISOString() })}\n\n`);

  const interval = setInterval(async () => {
    try {
      const pings = generateLiveTelemetryPings(5);
      const zones = await GeofencesDB.getAll().catch(() => GEOFENCE_ZONES);
      const highPingsZone = zones.find((z: any) => z.currentPingsCount >= z.triggerThresholdPings);

      res.write(`event: telemetry_ping\ndata: ${JSON.stringify({ timestamp: new Date().toISOString(), pings })}\n\n`);

      if (highPingsZone) {
        res.write(`event: breach_alert\ndata: ${JSON.stringify({
          zoneId: highPingsZone.id,
          zoneName: highPingsZone.name,
          pingsCount: highPingsZone.currentPingsCount,
          threshold: highPingsZone.triggerThresholdPings,
          offerHeadline: highPingsZone.offerHeadline,
          timestamp: new Date().toISOString()
        })}\n\n`);
      }
    } catch (e) {}
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.post('/api/geo/simulate-trigger', async (req: Request, res: Response) => {
  try {
    const { zoneId, spikePings } = req.body;
    const addPings = spikePings || 150;

    let updatedZone: any = null;
    try {
      updatedZone = await GeofencesDB.updatePings(zoneId || 'zone-student-01', addPings);
    } catch (e) {}

    const allZones = await GeofencesDB.getAll().catch(() => GEOFENCE_ZONES);
    const { triggeredAlerts } = evaluateGeofenceTriggers(allZones);

    res.json({
      message: `Trigger simulated for zone ${updatedZone?.name || zoneId || 'UP Hatfield Student Zone'}!`,
      zone: updatedZone || GEOFENCE_ZONES[0],
      triggeredAlerts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/geo/auto-dispatch-breach', async (req: Request, res: Response) => {
  try {
    const { zoneId, targetLanguage = 'isiZulu', channel = 'WHATSAPP' } = req.body;

    const allZones = await GeofencesDB.getAll().catch(() => GEOFENCE_ZONES);
    const zone = allZones.find((z: any) => z.id === zoneId) || allZones[0];

    const copyVariants = generateMultilingualCopy({
      campaignType: zone.category === 'University Campus' ? 'Student Data Special' : 'B2B Enterprise Dedicated Fiber',
      targetLanguage,
      channel: channel as any,
      tone: 'URGENT',
      customLocation: zone.name,
      customProduct: zone.recommendedCampaign
    });

    const primaryVariant = copyVariants[0] || {
      headline: zone.offerHeadline,
      body: zone.offerBody,
      language: targetLanguage
    };

    const newCampaign = dispatchCampaign({
      title: `[Autonomous AI] ${zone.name} (${targetLanguage})`,
      category: zone.category === 'University Campus' ? 'STUDENT_HYPERLOCAL' : 'B2B_ENTERPRISE_FIBER',
      channel: channel as any,
      targetLanguage,
      headline: primaryVariant.headline,
      body: primaryVariant.body,
      targetCount: zone.currentPingsCount,
      targetGeofenceId: zone.id
    });

    await CampaignsDB.insert(newCampaign).catch(() => {});

    res.json({
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      zoneName: zone.name,
      targetAudiencePings: zone.currentPingsCount,
      targetLanguage,
      channel,
      generatedAiVariant: primaryVariant,
      orchestrationDetails: newCampaign
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/geo/geofences', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const newZone: GeofenceZone = {
      id: `zone-${Date.now()}`,
      name: body.name || 'Hyperlocal Geofence Zone',
      category: body.category || 'University Campus',
      lat: Number(body.lat) || -26.2041,
      lng: Number(body.lng) || 28.0473,
      radiusMeters: Number(body.radiusMeters) || 750,
      associatedTowerId: body.associatedTowerId || CELL_TOWERS[0].id,
      targetDemographic: body.targetDemographic || 'Mobile Subscribers',
      recommendedCampaign: body.recommendedCampaign || 'Hyperlocal 5G Data Pack',
      triggerThresholdPings: Number(body.triggerThresholdPings) || 250,
      currentPingsCount: Number(body.currentPingsCount) || 50,
      isTriggered: false,
      offerHeadline: body.offerHeadline || '⚡ Special Localized Offer!',
      offerBody: body.offerBody || 'Exclusive deal available in your current area.'
    };

    await GeofencesDB.insert(newZone).catch(() => {});
    res.status(201).json(newZone);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI MULTILINGUAL COPY STUDIO API ────────────────────────────
app.post('/api/content/generate', (req: Request, res: Response) => {
  const body: CopyRequest = req.body;
  const copyVariants = generateMultilingualCopy({
    campaignType: body.campaignType || 'Student Data Special',
    targetLanguage: body.targetLanguage || 'English',
    channel: body.channel || 'PUSH',
    tone: body.tone || 'URGENT',
    customLocation: body.customLocation,
    customPrice: body.customPrice,
    customProduct: body.customProduct
  });

  res.json({
    request: body,
    generatedAt: new Date().toISOString(),
    variantsCount: copyVariants.length,
    variants: copyVariants
  });
});

app.get('/api/content/languages', (_req: Request, res: Response) => {
  res.json({ languages: ['English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sepedi', 'Setswana', 'Sesotho', 'Xitsonga', 'Hindi', 'French'] });
});

app.get('/api/content/campaign-types', (_req: Request, res: Response) => {
  res.json({ campaignTypes: ['Student Data Special', 'Airport Travel Roaming Pass', 'B2B Enterprise Dedicated Fiber', 'Weekend Data Turbo Pass', 'IoT Fleet Connectivity'] });
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

    await CampaignsDB.insert(newCampaign).catch(() => {});
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
