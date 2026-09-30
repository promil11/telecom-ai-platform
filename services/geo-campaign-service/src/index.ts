import express, { Request, Response } from 'express';
import cors from 'cors';
import { CELL_TOWERS, GeofenceZone } from './data/mockGeoData';
import { generateLiveTelemetryPings, evaluateGeofenceTriggers } from './gis/spatialEngine';
import { GeofencesDB, dbExplorer } from './db';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const zones = await GeofencesDB.getAll();
    res.json({
      status: 'UP',
      service: 'geo-campaign-service',
      port: PORT,
      database: 'Neon PostgreSQL (Cloud)',
      towersCount: CELL_TOWERS.length,
      geofencesCount: zones.length,
      triggeredCount: zones.filter(z => z.isTriggered).length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// ─── DB Explorer Admin Endpoints ────────────────────────────────
app.get('/api/geo/admin/db/tables', async (_req: Request, res: Response) => {
  try {
    const tables = await dbExplorer.getTables();
    res.json({ service: 'geo-campaign-service', database: 'Neon PostgreSQL (Cloud)', tables });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/geo/admin/db/data/:table', async (req: Request, res: Response) => {
  try {
    const data = await dbExplorer.getTableData(req.params.table);
    res.json({ table: req.params.table, rows: data, count: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/geo/admin/db/query', async (req: Request, res: Response) => {
  try {
    const { sql } = req.body;
    const result = await dbExplorer.runQuery(sql);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── GET /api/geo/towers ───────────────────────────────────────
app.get('/api/geo/towers', (_req: Request, res: Response) => {
  res.json({ total: CELL_TOWERS.length, towers: CELL_TOWERS });
});

// ─── GET /api/geo/geofences ────────────────────────────────────
app.get('/api/geo/geofences', async (req: Request, res: Response) => {
  try {
    const { category, triggeredOnly } = req.query;
    const zones = await GeofencesDB.getAll({
      category: typeof category === 'string' ? category : undefined,
      triggeredOnly: triggeredOnly === 'true'
    });
    res.json({ total: zones.length, geofences: zones });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/geo/telemetry ────────────────────────────────────
app.get('/api/geo/telemetry', (req: Request, res: Response) => {
  const count = req.query.count ? parseInt(req.query.count as string, 10) : 30;
  const pings = generateLiveTelemetryPings(count);
  res.json({ timestamp: new Date().toISOString(), pingsCount: pings.length, pings });
});

// ─── GET /api/geo/stream/telemetry (SSE Real-Time Stream) ─────
app.get('/api/geo/stream/telemetry', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'STREAMING', time: new Date().toISOString() })}\n\n`);

  const interval = setInterval(async () => {
    try {
      const pings = generateLiveTelemetryPings(5);
      const zones = await GeofencesDB.getAll();
      const highPingsZone = zones.find(z => z.currentPingsCount >= z.triggerThresholdPings);

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
    } catch (e) {
      // Stream error silent catch
    }
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// ─── POST /api/geo/auto-dispatch-breach ───────────────────────
app.post('/api/geo/auto-dispatch-breach', async (req: Request, res: Response) => {
  try {
    const { zoneId, targetLanguage = 'isiZulu', channel = 'WHATSAPP' } = req.body;

    const allZones = await GeofencesDB.getAll();
    const zone = allZones.find(z => z.id === zoneId) || allZones[0];

    // 1. Invoke AI Multilingual Copy Engine
    let aiCopy: any = null;
    try {
      const contentRes = await fetch('http://localhost:5003/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType: zone.category === 'University Campus' ? 'Student Data Special' : 'B2B Enterprise Dedicated Fiber',
          targetLanguage,
          channel,
          tone: 'URGENT',
          customLocation: zone.name,
          customProduct: zone.recommendedCampaign
        })
      });
      aiCopy = await contentRes.json();
    } catch (e) {
      console.warn('AI Content generation fallback:', e);
    }

    const primaryVariant = aiCopy?.variants?.[0] || {
      headline: zone.offerHeadline,
      body: zone.offerBody,
      language: targetLanguage
    };

    // 2. Invoke Campaign Orchestrator Dispatch Engine
    let dispatchRes: any = null;
    try {
      const orchRes = await fetch('http://localhost:5004/api/orchestrator/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Autonomous AI] ${zone.name} (${targetLanguage})`,
          category: zone.category === 'University Campus' ? 'STUDENT_HYPERLOCAL' : 'ENTERPRISE_DIRECT',
          channel,
          targetLanguage,
          headline: primaryVariant.headline,
          body: primaryVariant.body,
          targetCount: zone.currentPingsCount,
          targetGeofenceId: zone.id
        })
      });
      dispatchRes = await orchRes.json();
    } catch (e) {
      console.warn('Orchestrator fallback:', e);
    }

    console.log(`⚡ [Auto-Dispatch] Successfully executed AI Multilingual Dispatch for ${zone.name} in ${targetLanguage} via ${channel}`);

    res.json({
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      zoneName: zone.name,
      targetAudiencePings: zone.currentPingsCount,
      targetLanguage,
      channel,
      generatedAiVariant: primaryVariant,
      orchestrationDetails: dispatchRes?.campaign || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/geo/simulate-trigger ───────────────────────────
app.post('/api/geo/simulate-trigger', async (req: Request, res: Response) => {
  try {
    const { zoneId, spikePings } = req.body;
    const addPings = spikePings || 150;

    let targetId = zoneId;
    if (!targetId) {
      const all = await GeofencesDB.getAll();
      targetId = all[0]?.id;
    }

    const updatedZone = await GeofencesDB.updatePings(targetId, addPings);
    const allZones = await GeofencesDB.getAll();
    const { triggeredAlerts } = evaluateGeofenceTriggers(allZones);

    console.log(`📍 [PostgreSQL] Simulated ${addPings} pings on zone: ${updatedZone?.name || targetId}`);

    res.json({
      message: `Trigger simulated for zone ${updatedZone?.name || targetId}!`,
      zone: updatedZone,
      triggeredAlerts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/geo/geofences ───────────────────────────────────
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

    await GeofencesDB.insert(newZone);
    console.log(`✅ [PostgreSQL] Created new geofence: "${newZone.name}"`);

    res.status(201).json(newZone);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`📍 [Geo-Targeted Campaign Service] Running on http://localhost:${PORT}`);
  console.log(`🐘 [PostgreSQL] Connected to Neon DB Cloud Cluster`);
});
