import express, { Request, Response } from 'express';
import cors from 'cors';
import { dispatchCampaign } from './dispatch/orchestratorEngine';
import { CampaignsDB, dbExplorer } from './db';

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const analytics = await CampaignsDB.getAnalytics();
    const activeCampaigns = await CampaignsDB.getAll({ status: 'ACTIVE' });
    res.json({
      status: 'UP',
      service: 'campaign-orchestrator-service',
      port: PORT,
      database: 'Neon PostgreSQL (Cloud)',
      activeCampaignsCount: activeCampaigns.length,
      totalCampaigns: analytics.totalCampaigns,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// ─── DB Explorer Admin Endpoints ────────────────────────────────
app.get('/api/orchestrator/admin/db/tables', async (_req: Request, res: Response) => {
  try {
    const tables = await dbExplorer.getTables();
    res.json({ service: 'campaign-orchestrator-service', database: 'Neon PostgreSQL (Cloud)', tables });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orchestrator/admin/db/data/:table', async (req: Request, res: Response) => {
  try {
    const data = await dbExplorer.getTableData(req.params.table);
    res.json({ table: req.params.table, rows: data, count: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orchestrator/admin/db/query', async (req: Request, res: Response) => {
  try {
    const { sql } = req.body;
    const result = await dbExplorer.runQuery(sql);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── GET /api/orchestrator/campaigns ──────────────────────────
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

// ─── GET /api/orchestrator/analytics ──────────────────────────
app.get('/api/orchestrator/analytics', async (_req: Request, res: Response) => {
  try {
    const analytics = await CampaignsDB.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/orchestrator/campaigns/:id ──────────────────────
app.get('/api/orchestrator/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const cmp = await CampaignsDB.getById(req.params.id);
    if (!cmp) return res.status(404).json({ error: 'Campaign not found' });
    res.json(cmp);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/orchestrator/dispatch ──────────────────────────
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
    console.log(`🚀 [PostgreSQL] Dispatched & saved campaign: "${newCampaign.title}" (${newCampaign.channel})`);

    res.status(201).json({
      message: 'Campaign saved and launched across omnichannel dispatch queue!',
      campaign: newCampaign
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 [Campaign Orchestrator Service] Running on http://localhost:${PORT}`);
  console.log(`🐘 [PostgreSQL] Connected to Neon DB Cloud Cluster`);
});
