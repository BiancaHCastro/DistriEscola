import React, { useState, useMemo } from 'react';

export default function GradeManager({
  classes,
  students,
  enrollments,
  grades,
  onSaveGrade,
  loading
}) {
  const [selectedTurmaId, setSelectedTurmaId] = useState(classes[0]?.codigo || 'TURMA-101');
  const [filtroSituacao, setFiltroSituacao] = useState('ALL');
  const [filtroTexto, setFiltroTexto] = useState('');

  // Turma selecionada
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.codigo === selectedTurmaId) || classes[0] || null;
  }, [classes, selectedTurmaId]);

  // Alunos vinculados a esta turma via enrollment-service
  const alunosDaTurma = useMemo(() => {
    if (!selectedClass) return students;
    const enrolledIds = new Set(
      enrollments
        .filter((e) => Number(e.classId) === Number(selectedClass.id) && e.status !== 'CANCELADA')
        .map((e) => Number(e.alunoId))
    );

    if (enrolledIds.size === 0) {
      return students; // Fallback se não houver matrículas específicas ainda
    }
    return students.filter((s) => enrolledIds.has(Number(s.id)));
  }, [selectedClass, enrollments, students]);

  // Modal para lançamento de notas
  const [showModal, setShowModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    alunoId: '',
    turmaId: selectedTurmaId,
    nota1: '',
    nota2: '',
    notaFinal: ''
  });

  const openGradeModal = (aluno) => {
    const existing = grades.find(
      (g) => Number(g.alunoId) === Number(aluno.id) && g.turmaId === selectedTurmaId
    );
    setGradeForm({
      alunoId: aluno.id,
      turmaId: selectedTurmaId,
      nota1: existing?.nota1 ?? '',
      nota2: existing?.nota2 ?? '',
      notaFinal: existing?.notaFinal ?? ''
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const success = await onSaveGrade(gradeForm);
    if (success) {
      setShowModal(false);
    }
  };

  // Mapeamento de notas por aluno
  const gradeMap = useMemo(() => {
    const map = {};
    grades.forEach((g) => {
      if (g.turmaId === selectedTurmaId) {
        map[g.alunoId] = g;
      }
    });
    return map;
  }, [grades, selectedTurmaId]);

  // Alunos filtrados por busca e por situação
  const alunosFiltrados = useMemo(() => {
    return alunosDaTurma.filter((s) => {
      const matchText =
        !filtroTexto ||
        s.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        s.matricula.toLowerCase().includes(filtroTexto.toLowerCase());

      const g = gradeMap[s.id];
      const situacao = g?.situacao || 'EM_ANDAMENTO';
      const matchSituacao = filtroSituacao === 'ALL' || situacao === filtroSituacao;

      return matchText && matchSituacao;
    });
  }, [alunosDaTurma, filtroTexto, filtroSituacao, gradeMap]);

  return (
    <div className="card grades-card">
      <div className="card-header">
        <div>
          <h2>Gestão de Notas e Rendimento Acadêmico (grade-service)</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Lançamento de notas com publicação de eventos assíncronos no <strong>RabbitMQ</strong> (routing key: <code>grade.posted</code>)
          </span>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Selecione a Turma:</label>
            <select
              value={selectedTurmaId}
              onChange={(e) => setSelectedTurmaId(e.target.value)}
              style={{ minWidth: '240px', fontWeight: '500' }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.codigo}>
                  {c.codigo} - {c.nomeDisciplina}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca de Notas */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          background: '#f8fafc',
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ flex: '1 1 220px' }}>
          <input
            type="text"
            placeholder="Buscar aluno por nome ou matrícula..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Filtrar Situação:</span>
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
          >
            <option value="ALL">Todas as Situações</option>
            <option value="APROVADO">Aprovado (Média ≥ 7.0)</option>
            <option value="RECUPERACAO">Recuperação (4.0 a 6.9)</option>
            <option value="APROVADO_FINAL">Aprovado em Final</option>
            <option value="REPROVADO">Reprovado</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nome do Aluno</th>
              <th>Avaliação 1 (AV1)</th>
              <th>Avaliação 2 (AV2)</th>
              <th>Exame Final (AF)</th>
              <th>Média Calculada</th>
              <th>Situação Acadêmica</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Nenhum aluno encontrado para os critérios selecionados nesta turma.
                </td>
              </tr>
            ) : (
              alunosFiltrados.map((aluno) => {
                const g = gradeMap[aluno.id];
                const sit = g?.situacao || 'EM_ANDAMENTO';
                let sitClass = 'badge-atraso';
                let sitLabel = 'Em Andamento';

                if (sit === 'APROVADO') {
                  sitClass = 'badge-presenca';
                  sitLabel = 'Aprovado por Média';
                } else if (sit === 'RECUPERACAO') {
                  sitClass = 'badge-atraso';
                  sitLabel = 'Em Recuperação';
                } else if (sit === 'APROVADO_FINAL') {
                  sitClass = 'badge-presenca';
                  sitLabel = 'Aprovado em Prova Final';
                } else if (sit === 'REPROVADO') {
                  sitClass = 'badge-falta';
                  sitLabel = 'Reprovado';
                }

                return (
                  <tr key={aluno.id}>
                    <td><code>{aluno.matricula}</code></td>
                    <td className="student-name">{aluno.nome}</td>
                    <td>
                      <strong>{g?.nota1 !== null && g?.nota1 !== undefined ? g.nota1.toFixed(1) : '-'}</strong>
                    </td>
                    <td>
                      <strong>{g?.nota2 !== null && g?.nota2 !== undefined ? g.nota2.toFixed(1) : '-'}</strong>
                    </td>
                    <td>
                      {g?.notaFinal !== null && g?.notaFinal !== undefined ? (
                        <strong>{g.notaFinal.toFixed(1)}</strong>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      {g?.mediaCalculada !== null && g?.mediaCalculada !== undefined ? (
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                          {g.mediaCalculada.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${sitClass}`}>
                        {sitLabel}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => openGradeModal(aluno)}
                      >
                        Lançar / Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Lançamento de Notas - {selectedTurmaId}</h3>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Aluno Selecionado:</label>
                <div style={{ fontWeight: '600', padding: '8px 0', color: '#1e293b' }}>
                  {students.find((s) => s.id === gradeForm.alunoId)?.nome}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Avaliação 1 (AV1):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={gradeForm.nota1}
                    onChange={(e) => setGradeForm({ ...gradeForm, nota1: e.target.value })}
                    placeholder="0.0 a 10.0"
                  />
                </div>
                <div className="form-group">
                  <label>Avaliação 2 (AV2):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={gradeForm.nota2}
                    onChange={(e) => setGradeForm({ ...gradeForm, nota2: e.target.value })}
                    placeholder="0.0 a 10.0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Exame Final / Recuperação (AF - Opcional):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={gradeForm.notaFinal}
                  onChange={(e) => setGradeForm({ ...gradeForm, notaFinal: e.target.value })}
                  placeholder="Preencher apenas se em recuperação"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Publicando...' : 'Salvar e Emitir Evento (RabbitMQ)'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
