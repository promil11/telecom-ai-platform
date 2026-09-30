import React, { useState } from 'react';
import { Campaign } from '../../types';
import { ApiClient } from '../../services/apiClient';
import {
  Activity, Send, TrendingUp, RefreshCw,
  BarChart3, Layers, DollarSign, Zap, Users
} from 'lucide-react';

interface AnalyticsModuleProps {
  campaigns: Campaign[];
  analytics: any;
  onRefresh: () => void;
}

// Inline SVG bar chart
function BarChart({ data, color = '#6366f1' }: { data: { label: string; value: number; color?: string }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '0 4px' }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            borderRadius: '4px 4px 0 0',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: `${(item.value / max) * 100}%`,
              minHeight: 4,
              background: item.color || color,
              borderRadius: '3px 3px 0 0',
              opacity: 0.85,
              transition: 'height 0.6s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Donut chart SVG
function DonutChart({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) {
  const radius = (size / 2) - 8;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - percentage / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

const CHANNEL_DATA = [
  { channel: 'PUSH', name: 'App Push', conv: 10.2, rev: 174680, color: 'linear-gradient(135deg, #7c3aed, #6366f1)', accent: '#7c3aed' },
  { channel: 'SMS', name: 'Localized SMS', conv: 11.0, rev: 133500, color: 'linear-gradient(135deg, #0891b2, #22d3ee)', accent: '#0891b2' },
  { channel: 'WHATSAPP', name: 'WhatsApp', conv: 4.17, rev: 576000, color: 'linear-gradient(135deg, #059669, #34d399)', accent: '#059669' },
  { channel: 'EMAIL', name: 'B2B Email', conv: 3.4, rev: 85000, color: 'linear-gradient(135deg, #d97706, #fbbf24)', accent: '#d97706' }
];

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ campaigns, analytics, onRefresh }) => {
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const handleDispatchTest = async () => {
    setIsDispatching(true);
    await ApiClient.dispatchCampaign({
      title: 'Automated Hyperlocal Campaign Test',
      category: 'STUDENT_HYPERLOCAL',
      channel: 'PUSH',
      targetLanguage: 'isiZulu',
      headline: '🎓 Campus Special: 10GB Data @ R29',
      body: 'Instant activation across Pretoria University Sector.'
    });
    setIsDispatching(false);
    onRefresh();
  };

  const totalSent = analytics.totalSent || 24430;
  const avgConv = analytics.avgConversionRate || 9.65;
  const totalRev = analytics.totalRevenueZar || 969180;
  const activeCamps = campaigns.filter(c => c.status === 'ACTIVE').length;

  const weeklyData = [
    { label: 'Mon', value: 3200, color: '#6366f1' },
    { label: 'Tue', value: 4100, color: '#818cf8' },
    { label: 'Wed', value: 3700, color: '#6366f1' },
    { label: 'Thu', value: 5200, color: '#4f46e5' },
    { label: 'Fri', value: 4800, color: '#818cf8' },
    { label: 'Sat', value: 6100, color: '#6366f1' },
    { label: 'Sun', value: 5400, color: '#818cf8' }
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* KPI Cards */}
      <div className="grid-4">
        <div className="kpi-card kpi-indigo">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Omnichannel Sent
              </p>
              <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {(totalSent / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="kpi-icon icon-indigo">
              <Send size={18} />
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SMS · Push · WhatsApp · Email</p>
        </div>

        <div className="kpi-card kpi-emerald">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Avg Conversion Rate
              </p>
              <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#34d399', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {avgConv}%
              </p>
            </div>
            <div className="kpi-icon icon-emerald">
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, avgConv * 7)}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: 999 }} />
          </div>
        </div>

        <div className="kpi-card kpi-amber">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Campaign Revenue
              </p>
              <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.03em', lineHeight: 1 }}>
                R {(totalRev / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="kpi-icon icon-amber">
              <DollarSign size={18} />
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hyper-targeted ROI attribution</p>
        </div>

        <div className="kpi-card kpi-cyan">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Active Campaigns
              </p>
              <div className="flex items-baseline gap-2">
                <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#22d3ee', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {activeCamps}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {campaigns.length}</span>
              </div>
            </div>
            <div className="kpi-icon icon-cyan">
              <Activity size={18} />
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Currently dispatching live</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Weekly Dispatch Volume */}
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <BarChart3 size={16} style={{ color: '#818cf8' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Weekly Dispatch Volume
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={12} style={{ color: '#34d399' }} />
              <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>+18.4% vs last week</span>
            </div>
          </div>
          <BarChart data={weeklyData} color="#6366f1" />
        </div>

        {/* Channel Donut Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: '#10b981' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Revenue by Channel
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Donut */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
                {CHANNEL_DATA.map((item, idx) => {
                  const totalRev2 = CHANNEL_DATA.reduce((a, b) => a + b.rev, 0);
                  const angle = (item.rev / totalRev2) * 360;
                  const radius = 33;
                  const circ = 2 * Math.PI * radius;
                  const pct = (item.rev / totalRev2) * 100;
                  const offset = circ * (1 - pct / 100);
                  // Stack segments by rotating
                  const priorAngles = CHANNEL_DATA.slice(0, idx).reduce((a, b) => a + (b.rev / totalRev2) * 360, 0);
                  return (
                    <circle
                      key={item.channel}
                      cx={45} cy={45} r={radius}
                      fill="none"
                      stroke={item.accent}
                      strokeWidth={8}
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{
                        transformOrigin: '45px 45px',
                        transform: `rotate(${priorAngles * 3.6}deg)`,
                        opacity: 0.85
                      }}
                    />
                  );
                })}
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  R{(CHANNEL_DATA.reduce((a, b) => a + b.rev, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>

            {/* Legend */}
            <div style={{ flex: 1 }}>
              {CHANNEL_DATA.map((item) => (
                <div key={item.channel} className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    R{(item.rev / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Channel Performance Breakdown */}
      <div className="card" style={{ padding: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Omnichannel Dispatch Efficiency & ROI
            </h3>
          </div>
          <button onClick={handleDispatchTest} disabled={isDispatching} className="btn btn-primary btn-sm">
            <Send size={13} />
            {isDispatching ? 'Dispatching...' : 'Launch Test Dispatch'}
          </button>
        </div>

        <div className="grid-4">
          {CHANNEL_DATA.map((item, idx) => {
            const totalRevAll = CHANNEL_DATA.reduce((a, b) => a + b.rev, 0);
            const revPct = Math.round((item.rev / totalRevAll) * 100);
            return (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Top accent bar */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 2,
                  background: item.color,
                  borderRadius: '14px 14px 0 0'
                }} />

                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    fontWeight: 700
                  }}>
                    {item.channel}
                  </span>
                </div>

                {/* Donut mini */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <DonutChart percentage={item.conv * 7} color={item.accent} size={52} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, color: item.accent, lineHeight: 1 }}>
                        {item.conv}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Conversion</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>{item.conv}%</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      R{(item.rev / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${revPct}%`, height: '100%', background: item.accent, borderRadius: 999, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatched Campaigns Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2">
            <Layers size={16} style={{ color: '#22d3ee' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Campaign Dispatch Log & Telemetry
            </h3>
          </div>
          <button onClick={onRefresh} className="btn btn-ghost btn-sm">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Channel</th>
                <th>Language</th>
                <th>Sent / Delivered</th>
                <th>Clicks</th>
                <th>Conversions</th>
                <th>Revenue (ZAR)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{c.title}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#818cf8',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}>
                      {c.channel}
                    </span>
                  </td>
                  <td style={{ color: '#22d3ee', fontWeight: 600 }}>{c.targetLanguage}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {c.sentCount.toLocaleString()} / {c.deliveredCount.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.clickedCount.toLocaleString()}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                      {c.convertedCount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 4 }}>({c.conversionRatePercent}%)</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    R {c.revenueGeneratedZar.toLocaleString()}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}

              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-dim)' }}>
                    No campaigns dispatched yet. Launch a test dispatch above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
