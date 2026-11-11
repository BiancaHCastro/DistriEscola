import React, { useState, useMemo } from 'react';

export default function StudentManager({
  students,
  classes = [],
  enrollments = [],
  onSaveStudent,
  onDeleteStudent,
  onEnroll,
  onCancelEnrollment,
  loading
}) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState('');

  // Modal para Gerenciamento Direto de Matrículas do Aluno
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(null);
  const [classToEnrollId, setClassToEnrollId] = useState('');
  const [enrollingLoading, setEnrollingLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    id: null,
    matricula: '',
    nome: '',
    dataNascimento: '',
    endereco: '',
    contato: ''
  });

  const openNewModal = () => {
    setStudentForm({ id: null, matricula: '', nome: '', dataNascimento: '', endereco: '', contato: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    let rawDate = student.dataNascimento || '';
    if (rawDate && rawDate.includes('/')) {
      const [day, month, year] = rawDate.split('/');
      rawDate = `${year}-${month}-${day}`;
    }
    setStudentForm({
      ...student,
      dataNascimento: rawDate
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openManageEnrollmentsModal = (student) => {
    setSelectedStudentForEnroll(student);
    setClassToEnrollId('');
    setShowEnrollModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSaveStudent(studentForm, isEditing);
    if (success) {
      setShowModal(false);
    }
  };

  const handleEnrollInClass = async (e) => {
    e.preventDefault();
    if (!classToEnrollId || !selectedStudentForEnroll || !onEnroll) return;
    setEnrollingLoading(true);
    try {
      const success = await onEnroll(selectedStudentForEnroll.id, classToEnrollId);
      if (success) {
        setClassToEnrollId('');
      }
    } finally {
      setEnrollingLoading(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId) => {
    if (!onCancelEnrollment) return;
    setEnrollingLoading(true);
    try {
      await onCancelEnrollment(enrollmentId);
    } finally {
      setEnrollingLoading(false);
    }
  };

  // Filtragem de alunos
  const alunosFiltrados = useMemo(() => {
    if (!filtroTexto) return students;
    const q = filtroTexto.toLowerCase();
    return students.filter(
      (s) =>
        s.nome.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q) ||
        (s.contato && s.contato.toLowerCase().includes(q))
    );
  }, [students, filtroTexto]);

  // Turmas em que o aluno selecionado no modal já está matriculado
  const turmasDoAlunoSelecionado = useMemo(() => {
    if (!selectedStudentForEnroll) return [];
    return enrollments.filter(
      (e) => Number(e.alunoId) === Number(selectedStudentForEnroll.id)
    );
  }, [enrollments, selectedStudentForEnroll]);

  // Turmas disponíveis para este aluno se matricular (não matriculadas ainda)
  const turmasDisponiveisParaAluno = useMemo(() => {
    if (!selectedStudentForEnroll) return [];
    const idsTurmasMatriculadas = new Set(
      turmasDoAlunoSelecionado.map((e) => Number(e.classId))
    );
    return classes.filter((c) => !idsTurmasMatriculadas.has(Number(c.id)));
  }, [classes, turmasDoAlunoSelecionado, selectedStudentForEnroll]);

  return (
    <div className="card students-card">
      <div className="card-header">
        <div>
          <h2>Gerenciamento de Alunos (aluno-service)</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Base de dados acadêmica integrada via REST, Flyway e Matrículas Diretas
          </span>
        </div>
        <button className="btn-primary" onClick={openNewModal}>
          + Cadastrar Novo Aluno
        </button>
      </div>

      {/* Barra de Busca de Alunos */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '20px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ flex: '1 1 250px' }}>
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou contato..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        {filtroTexto && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFiltroTexto('')}
          >
            Limpar Busca
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Matrícula</th>
              <th>Nome Completo</th>
              <th>Turmas Matriculadas (N:N)</th>
              <th>Data Nasc.</th>
              <th>Contato</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  {students.length === 0
                    ? 'Nenhum aluno cadastrado. Clique no botão acima para adicionar.'
                    : 'Nenhum aluno encontrado para a busca.'}
                </td>
              </tr>
            ) : (
              alunosFiltrados.map((student) => {
                // Turmas deste aluno
                const matriculasAluno = enrollments.filter(
                  (e) => Number(e.alunoId) === Number(student.id)
                );

                return (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td><code>{student.matricula}</code></td>
                    <td className="student-name">{student.nome}</td>
                    <td>
                      {matriculasAluno.length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Nenhuma turma
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {matriculasAluno.map((mat) => {
                            const turmaObj = mat.turma || classes.find((c) => Number(c.id) === Number(mat.classId));
                            const codigoTurma = turmaObj ? turmaObj.codigo : `ID:${mat.classId}`;
                            const nomeDisc = turmaObj ? turmaObj.nomeDisciplina : '';

                            return (
                              <span
                                key={mat.id}
                                title={nomeDisc}
                                style={{
                                  backgroundColor: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                {codigoTurma}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td>{student.dataNascimento || '-'}</td>
                    <td>{student.contato || '-'}</td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => openManageEnrollmentsModal(student)}
                          title="Matricular e gerenciar turmas deste aluno diretamente"
                        >
                          📚 Matricular ({matriculasAluno.length})
                        </button>
                        <button className="btn-secondary" onClick={() => openEditModal(student)}>
                          Editar
                        </button>
                        <button className="btn-danger" onClick={() => onDeleteStudent(student.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Cadastrar / Editar Aluno */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditing ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Matrícula:</label>
                <input
                  type="text"
                  required
                  value={studentForm.matricula}
                  onChange={(e) => setStudentForm({ ...studentForm, matricula: e.target.value })}
                  placeholder="Ex: 2026105"
                />
              </div>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={studentForm.nome}
                  onChange={(e) => setStudentForm({ ...studentForm, nome: e.target.value })}
                  placeholder="Ex: Beatriz Lima Cavalcante"
                />
              </div>
              <div className="form-group">
                <label>Data de Nascimento:</label>
                <input
                  type="date"
                  value={studentForm.dataNascimento || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, dataNascimento: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Endereço:</label>
                <input
                  type="text"
                  value={studentForm.endereco || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, endereco: e.target.value })}
                  placeholder="Ex: Rua Floriano Peixoto, 210"
                />
              </div>
              <div className="form-group">
                <label>Contato:</label>
                <input
                  type="text"
                  value={studentForm.contato || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, contato: e.target.value })}
                  placeholder="Ex: (85) 99111-2233"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Aluno'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Gerenciamento Direto de Matrículas do Aluno */}
      {showEnrollModal && selectedStudentForEnroll && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>
                  Matrículas do Aluno
                </h3>
                <div style={{ fontSize: '15px', color: '#2563eb', fontWeight: '700' }}>
                  {selectedStudentForEnroll.nome}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Matrícula: <code>{selectedStudentForEnroll.matricula}</code> | Contato: {selectedStudentForEnroll.contato || '-'}
                </div>
              </div>
              <span style={{
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700'
              }}>
                {turmasDoAlunoSelecionado.length} Turma(s) Matriculada(s)
              </span>
            </div>

            {/* Formulário Rápido para Matricular em Nova Turma */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>
                ➕ Matricular em uma Turma/Disciplina:
              </h4>

              {turmasDisponiveisParaAluno.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                  {classes.length === 0
                    ? 'Nenhuma turma cadastrada no sistema. Crie turmas na aba "Turmas" primeiro.'
                    : 'Este aluno já está matriculado em todas as turmas cadastradas no sistema.'}
                </div>
              ) : (
                <form onSubmit={handleEnrollInClass} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 340px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Selecione a Turma / Disciplina:
                    </label>
                    <select
                      required
                      value={classToEnrollId}
                      onChange={(e) => setClassToEnrollId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Escolha uma Turma --</option>
                      {turmasDisponiveisParaAluno.map((c) => {
                        const totalMat = enrollments.filter((e) => Number(e.classId) === Number(c.id)).length;
                        const cap = c.capacidadeMaxima || 40;
                        const lotada = totalMat >= cap;

                        return (
                          <option key={c.id} value={c.id} disabled={lotada}>
                            {c.codigo} - {c.nomeDisciplina} ({c.semestre}) - {totalMat}/{cap} vagas {lotada ? '[LOTADA]' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                    disabled={enrollingLoading || !classToEnrollId}
                  >
                    {enrollingLoading ? 'Matriculando...' : '+ Confirmar Matrícula'}
                  </button>
                </form>
              )}
            </div>

            {/* Listagem das Turmas em que o Aluno já está Matriculado */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>
              Turmas Atuais do Aluno ({turmasDoAlunoSelecionado.length}):
            </h4>

            {turmasDoAlunoSelecionado.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: '#f8fafc',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '13px'
              }}>
                Este aluno ainda não está matriculado em nenhuma disciplina. Selecione uma turma acima para matriculá-lo.
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="attendance-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Disciplina</th>
                      <th>Semestre</th>
                      <th>Horário / Sala</th>
                      <th style={{ textAlign: 'right' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turmasDoAlunoSelecionado.map((item) => {
                      const classObj = item.turma || classes.find((c) => Number(c.id) === Number(item.classId));
                      const codigoTurma = classObj ? classObj.codigo : `ID:${item.classId}`;
                      const nomeTurma = classObj ? classObj.nomeDisciplina : `Turma #${item.classId}`;
                      const semestreTurma = classObj ? classObj.semestre : '-';
                      const horarioSala = classObj ? `${classObj.horario || ''} (${classObj.sala || ''})` : '-';

                      return (
                        <tr key={item.id}>
                          <td><code>{codigoTurma}</code></td>
                          <td className="student-name">{nomeTurma}</td>
                          <td>
                            <span style={{
                              backgroundColor: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {semestreTurma}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#475569' }}>
                            {horarioSala}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-danger"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                              onClick={() => handleRemoveEnrollment(item.id)}
                              disabled={enrollingLoading}
                            >
                              Cancelar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowEnrollModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
