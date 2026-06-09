import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { flattenEntry } from '../../lib/schemaUtils';

const COLORS = ['#C9992A', '#9A8870', '#7A6A52', '#4A443C', '#3A3428'];

function formatValue(value, isMoney) {
  if (typeof value !== 'number') return value;
  let formatted = '';
  if (value >= 1000000) {
    formatted = (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (value >= 1000) {
    formatted = (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    formatted = value.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
  }
  return isMoney ? `$${formatted}` : formatted;
}

function analyzeFields(fields, entries) {
  if (!fields || fields.length === 0 || !entries || entries.length === 0) return [];
  const flat = entries.map(flattenEntry);
  if (flat.length < 2) return [];

  const textFields = fields.filter(f => f.field_type === 'text');
  const numericFields = fields.filter(f => f.field_type === 'number');

  const numAnalysis = numericFields.map(numField => {
    const key = numField.field_name;
    const label = numField.display_name || numField.field_name;
    const numLower = key.toLowerCase();
    const isSumWords = ['revenue', 'sales', 'amount', 'total', 'units', 'count', 'quantity', 'price', 'earnings', 'income', 'cost'].some(w => numLower.includes(w));
    const aggType = isSumWords ? 'sum' : 'average';
    const isMoney = ['revenue', 'sales', 'amount', 'price', 'value', 'earnings', 'income', 'cost'].some(w => numLower.includes(w));
    // Prioritize relevant numeric fields
    let score = isSumWords ? 2 : 1;
    if (isMoney) score += 1;
    return { key, label, aggType, isMoney, score };
  }).sort((a, b) => b.score - a.score);

  const textAnalysis = textFields.map(tf => {
    const key = tf.field_name;
    const label = tf.display_name || tf.field_name;
    const counts = {};
    let validCount = 0;
    flat.forEach(row => {
      const val = row[key];
      if (val != null && val !== '') {
        counts[val] = (counts[val] || 0) + 1;
        validCount++;
      }
    });

    const uniqueValues = Object.keys(counts);
    const uniqueCount = uniqueValues.length;
    
    let cardinality = 'high';
    if (uniqueCount >= 2 && uniqueCount <= 3) cardinality = 'low';
    else if (uniqueCount >= 4 && uniqueCount <= 10) cardinality = 'mid';

    return { key, label, counts, uniqueValues, uniqueCount, validCount, cardinality };
  }).filter(t => t.validCount > 0 && t.cardinality !== 'high');

  const configs = [];
  const usedTextFields = new Set();
  const usedNumericFields = new Set();

  const aggregateNumeric = (catKey, numAnalysisInfo) => {
    const agg = {};
    flat.forEach(row => {
      const catVal = row[catKey];
      const val = parseFloat(row[numAnalysisInfo.key]);
      if (catVal == null || catVal === '' || isNaN(val)) return;
      if (!agg[catVal]) agg[catVal] = { sum: 0, count: 0 };
      agg[catVal].sum += val;
      agg[catVal].count += 1;
    });

    return Object.keys(agg).map(k => {
      const value = numAnalysisInfo.aggType === 'sum' ? agg[k].sum : (agg[k].sum / agg[k].count);
      return { name: k, value };
    }).sort((a, b) => b.value - a.value);
  };

  const getCountData = (countsObj) => {
    return Object.keys(countsObj).map(k => ({ name: k, value: countsObj[k] })).sort((a, b) => b.value - a.value);
  };

  const isValidCountData = (data) => {
    if (data.length < 2) return false;
    const vals = data.map(d => d.value);
    const maxCount = Math.max(...vals);
    const minCount = Math.min(...vals);
    return !(maxCount === minCount || maxCount === 1);
  };

  const midFields = textAnalysis.filter(t => t.cardinality === 'mid').sort((a, b) => b.uniqueCount - a.uniqueCount);
  
  // STEP 1 - Best BAR field
  if (midFields.length > 0) {
    const bestBarField = midFields[0];
    if (numAnalysis.length > 0) {
      const bestNumField = numAnalysis[0];
      const aggData = aggregateNumeric(bestBarField.key, bestNumField);
      if (aggData.length >= 2) {
        const titlePrefix = bestNumField.aggType === 'sum' ? 'Total' : 'Average';
        configs.push({
          chartType: 'bar',
          title: `${titlePrefix} ${bestNumField.label.replace(/_/g, ' ')} by ${bestBarField.label.replace(/_/g, ' ')}`,
          subtitle: `${bestNumField.aggType === 'sum' ? 'Sum' : 'Average'} of ${bestNumField.label.toLowerCase()} · grouped by ${bestBarField.label.toLowerCase()}`,
          data: aggData,
          dataKey: 'value',
          nameKey: 'name',
          isMoney: bestNumField.isMoney
        });
        usedTextFields.add(bestBarField.key);
        usedNumericFields.add(bestNumField.key);
      }
    } else {
      const countData = getCountData(bestBarField.counts);
      if (isValidCountData(countData)) {
        configs.push({
          chartType: 'bar',
          title: `Record Count by ${bestBarField.label.replace(/_/g, ' ')}`,
          subtitle: `Count of entries · grouped by ${bestBarField.label.toLowerCase()}`,
          data: countData,
          dataKey: 'value',
          nameKey: 'name',
          isMoney: false
        });
        usedTextFields.add(bestBarField.key);
      }
    }
  }

  // STEP 2 - Best PIE field
  const lowFields = textAnalysis.filter(t => t.cardinality === 'low' && !usedTextFields.has(t.key)).sort((a, b) => b.uniqueCount - a.uniqueCount);
  if (lowFields.length > 0) {
    const bestPieField = lowFields[0];
    let pieData = null;
    let title = '';
    let subtitle = '';
    let isMoney = false;

    if (numAnalysis.length > 0) {
      const bestNumField = numAnalysis[0]; // always use the best numeric field for pie if it exists
      pieData = aggregateNumeric(bestPieField.key, bestNumField);
      isMoney = bestNumField.isMoney;
      title = `${bestNumField.label.replace(/_/g, ' ')} by ${bestPieField.label.replace(/_/g, ' ')}`;
      subtitle = `${bestNumField.aggType === 'sum' ? 'Sum' : 'Average'} of ${bestNumField.label.toLowerCase()} · grouped by ${bestPieField.label.toLowerCase()}`;
    } else {
      const countData = getCountData(bestPieField.counts);
      if (isValidCountData(countData)) {
        pieData = countData;
        title = `Record Count by ${bestPieField.label.replace(/_/g, ' ')}`;
        subtitle = `Count of entries · grouped by ${bestPieField.label.toLowerCase()}`;
      }
    }

    if (pieData && pieData.length >= 2) {
      configs.push({
        chartType: 'pie',
        title,
        subtitle,
        data: pieData,
        dataKey: 'value',
        nameKey: 'name',
        isMoney
      });
      usedTextFields.add(bestPieField.key);
    }
  }

  // STEP 3 - Secondary BAR field
  if (configs.length < 3) {
    const remainingMidFields = midFields.filter(t => !usedTextFields.has(t.key));
    const remainingNumFields = numAnalysis.filter(n => !usedNumericFields.has(n.key));
    
    if (remainingMidFields.length > 0) {
      const secBarField = remainingMidFields[0];
      if (remainingNumFields.length > 0) {
        const secNumField = remainingNumFields[0];
        const aggData = aggregateNumeric(secBarField.key, secNumField);
        if (aggData.length >= 2) {
          const titlePrefix = secNumField.aggType === 'sum' ? 'Total' : 'Average';
          configs.push({
            chartType: 'bar',
            title: `${titlePrefix} ${secNumField.label.replace(/_/g, ' ')} by ${secBarField.label.replace(/_/g, ' ')}`,
            subtitle: `${secNumField.aggType === 'sum' ? 'Sum' : 'Average'} of ${secNumField.label.toLowerCase()} · grouped by ${secBarField.label.toLowerCase()}`,
            data: aggData,
            dataKey: 'value',
            nameKey: 'name',
            isMoney: secNumField.isMoney
          });
          usedTextFields.add(secBarField.key);
        }
      } else {
        const countData = getCountData(secBarField.counts);
        if (isValidCountData(countData)) {
          configs.push({
            chartType: 'bar',
            title: `Record Count by ${secBarField.label.replace(/_/g, ' ')}`,
            subtitle: `Count of entries · grouped by ${secBarField.label.toLowerCase()}`,
            data: countData,
            dataKey: 'value',
            nameKey: 'name',
            isMoney: false
          });
          usedTextFields.add(secBarField.key);
        }
      }
    }
  }

  return configs.slice(0, 3);
}

const cardStyle = {
  padding: '14px 16px',
  background: '#141410',
  borderRadius: '12px',
  border: '1px solid rgba(240,235,224,0.07)',
};

const titleStyle = {
  marginBottom: '0',
  color: '#F0EBE0',
  fontSize: '0.85rem',
  fontWeight: '600',
  fontFamily: 'var(--font-display)',
};

const subtitleStyle = {
  marginBottom: '14px',
  marginTop: '2px',
  color: '#5C5750',
  fontSize: '0.65rem',
  fontFamily: 'var(--font-body)',
};

const tooltipContentStyle = {
  background: 'var(--bg-surface-elevated)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
};

const axisTick = {
  fill: 'var(--text-tertiary)',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
};

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){
  if (endAngle - startAngle >= 359.9) {
    return `M ${x} ${y - radius} A ${radius} ${radius} 0 1 1 ${x} ${y + radius} A ${radius} ${radius} 0 1 1 ${x} ${y - radius}`;
  }
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function renderBarChart(config) {
  const maxValue = Math.max(...config.data.map(d => d.value), 1);
  const total = config.data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'center', height: '100%', padding: '10px 0' }}>
      {config.data.map((item, idx) => {
        const fillWidth = (item.value / maxValue) * 100;
        const color = COLORS[Math.min(idx, COLORS.length - 1)];
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '120px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </div>
            <div style={{ flex: 1, height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fillWidth}%`, background: color, borderRadius: '4px' }}></div>
            </div>
            <div style={{ width: '60px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {formatValue(item.value, config.isMoney)}
            </div>
          </div>
        );
      })}
      <div style={{ textAlign: 'right', fontSize: '0.62rem', color: '#5C5750', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
        Total: {formatValue(total, config.isMoney)}
      </div>
    </div>
  );
}

function renderPieChart(config) {
  const total = config.data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;
  const paddingAngle = 2;
  
  const top2 = config.data.slice(0, 2).map(d => Math.round((d.value / total) * 100) + '%');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%', padding: '10px 0' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        {config.data.map((item, idx) => {
          const sliceAngle = (item.value / total) * 360;
          if (sliceAngle <= paddingAngle) return null;
          
          const startAngle = currentAngle + (paddingAngle/2);
          const endAngle = currentAngle + sliceAngle - (paddingAngle/2);
          currentAngle += sliceAngle;
          
          const path = describeArc(60, 60, 39, startAngle, endAngle);
          
          return (
            <path 
              key={idx} 
              d={path} 
              fill="none" 
              stroke={COLORS[Math.min(idx, COLORS.length - 1)]} 
              strokeWidth="22" 
            />
          );
        })}
        {top2[0] && <text x="60" y="54" textAnchor="middle" fill="#9A9489" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{top2[0]} {top2[1] ? '/' : ''}</text>}
        {top2[1] && <text x="60" y="68" textAnchor="middle" fill="#9A9489" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{top2[1]}</text>}
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {config.data.map((item, idx) => {
           const pct = Math.round((item.value / total) * 100);
           return (
             <div key={idx} style={{ marginTop: idx > 0 ? '6px' : '0' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[Math.min(idx, COLORS.length - 1)], flexShrink: 0 }}></div>
                 <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                 <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{pct}%</span>
               </div>
               <div style={{ paddingLeft: '16px', color: '#5C5750', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                 {formatValue(item.value, config.isMoney)}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}

function renderLineChart(config) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
        <XAxis
          dataKey={config.nameKey}
          stroke="var(--text-tertiary)"
          tickLine={false}
          axisLine={false}
          dy={10}
          tick={axisTick}
        />
        <YAxis
          stroke="var(--text-tertiary)"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(v) => Math.round(v)}
          dx={-10}
          tick={axisTick}
        />
        <Tooltip
          contentStyle={tooltipContentStyle}
          itemStyle={{ color: 'var(--text-primary)' }}
          labelStyle={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}
        />
        <Line
          type="monotone"
          dataKey={config.dataKey}
          stroke={COLORS[0]}
          strokeWidth={2}
          dot={{ r: 4, fill: COLORS[0], strokeWidth: 0 }}
          activeDot={{ r: 6, fill: COLORS[0], stroke: 'var(--bg-surface-elevated)', strokeWidth: 2 }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function DynamicChart({ fields, entries }) {
  const chartConfigs = useMemo(() => analyzeFields(fields, entries), [fields, entries]);

  if (!chartConfigs || chartConfigs.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '3rem', ...cardStyle, background: 'transparent' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Your data doesn't have enough variety to visualize yet.</p>
        <p style={{ fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center' }}>Try logging entries with categorical fields like status, channel, or category.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: chartConfigs.length > 1 ? '1fr 1fr' : '1fr', 
      gap: '14px' 
    }}>
      {chartConfigs.map((config, idx) => {
        const isFullWidth = chartConfigs.length === 1 || idx >= 2;
        return (
          <div key={idx} style={{ ...cardStyle, gridColumn: isFullWidth ? '1 / -1' : 'auto' }}>
            <h3 style={titleStyle}>{config.title}</h3>
            {config.subtitle && <p style={subtitleStyle}>{config.subtitle}</p>}
            <div style={{ width: '100%', minHeight: 200 }}>
              {config.chartType === 'bar' && renderBarChart(config)}
              {config.chartType === 'pie' && renderPieChart(config)}
              {config.chartType === 'line' && renderLineChart(config)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
