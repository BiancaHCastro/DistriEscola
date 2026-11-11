import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { apiService } from './services/api';
import ConnectionBadge from './components/ConnectionBadge';
import AttendanceForm from './components/AttendanceForm';
import StudentManager from './components/StudentManager';
import TeacherManager from './components/TeacherManager';
import ClassManager from './components/ClassManager';
import EnrollmentManager from './components/EnrollmentManager';
import GradeManager from './components/GradeManager';
import AttendanceReport from './components/AttendanceReport';
import AuthManager from './components/AuthManager';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => apiService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('chamada');
  const [turmaId, setTurmaId] = useState('TURMA-101');
  const [dataChamada, setDataChamada] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [gatewayUrl, setGatewayUrl] = useState(() => apiService.getGatewayUrl());
  const [message, setMessage] = useState({ type: '', text: '' });

  // Monitora alterações no status de conexão com o Gateway
  useEffect(() => {
    const unsubscribe = apiService.subscribe((status) => {
      setIsConnected(status.isConnected);
      if (!status.isConnected) {
        setConnectionError(status.error || 'Não foi possível conectar ao API Gateway (:8080)');
      } else {
        setConnectionError(null);
      }
    });
    return unsubscribe;
  }, []);

  // Busca alunos (aluno-service)
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiService.getStudents();
      setStudents(data);
      setIsConnected(true);
      setConnectionError(null);

      const initial = {};
      data.forEach((s) => {
        initial[s.id] = 'PRESENCA';
      });
      setAttendanceStatus((prev) => ({ ...initial, ...prev }));
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca professores (teacher-service)
  const fetchTeachers = useCallback(async () => {
    try {
      const { data } = await apiService.getTeachers();
      setTeachers(data);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
    }
  }, []);

  // Busca turmas/disciplinas (class-service)
  const fetchClasses = useCallback(async () => {
    try {
      const { data } = await apiService.getClasses();
      setClasses(data);
      setIsConnected(true);
      if (data.length > 0 && !turmaId) {
        setTurmaId(data[0].codigo);
      }
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
    }
  }, [turmaId]);

  // Busca matrículas N:N (enrollment-service)
  const fetchEnrollments = useCallback(async () => {
    try {
      const { data } = await apiService.getEnrollments();
      setEnrollments(data);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
    }
  }, []);

  // Busca notas (grade-service)
  const fetchGrades = useCallback(async () => {
    try {
      const { data } = await apiService.getGrades(turmaId);
      setGrades(data);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
    }
  }, [turmaId]);

  // Busca relatório de frequência (attendance-service)
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiService.getReport(turmaId);
      setReport(data);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
    } finally {
      setLoading(false);
    }
  }, [turmaId]);

  // Carrega todos os dados e testa conectividade
  const refreshAll = useCallback(async () => {
    setIsChecking(true);
    try {
      await Promise.allSettled([
        fetchStudents(),
        fetchTeachers(),
        fetchClasses(),
        fetchEnrollments(),
        fetchGrades()
      ]);
    } finally {
      setIsChecking(false);
    }
  }, [fetchStudents, fetchTeachers, fetchClasses, fetchEnrollments, fetchGrades]);

  // Carga inicial
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Sincroniza dados na troca de abas
  useEffect(() => {
    if (activeTab === 'relatorio') {
      fetchReport();
    } else if (activeTab === 'alunos') {
      fetchStudents();
      fetchClasses();
      fetchEnrollments();
    } else if (activeTab === 'professores') {
      fetchTeachers();
    } else if (activeTab === 'turmas') {
      fetchClasses();
      fetchTeachers();
      fetchStudents();
      fetchEnrollments();
    } else if (activeTab === 'matriculas') {
      fetchEnrollments();
      fetchStudents();
      fetchClasses();
    } else if (activeTab === 'notas') {
      fetchGrades();
      fetchStudents();
      fetchClasses();
      fetchEnrollments();
    }
  }, [activeTab, fetchReport, fetchTeachers, fetchClasses, fetchEnrollments, fetchStudents, fetchGrades]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceStatus(updated);
  };

  const handleSubmitChamada = async (e) => {
    e.preventDefault();
    if (students.length === 0) {
      setMessage({ type: 'error', text: 'Nenhum aluno cadastrado para realizar a chamada.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await apiService.submitAttendance(students, attendanceStatus, turmaId, dataChamada);
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Chamada registrada no attendance-service e evento publicado no RabbitMQ (attendance.recorded) com sucesso!'
        });
        fetchReport();
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Erro ao enviar chamada: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (studentForm, isEditing) => {
    setLoading(true);
    try {
      await apiService.saveStudent(studentForm, isEditing);
      const actionText = isEditing ? 'Aluno atualizado com sucesso' : 'Aluno cadastrado com sucesso';
      setMessage({
        type: 'success',
        text: `${actionText} no banco de dados!`
      });
      await fetchStudents();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: `Erro no CRUD de Alunos: ${err.message}` });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Deseja realmente excluir este aluno?')) return;
    setLoading(true);
    try {
      await apiService.deleteStudent(id);
      setMessage({ type: 'success', text: 'Aluno excluído com sucesso do banco de dados!' });
      await fetchStudents();
      await fetchEnrollments();
    } catch (err) {
      setMessage({ type: 'error', text: `Erro ao excluir aluno: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeacher = async (teacherForm, isEditing) => {
    setLoading(true);
    try {
      await apiService.saveTeacher(teacherForm, isEditing);
      const actionText = isEditing ? 'Professor atualizado com sucesso' : 'Professor cadastrado com sucesso';
      setMessage({
        type: 'success',
        text: `${actionText} no banco de dados!`
      });
      await fetchTeachers();
      await fetchClasses();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: `Erro no CRUD de Professores: ${err.message}` });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Deseja realmente excluir este professor?')) return;
    setLoading(true);
    try {
      await apiService.deleteTeacher(id);
      setMessage({ type: 'success', text: 'Professor excluído com sucesso do banco de dados!' });
      await fetchTeachers();
      await fetchClasses();
    } catch (err) {
      setMessage({ type: 'error', text: `Erro ao excluir professor: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async (classForm, isEditing) => {
    setLoading(true);
    try {
      await apiService.saveClass(classForm, isEditing);
      const actionText = isEditing ? 'Turma atualizada com sucesso' : 'Turma criada com sucesso';
      setMessage({
        type: 'success',
        text: `${actionText} no banco de dados!`
      });
      await fetchClasses();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: `Erro no cadastro da turma: ${err.message}` });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta turma?')) return;
    setLoading(true);
    try {
      await apiService.deleteClass(id);
      setMessage({ type: 'success', text: 'Turma excluída com sucesso do banco de dados!' });
      await fetchClasses();
      await fetchEnrollments();
    } catch (err) {
      setMessage({ type: 'error', text: `Erro ao excluir turma: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (alunoId, classId) => {
    setLoading(true);
    try {
      await apiService.enrollStudent(alunoId, classId);
      setMessage({
        type: 'success',
        text: 'Matrícula efetuada com sucesso no enrollment-service!'
      });
      await fetchEnrollments();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: `Falha na matrícula: ${err.message}` });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async (id) => {
    if (!window.confirm('Deseja cancelar esta matrícula?')) return;
    setLoading(true);
    try {
      await apiService.cancelEnrollment(id);
      setMessage({ type: 'success', text: 'Matrícula cancelada com sucesso no banco de dados!' });
      await fetchEnrollments();
    } catch (err) {
      setMessage({ type: 'error', text: `Erro ao cancelar matrícula: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (gradeForm) => {
    setLoading(true);
    try {
      await apiService.saveGrade(gradeForm);
      setMessage({
        type: 'success',
        text: 'Nota salva no grade-service e evento publicado no RabbitMQ (grade.posted) com sucesso!'
      });
      await fetchGrades();
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: `Erro ao lançar notas: ${err.message}` });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="distrischool-container">
      <header className="app-header">
        <div className="header-brand">
          <h1>DistriSchool</h1>
          <span>Plataforma de Gestão Escolar Distribuída</span>
          <div style={{ marginTop: '8px' }}>
            <ConnectionBadge
              isConnected={isConnected}
              isChecking={isChecking}
              onRetry={refreshAll}
            />
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={activeTab === 'chamada' ? 'active' : ''}
            onClick={() => { setActiveTab('chamada'); setMessage({ type: '', text: '' }); }}
          >
            Chamada Diária
          </button>
          <button
            className={activeTab === 'alunos' ? 'active' : ''}
            onClick={() => { setActiveTab('alunos'); setMessage({ type: '', text: '' }); }}
          >
            Alunos (aluno-service)
          </button>
          <button
            className={activeTab === 'professores' ? 'active' : ''}
            onClick={() => { setActiveTab('professores'); setMessage({ type: '', text: '' }); }}
          >
            Docentes (teacher-service)
          </button>
          <button
            className={activeTab === 'turmas' ? 'active' : ''}
            onClick={() => { setActiveTab('turmas'); setMessage({ type: '', text: '' }); }}
          >
            Turmas (class-service)
          </button>
          <button
            className={activeTab === 'matriculas' ? 'active' : ''}
            onClick={() => { setActiveTab('matriculas'); setMessage({ type: '', text: '' }); }}
          >
            Matrículas N:N (enrollment-service)
          </button>
          <button
            className={activeTab === 'notas' ? 'active' : ''}
            onClick={() => { setActiveTab('notas'); setMessage({ type: '', text: '' }); }}
          >
            Notas (grade-service)
          </button>
          <button
            className={activeTab === 'relatorio' ? 'active' : ''}
            onClick={() => { setActiveTab('relatorio'); setMessage({ type: '', text: '' }); }}
          >
            Relatório de Frequência
          </button>
          <button
            className={activeTab === 'auth' ? 'active' : ''}
            onClick={() => { setActiveTab('auth'); setMessage({ type: '', text: '' }); }}
          >
            Autenticação (login-service)
          </button>
        </nav>
      </header>

      {/* Banner explicativo quando o Docker estiver offline */}
      {!isConnected && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '8px',
          padding: '14px 18px',
          margin: '16px auto',
          maxWidth: '1200px',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div>
            <strong>⚠️ Servidores Docker Desconectados ou Iniciando:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7f1d1d' }}>
              O frontend está em <strong>modo estrito</strong> comunicando diretamente com o backend real.
              Para interagir com o sistema, certifique-se de que os contêineres estão em execução executando no terminal:
              <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>
                ./build-sequential.sh
              </code> ou <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                docker compose up -d
              </code>.
            </p>
            {connectionError && (
              <small style={{ display: 'block', marginTop: '4px', color: '#b91c1c', fontStyle: 'italic' }}>
                Detalhe técnico: {connectionError}
              </small>
            )}
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: '500' }}>URL do Gateway:</span>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                onBlur={() => {
                  apiService.setGatewayUrl(gatewayUrl);
                  refreshAll();
                }}
                placeholder="http://localhost:8080/api"
                style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #fca5a5',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  width: '260px'
                }}
              />
              <span style={{ fontSize: '11px', color: '#991b1b' }}>
                (Padrão: <code>http://localhost:8080/api</code>)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            disabled={isChecking}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isChecking ? 'wait' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {isChecking ? 'Verificando...' : '🔄 Testar Conexão'}
          </button>
        </div>
      )}

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <main className="app-main">
        {activeTab === 'chamada' && (
          <AttendanceForm
            students={students}
            classes={classes}
            enrollments={enrollments}
            turmaId={turmaId}
            setTurmaId={setTurmaId}
            dataChamada={dataChamada}
            setDataChamada={setDataChamada}
            attendanceStatus={attendanceStatus}
            onStatusChange={handleStatusChange}
            onMarkAll={handleMarkAll}
            onSubmit={handleSubmitChamada}
            loading={loading}
          />
        )}

        {activeTab === 'alunos' && (
          <StudentManager
            students={students}
            classes={classes}
            enrollments={enrollments}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onEnroll={handleEnrollStudent}
            onCancelEnrollment={handleCancelEnrollment}
            loading={loading}
          />
        )}

        {activeTab === 'professores' && (
          <TeacherManager
            teachers={teachers}
            onSaveTeacher={handleSaveTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            loading={loading}
          />
        )}

        {activeTab === 'turmas' && (
          <ClassManager
            classes={classes}
            teachers={teachers}
            students={students}
            enrollments={enrollments}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
            onEnroll={handleEnrollStudent}
            onCancelEnrollment={handleCancelEnrollment}
            loading={loading}
          />
        )}

        {activeTab === 'matriculas' && (
          <EnrollmentManager
            enrollments={enrollments}
            students={students}
            classes={classes}
            onEnroll={handleEnrollStudent}
            onCancelEnrollment={handleCancelEnrollment}
            loading={loading}
          />
        )}

        {activeTab === 'notas' && (
          <GradeManager
            classes={classes}
            students={students}
            enrollments={enrollments}
            grades={grades}
            onSaveGrade={handleSaveGrade}
            loading={loading}
          />
        )}

        {activeTab === 'relatorio' && (
          <AttendanceReport
            report={report}
            turmaId={turmaId}
            setTurmaId={setTurmaId}
            classes={classes}
            onRefresh={fetchReport}
            loading={loading}
          />
        )}

        {activeTab === 'auth' && (
          <AuthManager
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setMessage({ type: 'success', text: `Autenticado com sucesso como ${user.username} (${user.role})!` });
            }}
            onLogout={() => {
              apiService.logout();
              setCurrentUser(null);
              setMessage({ type: 'info', text: 'Sessão encerrada com sucesso.' });
            }}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}
