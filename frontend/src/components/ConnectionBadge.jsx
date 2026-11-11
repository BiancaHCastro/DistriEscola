import React from 'react';

export default function ConnectionBadge({ isFallback, onRetry }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
        backgroundColor: isFallback ? '#fef3c7' : '#dcfce7',
        color: isFallback ? '#92400e' : '#166534',
        border: `1px solid ${isFallback ? '#fcd34d' : '#86efac'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isFallback ? '#f59e0b' : '#22c55e',
          display: 'inline-block'
        }}
      />
      <span>
        {isFallback
          ? 'Modo Fallback / Resiliência Ativo'
          : 'API Gateway Conectado (Porta 8080)'}
      </span>
      {isFallback && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#b45309',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '12px',
            fontWeight: '600'
          }}
          title="Tentar conexão com http://localhost:8080/api"
        >
          Reconectar
        </button>
      )}
    </div>
  );
}
