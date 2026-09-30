import { Pool } from 'pg';
import { GEOFENCE_ZONES, GeofenceZone } from './data/mockGeoData';

const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_Dbfu58pPwRnV@ep-dry-sky-b4aow3cl-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000
});

console.log('🐘 [PostgreSQL] Initialized Neon DB pool connection for Geo Service');

// ─── Table Initialization ──────────────────────────────────────
export async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS geofences (
        id                          VARCHAR(255) PRIMARY KEY,
        name                        TEXT NOT NULL,
        category                    TEXT NOT NULL,
        center_lat                  DOUBLE PRECISION NOT NULL,
        center_lng                  DOUBLE PRECISION NOT NULL,
        radius_meters               DOUBLE PRECISION NOT NULL,
        associated_tower_id         TEXT,
        target_demographic          TEXT,
        recommended_campaign        TEXT,
        trigger_threshold_pings     INTEGER NOT NULL,
        current_pings_count         INTEGER NOT NULL DEFAULT 0,
        is_triggered                BOOLEAN NOT NULL DEFAULT FALSE,
        offer_headline              TEXT,
        offer_body                  TEXT,
        last_triggered_at           TEXT,
        updated_at                  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    const res = await pool.query('SELECT COUNT(*)::int as cnt FROM geofences');
    const count = res.rows[0].cnt;

    if (count === 0) {
      console.log('🌱 [PostgreSQL] Seeding initial geofences into Neon DB...');
      for (const zone of GEOFENCE_ZONES) {
        await pool.query(`
          INSERT INTO geofences (
            id, name, category, center_lat, center_lng, radius_meters,
            associated_tower_id, target_demographic, recommended_campaign,
            trigger_threshold_pings, current_pings_count, is_triggered,
            offer_headline, offer_body, last_triggered_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO NOTHING;
        `, [
          zone.id, zone.name, zone.category, zone.lat, zone.lng,
          zone.radiusMeters, zone.associatedTowerId, zone.targetDemographic,
          zone.recommendedCampaign, zone.triggerThresholdPings, zone.currentPingsCount,
          zone.isTriggered, zone.offerHeadline, zone.offerBody, zone.lastTriggeredAt || null,
          new Date().toISOString()
        ]);
      }
      console.log(`✅ [PostgreSQL] Seeded ${GEOFENCE_ZONES.length} geofences.`);
    } else {
      console.log(`✅ [PostgreSQL] Found ${count} existing geofences in Neon DB.`);
    }
  } catch (err) {
    console.error('❌ [PostgreSQL] Init DB error:', err);
  }
}

initDb();

// ─── Helper: Row → GeofenceZone ────────────────────────────────
function rowToZone(row: any): GeofenceZone {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    lat: Number(row.center_lat),
    lng: Number(row.center_lng),
    radiusMeters: Number(row.radius_meters),
    associatedTowerId: row.associated_tower_id,
    targetDemographic: row.target_demographic,
    recommendedCampaign: row.recommended_campaign,
    triggerThresholdPings: Number(row.trigger_threshold_pings),
    currentPingsCount: Number(row.current_pings_count),
    isTriggered: Boolean(row.is_triggered),
    offerHeadline: row.offer_headline,
    offerBody: row.offer_body,
    lastTriggeredAt: row.last_triggered_at
  };
}

// ─── DB Operations ──────────────────────────────────────────────
export const GeofencesDB = {
  async getAll(filters?: { category?: string; triggeredOnly?: boolean }): Promise<GeofenceZone[]> {
    let sql = 'SELECT * FROM geofences';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.category) {
      params.push(filters.category);
      conditions.push(`UPPER(category) = UPPER($${params.length})`);
    }

    if (filters?.triggeredOnly) {
      conditions.push('is_triggered = TRUE');
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY current_pings_count DESC';

    const res = await pool.query(sql, params);
    return res.rows.map(rowToZone);
  },

  async getById(id: string): Promise<GeofenceZone | null> {
    const res = await pool.query('SELECT * FROM geofences WHERE id = $1', [id]);
    return res.rows.length > 0 ? rowToZone(res.rows[0]) : null;
  },

  async updatePings(id: string, addPings: number): Promise<GeofenceZone | null> {
    await pool.query(`
      UPDATE geofences
      SET current_pings_count = current_pings_count + $1,
          updated_at = CURRENT_TIMESTAMP::text
      WHERE id = $2;
    `, [addPings, id]);

    const zone = await this.getById(id);
    if (zone) {
      const triggered = zone.currentPingsCount >= zone.triggerThresholdPings;
      await pool.query(`
        UPDATE geofences
        SET is_triggered = $1,
            last_triggered_at = CASE WHEN $1 = TRUE THEN CURRENT_TIMESTAMP::text ELSE last_triggered_at END
        WHERE id = $2;
      `, [triggered, id]);
      zone.isTriggered = triggered;
    }
    return zone;
  },

  async insert(zone: GeofenceZone): Promise<GeofenceZone> {
    await pool.query(`
      INSERT INTO geofences (
        id, name, category, center_lat, center_lng, radius_meters,
        associated_tower_id, target_demographic, recommended_campaign,
        trigger_threshold_pings, current_pings_count, is_triggered,
        offer_headline, offer_body, last_triggered_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        current_pings_count = EXCLUDED.current_pings_count,
        is_triggered = EXCLUDED.is_triggered,
        updated_at = EXCLUDED.updated_at;
    `, [
      zone.id, zone.name, zone.category, zone.lat, zone.lng,
      zone.radiusMeters, zone.associatedTowerId, zone.targetDemographic,
      zone.recommendedCampaign, zone.triggerThresholdPings, zone.currentPingsCount,
      zone.isTriggered, zone.offerHeadline, zone.offerBody, zone.lastTriggeredAt || null,
      new Date().toISOString()
    ]);
    return zone;
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
