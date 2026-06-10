import React, { useState } from 'react';
import { useSchemaContext } from '../../context/SchemaContext';
import DynamicTable from './DynamicTable';
import DynamicChart from './DynamicChart';
import FilterBar from './FilterBar';
import KpiRibbon from './KpiRibbon';
import KeyInsightsPanel from './KeyInsightsPanel';
import ConfirmModal from '../common/ConfirmModal';
import { useUndo } from '../../context/UndoContext';

export default function DashboardPanel({ chatVisible, setChatVisible }) {
  const { dashboardId, dashboard, fields, entries, loading, refreshData } = useSchemaContext();
  const [filterText, setFilterText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isHiddenLocally, setIsHiddenLocally] = useState(false);
  const { triggerDeferredDelete } = useUndo();

  if (loading) {
    return (
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', width: '100%', padding: '2rem' }}>
          <div className="animate-pulse" style={{ height: '60px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}></div>
          <div className="animate-pulse" style={{ height: '300px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}></div>
          <div className="animate-pulse" style={{ height: '200px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}></div>
        </div>
      </div>
    );
  }

  // Calculate simple stats for infographics
  const displayEntries = isHiddenLocally ? [] : entries;
  const displayFields = isHiddenLocally ? [] : fields;

  const validEntries = displayEntries.filter(e => {
    const isLog = e.extracted_data?.intent === 'LOG_DATA' || !e.extracted_data?.intent;
    const isUndone = e.extracted_data?.is_undone;
    return isLog && !isUndone;
  });
  const totalEntries = validEntries.length;
  const uniqueFields = displayFields.length;

  const confirmClearSchema = () => {
    setShowClearConfirm(false);
    triggerDeferredDelete(
      'Cleared Dashboard Columns',
      () => setIsHiddenLocally(true),
      async () => {
        const { supabase } = await import('../../lib/supabaseClient');
        await supabase.from('schema_registry').delete().eq('dashboard_id', dashboardId);
        await supabase.from('entries').delete().eq('dashboard_id', dashboardId);
        setIsHiddenLocally(false);
        await refreshData();
      },
      () => setIsHiddenLocally(false)
    );
  };

  return (
    <div className="glass animate-fade-up" style={{ 
      borderRadius: 'var(--radius-xl)', 
      padding: '2rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem',
      overflowY: 'auto',
      position: 'relative',
      height: '100%'
    }}>
      {setChatVisible && (
        <button 
          onClick={() => setChatVisible(!chatVisible)}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '40px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--glass-border)',
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          {chatVisible ? '«' : '»'}
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.75rem', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{totalEntries} entries · {uniqueFields} columns</span>
            
              <button onClick={() => setShowClearConfirm(true)} title="Clear Columns" style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => {e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(139, 58, 58, 0.1)'}} onMouseOut={e => {e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              </button>
          </div>
        </div>
      </div>

      {displayFields.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            border: '2px dashed var(--glass-border-hover)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
            background: 'var(--bg-surface)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>No data yet</p>
          <p style={{ fontSize: '0.9rem', maxWidth: '300px', textAlign: 'center' }}>Start typing in the chat to log your first entry.</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
          
          <KpiRibbon fields={displayFields} entries={validEntries} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>Records</h3>
              <FilterBar filterText={filterText} setFilterText={setFilterText} />
            </div>
            <DynamicTable fields={displayFields} entries={validEntries} globalFilter={filterText} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', paddingBottom: '1.5rem' }}>
            <DynamicChart fields={displayFields} entries={validEntries} aiChartConfigs={dashboard?.chart_config} />
          </div>

          <KeyInsightsPanel 
            insights={dashboard?.key_insights} 
            loading={!dashboard?.key_insights && validEntries.length > 0} 
            hasData={validEntries.length > 0} 
          />
        </div>
      )}
      {showClearConfirm && (
        <ConfirmModal 
          title="Clear Dashboard Columns"
          message="Are you sure you want to completely clear this dashboard's columns and records? This will delete all logged data."
          confirmText="Clear Data"
          onConfirm={confirmClearSchema}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}
