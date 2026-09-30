import { Pool } from 'pg';
import { INITIAL_CAMPAIGNS, Campaign } from './dispatch/orchestratorEngine';

const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_Dbfu58pPwRnV@ep-dry-sky-b4aow3cl-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000
});

console.log('🐘 [PostgreSQL] Initialized Neon DB pool connection for Orchestrator');

// ─── Table Initialization ──────────────────────────────────────
export async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id                          VARCHAR(255) PRIMARY KEY,
        title                       TEXT NOT NULL,
        category                    TEXT NOT NULL,
        channel                     TEXT NOT NULL,
        target_language             TEXT NOT NULL DEFAULT 'English',
        target_geofence_id          TEXT,
        headline                    TEXT NOT NULL,
        body                        TEXT NOT NULL,
        total_target_users          INTEGER DEFAULT 0,
        sent_count                  INTEGER DEFAULT 0,
        delivered_count             INTEGER DEFAULT 0,
        clicked_count               INTEGER DEFAULT 0,
        converted_count             INTEGER DEFAULT 0,
        conversion_rate_percent     DOUBLE PRECISION DEFAULT 0,
        revenue_generated_zar       DOUBLE PRECISION DEFAULT 0,
        status                      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        launched_at                 TEXT NOT NULL,
        created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await pool.query('SELECT COUNT(*)::int as cnt FROM campaigns');
    const count = res.rows[0].cnt;

    if (count === 0) {
      console.log('🌱 [PostgreSQL] Seeding initial campaigns into Neon DB...');
      for (const c of INITIAL_CAMPAIGNS) {
        await pool.query(`
          INSERT INTO campaigns (
            id, title, category, channel, target_language, target_geofence_id,
            headline, body, total_target_users, sent_count, delivered_count,
            clicked_count, converted_count, conversion_rate_percent,
            revenue_generated_zar, status, launched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING;
        `, [
          c.id, c.title, c.category, c.channel, c.targetLanguage, c.targetGeofenceId || null,
          c.headline, c.body, c.totalTargetUsers, c.sentCount, c.deliveredCount,
          c.clickedCount, c.convertedCount, c.conversionRatePercent, c.revenueGeneratedZar,
          c.status, c.launchedAt
        ]);
      }
      console.log(`✅ [PostgreSQL] Seeded ${INITIAL_CAMPAIGNS.length} campaigns.`);
    } else {
      console.log(`✅ [PostgreSQL] Found ${count} existing campaigns in Neon DB.`);
    }
  } catch (err) {
    console.error('❌ [PostgreSQL] Init DB error:', err);
  }
}

initDb();

// ─── Helper: Row → Campaign ────────────────────────────────────
function rowToCampaign(row: any): Campaign {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    channel: row.channel,
    targetLanguage: row.target_language,
    targetGeofenceId: row.target_geofence_id,
    headline: row.headline,
    body: row.body,
    totalTargetUsers: Number(row.total_target_users),
    sentCount: Number(row.sent_count),
    deliveredCount: Number(row.delivered_count),
    clickedCount: Number(row.clicked_count),
    convertedCount: Number(row.converted_count),
    conversionRatePercent: Number(row.conversion_rate_percent),
    revenueGeneratedZar: Number(row.revenue_generated_zar),
    status: row.status,
    launchedAt: row.launched_at
  };
}

// ─── DB Operations ──────────────────────────────────────────────
export const CampaignsDB = {
  async getAll(filters?: { channel?: string; status?: string }): Promise<Campaign[]> {
    let sql = 'SELECT * FROM campaigns';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.channel) {
      params.push(filters.channel);
      conditions.push(`UPPER(channel) = UPPER($${params.length})`);
    }

    if (filters?.status) {
      params.push(filters.status);
      conditions.push(`UPPER(status) = UPPER($${params.length})`);
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const res = await pool.query(sql, params);
    return res.rows.map(rowToCampaign);
  },

  async getById(id: string): Promise<Campaign | null> {
    const res = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
    return res.rows.length > 0 ? rowToCampaign(res.rows[0]) : null;
  },

  async insert(c: Campaign): Promise<Campaign> {
    await pool.query(`
      INSERT INTO campaigns (
        id, title, category, channel, target_language, target_geofence_id,
        headline, body, total_target_users, sent_count, delivered_count,
        clicked_count, converted_count, conversion_rate_percent,
        revenue_generated_zar, status, launched_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        sent_count = EXCLUDED.sent_count,
        delivered_count = EXCLUDED.delivered_count,
        clicked_count = EXCLUDED.clicked_count,
        converted_count = EXCLUDED.converted_count,
        revenue_generated_zar = EXCLUDED.revenue_generated_zar,
        status = EXCLUDED.status;
    `, [
      c.id, c.title, c.category, c.channel, c.targetLanguage, c.targetGeofenceId || null,
      c.headline, c.body, c.totalTargetUsers, c.sentCount, c.deliveredCount,
      c.clickedCount, c.convertedCount, c.conversionRatePercent, c.revenueGeneratedZar,
      c.status, c.launchedAt
    ]);
    return c;
  },

  async getAnalytics() {
    const total = (await pool.query('SELECT COUNT(*)::int as cnt FROM campaigns')).rows[0].cnt;
    const totalSent = (await pool.query('SELECT COALESCE(SUM(sent_count), 0)::bigint as s FROM campaigns')).rows[0].s;
    const totalConverted = (await pool.query('SELECT COALESCE(SUM(converted_count), 0)::bigint as c FROM campaigns')).rows[0].c;
    const totalRevenue = (await pool.query('SELECT COALESCE(SUM(revenue_generated_zar), 0) as r FROM campaigns')).rows[0].r;

    const sNum = Number(totalSent);
    const cNum = Number(totalConverted);
    const avgConv = sNum > 0 ? Number(((cNum / sNum) * 100).toFixed(2)) : 0;

    const channelBreakdown = [];
    for (const ch of ['SMS', 'PUSH', 'WHATSAPP', 'EMAIL']) {
      const res = await pool.query(`
        SELECT COUNT(*)::int as cnt, 
               COALESCE(SUM(sent_count), 0)::bigint as sent, 
               COALESCE(SUM(converted_count), 0)::bigint as conv, 
               COALESCE(SUM(revenue_generated_zar), 0) as rev
        FROM campaigns WHERE UPPER(channel) = $1
      `, [ch]);

      const r = res.rows[0];
      const sent = Number(r?.sent || 0);
      const conv = Number(r?.conv || 0);
      channelBreakdown.push({
        channel: ch,
        campaignsCount: Number(r?.cnt || 0),
        sent,
        converted: conv,
        revenueZar: Number(r?.rev || 0),
        conversionRate: sent > 0 ? Number(((conv / sent) * 100).toFixed(2)) : 0
      });
    }

    return {
      totalCampaigns: Number(total),
      totalSent: sNum,
      totalConverted: cNum,
      totalRevenueZar: Math.round(Number(totalRevenue)),
      avgConversionRate: avgConv,
      channelBreakdown
    };
  }
};

// ─── PostgreSQL DB Explorer ────────────────────────────────────
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
