import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LeadScoringModule } from './components/lead-scoring/LeadScoringModule';
import { GeoCampaignModule } from './components/geo-campaigns/GeoCampaignModule';
import { AiContentStudioModule } from './components/ai-studio/AiContentStudioModule';
import { AnalyticsModule } from './components/analytics/AnalyticsModule';

import { ApiClient } from './services/apiClient';
import { EnterpriseLead, LeadKpis, CellTower, GeofenceZone, TelemetryPing, Campaign, MicroserviceStatus } from './types';

export type ActiveTab = 'LEAD_SCORING' | 'GEO_CAMPAIGNS' | 'AI_STUDIO' | 'ANALYTICS';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('LEAD_SCORING');

  // Master State
  const [gatewayStatus, setGatewayStatus] = useState<string>('ONLINE');
  const [microservices, setMicroservices] = useState<MicroserviceStatus[]>([
    { name: 'b2b-lead-scoring-service', status: 'ONLINE' },
    { name: 'geo-campaign-service', status: 'ONLINE' },
    { name: 'ai-content-service', status: 'ONLINE' },
    { name: 'campaign-orchestrator-service', status: 'ONLINE' }
  ]);

  const [leads, setLeads] = useState<EnterpriseLead[]>([]);
  const [leadKpis, setLeadKpis] = useState<LeadKpis>({
    totalLeads: 5,
    hotLeads: 3,
    warmLeads: 1,
    coldLeads: 1,
    totalPipelineZar: 28800000,
    weightedPipelineZar: 23400000,
    avgScore: 81,
    topProduct: 'Enterprise 5G Private Net'
  });

  const [towers, setTowers] = useState<CellTower[]>([]);
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [telemetryPings, setTelemetryPings] = useState<TelemetryPing[]>([]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const statusRes = await ApiClient.getMicroservicesStatus();
      setGatewayStatus(statusRes.gateway);
      setMicroservices(statusRes.services);

      const leadsRes = await ApiClient.getLeads();
      setLeads(leadsRes.leads);
      const kpiRes = await ApiClient.getLeadKpis();
      setLeadKpis(kpiRes);

      const towersRes = await ApiClient.getTowers();
      setTowers(towersRes.towers);

      const geoRes = await ApiClient.getGeofences();
      setGeofences(geoRes.geofences);

      const pingsRes = await ApiClient.getTelemetryPings(35);
      setTelemetryPings(pingsRes.pings);

      const cmpRes = await ApiClient.getCampaigns();
      setCampaigns(cmpRes.campaigns);

      const analyticsRes = await ApiClient.getCampaignAnalytics();
      setAnalytics(analyticsRes);
    } catch (error) {
      console.warn('Microservices connection error (using demo data):', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-content">
        <Topbar
          activeTab={activeTab}
          microservices={microservices}
          gatewayStatus={gatewayStatus}
          onRefresh={loadData}
        />

        <div className="page-area">
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              gap: 20
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.2))',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  border: '2px solid rgba(99, 102, 241, 0.2)',
                  borderTop: '2px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'rotate 0.8s linear infinite'
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Connecting to AetherTel Microservices
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                  API Gateway → Service Mesh → Data Layer
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'LEAD_SCORING' && (
                <LeadScoringModule leads={leads} kpis={leadKpis} onRefresh={loadData} />
              )}
              {activeTab === 'GEO_CAMPAIGNS' && (
                <GeoCampaignModule
                  towers={towers}
                  geofences={geofences}
                  telemetryPings={telemetryPings}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'AI_STUDIO' && <AiContentStudioModule />}
              {activeTab === 'ANALYTICS' && (
                <AnalyticsModule campaigns={campaigns} analytics={analytics} onRefresh={loadData} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
