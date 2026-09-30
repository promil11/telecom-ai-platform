import express, { Request, Response } from 'express';
import cors from 'cors';
import { calculateLeadScore, TRAINED_MODEL_METRICS } from './engine/scoringEngine';
import { LeadsDB, dbExplorer } from './db';
import { EnterpriseLead } from './data/mockLeads';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const kpis = await LeadsDB.getKPIs();
    res.json({
      status: 'UP',
      service: 'b2b-lead-scoring-service',
      port: PORT,
      database: 'Neon PostgreSQL (Cloud)',
      modelAccuracy: '95.4%',
      leadsCount: kpis.totalLeads,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// ─── GET /api/leads/model-metrics — ML Model Accuracy & Performance Matrix
app.get('/api/leads/model-metrics', (_req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    metrics: TRAINED_MODEL_METRICS
  });
});

// ─── GET /api/leads — List all leads, with filtering ───────────
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

// ─── GET /api/leads/kpis — Aggregated pipeline metrics ─────────
app.get('/api/leads/kpis', async (_req: Request, res: Response) => {
  try {
    const kpis = await LeadsDB.getKPIs();
    res.json(kpis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/leads/:id — Single lead detail ───────────────────
app.get('/api/leads/:id', async (req: Request, res: Response) => {
  try {
    const lead = await LeadsDB.getById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/leads/score — Dynamic scoring (no persist) ──────
app.post('/api/leads/score', (req: Request, res: Response) => {
  const input = req.body;
  const scoreResult = calculateLeadScore(input);
  res.json({ input, result: scoreResult });
});

// ─── POST /api/leads — Create + Score + Persist ────────────────
app.post('/api/leads', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { score, status, conversionProbability, featureImpacts } = calculateLeadScore(body);

    const newLead: EnterpriseLead = {
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
      assignedRep: body.assignedRep || 'Unassigned Lead Desk',
      status,
      score,
      conversionProbability,
      featureImpacts,
      updatedAt: new Date().toISOString()
    };

    await LeadsDB.insert(newLead);
    console.log(`✅ [PostgreSQL] Inserted new lead: ${newLead.companyName} (Score: ${score})`);
    res.status(201).json(newLead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DB Explorer Admin Endpoints ────────────────────────────────
app.get('/api/leads/admin/db/tables', async (_req: Request, res: Response) => {
  try {
    const tables = await dbExplorer.getTables();
    res.json({ service: 'b2b-lead-scoring-service', database: 'Neon PostgreSQL (Cloud)', tables });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leads/admin/db/data/:table', async (req: Request, res: Response) => {
  try {
    const data = await dbExplorer.getTableData(req.params.table);
    res.json({ table: req.params.table, rows: data, count: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads/admin/db/query', async (req: Request, res: Response) => {
  try {
    const { sql } = req.body;
    const result = await dbExplorer.runQuery(sql);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🤖 [B2B Lead Scoring Microservice] Running on http://localhost:${PORT}`);
  console.log(`🐘 [PostgreSQL] Connected to Neon DB Cloud Cluster`);
});
