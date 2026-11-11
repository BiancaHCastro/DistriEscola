import React, { useState, useMemo } from 'react';

export default function AttendanceForm({
  students,
  classes,
  enrollments,
  turmaId,
  setTurmaId,
  dataChamada,
  setDataChamada,
  attendanceStatus,
  onStatusChange,
  onMarkAll,
  onSubmit,
  loading
}) {
  const [apenasMatriculados, setApenasMatriculados] = useState(true);
  const [filtroAlunoTexto, setFiltroAlunoTexto] = useState('');

  // Identifica a turma selecionada atualmente
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.codigo === turmaId || String(c.id) === String(turmaId)) || classes[0] || null;
  }, [classes, turmaId]);

  // Alunos matriculados especificamente nesta turma via enrollment-service
  const alunosMatriculadosNestaTurma = useMemo(() => {
    if (!selectedClass) return students;
    const enrolledIds = new Set(
      enrollments
        .filter((e) => Number(e.classId) === Number(selectedClass.id) && e.status !== 'CANCELADA')
        .map((e) => Number(e.alunoId))
    );

    if (enrolledIds.size === 0 && apenasMatriculados) {
      // Se ainda não houver matrículas registradas para esta turma específica, exibe aviso informativo
      return [];
    }

    if (apenasMatriculados) {
      return students.filter((s) => enrolledIds.has(Number(s.id)));
    }
    return students;
  }, [selectedClass, enrollments, students, apenasMatriculados]);

  // Filtragem de busca por nome ou matrícula na lista de chamada
  const alunosParaChamada = useMemo(() => {
    if (!filtroAlunoTexto) return alunosMatriculadosNestaTurma;
    const term = filtroAlunoTexto.toLowerCase();
    return alunosMatriculadosNestaTurma.filter(
      (s) => s.nome.toLowerCase().includes(term) || s.matricula.toLowerCase().includes(term)
    );
  }, [alunosMatriculadosNestaTurma, filtroAlunoTexto]);

  return (
    <div className="card attendance-card">
      <div className="card-header">
        <div>
          <h2>Registro de Chamada de Aula</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Integração síncrona com <strong>class-service</strong> e <strong>enrollment-service</strong> (Publicação RabbitMQ)
          </span>
        </div>

        {/* Seleção Dinâmica de Turmas de class-service */}
        <div className="filters">
          <div className="filter-group">
            <label>Turma / Disciplina:</label>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              style={{ minWidth: '260px', fontWeight: '500' }}
            >
              {classes.length === 0 ? (
                <option value="">Nenhuma turma cadastrada</option>
              ) : (
                classes.map((turma) => (
                  <option key={turma.id} value={turma.codigo}>
                    {turma.codigo} - {turma.nomeDisciplina} ({turma.semestre})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>Data da Aula:</label>
            <input
              type="date"
              value={dataChamada}
              onChange={(e) => setDataChamada(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cartão de Detalhes da Turma Selecionada */}
      {selectedClass && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <strong style={{ fontSize: '15px', color: '#1e293b' }}>
              {selectedClass.codigo} — {selectedClass.nomeDisciplina}
            </strong>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Docente: <strong>{selectedClass.teacher ? selectedClass.teacher.nome : 'A definir'}</strong>
              {' • '}
              Horário: <span>{selectedClass.horario || 'Não definido'}</span>
              {' • '}
              Espaço: <span>{selectedClass.sala || 'Não definido'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '4px 10px',
                borderRadius: '6px'
              }}
            >
              {alunosMatriculadosNestaTurma.length} alunos vinculados
            </span>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={apenasMatriculados}
                onChange={(e) => setApenasMatriculados(e.target.checked)}
              />
              Apenas matriculados nesta turma
            </label>
          </div>
        </div>
      )}

      {/* Barra de Ações Rápidas e Busca de Alunos */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div className="batch-actions" style={{ margin: 0 }}>
          <span>Marcar listados como:</span>
          <button type="button" className="btn-success" onClick={() => onMarkAll('PRESENCA')}>
            Presente
          </button>
          <button type="button" className="btn-danger" onClick={() => onMarkAll('FALTA')}>
            Falta
          </button>
          <button type="button" className="btn-warning" onClick={() => onMarkAll('ATRASO')}>
            Atraso
          </button>
        </div>

        <div style={{ minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Buscar aluno na chamada..."
            value={filtroAlunoTexto}
            onChange={(e) => setFiltroAlunoTexto(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome do Aluno</th>
                <th>Status da Presença</th>
              </tr>
            </thead>
            <tbody>
              {alunosParaChamada.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center" style={{ padding: '32px' }}>
                    {apenasMatriculados ? (
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                          Nenhum aluno matriculado nesta turma ({selectedClass ? selectedClass.codigo : turmaId}).
                        </p>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          Vá até a aba <strong>Matrículas N:N (enrollment-service)</strong> para matricular alunos nesta turma, ou desmarque a opção "Apenas matriculados".
                        </span>
                      </div>
                    ) : (
                      'Nenhum aluno cadastrado no sistema.'
                    )}
                  </td>
                </tr>
              ) : (
                alunosParaChamada.map((student) => (
                  <tr key={student.id}>
                    <td><code>{student.matricula}</code></td>
                    <td className="student-name">{student.nome}</td>
                    <td>
                      <div className="status-buttons">
                        <button
                          type="button"
                          className={`status-btn ${attendanceStatus[student.id] === 'PRESENCA' ? 'selected-presenca' : ''}`}
                          onClick={() => onStatusChange(student.id, 'PRESENCA')}
                        >
                          Presente
                        </button>
                        <button
                          type="button"
                          className={`status-btn ${attendanceStatus[student.id] === 'FALTA' ? 'selected-falta' : ''}`}
                          onClick={() => onStatusChange(student.id, 'FALTA')}
                        >
                          Falta
                        </button>
                        <button
                          type="button"
                          className={`status-btn ${attendanceStatus[student.id] === 'ATRASO' ? 'selected-atraso' : ''}`}
                          onClick={() => onStatusChange(student.id, 'ATRASO')}
                        >
                          Atraso
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || alunosParaChamada.length === 0}
          >
            {loading ? 'Publicando Evento RabbitMQ...' : 'Salvar Chamada e Emitir Evento (RabbitMQ)'}
          </button>
        </div>
      </form>
    </div>
  );
}
