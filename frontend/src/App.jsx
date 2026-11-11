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
  const [isFallback, setIsFallback] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Monitora alterações no status de conexão (Fallback / Gateway)
  useEffect(() => {
    const unsubscribe = apiService.subscribe((status) => {
      setIsFallback(status.isFallback);
    });
    return unsubscribe;
  }, []);

  // Busca alunos (aluno-service)
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, isFallback: fallbackActive } = await apiService.getStudents();
      setStudents(data);
      setIsFallback(fallbackActive);

      const initial = {};
      data.forEach((s) => {
        initial[s.id] = 'PRESENCA';
      });
      setAttendanceStatus((prev) => ({ ...initial, ...prev }));
    } catch (err) {
      console.warn('Falha ao carregar alunos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca professores (teacher-service)
  const fetchTeachers = useCallback(async () => {
    try {
      const { data, isFallback: fallbackActive } = await apiService.getTeachers();
      setTeachers(data);
      setIsFallback(fallbackActive);
    } catch (err) {
      console.warn('Falha ao carregar professores:', err);
    }
  }, []);

  // Busca turmas/disciplinas (class-service)
  const fetchClasses = useCallback(async () => {
    try {
      const { data, isFallback: fallbackActive } = await apiService.getClasses();
      setClasses(data);
      setIsFallback(fallbackActive);
      if (data.length > 0 && !turmaId) {
        setTurmaId(data[0].codigo);
      }
    } catch (err) {
      console.warn('Falha ao carregar turmas:', err);
    }
  }, [turmaId]);

  // Busca matrículas N:N (enrollment-service)
  const fetchEnrollments = useCallback(async () => {
    try {
      const { data, isFallback: fallbackActive } = await apiService.getEnrollments();
      setEnrollments(data);
      setIsFallback(fallbackActive);
    } catch (err) {
      console.warn('Falha ao carregar matrículas:', err);
    }
  }, []);

  // Busca notas (grade-service)
  const fetchGrades = useCallback(async () => {
    try {
      const { data, isFallback: fallbackActive } = await apiService.getGrades(turmaId);
      setGrades(data);
      setIsFallback(fallbackActive);
    } catch (err) {
      console.warn('Falha ao carregar notas:', err);
    }
  }, [turmaId]);

  // Busca relatório de frequência (attendance-service)
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data, isFallback: fallbackActive } = await apiService.getReport(turmaId);
      setReport(data);
      setIsFallback(fallbackActive);
    } catch (err) {
      console.warn('Falha ao obter relatório:', err);
    } finally {
      setLoading(false);
    }
  }, [turmaId]);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchClasses();
    fetchEnrollments();
    fetchGrades();
  }, [fetchStudents, fetchTeachers, fetchClasses, fetchEnrollments, fetchGrades]);

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
          text: result.isFallback
            ? 'Chamada registrada no Fallback local! (Evento RabbitMQ simulado com sucesso)'
            : 'Chamada registrada no API Gateway e evento emitido no RabbitMQ (attendance.recorded) com sucesso!'
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
      const result = await apiService.saveStudent(studentForm, isEditing);
      const actionText = isEditing ? 'Aluno atualizado com sucesso' : 'Aluno cadastrado com sucesso';
      setMessage({
        type: 'success',
        text: result.isFallback ? `${actionText} (Fallback Local)!` : `${actionText}!`
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
      setMessage({ type: 'success', text: 'Aluno excluído com sucesso!' });
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
      const result = await apiService.saveTeacher(teacherForm, isEditing);
      const actionText = isEditing ? 'Professor atualizado com sucesso' : 'Professor cadastrado com sucesso';
      setMessage({
        type: 'success',
        text: result.isFallback ? `${actionText} (Fallback Local)!` : `${actionText}!`
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
      setMessage({ type: 'success', text: 'Professor excluído com sucesso!' });
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
      const result = await apiService.saveClass(classForm, isEditing);
      const actionText = isEditing ? 'Turma atualizada com sucesso' : 'Turma criada com sucesso';
      setMessage({
        type: 'success',
        text: result.isFallback ? `${actionText} (Fallback Local)!` : `${actionText}!`
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
      setMessage({ type: 'success', text: 'Turma excluída com sucesso!' });
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
      const result = await apiService.enrollStudent(alunoId, classId);
      setMessage({
        type: 'success',
        text: result.isFallback
          ? 'Matrícula efetuada com sucesso (Fallback Local / Validação N:N ativa)!'
          : 'Matrícula efetuada com sucesso via API Gateway!'
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
      setMessage({ type: 'success', text: 'Matrícula cancelada com sucesso!' });
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
      const result = await apiService.saveGrade(gradeForm);
      setMessage({
        type: 'success',
        text: result.isFallback
          ? 'Nota salva no Fallback local! (Evento RabbitMQ simulado)'
          : 'Nota salva no API Gateway e evento emitido no RabbitMQ (grade.posted) com sucesso!'
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
              isFallback={isFallback}
              onRetry={() => {
                fetchStudents();
                fetchTeachers();
                fetchClasses();
                fetchEnrollments();
                fetchGrades();
                if (activeTab === 'relatorio') fetchReport();
              }}
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
