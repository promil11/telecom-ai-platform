import { Pool } from 'pg';
import { INITIAL_LEADS, EnterpriseLead } from './data/mockLeads';

const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_Dbfu58pPwRnV@ep-dry-sky-b4aow3cl-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000
});

console.log('🐘 [PostgreSQL] Initialized Neon DB pool connection');

// ─── Table Initialization ──────────────────────────────────────
export async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id                          VARCHAR(255) PRIMARY KEY,
        company_name                TEXT NOT NULL,
        industry                    TEXT NOT NULL,
        employees                   INTEGER,
        annual_revenue_usd          DOUBLE PRECISION,
        product_target              TEXT,
        contract_expiry_months      INTEGER,
        bandwidth_need_gbps         DOUBLE PRECISION,
        distance_to_fiber_meters    DOUBLE PRECISION,
        digital_portal_pings        INTEGER,
        estimated_deal_value_zar    DOUBLE PRECISION,
        contact_person              TEXT,
        contact_email               TEXT,
        contact_phone               TEXT,
        assigned_rep                TEXT,
        status                      VARCHAR(50) NOT NULL DEFAULT 'WARM',
        score                       INTEGER NOT NULL DEFAULT 50,
        conversion_probability      DOUBLE PRECISION,
        feature_impacts_json        TEXT,
        updated_at                  TEXT NOT NULL,
        created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await pool.query('SELECT COUNT(*)::int as cnt FROM leads');
    const count = res.rows[0].cnt;

    if (count === 0) {
      console.log('🌱 [PostgreSQL] Seeding initial enterprise leads into Neon DB...');
      for (const lead of INITIAL_LEADS) {
        await pool.query(`
          INSERT INTO leads (
            id, company_name, industry, employees, annual_revenue_usd, product_target,
            contract_expiry_months, bandwidth_need_gbps, distance_to_fiber_meters,
            digital_portal_pings, estimated_deal_value_zar, contact_person, contact_email,
            contact_phone, assigned_rep, status, score, conversion_probability,
            feature_impacts_json, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (id) DO NOTHING;
        `, [
          lead.id, lead.companyName, lead.industry, lead.employees, lead.annualRevenueUsd,
          lead.productTarget, lead.contractExpiryMonths, lead.bandwidthNeedGbps,
          lead.distanceToFiberNodeMeters, lead.digitalPortalPingsLast30Days,
          lead.estimatedDealValueZar, lead.contactPerson, lead.contactEmail,
          lead.contactPhone, lead.assignedRep, lead.status, lead.score,
          lead.conversionProbability, JSON.stringify(lead.featureImpacts), lead.updatedAt
        ]);
      }
      console.log(`✅ [PostgreSQL] Seeded ${INITIAL_LEADS.length} enterprise leads.`);
    } else {
      console.log(`✅ [PostgreSQL] Found ${count} existing leads in Neon DB.`);
    }
  } catch (err) {
    console.error('❌ [PostgreSQL] Init DB error:', err);
  }
}

// Automatically trigger DB init on load
initDb();

// ─── Helper: Row → EnterpriseLead ──────────────────────────────
function rowToLead(row: any): EnterpriseLead {
  return {
    id: row.id,
    companyName: row.company_name,
    industry: row.industry,
    employees: row.employees ? Number(row.employees) : 0,
    annualRevenueUsd: row.annual_revenue_usd ? Number(row.annual_revenue_usd) : 0,
    productTarget: row.product_target,
    contractExpiryMonths: row.contract_expiry_months ? Number(row.contract_expiry_months) : 0,
    bandwidthNeedGbps: row.bandwidth_need_gbps ? Number(row.bandwidth_need_gbps) : 0,
    distanceToFiberNodeMeters: row.distance_to_fiber_meters ? Number(row.distance_to_fiber_meters) : 0,
    digitalPortalPingsLast30Days: row.digital_portal_pings ? Number(row.digital_portal_pings) : 0,
    estimatedDealValueZar: row.estimated_deal_value_zar ? Number(row.estimated_deal_value_zar) : 0,
    contactPerson: row.contact_person,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    assignedRep: row.assigned_rep,
    status: row.status,
    score: Number(row.score),
    conversionProbability: row.conversion_probability ? Number(row.conversion_probability) : 0,
    featureImpacts: JSON.parse(row.feature_impacts_json || '[]'),
    updatedAt: row.updated_at
  };
}

// ─── DB Operations ──────────────────────────────────────────────
export const LeadsDB = {
  async getAll(filters?: { status?: string; search?: string }): Promise<EnterpriseLead[]> {
    let sql = 'SELECT * FROM leads';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.status && filters.status !== 'ALL') {
      params.push(filters.status);
      conditions.push(`UPPER(status) = UPPER($${params.length})`);
    }

    if (filters?.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      const pIdx = params.length;
      conditions.push(`(LOWER(company_name) LIKE $${pIdx} OR LOWER(industry) LIKE $${pIdx})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY score DESC';

    const res = await pool.query(sql, params);
    return res.rows.map(rowToLead);
  },

  async getById(id: string): Promise<EnterpriseLead | null> {
    const res = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    return res.rows.length > 0 ? rowToLead(res.rows[0]) : null;
  },

  async insert(lead: EnterpriseLead): Promise<EnterpriseLead> {
    await pool.query(`
      INSERT INTO leads (
        id, company_name, industry, employees, annual_revenue_usd, product_target,
        contract_expiry_months, bandwidth_need_gbps, distance_to_fiber_meters,
        digital_portal_pings, estimated_deal_value_zar, contact_person, contact_email,
        contact_phone, assigned_rep, status, score, conversion_probability,
        feature_impacts_json, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        score = EXCLUDED.score,
        conversion_probability = EXCLUDED.conversion_probability,
        feature_impacts_json = EXCLUDED.feature_impacts_json,
        updated_at = EXCLUDED.updated_at;
    `, [
      lead.id, lead.companyName, lead.industry, lead.employees, lead.annualRevenueUsd,
      lead.productTarget, lead.contractExpiryMonths, lead.bandwidthNeedGbps,
      lead.distanceToFiberNodeMeters, lead.digitalPortalPingsLast30Days,
      lead.estimatedDealValueZar, lead.contactPerson, lead.contactEmail,
      lead.contactPhone, lead.assignedRep, lead.status, lead.score,
      lead.conversionProbability, JSON.stringify(lead.featureImpacts), lead.updatedAt
    ]);
    return lead;
  },

  async getKPIs() {
    const total = (await pool.query('SELECT COUNT(*)::int as cnt FROM leads')).rows[0].cnt;
    const hot = (await pool.query("SELECT COUNT(*)::int as cnt FROM leads WHERE UPPER(status) = 'HOT'")).rows[0].cnt;
    const warm = (await pool.query("SELECT COUNT(*)::int as cnt FROM leads WHERE UPPER(status) = 'WARM'")).rows[0].cnt;
    const cold = (await pool.query("SELECT COUNT(*)::int as cnt FROM leads WHERE UPPER(status) = 'COLD'")).rows[0].cnt;
    const pipeline = (await pool.query('SELECT COALESCE(SUM(estimated_deal_value_zar), 0) as total FROM leads')).rows[0].total;
    const weighted = (await pool.query('SELECT COALESCE(SUM(estimated_deal_value_zar * conversion_probability), 0) as total FROM leads')).rows[0].total;
    const avgScore = (await pool.query('SELECT COALESCE(AVG(score), 0) as avg FROM leads')).rows[0].avg;

    return {
      totalLeads: Number(total),
      hotLeads: Number(hot),
      warmLeads: Number(warm),
      coldLeads: Number(cold),
      totalPipelineZar: Math.round(Number(pipeline)),
      weightedPipelineZar: Math.round(Number(weighted)),
      avgScore: Math.round(Number(avgScore)),
      topProduct: 'Enterprise 5G Private Net'
    };
  },

  async delete(id: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }
};

// ─── PostgreSQL DB Explorer for Dashboard Studio ───────────────
export const dbExplorer = {
  async getTables() {
    const res = await pool.query(`
      SELECT table_name as name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = res.rows;
    const result = [];

    for (const t of tables) {
      const cntRes = await pool.query(`SELECT COUNT(*)::int as cnt FROM "${t.name}"`);
      const colRes = await pool.query(`
        SELECT 
          ordinal_position as cid,
          column_name as name,
          data_type as type,
          CASE WHEN is_nullable = 'YES' THEN 0 ELSE 1 END as notnull,
          column_default as dflt_value,
          0 as pk
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [t.name]);

      result.push({
        name: t.name,
        rowCount: cntRes.rows[0].cnt,
        columns: colRes.rows
      });
    }

    return result;
  },

  async getTableData(tableName: string, limit = 50) {
    const res = await pool.query(`SELECT * FROM "${tableName}" LIMIT $1;`, [limit]);
    return res.rows;
  },

  async runQuery(sql: string) {
    const res = await pool.query(sql);
    if (Array.isArray(res.rows)) {
      return { type: 'SELECT', rows: res.rows, rowCount: res.rows.length };
    } else {
      return { type: 'WRITE', changes: res.rowCount, lastInsertRowid: null };
    }
  }
};

export default pool;
