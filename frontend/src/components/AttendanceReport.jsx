import React, { useState } from 'react';

export default function AttendanceReport({
  report,
  turmaId,
  setTurmaId,
  classes = [],
  onRefresh,
  loading
}) {
  const [filtroStatus, setFiltroStatus] = useState('ALL');

  const historicoFiltrado = (report?.historico || []).filter((item) => {
    if (filtroStatus === 'ALL') return true;
    return item.status === filtroStatus;
  });

  return (
    <div className="card report-card">
      <div className="card-header">
        <div>
          <h2>Relatório de Frequência - {turmaId}</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Consolidação em tempo real dos eventos registrados via RabbitMQ (attendance-service)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {classes.length > 0 && setTurmaId && (
            <div className="filter-group">
              <label>Turma / Disciplina:</label>
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                style={{ fontWeight: '500' }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.codigo}>
                    {c.codigo} - {c.nomeDisciplina}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="btn-secondary" onClick={onRefresh} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? 'Atualizando...' : 'Atualizar Relatório'}
          </button>
        </div>
      </div>

      {report ? (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <h3>Total de Registros</h3>
              <p className="stat-value">{report.totalAulas ?? 0}</p>
            </div>
            <div className="stat-box">
              <h3>Presenças / Atrasos</h3>
              <p className="stat-value success">{report.presencas ?? 0}</p>
            </div>
            <div className="stat-box">
              <h3>Faltas Registradas</h3>
              <p className="stat-value danger">{report.faltas ?? 0}</p>
            </div>
            <div className="stat-box">
              <h3>Taxa de Presença</h3>
              <p className="stat-value primary">
                {(report.percentualPresenca ?? 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="table-responsive" style={{ marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <h3 style={{ fontSize: '16px', margin: 0, color: '#334155' }}>
                Histórico de Eventos de Presença
              </h3>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Filtrar status:</span>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  style={{ padding: '4px 8px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  <option value="ALL">Todos os Registros</option>
                  <option value="PRESENCA">Apenas Presente</option>
                  <option value="FALTA">Apenas Falta</option>
                  <option value="ATRASO">Apenas Atraso</option>
                </select>
              </div>
            </div>

            <table className="attendance-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Aluno ID</th>
                  <th>Turma</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historicoFiltrado.length > 0 ? (
                  historicoFiltrado.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.alunoId}</td>
                      <td>{item.turmaId}</td>
                      <td>{item.data}</td>
                      <td>
                        <span className={`badge badge-${item.status ? item.status.toLowerCase() : 'presenca'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Nenhum registro encontrado para esta turma ou filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-center" style={{ padding: '32px', color: '#64748b' }}>
          Carregando relatório de frequência...
        </p>
      )}
    </div>
  );
}
