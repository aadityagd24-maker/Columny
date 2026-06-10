import React, { useMemo } from 'react';

function formatKpiValue(value, isPercentage, isMoney) {
  if (value == null) return '-';
  if (isPercentage) {
    return `${Math.round(value)}%`;
  }
  
  let formatted = '';
  if (value >= 1000000) {
    formatted = (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (value >= 1000) {
    formatted = (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    // If it's a whole number, don't show decimals
    if (value % 1 === 0) {
      formatted = value.toString();
    } else {
      formatted = value.toFixed(1).replace(/\.0$/, '');
    }
  }
  
  return isMoney ? `$${formatted}` : formatted;
}

export default function KpiRibbon({ fields, entries }) {
  const kpis = useMemo(() => {
    if (!fields || !entries || entries.length === 0) return [];
    
    // 1. Total Records KPI
    const validEntries = entries.filter(e => {
      const isLog = e.extracted_data?.intent === 'LOG_DATA' || !e.extracted_data?.intent;
      const isUndone = e.extracted_data?.is_undone;
      return isLog && !isUndone;
    });
    
    const recordsKpi = {
      label: 'Total Records',
      value: validEntries.length,
      isMoney: false,
      isPercentage: false
    };

    // 2. Numeric Fields KPIs
    const numericFields = fields.filter(f => f.field_type === 'number');
    
    const sums = numericFields.map(numField => {
      const key = numField.field_name;
      const label = numField.display_name || numField.field_name;
      const numLower = key.toLowerCase();
      
      const isMoney = ['revenue', 'sales', 'amount', 'price', 'value', 'earnings', 'income', 'cost'].some(w => numLower.includes(w));
      const isPercentage = ['pct', 'percent', 'rate', 'share', 'margin'].some(w => numLower.includes(w));
      
      let total = 0;
      validEntries.forEach(row => {
        // Flatten the entry first or access directly
        const data = row.extracted_data?.intent === 'LOG_DATA' ? row.extracted_data.entities : row.extracted_data;
        const val = parseFloat((data || {})[key]);
        if (!isNaN(val)) total += val;
      });
      
      let displayLabel = label.replace(/_/g, ' ');
      // Capitalize first letter of each word
      displayLabel = displayLabel.replace(/\b\w/g, c => c.toUpperCase());
      // Prefix with Total if it doesn't already have it and it's not a percentage
      if (!isPercentage && !displayLabel.toLowerCase().includes('total')) {
        displayLabel = `Total ${displayLabel}`;
      }

      return {
        label: displayLabel,
        value: total,
        isMoney,
        isPercentage
      };
    }).sort((a, b) => b.value - a.value); // Sort by highest sum

    // Pick top 3 numeric KPIs
    const topNumericKpis = sums.slice(0, 3);
    
    // Combine and pad to 4 if needed (just so the layout is nice, though 4 is the max requested)
    const finalKpis = [...topNumericKpis, recordsKpi];
    
    // If we have less than 4, that's fine, we will just map what we have.
    // The requirement says "Add a 4th KPI: always show 'Total Records'".
    // If there are only 2 numeric fields, we'll show 3 cards total.
    return finalKpis;
  }, [fields, entries]);

  if (kpis.length === 0) return null;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${Math.min(4, Math.max(2, kpis.length))}, 1fr)`, 
      gap: '14px',
      marginBottom: '2rem'
    }}>
      {kpis.map((kpi, idx) => (
        <div key={idx} className="glass" style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.7rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            {kpi.label}
          </span>
          <span style={{ 
            color: 'var(--accent)', 
            fontSize: '1.8rem', 
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            lineHeight: 1
          }}>
            {formatKpiValue(kpi.value, kpi.isPercentage, kpi.isMoney)}
          </span>
        </div>
      ))}
    </div>
  );
}
