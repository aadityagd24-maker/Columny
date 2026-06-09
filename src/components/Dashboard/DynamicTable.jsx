import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { fieldsToColumns, flattenEntry } from '../../lib/schemaUtils';

function formatNumber(value, fieldName) {
  if (typeof value !== 'number') return value;
  const formatted = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const isMoneyWords = ['revenue', 'sales', 'amount', 'price', 'value', 'earnings', 'income', 'cost'];
  const isMoney = isMoneyWords.some(w => fieldName.toLowerCase().includes(w));
  return isMoney ? `$${formatted}` : formatted;
}

function getPillStyle(value) {
  if (typeof value !== 'string' || value.length > 30) return null;
  const lower = value.toLowerCase();
  
  if (['e-commerce', 'online', 'digital', 'web'].some(w => lower.includes(w))) {
    return { background: 'rgba(74,124,89,.15)', border: '1px solid rgba(74,124,89,.3)', color: '#4A7C59' };
  }
  if (['retail', 'store', 'physical', 'in-store'].some(w => lower.includes(w))) {
    return { background: 'rgba(201,153,42,.10)', border: '1px solid rgba(201,153,42,.25)', color: '#C9992A' };
  }
  if (['pending', 'processing', 'in progress'].some(w => lower.includes(w))) {
    return { background: 'rgba(201,153,42,.10)', border: '1px solid rgba(201,153,42,.25)', color: '#C9992A' };
  }
  if (['complete', 'done', 'closed', 'won'].some(w => lower.includes(w))) {
    return { background: 'rgba(74,124,89,.15)', border: '1px solid rgba(74,124,89,.3)', color: '#4A7C59' };
  }
  if (['failed', 'lost', 'cancelled', 'rejected'].some(w => lower.includes(w))) {
    return { background: 'rgba(139,58,58,.15)', border: '1px solid rgba(139,58,58,.3)', color: '#C0504A' };
  }
  return null;
}

export default function DynamicTable({ fields, entries, globalFilter }) {
  const data = useMemo(() => entries.map(flattenEntry), [entries]);
  const columns = useMemo(() => fieldsToColumns(fields), [fields]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(240,235,224,0.07)', background: '#141410' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead style={{ background: '#1C1C17', borderBottom: '1px solid rgba(240,235,224,0.07)' }}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ 
                    color: 'var(--text-tertiary)',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontVariant: 'small-caps',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.2s'
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() && (
                      <span style={{ color: 'var(--accent)' }}>
                        {{ asc: '↑', desc: '↓' }[header.column.getIsSorted()]}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr key={row.id} style={{ 
                borderBottom: '1px solid rgba(240,235,224,0.07)', 
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                transition: 'background 0.2s' 
              }} 
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
            >
              {row.getVisibleCells().map(cell => {
                const value = cell.getValue();
                const fieldName = cell.column.id;
                const isNumber = typeof value === 'number';
                const isDate = fieldName === 'created_at';
                
                let content = flexRender(cell.column.columnDef.cell, cell.getContext());
                
                if (isNumber) {
                  content = formatNumber(value, fieldName);
                } else if (!isDate && typeof value === 'string') {
                  const pillStyle = getPillStyle(value);
                  if (pillStyle) {
                    content = (
                      <span style={{ 
                        ...pillStyle, 
                        padding: '1px 7px', 
                        borderRadius: '4px', 
                        fontSize: '.65rem', 
                        fontFamily: 'var(--font-mono)', 
                        display: 'inline-block' 
                      }}>
                        {value}
                      </span>
                    );
                  }
                }

                return (
                  <td key={cell.id} style={{ 
                    padding: '0.85rem 1rem', 
                    color: isNumber ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontFamily: isNumber ? 'var(--font-mono)' : 'var(--font-body)',
                    whiteSpace: 'nowrap', 
                    maxWidth: '300px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
