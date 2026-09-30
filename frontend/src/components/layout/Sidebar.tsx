import React from 'react';
import { Cpu, Radio, Sparkles, Activity, Zap } from 'lucide-react';
import { ActiveTab } from '../../App';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const NAV_ITEMS: {
  tab: ActiveTab;
  icon: React.ReactNode;
  label: string;
  color: string;
  accent: string;
}[] = [
  {
    tab: 'LEAD_SCORING',
    icon: <Cpu size={20} />,
    label: 'AI Lead Scoring',
    color: 'indigo',
    accent: '#6366f1'
  },
  {
    tab: 'GEO_CAMPAIGNS',
    icon: <Radio size={20} />,
    label: 'Geo Engine',
    color: 'cyan',
    accent: '#06b6d4'
  },
  {
    tab: 'AI_STUDIO',
    icon: <Sparkles size={20} />,
    label: 'AI Copy Studio',
    color: 'purple',
    accent: '#a855f7'
  },
  {
    tab: 'ANALYTICS',
    icon: <Activity size={20} />,
    label: 'Analytics',
    color: 'emerald',
    accent: '#10b981'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Zap size={20} color="#fff" />
      </div>

      {/* Thin Divider */}
      <div style={{
        width: 32,
        height: 1,
        background: 'var(--border-subtle)',
        marginBottom: 6
      }} />

      {/* Nav Items */}
      {NAV_ITEMS.map((item) => (
        <div
          key={item.tab}
          className={`sidebar-nav-item tooltip-container ${activeTab === item.tab ? 'active' : ''}`}
          data-color={item.color}
          onClick={() => setActiveTab(item.tab)}
          title={item.label}
        >
          {item.icon}
          <div className="tooltip">{item.label}</div>
        </div>
      ))}

      {/* Bottom Spacer */}
      <div style={{ flex: 1 }} />

      {/* Version Badge */}
      <div style={{
        fontSize: '0.55rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-dim)',
        textAlign: 'center',
        letterSpacing: '0.08em',
        padding: '0 8px'
      }}>
        v2.4
      </div>
    </aside>
  );
};
