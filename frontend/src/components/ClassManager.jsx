import React, { useState, useMemo } from 'react';

const DIAS_OPCOES = [
  'Seg / Qua',
  'Ter / Qui',
  'Qua / Sex',
  'Seg / Qua / Sex',
  'Ter / Qui / Sáb',
  'Sábado Manhã'
];

const HORARIOS_OPCOES = [
  '07:30 - 09:10 (Manhã A)',
  '09:20 - 11:00 (Manhã B)',
  '11:10 - 12:50 (Manhã C)',
  '13:30 - 15:10 (Tarde A)',
  '15:20 - 17:00 (Tarde B)',
  '18:30 - 20:10 (Noite A)',
  '20:20 - 22:00 (Noite B)'
];

const BLOCOS_OPCOES = [
  'Bloco A (Exatas & Gestão)',
  'Bloco B (Humanas & Artes)',
  'Bloco M (Tecnologia da Informação)',
  'Complexo de Laboratórios',
  'Auditório Central'
];

const SALAS_OPCOES = [
  'Sala 101', 'Sala 102', 'Sala 103', 'Sala 104',
  'Sala 201', 'Sala 202', 'Sala 203', 'Sala 204',
  'Lab 01 (Eng. Software)', 'Lab 02 (Sistemas Distribuídos)',
  'Lab 03 (Redes & Cloud)', 'Lab 04 (Hardware & IoT)'
];

export default function ClassManager({
  classes,
  teachers,
  students = [],
  enrollments = [],
  onSaveClass,
  onDeleteClass,
  onEnroll,
  onCancelEnrollment,
  loading
}) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Modal para Gerenciamento Direto de Matrículas da Turma
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClassForEnroll, setSelectedClassForEnroll] = useState(null);
  const [studentToEnrollId, setStudentToEnrollId] = useState('');
  const [enrollingLoading, setEnrollingLoading] = useState(false);

  // Filtros de busca na listagem de turmas
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');
  const [filtroProfessor, setFiltroProfessor] = useState('');

  // Formulário com campos estruturados e validados
  const [classForm, setClassForm] = useState({
    id: null,
    codigo: '',
    nomeDisciplina: '',
    semestre: '2026.1',
    diasSemana: 'Seg / Qua',
    faixaHorario: '07:30 - 09:10 (Manhã A)',
    bloco: 'Bloco M (Tecnologia da Informação)',
    salaNumero: 'Lab 02 (Sistemas Distribuídos)',
    capacidadeMaxima: 40,
    teacherId: ''
  });

  const openNewModal = () => {
    setClassForm({
      id: null,
      codigo: '',
      nomeDisciplina: '',
      semestre: '2026.1',
      diasSemana: 'Seg / Qua',
      faixaHorario: '07:30 - 09:10 (Manhã A)',
      bloco: 'Bloco M (Tecnologia da Informação)',
      salaNumero: 'Lab 02 (Sistemas Distribuídos)',
      capacidadeMaxima: 40,
      teacherId: teachers.length > 0 ? teachers[0].id : ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (turma) => {
    let dias = 'Seg / Qua';
    let faixa = '07:30 - 09:10 (Manhã A)';
    if (turma.horario && turma.horario.includes(' - ')) {
      const parts = turma.horario.split(' ');
      if (parts.length >= 3) {
        dias = parts.slice(0, 3).join(' ');
        faixa = parts.slice(3).join(' ') || faixa;
      }
    }

    let bloco = 'Bloco M (Tecnologia da Informação)';
    let salaNum = 'Sala 101';
    if (turma.sala && turma.sala.includes(' - ')) {
      const parts = turma.sala.split(' - ');
      bloco = parts[0] || bloco;
      salaNum = parts[1] || salaNum;
    }

    setClassForm({
      id: turma.id,
      codigo: turma.codigo,
      nomeDisciplina: turma.nomeDisciplina,
      semestre: turma.semestre,
      diasSemana: dias,
      faixaHorario: faixa,
      bloco: bloco,
      salaNumero: salaNum,
      capacidadeMaxima: turma.capacidadeMaxima || 40,
      teacherId: turma.teacherId || (turma.teacher ? turma.teacher.id : '')
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openManageEnrollmentsModal = (turma) => {
    setSelectedClassForEnroll(turma);
    setStudentToEnrollId('');
    setShowEnrollModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const horarioComposto = `${classForm.diasSemana} ${classForm.faixaHorario}`;
    const salaComposta = `${classForm.bloco} - ${classForm.salaNumero}`;

    const payload = {
      id: classForm.id,
      codigo: classForm.codigo.trim().toUpperCase(),
      nomeDisciplina: classForm.nomeDisciplina.trim(),
      semestre: classForm.semestre.trim(),
      horario: horarioComposto,
      sala: salaComposta,
      capacidadeMaxima: Number(classForm.capacidadeMaxima),
      teacherId: classForm.teacherId ? Number(classForm.teacherId) : null
    };

    const success = await onSaveClass(payload, isEditing);
    if (success) {
      setShowModal(false);
    }
  };

  const handleEnrollStudentInClass = async (e) => {
    e.preventDefault();
    if (!studentToEnrollId || !selectedClassForEnroll || !onEnroll) return;
    setEnrollingLoading(true);
    try {
      const success = await onEnroll(studentToEnrollId, selectedClassForEnroll.id);
      if (success) {
        setStudentToEnrollId('');
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

  // Filtragem dinâmica de turmas
  const turmasFiltradas = useMemo(() => {
    return classes.filter((turma) => {
      const matchesTexto =
        !filtroTexto ||
        turma.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        turma.nomeDisciplina.toLowerCase().includes(filtroTexto.toLowerCase());

      const matchesSemestre = !filtroSemestre || turma.semestre === filtroSemestre;

      const matchesProfessor =
        !filtroProfessor ||
        (turma.teacher && String(turma.teacher.id) === String(filtroProfessor)) ||
        (turma.teacherId && String(turma.teacherId) === String(filtroProfessor));

      return matchesTexto && matchesSemestre && matchesProfessor;
    });
  }, [classes, filtroTexto, filtroSemestre, filtroProfessor]);

  const semestresUnicos = useMemo(() => {
    const s = new Set(classes.map((c) => c.semestre).filter(Boolean));
    return Array.from(s);
  }, [classes]);

  // Alunos matriculados na turma atualmente selecionada no modal
  const alunosMatriculadosNaTurma = useMemo(() => {
    if (!selectedClassForEnroll) return [];
    return enrollments.filter(
      (e) => Number(e.classId) === Number(selectedClassForEnroll.id)
    );
  }, [enrollments, selectedClassForEnroll]);

  // Alunos ainda NÃO matriculados nesta turma para o dropdown de adição
  const alunosDisponiveisParaTurma = useMemo(() => {
    if (!selectedClassForEnroll) return [];
    const idsJaMatriculados = new Set(
      alunosMatriculadosNaTurma.map((e) => Number(e.alunoId))
    );
    return students.filter((s) => !idsJaMatriculados.has(Number(s.id)));
  }, [students, alunosMatriculadosNaTurma, selectedClassForEnroll]);

  return (
    <div className="card classes-card">
      <div className="card-header">
        <div>
          <h2>Turmas & Disciplinas (class-service)</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Planejamento acadêmico com matrículas diretas, horários, salas e corpo docente
          </span>
        </div>
        <button className="btn-primary" onClick={openNewModal}>
          + Criar Nova Turma
        </button>
      </div>

      {/* Barra de Filtros e Busca de Turmas */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <input
            type="text"
            placeholder="Filtrar por código ou disciplina..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ minWidth: '150px' }}>
          <select
            value={filtroSemestre}
            onChange={(e) => setFiltroSemestre(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">Todos os Semestres</option>
            {semestresUnicos.map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            value={filtroProfessor}
            onChange={(e) => setFiltroProfessor(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">Todos os Professores</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>

        {(filtroTexto || filtroSemestre || filtroProfessor) && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFiltroTexto('');
              setFiltroSemestre('');
              setFiltroProfessor('');
            }}
          >
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Disciplina</th>
              <th>Semestre</th>
              <th>Docente Alocado (REST)</th>
              <th>Horário (Dias / Turno)</th>
              <th>Espaço / Sala</th>
              <th>Matrículas / Vagas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">
                  Nenhuma turma encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              turmasFiltradas.map((turma) => {
                const totalMatriculados = enrollments.filter(
                  (e) => Number(e.classId) === Number(turma.id)
                ).length;
                const capacidade = turma.capacidadeMaxima || 40;
                const estaLotada = totalMatriculados >= capacidade;

                return (
                  <tr key={turma.id}>
                    <td>{turma.id}</td>
                    <td><code>{turma.codigo}</code></td>
                    <td className="student-name">{turma.nomeDisciplina}</td>
                    <td>
                      <span style={{
                        backgroundColor: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {turma.semestre}
                      </span>
                    </td>
                    <td>
                      {turma.teacher ? (
                        <div>
                          <strong>{turma.teacher.nome}</strong>
                          {turma.teacher.fallback && (
                            <span style={{ display: 'block', fontSize: '11px', color: '#b45309' }}>
                              (Fallback Resiliente)
                            </span>
                          )}
                          <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                            {turma.teacher.especialidade}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Não alocado</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>
                        {turma.horario || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                        {turma.sala || '-'}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{
                          fontWeight: '700',
                          color: estaLotada ? '#dc2626' : '#166534',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {totalMatriculados} / {capacidade} alunos
                        </span>
                        <div style={{ fontSize: '11px', color: estaLotada ? '#dc2626' : '#64748b', marginTop: '2px' }}>
                          {estaLotada ? '⚠️ Turma Lotada' : `${capacidade - totalMatriculados} vagas restantes`}
                        </div>
                      </div>
                    </td>
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
                          onClick={() => openManageEnrollmentsModal(turma)}
                          title="Gerenciar e matricular alunos nesta turma diretamente"
                        >
                          👥 Alunos ({totalMatriculados})
                        </button>
                        <button className="btn-secondary" onClick={() => openEditModal(turma)}>
                          Editar
                        </button>
                        <button className="btn-danger" onClick={() => onDeleteClass(turma.id)}>
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

      {/* Modal 1: Criar / Editar Turma */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <h3>{isEditing ? 'Editar Turma' : 'Criar Nova Turma'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Código da Turma:</label>
                  <input
                    type="text"
                    required
                    value={classForm.codigo}
                    onChange={(e) => setClassForm({ ...classForm, codigo: e.target.value })}
                    placeholder="Ex: TURMA-301"
                  />
                </div>
                <div className="form-group">
                  <label>Nome da Disciplina:</label>
                  <input
                    type="text"
                    required
                    value={classForm.nomeDisciplina}
                    onChange={(e) => setClassForm({ ...classForm, nomeDisciplina: e.target.value })}
                    placeholder="Ex: Sistemas Distribuídos e Microsserviços"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Semestre Letivo:</label>
                  <select
                    value={classForm.semestre}
                    onChange={(e) => setClassForm({ ...classForm, semestre: e.target.value })}
                  >
                    <option value="2026.1">2026.1</option>
                    <option value="2026.2">2026.2</option>
                    <option value="2027.1">2027.1</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacidade Máxima (Vagas):</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    required
                    value={classForm.capacidadeMaxima}
                    onChange={(e) => setClassForm({ ...classForm, capacidadeMaxima: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Professor Responsável (teacher-service):</label>
                <select
                  value={classForm.teacherId}
                  onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                >
                  <option value="">-- Selecione o Professor Responsável --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} - {t.especialidade} ({t.matricula})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seção Estruturada de Horário */}
              <div style={{
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Definição de Horário (Dias e Faixa Horária):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Dias da Semana:</label>
                    <select
                      value={classForm.diasSemana}
                      onChange={(e) => setClassForm({ ...classForm, diasSemana: e.target.value })}
                    >
                      {DIAS_OPCOES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Faixa de Horário:</label>
                    <select
                      value={classForm.faixaHorario}
                      onChange={(e) => setClassForm({ ...classForm, faixaHorario: e.target.value })}
                    >
                      {HORARIOS_OPCOES.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção Estruturada de Local / Sala */}
              <div style={{
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Alocação de Espaço Físico (Bloco e Sala/Lab):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Bloco / Edifício:</label>
                    <select
                      value={classForm.bloco}
                      onChange={(e) => setClassForm({ ...classForm, bloco: e.target.value })}
                    >
                      {BLOCOS_OPCOES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Sala ou Laboratório:</label>
                    <select
                      value={classForm.salaNumero}
                      onChange={(e) => setClassForm({ ...classForm, salaNumero: e.target.value })}
                    >
                      {SALAS_OPCOES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Turma'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Gerenciamento Direto de Matrículas da Turma */}
      {showEnrollModal && selectedClassForEnroll && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>
                  Gerenciar Matrículas da Turma
                </h3>
                <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>
                  {selectedClassForEnroll.codigo} - {selectedClassForEnroll.nomeDisciplina}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Semestre {selectedClassForEnroll.semestre} | {selectedClassForEnroll.horario} | {selectedClassForEnroll.sala}
                </div>
              </div>
              <span style={{
                backgroundColor: alunosMatriculadosNaTurma.length >= (selectedClassForEnroll.capacidadeMaxima || 40) ? '#fee2e2' : '#dcfce7',
                color: alunosMatriculadosNaTurma.length >= (selectedClassForEnroll.capacidadeMaxima || 40) ? '#991b1b' : '#166534',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700'
              }}>
                {alunosMatriculadosNaTurma.length} / {selectedClassForEnroll.capacidadeMaxima || 40} Vagas
              </span>
            </div>

            {/* Formulário Rápido para Matricular Novo Aluno nesta Turma */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>
                ➕ Matricular Aluno nesta Turma:
              </h4>

              {alunosDisponiveisParaTurma.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                  {students.length === 0
                    ? 'Nenhum aluno cadastrado no sistema. Cadastre alunos na aba "Alunos" primeiro.'
                    : 'Todos os alunos cadastrados no sistema já estão matriculados nesta turma.'}
                </div>
              ) : (
                <form onSubmit={handleEnrollStudentInClass} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Selecione o Aluno:
                    </label>
                    <select
                      required
                      value={studentToEnrollId}
                      onChange={(e) => setStudentToEnrollId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Escolha um Aluno --</option>
                      {alunosDisponiveisParaTurma.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} ({s.matricula})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                    disabled={enrollingLoading || !studentToEnrollId || alunosMatriculadosNaTurma.length >= (selectedClassForEnroll.capacidadeMaxima || 40)}
                  >
                    {enrollingLoading ? 'Matriculando...' : '+ Confirmar Matrícula'}
                  </button>
                </form>
              )}
            </div>

            {/* Listagem dos Alunos Atualmente Matriculados */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>
              Alunos Atualmente Matriculados ({alunosMatriculadosNaTurma.length}):
            </h4>

            {alunosMatriculadosNaTurma.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: '#f8fafc',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '13px'
              }}>
                Nenhum aluno matriculado nesta turma ainda. Selecione um aluno acima para matriculá-lo.
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="attendance-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Nome do Aluno</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosMatriculadosNaTurma.map((item) => {
                      const studentObj = item.aluno || students.find((s) => Number(s.id) === Number(item.alunoId));
                      const nomeAluno = studentObj ? studentObj.nome : `Aluno #${item.alunoId}`;
                      const matriculaAluno = studentObj ? studentObj.matricula : `ID:${item.alunoId}`;

                      return (
                        <tr key={item.id}>
                          <td><code>{matriculaAluno}</code></td>
                          <td className="student-name">{nomeAluno}</td>
                          <td>
                            <span className="badge badge-presenca" style={{ fontSize: '11px' }}>
                              {item.status || 'ATIVA'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-danger"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                              onClick={() => handleRemoveEnrollment(item.id)}
                              disabled={enrollingLoading}
                            >
                              Remover
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
