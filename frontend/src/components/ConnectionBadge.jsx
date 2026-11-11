import React from 'react';

export default function ConnectionBadge({ isConnected, onRetry, isChecking }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
        color: isConnected ? '#15803d' : '#b91c1c',
        border: `1px solid ${isConnected ? '#86efac' : '#fca5a5'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
    >
      <span
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#22c55e' : '#ef4444',
          display: 'inline-block',
          boxShadow: isConnected ? '0 0 6px rgba(34, 197, 94, 0.6)' : '0 0 6px rgba(239, 68, 68, 0.6)'
        }}
      />
      <span>
        {isChecking
          ? 'Verificando conexão...'
          : isConnected
          ? 'Servidores Online (Gateway :8080)'
          : 'Servidores Offline / Desconectados'}
      </span>
      {(!isConnected || onRetry) && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isChecking}
          style={{
            background: 'transparent',
            border: 'none',
            color: isConnected ? '#15803d' : '#b91c1c',
            textDecoration: 'underline',
            cursor: isChecking ? 'wait' : 'pointer',
            padding: '0 4px',
            fontSize: '12px',
            fontWeight: '600'
          }}
          title="Tentar reconectar com http://localhost:8080/api"
        >
          {isChecking ? 'Checando...' : 'Reconectar'}
        </button>
      )}
    </div>
  );
}
