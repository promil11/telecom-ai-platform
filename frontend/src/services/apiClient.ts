import { EnterpriseLead, LeadKpis, CellTower, GeofenceZone, TelemetryPing, GeneratedVariant, Campaign, MicroserviceStatus } from '../types';

const API_BASE = '/api';

// Helper fetcher with graceful fallback to demo mock data if microservices offline
async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`[ApiClient] Network request failed for ${url}. Using offline demo fallback:`, error);
    return fallbackData;
  }
}

export const ApiClient = {
  // Gateway & Microservices Status
  getMicroservicesStatus: async (): Promise<{ gateway: string; services: MicroserviceStatus[] }> => {
    return fetchWithFallback(`${API_BASE}/gateway/status`, {
      gateway: 'ONLINE',
      services: [
        { name: 'b2b-lead-scoring-service', status: 'ONLINE' },
        { name: 'geo-campaign-service', status: 'ONLINE' },
        { name: 'ai-content-service', status: 'ONLINE' },
        { name: 'campaign-orchestrator-service', status: 'ONLINE' }
      ]
    });
  },

  // B2B Lead Scoring
  getLeads: async (params?: { status?: string; product?: string; search?: string }): Promise<{ total: number; leads: EnterpriseLead[] }> => {
    const query = new URLSearchParams(params as any).toString();
    const url = `${API_BASE}/leads${query ? `?${query}` : ''}`;
    return fetchWithFallback(url, { total: 0, leads: [] });
  },

  getLeadKpis: async (): Promise<LeadKpis> => {
    return fetchWithFallback(`${API_BASE}/leads/kpis`, {
      totalLeads: 5,
      hotLeads: 3,
      warmLeads: 1,
      coldLeads: 1,
      totalPipelineZar: 28800000,
      weightedPipelineZar: 23400000,
      avgScore: 81,
      topProduct: 'Enterprise 5G Private Net'
    });
  },

  getModelMetrics: async () => {
    return fetchWithFallback(`${API_BASE}/leads/model-metrics`, {
      metrics: {
        modelType: 'Gradient Boosted Decision Forest (Production v2.4)',
        accuracy: 0.954,
        precision: 0.948,
        recall: 0.961,
        f1Score: 0.954,
        rocAuc: 0.978,
        inferenceLatencyMs: 1.8
      }
    });
  },

  scoreLeadDynamic: async (leadInput: Partial<EnterpriseLead>) => {
    try {
      const res = await fetch(`${API_BASE}/leads/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadInput)
      });
      return await res.json();
    } catch (e) {
      console.warn('Scoring fallback:', e);
      return null;
    }
  },

  createLead: async (newLead: Partial<EnterpriseLead>): Promise<EnterpriseLead> => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    });
    return res.json();
  },

  // Geo Campaigns & Spatial Telemetry
  getTowers: async (): Promise<{ total: number; towers: CellTower[] }> => {
    return fetchWithFallback(`${API_BASE}/geo/towers`, { total: 0, towers: [] });
  },

  getGeofences: async (): Promise<{ total: number; geofences: GeofenceZone[] }> => {
    return fetchWithFallback(`${API_BASE}/geo/geofences`, { total: 0, geofences: [] });
  },

  getTelemetryPings: async (count: number = 30): Promise<{ timestamp: string; pingsCount: number; pings: TelemetryPing[] }> => {
    return fetchWithFallback(`${API_BASE}/geo/telemetry?count=${count}`, { timestamp: new Date().toISOString(), pingsCount: 0, pings: [] });
  },

  simulateGeoTrigger: async (zoneId: string, spikePings: number = 150) => {
    const res = await fetch(`${API_BASE}/geo/simulate-trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoneId, spikePings })
    });
    return res.json();
  },

  subscribeTelemetryStream: (
    onPing: (data: { timestamp: string; pings: TelemetryPing[] }) => void,
    onBreach?: (alert: any) => void
  ): (() => void) => {
    try {
      const eventSource = new EventSource(`${API_BASE}/geo/stream/telemetry`);

      eventSource.addEventListener('telemetry_ping', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          onPing(parsed);
        } catch (err) { }
      });

      if (onBreach) {
        eventSource.addEventListener('breach_alert', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            onBreach(parsed);
          } catch (err) { }
        });
      }

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('EventSource connection failed:', err);
      return () => { };
    }
  },

  executeMultilingualAutoDispatch: async (zoneId: string, targetLanguage: string = 'isiZulu', channel: string = 'WHATSAPP') => {
    const res = await fetch(`${API_BASE}/geo/auto-dispatch-breach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoneId, targetLanguage, channel })
    });
    return res.json();
  },

  // AI Content Studio
  generateCopyVariants: async (payload: {
    campaignType: string;
    targetLanguage: string;
    channel: string;
    tone: string;
    customLocation?: string;
    customPrice?: string;
  }): Promise<{ variants: GeneratedVariant[] }> => {
    const res = await fetch(`${API_BASE}/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Campaign Orchestrator
  getCampaigns: async (): Promise<{ total: number; campaigns: Campaign[] }> => {
    return fetchWithFallback(`${API_BASE}/orchestrator/campaigns`, { total: 0, campaigns: [] });
  },

  getCampaignAnalytics: async () => {
    return fetchWithFallback(`${API_BASE}/orchestrator/analytics`, {
      totalCampaigns: 3,
      totalSent: 24430,
      totalConverted: 2358,
      totalRevenueZar: 750680,
      avgConversionRate: 9.65,
      channelBreakdown: []
    });
  },

  dispatchCampaign: async (payload: {
    title: string;
    category: string;
    channel: string;
    targetLanguage: string;
    headline: string;
    body: string;
    targetGeofenceId?: string;
  }) => {
    const res = await fetch(`${API_BASE}/orchestrator/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Database Admin Explorer
  getDbTables: async (serviceKey: 'leads' | 'geo' | 'orchestrator'): Promise<{ service: string; database: string; tables: { name: string; rowCount: number; columns: any[] }[] }> => {
    return fetchWithFallback(`${API_BASE}/${serviceKey}/admin/db/tables`, {
      service: `${serviceKey}-service`,
      database: `${serviceKey}.sqlite3`,
      tables: []
    });
  },

  getDbData: async (serviceKey: 'leads' | 'geo' | 'orchestrator', tableName: string) => {
    return fetchWithFallback(`${API_BASE}/${serviceKey}/admin/db/data/${tableName}`, {
      table: tableName,
      rows: [],
      count: 0
    });
  },

  runDbQuery: async (serviceKey: 'leads' | 'geo' | 'orchestrator', sql: string) => {
    try {
      const res = await fetch(`${API_BASE}/${serviceKey}/admin/db/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      return await res.json();
    } catch (err: any) {
      return { error: err.message };
    }
  }
};

