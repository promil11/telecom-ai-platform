import React, { useState, useEffect, useCallback } from 'react';
import { Database, Table, Terminal, Play, Search, Eye, RefreshCw, Server, CheckCircle2, ShieldAlert, Copy, Check, Filter } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';

type ServiceKey = 'leads' | 'geo' | 'orchestrator';

interface DbTableInfo {
  name: string;
  rowCount: number;
  columns: { cid: number; name: string; type: string; notnull: number; dflt_value: any; pk: number }[];
}

// Essential summary columns to display in Data Grid per table
const ESSENTIAL_COLUMNS: Record<string, string[]> = {
  leads: ['id', 'company_name', 'industry', 'status', 'score', 'estimated_deal_value_zar', 'product_target', 'assigned_rep'],
  geofences: ['id', 'name', 'category', 'current_pings_count', 'trigger_threshold_pings', 'is_triggered', 'offer_headline'],
  campaigns: ['id', 'title', 'channel', 'target_language', 'status', 'sent_count', 'converted_count', 'revenue_generated_zar']
};

export const DatabaseExplorerModule: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceKey>('leads');
  const [tables, setTables] = useState<DbTableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedRow, setInspectedRow] = useState<any | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // SQL Console state
  const [customSql, setCustomSql] = useState<string>('SELECT * FROM leads WHERE score > 70 ORDER BY score DESC;');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [isQueryRunning, setIsQueryRunning] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'GRID' | 'SQL'>('GRID');

  const servicesInfo: Record<ServiceKey, { label: string; dbFile: string; serviceName: string; color: string; icon: string; port: string }> = {
    leads: {
      label: 'B2B Lead Scoring DB',
      dbFile: 'Neon PostgreSQL (leads)',
      serviceName: 'b2b-lead-scoring-service',
      color: '#6366f1',
      icon: '🧠',
      port: '5001'
    },
    geo: {
      label: 'Geo Campaign Engine DB',
      dbFile: 'Neon PostgreSQL (geofences)',
      serviceName: 'geo-campaign-service',
      color: '#06b6d4',
      icon: '📍',
      port: '5002'
    },
    orchestrator: {
      label: 'Campaign Orchestrator DB',
      dbFile: 'Neon PostgreSQL (campaigns)',
      serviceName: 'campaign-orchestrator-service',
      color: '#10b981',
      icon: '🚀',
      port: '5004'
    }
  };

  // ─── Atomic Database & Table Data Loader (Fixes tab switching race condition glitch) ───
  const fetchDatabaseAndTable = useCallback(async (serviceKey: ServiceKey, tableKeyOverride?: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch tables list for the target service
      const res = await ApiClient.getDbTables(serviceKey);
      const fetchedTables = res.tables || [];
      setTables(fetchedTables);

      if (fetchedTables.length > 0) {
        // Determine active table name safely
        const targetTable = tableKeyOverride && fetchedTables.some(t => t.name === tableKeyOverride)
          ? tableKeyOverride
          : fetchedTables[0].name;

        setSelectedTable(targetTable);
        setCustomSql(`SELECT * FROM "${targetTable}" LIMIT 25;`);

        // 2. Fetch rows for the target table in the SAME atomic step
        const dataRes = await ApiClient.getDbData(serviceKey, targetTable);
        setTableData(dataRes.rows || []);
      } else {
        setSelectedTable('');
        setTableData([]);
      }
    } catch (err) {
      console.error('Failed to load DB state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when service changes
  useEffect(() => {
    fetchDatabaseAndTable(selectedService);
  }, [selectedService, fetchDatabaseAndTable]);

  const handleServiceSelect = (key: ServiceKey) => {
    if (key === selectedService) return;
    setSelectedService(key);
    setSearchQuery('');
    setQueryResult(null);
  };

  const handleTableSelect = (tableName: string) => {
    if (tableName === selectedTable) return;
    setSelectedTable(tableName);
    setCustomSql(`SELECT * FROM "${tableName}" LIMIT 25;`);
    fetchDatabaseAndTable(selectedService, tableName);
  };

  const handleExecuteSql = async () => {
    if (!customSql.trim()) return;
    setIsQueryRunning(true);
    setQueryResult(null);
    try {
      const res = await ApiClient.runDbQuery(selectedService, customSql);
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({ error: err.message });
    } finally {
      setIsQueryRunning(false);
    }
  };

  const currentTableSchema = tables.find(t => t.name === selectedTable);

  // Filter columns to display essential business columns only
  const displayColumns = (currentTableSchema?.columns || []).filter(col => {
    const list = ESSENTIAL_COLUMNS[selectedTable];
    if (list && list.length > 0) {
      return list.includes(col.name);
    }
    return true;
  });

  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;
    return JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCopyJson = () => {
    if (!inspectedRow) return;
    navigator.clipboard.writeText(JSON.stringify(inspectedRow, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Helper to format cell values
  const renderFormattedCell = (colName: string, val: any) => {
    if (val === null || val === undefined) {
      return <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.75rem' }}>null</span>;
    }

    // Status badges
    if (colName === 'status' || colName === 'is_triggered') {
      const s = String(val).toUpperCase();
      let bg = 'rgba(100, 116, 139, 0.2)';
      let text = '#94a3b8';
      let border = 'rgba(148, 163, 184, 0.3)';
      if (s === 'HOT' || s === 'ACTIVE' || s === 'TRUE') { bg = 'rgba(239, 68, 68, 0.15)'; text = '#f87171'; border = 'rgba(239, 68, 68, 0.4)'; }
      else if (s === 'WARM') { bg = 'rgba(245, 158, 11, 0.15)'; text = '#fbbf24'; border = 'rgba(245, 158, 11, 0.4)'; }
      else if (s === 'COLD' || s === 'FALSE') { bg = 'rgba(59, 130, 246, 0.15)'; text = '#60a5fa'; border = 'rgba(59, 130, 246, 0.4)'; }

      return (
        <span style={{
          padding: '3px 8px',
          borderRadius: 6,
          fontSize: '0.72rem',
          fontWeight: 700,
          background: bg,
          color: text,
          border: `1px solid ${border}`,
          letterSpacing: '0.04em'
        }}>
          {s}
        </span>
      );
    }

    // Currency values
    if (colName.includes('zar') || colName.includes('revenue') || colName.includes('deal_value')) {
      const num = Number(val);
      if (!isNaN(num)) {
        const formatted = num >= 1_000_000 ? `R${(num / 1_000_000).toFixed(1)}M` : `R${num.toLocaleString()}`;
        return (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }} title={`R${num.toLocaleString()}`}>
            {formatted}
          </span>
        );
      }
    }

    // Percentage values
    if (colName.includes('percent') || colName.includes('probability') || colName.includes('rate')) {
      const num = Number(val);
      if (!isNaN(num)) {
        const displayVal = num <= 1 && num > 0 ? `${(num * 100).toFixed(0)}%` : `${num}%`;
        return (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
            {displayVal}
          </span>
        );
      }
    }

    // Objects or JSON
    if (typeof val === 'object') {
      return (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#a5b4fc' }}>
          {JSON.stringify(val).substring(0, 28)}...
        </span>
      );
    }

    // Number formatting
    if (typeof val === 'number') {
      return (
        <span style={{ fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
          {val.toLocaleString()}
        </span>
      );
    }

    // Standard Text
    const str = String(val);
    return (
      <span style={{ color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 220, display: 'inline-block' }} title={str}>
        {str}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
      {/* Header Bar */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.85))',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <Database size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Microservices Database Explorer
              </h2>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} /> Neon PostgreSQL Active
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginTop: 3 }}>
              High-level essential data grid, document JSON inspector, and direct SQL console
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => fetchDatabaseAndTable(selectedService, selectedTable)} style={{ gap: 8, padding: '8px 16px' }}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Sync DB
        </button>
      </div>

      {/* Database Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {(['leads', 'geo', 'orchestrator'] as ServiceKey[]).map(key => {
          const info = servicesInfo[key];
          const isSelected = selectedService === key;
          return (
            <div
              key={key}
              onClick={() => handleServiceSelect(key)}
              style={{
                cursor: 'pointer',
                borderRadius: 14,
                padding: '18px 20px',
                border: `1.5px solid ${isSelected ? info.color : 'rgba(255, 255, 255, 0.08)'}`,
                background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.5)',
                boxShadow: isSelected ? `0 0 24px ${info.color}33` : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {info.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: info.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {info.dbFile}
                    </div>
                  </div>
                </div>

                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isSelected ? info.color : 'rgba(255,255,255,0.2)',
                  boxShadow: isSelected ? `0 0 10px ${info.color}` : 'none'
                }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  <Server size={12} color="#64748b" />
                  {info.serviceName}
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  PORT :{info.port}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Explorer Panel */}
      <div style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(15, 23, 42, 0.85)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        {/* Panel Navigation Toolbar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 15, 30, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}>
          {/* Tables Selector Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TABLES:
            </span>
            {tables.map(t => {
              const isActive = selectedTable === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handleTableSelect(t.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: `1px solid ${isActive ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    background: isActive ? 'linear-gradient(135deg, #4f46e5, #3b82f6)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Table size={14} />
                  <span>{t.name}</span>
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 10,
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {t.rowCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#090d16',
            padding: 4,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setActiveView('GRID')}
              style={{
                background: activeView === 'GRID' ? '#6366f1' : 'transparent',
                color: activeView === 'GRID' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: 7,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Table size={14} /> Essential Grid ({displayColumns.length} cols)
            </button>
            <button
              onClick={() => setActiveView('SQL')}
              style={{
                background: activeView === 'SQL' ? '#6366f1' : 'transparent',
                color: activeView === 'SQL' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: 7,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Terminal size={14} /> SQL Console
            </button>
          </div>
        </div>

        {/* View 1: Data Grid */}
        {activeView === 'GRID' && (
          <div style={{ padding: 20 }}>
            {/* Search Filter Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 340 }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={`Search in ${selectedTable}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: '8px 12px 8px 36px',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99, 102, 241, 0.1)', padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <Filter size={12} /> Showing {displayColumns.length} essential business columns • Click <b>👁 JSON</b> to inspect all {currentTableSchema?.columns.length || 0} fields
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Showing <b style={{ color: '#ffffff' }}>{filteredData.length}</b> of <b style={{ color: '#ffffff' }}>{tableData.length}</b> records
                </span>
              </div>
            </div>

            {/* Table Container with Horizontal & Vertical Scroll */}
            <div style={{ overflow: 'auto', maxHeight: '550vh', maxWidth: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: '#0b1120', position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'center', width: 80, color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      INSPECT
                    </th>
                    {displayColumns.map(col => (
                      <th
                        key={col.name}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color: '#f8fafc',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          letterSpacing: '0.03em',
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{col.name}</span>
                          {col.pk === 1 && (
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              borderRadius: 4,
                              padding: '1px 5px',
                              fontSize: '0.62rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800
                            }}>
                              PK
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={displayColumns.length + 1} style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                        No records match your search criteria in table <b>{selectedTable}</b>.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(30, 41, 59, 0.25)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(30, 41, 59, 0.25)'}
                      >
                        {/* Action Cell */}
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            onClick={() => setInspectedRow(row)}
                            style={{
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#a5b4fc',
                              border: '1px solid rgba(99, 102, 241, 0.35)',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="View All Fields (Full Document JSON)"
                          >
                            <Eye size={12} /> JSON
                          </button>
                        </td>

                        {/* Column Value Cells */}
                        {displayColumns.map(col => (
                          <td
                            key={col.name}
                            style={{
                              padding: '10px 16px',
                              borderRight: '1px solid rgba(255,255,255,0.03)',
                              verticalAlign: 'middle'
                            }}
                          >
                            {renderFormattedCell(col.name, row[col.name])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 2: SQL Console */}
        {activeView === 'SQL' && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} color="#818cf8" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  Execute SQL Query on {servicesInfo[selectedService].dbFile}
                </span>
              </div>

              {/* Sample Snippet Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600 }}
                  onClick={() => setCustomSql(`SELECT * FROM "${selectedTable}" LIMIT 10;`)}
                >
                  SELECT *
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600 }}
                  onClick={() => setCustomSql(`SELECT COUNT(*) as total_rows FROM "${selectedTable}";`)}
                >
                  COUNT(*)
                </button>
              </div>
            </div>

            {/* SQL Textarea */}
            <textarea
              rows={4}
              value={customSql}
              onChange={e => setCustomSql(e.target.value)}
              style={{
                width: '100%',
                background: '#070a13',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 10,
                padding: 16,
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={handleExecuteSql}
                disabled={isQueryRunning}
                style={{ gap: 8, padding: '10px 24px', fontWeight: 700 }}
              >
                <Play size={16} /> {isQueryRunning ? 'Executing SQL...' : 'Run Query'}
              </button>
            </div>

            {/* Query Result Output */}
            {queryResult && (
              <div style={{ marginTop: 8 }}>
                {queryResult.error ? (
                  <div style={{
                    padding: 16,
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <ShieldAlert size={20} />
                    <div>
                      <div style={{ fontWeight: 800 }}>SQL Execution Error</div>
                      <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{queryResult.error}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#10b981', marginBottom: 8, fontWeight: 700 }}>
                      ✅ Query executed successfully ({queryResult.rowCount ?? queryResult.changes ?? 0} rows returned)
                    </div>
                    <pre style={{
                      background: '#05070f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: 16,
                      color: '#a5b4fc',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      maxHeight: 320,
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(queryResult.rows || queryResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row JSON Inspector Modal (Mongoose / MongoDB Compass style) */}
      {inspectedRow && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 720,
            maxHeight: '85vh',
            borderRadius: 16,
            background: '#0f172a',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              background: '#090d16',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Eye size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Complete Document JSON Inspector ({selectedTable})
                </h3>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setInspectedRow(null)}
                style={{ padding: '4px 12px', fontSize: '0.8125rem' }}
              >
                Close ✕
              </button>
            </div>

            {/* Document Body */}
            <div style={{ flex: 1, padding: 20, overflow: 'auto', background: '#05070f' }}>
              <pre style={{
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                margin: 0,
                lineHeight: 1.6
              }}>
                {JSON.stringify(inspectedRow, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              background: '#090d16',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                className="btn btn-secondary"
                onClick={handleCopyJson}
                style={{ gap: 6, padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                {copiedJson ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copiedJson ? 'Copied to Clipboard!' : 'Copy Raw JSON'}
              </button>

              <button className="btn btn-primary" onClick={() => setInspectedRow(null)} style={{ padding: '8px 20px', fontWeight: 700 }}>
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
