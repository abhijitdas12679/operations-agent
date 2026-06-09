import React from 'react';

const colors = {
  draft: '#64748b',
  pending: '#f59e0b',
  scheduled: '#7c3aed',
  sent: '#16a34a',
  failed: '#dc2626',
};

export default function StatusBadge({ status }) {
  return (
    <span
      style={{
        background: colors[status] || '#64748b',
        color: '#fff',
        padding: '4px 9px',
        borderRadius: '999px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {status || 'draft'}
    </span>
  );
}