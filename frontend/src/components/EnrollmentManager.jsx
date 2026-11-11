import React, { useState } from 'react';

export default function EnrollmentManager({
  enrollments,
  students,
  classes,
  onEnroll,
  onCancelEnrollment,
  loading
}) {
  const [selectedAlunoId, setSelectedAlunoId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [filterView, setFilterView] = useState('all'); // 'all', 'byStudent', 'byClass'
  const [filterTargetId, setFilterTargetId] = useState('');

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlunoId || !selectedClassId) return;
    await onEnroll(selectedAlunoId, selectedClassId);
    setSelectedClassId('');
  };

  // Filtra as matrículas conforme o modo de visualização
  const displayedEnrollments = enrollments.filter((item) => {
    if (filterView === 'byStudent' && filterTargetId) {
      return Number(item.alunoId) === Number(filterTargetId);
    }
    if (filterView === 'byClass' && filterTargetId) {
      return Number(item.classId) === Number(filterTargetId);
    }
    return true;
  });

  return (
    <div className="card enrollments-card">
      <div className="card-header">
        <div>
          <h2>Matrículas Acadêmicas N:N (enrollment-service)</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Regra N:N: Alunos em múltiplas disciplinas e Turmas com múltiplos alunos (REST com fallbacks)
          </span>
        </div>
      </div>

      {/* Painel de Matrícula Rápida */}
      <div
        style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>
          Nova Matrícula (Associar Aluno a Disciplina)
        </h3>
        <form
          onSubmit={handleEnrollSubmit}
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'flex-end'
          }}
        >
          <div className="filter-group" style={{ flex: '1 1 250px' }}>
            <label>Selecione o Aluno:</label>
            <select
              required
              value={selectedAlunoId}
              onChange={(e) => setSelectedAlunoId(e.target.value)}
            >
              <option value="">-- Escolha um Aluno --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.matricula})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ flex: '1 1 250px' }}>
            <label>Selecione a Turma/Disciplina:</label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">-- Escolha a Turma --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.nomeDisciplina} ({c.semestre})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ height: '42px', padding: '0 20px' }}
            disabled={loading || !selectedAlunoId || !selectedClassId}
          >
            {loading ? 'Matriculando...' : 'Efetuar Matrícula'}
          </button>
        </form>
      </div>

      {/* Filtros de Visualização da Matriz N:N */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Visualizar:</span>
          <button
            type="button"
            className={filterView === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '13px' }}
            onClick={() => { setFilterView('all'); setFilterTargetId(''); }}
          >
            Todas as Matrículas ({enrollments.length})
          </button>
          <button
            type="button"
            className={filterView === 'byStudent' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '13px' }}
            onClick={() => { setFilterView('byStudent'); setFilterTargetId(students[0]?.id || ''); }}
          >
            Por Aluno
          </button>
          <button
            type="button"
            className={filterView === 'byClass' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '13px' }}
            onClick={() => { setFilterView('byClass'); setFilterTargetId(classes[0]?.id || ''); }}
          >
            Por Turma
          </button>
        </div>

        {filterView === 'byStudent' && (
          <select
            value={filterTargetId}
            onChange={(e) => setFilterTargetId(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.nome} ({s.matricula})</option>
            ))}
          </select>
        )}

        {filterView === 'byClass' && (
          <select
            value={filterTargetId}
            onChange={(e) => setFilterTargetId(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.codigo} - {c.nomeDisciplina}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tabela de Matrículas */}
      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno (aluno-service)</th>
              <th>Matrícula</th>
              <th>Disciplina / Turma (class-service)</th>
              <th>Código</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {displayedEnrollments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Nenhuma matrícula encontrada para o filtro selecionado.
                </td>
              </tr>
            ) : (
              displayedEnrollments.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="student-name">
                    {item.aluno ? item.aluno.nome : `Aluno #${item.alunoId}`}
                  </td>
                  <td>
                    <code>{item.aluno ? item.aluno.matricula : `ID:${item.alunoId}`}</code>
                  </td>
                  <td>
                    <strong>{item.turma ? item.turma.nomeDisciplina : `Turma #${item.classId}`}</strong>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {item.turma ? item.turma.codigo : `ID:${item.classId}`}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-presenca">
                      {item.status || 'ATIVA'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => onCancelEnrollment(item.id)}
                    >
                      Cancelar Matrícula
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
