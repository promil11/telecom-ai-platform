import React, { useState, useEffect } from 'react';
import { CellTower, GeofenceZone, TelemetryPing } from '../../types';
import { ApiClient } from '../../services/apiClient';
import { Radio, Zap, Play, Send, RefreshCw, MapPin, Signal, AlertTriangle, ShieldCheck, Clock, Sliders, Check, ShieldAlert, Lock, AlertCircle, RefreshCcw } from 'lucide-react';

interface GeoCampaignModuleProps {
  towers: CellTower[];
  geofences: GeofenceZone[];
  telemetryPings: TelemetryPing[];
  onRefresh: () => void;
}

export const GeoCampaignModule: React.FC<GeoCampaignModuleProps> = ({
  towers, geofences, telemetryPings, onRefresh
}) => {
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(geofences[0] || null);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState<boolean>(false);
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  const [activePingIdx, setActivePingIdx] = useState<number>(0);
  const [liveStreamPings, setLiveStreamPings] = useState<TelemetryPing[]>(telemetryPings);
  const [breachAlert, setBreachAlert] = useState<any | null>(null);

  // Subscribe to Live SSE Telemetry Stream
  useEffect(() => {
    const cleanup = ApiClient.subscribeTelemetryStream(
      (data) => {
        if (data.pings && data.pings.length > 0) {
          setLiveStreamPings(prev => [...data.pings, ...prev].slice(0, 40));
        }
      },
      (breachData) => {
        setBreachAlert(breachData);
      }
    );
    return () => cleanup();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => onRefresh(), 4000);
    return () => clearInterval(timer);
  }, [onRefresh]);

  useEffect(() => {
    const anim = setInterval(() => {
      setActivePingIdx(i => (i + 1) % Math.max(1, liveStreamPings.length));
    }, 120);
    return () => clearInterval(anim);
  }, [liveStreamPings.length]);

  const [selectedLang, setSelectedLang] = useState<string>('isiZulu');
  const [selectedChannel, setSelectedChannel] = useState<string>('WHATSAPP');
  const [dispatchResultModal, setDispatchResultModal] = useState<any | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Anti-Spam Policy Governance State
  const [showSpamPolicyModal, setShowSpamPolicyModal] = useState<boolean>(false);
  const [cooldownHours, setCooldownHours] = useState<number>(24);
  const [maxWeeklyCap, setMaxWeeklyCap] = useState<number>(2);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(true);
  const [dwellMode, setDwellMode] = useState<'ON_ENTRY' | 'ON_DWELL_15M' | 'ON_EXIT'>('ON_ENTRY');
  
  const [policySimPhone, setPolicySimPhone] = useState<string>('+27 82 491 8802');
  const [isRunningPolicyTest, setIsRunningPolicyTest] = useState<boolean>(false);
  const [policyTestResults, setPolicyTestResults] = useState<any[] | null>(null);
  const [policyAlert, setPolicyAlert] = useState<string | null>(null);

  const handleRunPolicyTest = () => {
    setIsRunningPolicyTest(true);
    setTimeout(() => {
      setPolicyTestResults([
        {
          timestamp: '09:00 AM (Arrival at Tower)',
          action: 'DISPATCHED ✅',
          channel: 'WhatsApp Business',
          status: 'PASSED',
          reason: 'Initial arrival ping detected. No previous messages in 24h window.'
        },
        {
          timestamp: `11:30 AM (Standing near tower for 2.5 hrs)`,
          action: 'BLOCKED 🛑',
          channel: 'SMS Gateway',
          status: 'BLOCKED',
          reason: `Active ${cooldownHours}h Cooldown Window in effect (${cooldownHours - 2}h 30m remaining). Duplicate suppressed.`
        },
        {
          timestamp: '22:15 PM (Evening crowd ping)',
          action: quietHoursEnabled ? 'QUEUED FOR 08:00 AM 🌙' : 'DISPATCHED ✅',
          channel: 'App Push',
          status: quietHoursEnabled ? 'QUEUED' : 'PASSED',
          reason: quietHoursEnabled ? 'Quiet Hours Active (21:00 - 08:00). Message held in dispatch queue.' : 'Quiet hours disabled.'
        }
      ]);
      setIsRunningPolicyTest(false);
    }, 500);
  };

  const handleSimulateSpike = async (zoneId: string) => {
    setIsSimulatingSpike(true);
    const res = await ApiClient.simulateGeoTrigger(zoneId, 180);
    setLastAlert(`Hyperlocal Trigger Activated: ${res.message}`);
    setIsSimulatingSpike(false);
    onRefresh();
  };

  const handleLaunchHyperlocalOffer = async (zone: GeofenceZone, lang: string = selectedLang, ch: string = selectedChannel) => {
    setIsDispatching(true);
    try {
      const res = await ApiClient.executeMultilingualAutoDispatch(zone.id, lang, ch);
      setDispatchResultModal(res);
      onRefresh();
    } catch (e: any) {
      alert(`Auto-dispatch error: ${e.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const triggeredCount = geofences.filter(g => g.isTriggered).length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* High Footfall Breach SSE Alert Banner */}
      {breachAlert && (
        <div className="alert alert-warning flex items-center justify-between" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(225, 29, 72, 0.25))',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
        }}>
          <div className="flex items-center gap-3">
            <div className="pulse-dot pulse-amber" style={{ width: 10, height: 10 }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fbbf24' }}>
                🚨 REAL-TIME FOOTFALL BREACH: {breachAlert.zoneName} ({breachAlert.pingsCount} pings/sec threshold reached)
              </p>
              <p style={{ fontSize: '0.7rem', color: '#f1f5f9', marginTop: 2 }}>
                Recommended Campaign: "{breachAlert.offerHeadline}" — Hyperlocal auto-dispatch available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const zone = geofences.find(g => g.id === breachAlert.zoneId) || geofences[0];
                handleLaunchHyperlocalOffer(zone);
              }}
              className="btn btn-cyan btn-xs"
              style={{ fontWeight: 700 }}
            >
              <Send size={11} /> Auto-Dispatch Offer
            </button>
            <button onClick={() => setBreachAlert(null)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {lastAlert && (
        <div className="alert alert-warning">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{lastAlert}</span>
          <button onClick={() => setLastAlert(null)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
            ✕
          </button>
        </div>
      )}

      {/* Autonomous AI Multilingual Dispatch Control Strip */}
      <div className="card" style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap size={18} style={{ color: '#22d3ee' }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.825rem', color: '#fff' }}>🤖 Autonomous AI Multilingual Dispatch Pipeline</p>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Auto-generates hyper-localized copy variants in isiZulu, Afrikaans, or English upon footfall threshold breach</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Target Lang:</span>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#22d3ee',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <option value="isiZulu">isiZulu (Zulu)</option>
                <option value="Afrikaans">Afrikaans</option>
                <option value="English">English</option>
                <option value="isiXhosa">isiXhosa</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Channel:</span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#818cf8',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <option value="WHATSAPP">WhatsApp Business</option>
                <option value="SMS">SMS Gateway</option>
                <option value="PUSH">Mobile App Push</option>
              </select>
            </div>
            <button
              onClick={() => setShowSpamPolicyModal(true)}
              className="btn btn-secondary btn-sm"
              style={{
                gap: 6,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              <ShieldCheck size={14} />
              Anti-Spam Rules ({cooldownHours}h Cooldown)
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="grid-3">
        <div className="kpi-card kpi-cyan">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Active Tower Nodes
              </p>
              <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#22d3ee', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {towers.length}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>5G / 4G LTE coverage points</p>
            </div>
            <div className="kpi-icon icon-cyan">
              <Signal size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card kpi-indigo">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Monitored Geofences
              </p>
              <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#818cf8', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {geofences.length}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Hyperlocal trigger zones</p>
            </div>
            <div className="kpi-icon icon-indigo">
              <MapPin size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card kpi-rose">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Active Triggers
              </p>
              <div className="flex items-baseline gap-2">
                <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#fb7185', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {triggeredCount}
                </p>
                {triggeredCount > 0 && <div className="pulse-dot pulse-red" />}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Threshold threshold exceeded</p>
            </div>
            <div className="kpi-icon icon-rose">
              <Zap size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Map + Trigger Matrix */}
      <div className="grid-split-8-4">
        {/* Left: Geospatial Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-2">
              <Radio size={16} style={{ color: '#22d3ee' }} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Cell Tower Telemetry & Footfall Density
                </h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                  Real-time device pings · South African regional sectors
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: '0.7rem'
              }}>
                <div className="pulse-dot pulse-green" style={{ width: 6, height: 6 }} />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {liveStreamPings.length} Active Stream Pings
                </span>
              </div>
              <button onClick={onRefresh} className="btn btn-ghost btn-icon btn-sm">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* SVG Map */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 420,
            background: '#05080f',
            overflow: 'hidden'
          }}>
            {/* Grid lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Radar rings and connections */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 900 420" preserveAspectRatio="xMidYMid meet">
              {/* Background ambience circles */}
              <circle cx="450" cy="210" r="200" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" strokeDasharray="6 6" />
              <circle cx="450" cy="210" r="120" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" />
              <circle cx="450" cy="210" r="60" fill="none" stroke="rgba(168, 85, 247, 0.05)" strokeWidth="1" />

              {/* Radar sweep */}
              <defs>
                <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0.3)" />
                </linearGradient>
              </defs>
              <path
                d="M 450 210 L 450 10 A 200 200 0 0 1 650 210 Z"
                fill="url(#radarGrad)"
                style={{ transformOrigin: '450px 210px', animation: 'radarSpin 8s linear infinite' }}
              />

              {/* Tower connection lines */}
              {towers.map((tower, idx) => {
                const positions = [
                  [160, 100], [320, 280], [490, 80], [650, 300], [790, 120]
                ];
                const [cx, cy] = positions[idx % positions.length];
                return (
                  <line
                    key={tower.id}
                    x1={450} y1={210}
                    x2={cx} y2={cy}
                    stroke="rgba(99, 102, 241, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Tower coverage rings */}
              {towers.map((tower, idx) => {
                const positions = [
                  [160, 100], [320, 280], [490, 80], [650, 300], [790, 120]
                ];
                const [cx, cy] = positions[idx % positions.length];
                return (
                  <g key={tower.id}>
                    <circle cx={cx} cy={cy} r={70} fill="rgba(6, 182, 212, 0.04)" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx={cx} cy={cy} r={40} fill="rgba(6, 182, 212, 0.06)" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />
                  </g>
                );
              })}

              {/* Geofence zones */}
              {geofences.map((zone, idx) => {
                const positions = [[250, 150], [580, 200], [420, 330], [720, 80]];
                const [cx, cy] = positions[idx % positions.length];
                return (
                  <g key={zone.id}>
                    <circle
                      cx={cx} cy={cy} r={50}
                      fill={zone.isTriggered ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.06)'}
                      stroke={zone.isTriggered ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.3)'}
                      strokeWidth={zone.isTriggered ? 1.5 : 1}
                      strokeDasharray={zone.isTriggered ? 'none' : '4 4'}
                    />
                    {zone.isTriggered && (
                      <circle cx={cx} cy={cy} r={50} fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1"
                        style={{ animation: 'ping 2s ease-in-out infinite', transformOrigin: `${cx}px ${cy}px` }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Telemetry pings */}
              {liveStreamPings.slice(0, 30).map((ping, idx) => {
                const px = 80 + ((idx * 31 + 7) % 760);
                const py = 30 + ((idx * 17 + 5) % 360);
                const isActive = idx === activePingIdx % 30;
                return (
                  <circle
                    key={ping.id}
                    cx={px} cy={py}
                    r={isActive ? 3 : 1.5}
                    fill={isActive ? '#6366f1' : '#818cf8'}
                    opacity={isActive ? 1 : 0.4}
                    style={isActive ? { filter: 'drop-shadow(0 0 4px #6366f1)' } : {}}
                  />
                );
              })}
            </svg>

            {/* Tower HTML nodes */}
            {towers.map((tower, idx) => {
              const positions = [
                { left: '17%', top: '23%' },
                { left: '35%', top: '67%' },
                { left: '54%', top: '19%' },
                { left: '72%', top: '71%' },
                { left: '88%', top: '28%' }
              ];
              const pos = positions[idx % positions.length];
              return (
                <div
                  key={tower.id}
                  style={{
                    position: 'absolute',
                    left: pos.left,
                    top: pos.top,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                  title={`${tower.name} · ${tower.connectedUsers.toLocaleString()} users`}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.2)',
                      border: '1.5px solid rgba(6, 182, 212, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, background 0.2s ease',
                      backdropFilter: 'blur(8px)'
                    }}>
                      <Radio size={14} style={{ color: '#22d3ee' }} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: -1,
                      right: -1,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 6px rgba(16,185,129,0.8)',
                      animation: 'ping 2s ease-in-out infinite'
                    }} />
                    {/* Label */}
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: 6,
                      background: 'rgba(0, 0, 0, 0.85)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: 8,
                      padding: '5px 8px',
                      whiteSpace: 'nowrap',
                      fontSize: '0.6rem',
                      color: '#e2e8f0',
                      backdropFilter: 'blur(8px)',
                      pointerEvents: 'none'
                    }}>
                      <div style={{ fontWeight: 700, color: '#22d3ee' }}>{tower.name}</div>
                      <div style={{ color: '#94a3b8' }}>{tower.connectedUsers.toLocaleString()} users · {tower.band}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: '0.65rem',
              backdropFilter: 'blur(12px)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
                Tower Node
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
                Device Ping
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                Trigger Zone
              </span>
            </div>

            {/* Live SSE Telemetry Ticker Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(5, 8, 15, 0.88)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: 8,
              padding: '6px 12px',
              maxWidth: 340,
              fontSize: '0.65rem',
              backdropFilter: 'blur(12px)',
              overflow: 'hidden'
            }}>
              <div className="flex items-center gap-2">
                <div className="pulse-dot pulse-green" style={{ width: 6, height: 6, flexShrink: 0 }} />
                <span style={{ color: '#22d3ee', fontWeight: 800, flexShrink: 0 }}>LIVE TELEMETRY:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {liveStreamPings[0] ? `${liveStreamPings[0].deviceHash} • ${liveStreamPings[0].simType}` : 'Streaming...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Trigger Matrix */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: '#fbbf24' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Geofence Trigger Matrix
              </h3>
            </div>
            {triggeredCount > 0 && (
              <span style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: '0.6rem',
                fontWeight: 700,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                {triggeredCount} Live
              </span>
            )}
          </div>

          <div style={{ padding: 16, height: 'calc(420px - 57px)', overflowY: 'auto' }}>
            <div className="space-y-3">
              {geofences.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                const pct = Math.min(100, (zone.currentPingsCount / zone.triggerThresholdPings) * 100);

                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className="card cursor-pointer"
                    style={{
                      padding: 14,
                      borderColor: isSelected
                        ? zone.isTriggered ? 'rgba(245,158,11,0.5)' : 'rgba(6,182,212,0.4)'
                        : undefined
                    }}
                  >
                    <div className="flex items-start justify-between gap-2" style={{ marginBottom: 8 }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                            {zone.name}
                          </h4>
                          {zone.isTriggered && (
                            <div className="pulse-dot pulse-amber" style={{ width: 7, height: 7 }} />
                          )}
                        </div>
                        <p style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 600, marginTop: 1 }}>
                          {zone.category}
                        </p>
                      </div>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: 999,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        ...(zone.isTriggered
                          ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }
                          : { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }
                        )
                      }}>
                        {zone.isTriggered ? 'TRIGGERED' : 'MONITORING'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      {zone.targetDemographic}
                    </p>

                    {/* Ping progress */}
                    <div style={{ marginBottom: 8 }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {zone.currentPingsCount} pings
                        </span>
                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {zone.triggerThresholdPings} threshold
                        </span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', height: 5, borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: 999,
                          background: zone.isTriggered
                            ? 'linear-gradient(90deg, #f59e0b, #fb7185)'
                            : 'linear-gradient(90deg, #0891b2, #22d3ee)',
                          boxShadow: zone.isTriggered ? '0 0 8px rgba(245,158,11,0.4)' : '0 0 8px rgba(6,182,212,0.3)',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSimulateSpike(zone.id); }}
                        disabled={isSimulatingSpike}
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: '0.65rem', gap: 4, padding: '4px 8px' }}
                      >
                        <Play size={10} style={{ color: '#fbbf24' }} />
                        Simulate Burst
                      </button>

                      {zone.isTriggered && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLaunchHyperlocalOffer(zone); }}
                          className="btn btn-cyan btn-xs"
                          style={{ fontSize: '0.65rem', gap: 4, padding: '4px 10px' }}
                        >
                          <Send size={10} />
                          Auto-Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Result Modal */}
      {dispatchResultModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card animate-scale-up" style={{ width: 540, maxWidth: '90vw', padding: 24, border: '1px solid rgba(6, 182, 212, 0.5)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2">
                <Zap size={20} style={{ color: '#22d3ee' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                  🤖 AI Multilingual Auto-Dispatch Executed
                </h3>
              </div>
              <button onClick={() => setDispatchResultModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="space-y-3" style={{ fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Geofence Sector</p>
                <p style={{ fontWeight: 700, color: '#22d3ee', fontSize: '0.95rem' }}>{dispatchResultModal.zoneName}</p>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Target Audience: {dispatchResultModal.targetAudiencePings} connected active subscribers</p>
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    AI Generated Copy ({dispatchResultModal.targetLanguage})
                  </span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    {dispatchResultModal.channel}
                  </span>
                </div>
                <p style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{dispatchResultModal.generatedAiVariant?.headline}</p>
                <p style={{ color: '#cbd5e1', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>"{dispatchResultModal.generatedAiVariant?.body}"</p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Omnichannel Dispatch Engine</span>
                  <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>98.4% Delivered (1.2ms latency)</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setDispatchResultModal(null)} className="btn btn-cyan">
                Close Execution Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Spam Policy & Frequency Capping Manager Modal */}
      {showSpamPolicyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
        }} onClick={() => setShowSpamPolicyModal(false)}>
          <div className="card animate-scale-up" style={{ width: 720, maxWidth: '92vw', padding: 24, border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 25px 70px rgba(0,0,0,0.85)' }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(16, 185, 129, 0.4)' }}>
                  <ShieldCheck size={22} color="#fff" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success" style={{ fontSize: '0.625rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Active Compliance Engine</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TRAI / POPIA / GDPR Rule Set</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginTop: 2 }}>
                    Frequency Capping & Anti-Spam Policy Manager
                  </h3>
                </div>
              </div>
              <button onClick={() => setShowSpamPolicyModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Notification alert */}
            {policyAlert && (
              <div className="alert alert-success" style={{ margin: '14px 0 0', fontSize: '0.75rem' }}>
                <Check size={14} />
                <span>{policyAlert}</span>
              </div>
            )}

            {/* Modal Content */}
            <div style={{ padding: '18px 0', maxHeight: '66vh', overflowY: 'auto' }} className="space-y-5">
              
              {/* Policy Controls Grid */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 18 }} className="space-y-4">
                <h4 className="section-label" style={{ marginBottom: 12 }}>1. Operational Governance Rules</h4>

                <div className="grid-2" style={{ gap: 16 }}>
                  {/* Cooldown Window Slider */}
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} style={{ color: '#34d399' }} />
                        Tower Cooldown Window
                      </label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>
                        {cooldownHours} Hours
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={72}
                      step={1}
                      value={cooldownHours}
                      onChange={(e) => setCooldownHours(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Suppresses duplicate promo messages sent to the same phone number at the same tower within {cooldownHours} hours.
                    </p>
                  </div>

                  {/* Global Weekly Cap Slider */}
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sliders size={13} style={{ color: '#22d3ee' }} />
                        Global Weekly Cap
                      </label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#22d3ee', fontWeight: 800 }}>
                        {maxWeeklyCap} Msgs / Week
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={maxWeeklyCap}
                      onChange={(e) => setMaxWeeklyCap(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#06b6d4' }}
                    />
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Maximum promotional messages a customer can receive across ALL towers per week.
                    </p>
                  </div>
                </div>

                {/* Dwell Trigger Mode & Quiet Hours */}
                <div className="grid-2" style={{ gap: 16, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: 8 }}>
                      Event Trigger Mode (Dwell Filter)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {[
                        { id: 'ON_ENTRY', label: 'On Entry' },
                        { id: 'ON_DWELL_15M', label: 'Dwell 15m+' },
                        { id: 'ON_EXIT', label: 'On Exit' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setDwellMode(mode.id as any)}
                          style={{
                            padding: '6px',
                            borderRadius: 8,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            border: '1px solid',
                            borderColor: dwellMode === mode.id ? '#10b981' : 'var(--border-subtle)',
                            background: dwellMode === mode.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)',
                            color: dwellMode === mode.id ? '#34d399' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#f1f5f9' }}>
                        Regulatory Quiet Hours Window
                      </label>
                      <button
                        onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          background: quietHoursEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: quietHoursEnabled ? '#34d399' : '#fb7185'
                        }}
                      >
                        {quietHoursEnabled ? 'ENABLED (21:00 - 08:00)' : 'DISABLED'}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      Automatically queues all promotional dispatches during night hours (9 PM to 8 AM) and holds dispatch until 8:00 AM.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Live Anti-Spam Simulator */}
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 12, padding: 18 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <div>
                    <h4 className="section-label" style={{ color: '#818cf8' }}>2. Live Anti-Spam Policy Engine Simulator</h4>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Test how the policy engine handles repeated pings from the same device</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={policySimPhone}
                      onChange={(e) => setPolicySimPhone(e.target.value)}
                      style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', color: '#fff', width: 140, fontFamily: 'var(--font-mono)' }}
                    />
                    <button
                      onClick={handleRunPolicyTest}
                      disabled={isRunningPolicyTest}
                      className="btn btn-primary btn-xs"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', gap: 4 }}
                    >
                      {isRunningPolicyTest ? 'Testing...' : 'Run Policy Test'}
                    </button>
                  </div>
                </div>

                {policyTestResults && (
                  <div className="space-y-2" style={{ marginTop: 10 }}>
                    {policyTestResults.map((res, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px', fontSize: '0.725rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', width: 150 }}>{res.timestamp}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            ...(res.status === 'PASSED' ? { background: 'rgba(16,185,129,0.2)', color: '#34d399' } : res.status === 'BLOCKED' ? { background: 'rgba(244,63,94,0.2)', color: '#fb7185' } : { background: 'rgba(245,158,11,0.2)', color: '#fbbf24' })
                          }}>
                            {res.action}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{res.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Blacklist & Opt-Out Records */}
              <div>
                <h4 className="section-label" style={{ marginBottom: 8 }}>3. Opt-Out Blacklist Registry (STOP SMS Requests)</h4>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden', fontSize: '0.725rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 12px' }}>Phone Number</th>
                        <th style={{ padding: '8px 12px' }}>Opt-Out Channel</th>
                        <th style={{ padding: '8px 12px' }}>Date Blacklisted</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>+27 83 992 1042</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>SMS STOP Reply</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>2026-09-26</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ color: '#fb7185', fontWeight: 700 }}>PERMANENTLY OPTED OUT</span></td>
                      </tr>
                      <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>+27 72 118 4099</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>App Unsubscribe</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>2026-09-24</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ color: '#fb7185', fontWeight: 700 }}>PERMANENTLY OPTED OUT</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Policy Engine Status: <span style={{ color: '#34d399', fontWeight: 700 }}>ACTIVE ({cooldownHours}h Cooldown Enabled)</span>
              </span>
              <button
                onClick={() => {
                  setPolicyAlert('Anti-Spam Policy configuration saved successfully!');
                  setTimeout(() => {
                    setPolicyAlert(null);
                    setShowSpamPolicyModal(false);
                  }, 1200);
                }}
                className="btn btn-emerald btn-sm"
                style={{ gap: 6 }}
              >
                <Check size={14} />
                Save Policy Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
