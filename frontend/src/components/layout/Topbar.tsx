import React from 'react';
import { RefreshCw, Server, Wifi, Shield } from 'lucide-react';
import { ActiveTab } from '../../App';
import { MicroserviceStatus } from '../../types';

interface TopbarProps {
  activeTab: ActiveTab;
  microservices: MicroserviceStatus[];
  gatewayStatus: string;
  onRefresh: () => void;
}

const TAB_META: Record<ActiveTab, { label: string; desc: string; accent: string }> = {
  LEAD_SCORING: {
    label: 'AI B2B Lead Scoring',
    desc: 'Explainable ML propensity engine for enterprise sales conversion',
    accent: '#6366f1'
  },
  GEO_CAMPAIGNS: {
    label: 'Hyperlocal Geo Engine',
    desc: 'Cell tower footfall analytics & auto-triggered campaign dispatch',
    accent: '#06b6d4'
  },
  AI_STUDIO: {
    label: 'Multilingual AI Copy Studio',
    desc: 'LLM-powered localized ad copy for 10+ regional languages',
    accent: '#a855f7'
  },
  ANALYTICS: {
    label: 'Campaign Analytics',
    desc: 'Omnichannel dispatch performance & revenue attribution',
    accent: '#10b981'
  }
};

export const Topbar: React.FC<TopbarProps> = ({ activeTab, microservices, gatewayStatus, onRefresh }) => {
  const meta = TAB_META[activeTab];
  const onlineCount = microservices.filter(s => s.status === 'ONLINE').length;
  const allOnline = onlineCount === microservices.length;

  return (
    <div className="topbar">
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <div style={{
          width: 3,
          height: 28,
          borderRadius: 2,
          background: `linear-gradient(to bottom, ${meta.accent}, transparent)`,
          flexShrink: 0
        }} />
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            {meta.label}
          </h2>
          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            marginTop: 1
          }}>
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Right: Status bar */}
      <div className="flex items-center gap-3">
        {/* Service health */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: '6px 12px',
          fontSize: '0.7rem'
        }}>
          <Server size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Services</span>
          <div className="flex items-center gap-1">
            {microservices.map((svc, i) => (
              <div
                key={i}
                title={`${svc.name}: ${svc.status}`}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: svc.status === 'ONLINE' ? '#10b981' : '#f43f5e',
                  boxShadow: svc.status === 'ONLINE' ? '0 0 4px rgba(16,185,129,0.6)' : 'none'
                }}
              />
            ))}
          </div>
          <span style={{
            fontWeight: 700,
            color: allOnline ? '#34d399' : '#fbbf24',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem'
          }}>
            {onlineCount}/{microservices.length}
          </span>
        </div>

        {/* Gateway */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: '6px 12px',
          fontSize: '0.7rem'
        }}>
          <Shield size={12} style={{ color: '#34d399' }} />
          <span style={{ color: '#34d399', fontWeight: 600 }}>API Gateway</span>
          <div className="pulse-dot pulse-green" style={{ width: 6, height: 6 }} />
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="btn btn-ghost btn-icon btn-sm"
          title="Refresh all data"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
};
