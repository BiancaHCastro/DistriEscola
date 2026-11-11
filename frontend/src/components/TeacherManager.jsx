import React, { useState } from 'react';

export default function TeacherManager({
  teachers,
  onSaveTeacher,
  onDeleteTeacher,
  loading
}) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    id: null,
    matricula: '',
    nome: '',
    email: '',
    especialidade: '',
    departamento: '',
    telefone: ''
  });

  const openNewModal = () => {
    setTeacherForm({
      id: null,
      matricula: '',
      nome: '',
      email: '',
      especialidade: '',
      departamento: '',
      telefone: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setTeacherForm({ ...teacher });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSaveTeacher(teacherForm, isEditing);
    if (success) {
      setShowModal(false);
    }
  };

  return (
    <div className="card teachers-card">
      <div className="card-header">
        <div>
          <h2>Corpo Docente (teacher-service)</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Gestão Administrativa de Professores e Especialidades (PostgreSQL + Flyway)
          </span>
        </div>
        <button className="btn-primary" onClick={openNewModal}>
          + Cadastrar Professor
        </button>
      </div>

      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Matrícula</th>
              <th>Nome do Docente</th>
              <th>E-mail Institucional</th>
              <th>Especialidade</th>
              <th>Departamento</th>
              <th>Contato</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Nenhum professor cadastrado. Clique no botão acima para cadastrar.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.id}</td>
                  <td><code>{teacher.matricula}</code></td>
                  <td className="student-name">{teacher.nome}</td>
                  <td>{teacher.email}</td>
                  <td>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {teacher.especialidade}
                    </span>
                  </td>
                  <td>{teacher.departamento || '-'}</td>
                  <td>{teacher.telefone || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-secondary" onClick={() => openEditModal(teacher)}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => onDeleteTeacher(teacher.id)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditing ? 'Editar Professor' : 'Cadastrar Novo Professor'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Matrícula do Docente:</label>
                <input
                  type="text"
                  required
                  value={teacherForm.matricula}
                  onChange={(e) => setTeacherForm({ ...teacherForm, matricula: e.target.value })}
                  placeholder="Ex: PROF-104"
                />
              </div>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={teacherForm.nome}
                  onChange={(e) => setTeacherForm({ ...teacherForm, nome: e.target.value })}
                  placeholder="Ex: Dra. Camila Rocha"
                />
              </div>
              <div className="form-group">
                <label>E-mail Institucional:</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  placeholder="Ex: camila.rocha@distrischool.edu.br"
                />
              </div>
              <div className="form-group">
                <label>Especialidade / Disciplinas:</label>
                <input
                  type="text"
                  required
                  value={teacherForm.especialidade}
                  onChange={(e) => setTeacherForm({ ...teacherForm, especialidade: e.target.value })}
                  placeholder="Ex: Algoritmos e Computação Quântica"
                />
              </div>
              <div className="form-group">
                <label>Departamento:</label>
                <input
                  type="text"
                  value={teacherForm.departamento || ''}
                  onChange={(e) => setTeacherForm({ ...teacherForm, departamento: e.target.value })}
                  placeholder="Ex: Centro de Ciências Tecnológicas"
                />
              </div>
              <div className="form-group">
                <label>Telefone / Ramal:</label>
                <input
                  type="text"
                  value={teacherForm.telefone || ''}
                  onChange={(e) => setTeacherForm({ ...teacherForm, telefone: e.target.value })}
                  placeholder="Ex: (85) 98888-4040"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Docente'}
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
