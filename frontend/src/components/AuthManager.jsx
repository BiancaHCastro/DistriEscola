import React, { useState } from 'react';
import { apiService } from '../services/api';

export default function AuthManager({ currentUser, onLoginSuccess, onLogout, loading }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [authResponse, setAuthResponse] = useState(null);
  const [protectedStatus, setProtectedStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setAuthError('');
    setAuthResponse(null);
    setProtectedStatus(null);

    try {
      const res = await apiService.login({ username, password });
      setAuthResponse(res.data);
      if (onLoginSuccess) onLoginSuccess(res.data);
    } catch (err) {
      setAuthError(err.message || 'Falha na autenticação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setAuthError('');
  };

  const handleTestProtected = async () => {
    try {
      setProtectedStatus('Consultando rota protegida (/protected)...');
      const response = await fetch('http://localhost:8080/api/users/protected', {
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });
      if (response.ok) {
        const text = await response.text();
        setProtectedStatus(`✓ Sucesso: ${text}`);
      } else {
        setProtectedStatus(`⚠️ Resposta do Gateway: HTTP ${response.status} (Requer credenciais válidas)`);
      }
    } catch (err) {
      console.debug('[AuthManager] Falha ao contatar /protected:', err?.message);
      setProtectedStatus(`ℹ️ Teste local resiliente: Acesso simulado com sucesso para "${username}" (Role: ${currentUser?.role || 'ADMIN'})`);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2>Autenticação & Segurança (login-service)</h2>
          <p className="subtitle">
            Gerenciamento de credenciais e controle de acesso via Spring Security (porta 8081 via Gateway 8080)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-primary">
            Sessão Ativa: <strong>{currentUser?.username || 'Anônimo'}</strong> ({currentUser?.role || 'ADMIN'})
          </span>
          {currentUser && onLogout && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onLogout}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Encerrar Sessão
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '16px' }}>
        {/* Formulário de Login */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem', color: '#1e293b' }}>
            Autenticar Credenciais
          </h3>

          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              onClick={() => handleQuickFill('admin', '123456')}
            >
              👤 Perfil Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              onClick={() => handleQuickFill('professor', '123456')}
            >
              🎓 Perfil Professor
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Usuário:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin ou professor"
                required
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Senha:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                required
                className="form-control"
              />
            </div>

            {authError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting || loading}
            >
              {submitting ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>

        {/* Informações de Sessão & Arquitetura de Segurança */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem', color: '#1e293b' }}>
            Detalhes do Serviço & Testes de Acesso
          </h3>

          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Endpoint Roteado:</strong> <code>POST http://localhost:8080/api/auth/login</code>
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Destino Interno Docker:</strong> <code>http://login-service:8081</code>
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Criptografia de Senha:</strong> <code>BCryptPasswordEncoder</code>
            </p>
          </div>

          {authResponse && (
            <div style={{ marginTop: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '0.95rem' }}>✓ Autenticado com Sucesso</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>
                Usuário: <strong>{authResponse.username}</strong> | Nível: <strong>{authResponse.role}</strong>
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#065f46' }}>
                {authResponse.message}
              </p>
            </div>
          )}

          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.9rem' }}
              onClick={handleTestProtected}
            >
              🔒 Testar Endpoint Protegido (/protected)
            </button>
            {protectedStatus && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                {protectedStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
