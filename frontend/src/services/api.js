// Serviço de comunicação HTTP com o API Gateway (http://localhost:8080/api)
// Implementa Resiliência e Fallback/Mock para operar sem interrupções mesmo quando
// o backend estiver offline ou em ambiente de visualização em nuvem.

const API_BASE = 'http://localhost:8080/api';
const TIMEOUT_MS = 1500;

const STORAGE_KEYS = {
  STUDENTS: 'distrischool_students',
  TEACHERS: 'distrischool_teachers',
  CLASSES: 'distrischool_classes',
  ENROLLMENTS: 'distrischool_enrollments',
  GRADES: 'distrischool_grades',
  ATTENDANCES: 'distrischool_attendances',
  IS_FALLBACK: 'distrischool_is_fallback'
};

const DEFAULT_GRADES = [
  {
    id: 1,
    alunoId: 1,
    turmaId: 'TURMA-101',
    nota1: 8.5,
    nota2: 9.0,
    notaFinal: null,
    mediaCalculada: 8.75,
    situacao: 'APROVADO'
  },
  {
    id: 2,
    alunoId: 2,
    turmaId: 'TURMA-101',
    nota1: 6.0,
    nota2: 5.0,
    notaFinal: null,
    mediaCalculada: 5.5,
    situacao: 'RECUPERACAO'
  },
  {
    id: 3,
    alunoId: 1,
    turmaId: 'TURMA-102',
    nota1: 9.5,
    nota2: 10.0,
    notaFinal: null,
    mediaCalculada: 9.75,
    situacao: 'APROVADO'
  }
];

const DEFAULT_CLASSES = [
  {
    id: 1,
    codigo: 'TURMA-101',
    nomeDisciplina: 'Sistemas Distribuídos',
    semestre: '2026.1',
    horario: 'Seg/Qua 08:00 - 10:00',
    sala: 'Laboratório 04',
    capacidadeMaxima: 35,
    teacherId: 2,
    teacher: { id: 2, nome: 'Dra. Juliana Freitas', especialidade: 'Sistemas Distribuídos & Nuvem' }
  },
  {
    id: 2,
    codigo: 'TURMA-102',
    nomeDisciplina: 'Cálculo e Álgebra Linear',
    semestre: '2026.1',
    horario: 'Ter/Qui 10:00 - 12:00',
    sala: 'Bloco A - Sala 202',
    capacidadeMaxima: 40,
    teacherId: 1,
    teacher: { id: 1, nome: 'Dr. Marcelo Vasconcelos', especialidade: 'Matemática & Estatística' }
  },
  {
    id: 3,
    codigo: 'TURMA-201',
    nomeDisciplina: 'Redes de Alta Velocidade',
    semestre: '2026.1',
    horario: 'Sex 08:00 - 12:00',
    sala: 'Laboratório Cisco',
    capacidadeMaxima: 30,
    teacherId: 3,
    teacher: { id: 3, nome: 'Me. Rodrigo Albuquerque', especialidade: 'Redes de Computadores & Segurança' }
  }
];

const DEFAULT_ENROLLMENTS = [
  {
    id: 1,
    alunoId: 1,
    classId: 1,
    status: 'ATIVA',
    dataMatricula: '2026-02-15T09:00:00',
    aluno: { id: 1, matricula: '2026101', nome: 'Ana Beatriz Souza' },
    turma: { id: 1, codigo: 'TURMA-101', nomeDisciplina: 'Sistemas Distribuídos' }
  },
  {
    id: 2,
    alunoId: 1,
    classId: 2,
    status: 'ATIVA',
    dataMatricula: '2026-02-15T09:10:00',
    aluno: { id: 1, matricula: '2026101', nome: 'Ana Beatriz Souza' },
    turma: { id: 2, codigo: 'TURMA-102', nomeDisciplina: 'Cálculo e Álgebra Linear' }
  },
  {
    id: 3,
    alunoId: 2,
    classId: 1,
    status: 'ATIVA',
    dataMatricula: '2026-02-15T10:00:00',
    aluno: { id: 2, matricula: '2026102', nome: 'Carlos Eduardo Lima' },
    turma: { id: 1, codigo: 'TURMA-101', nomeDisciplina: 'Sistemas Distribuídos' }
  },
  {
    id: 4,
    alunoId: 3,
    classId: 3,
    status: 'ATIVA',
    dataMatricula: '2026-02-16T11:00:00',
    aluno: { id: 3, matricula: '2026103', nome: 'Mariana Silva Santos' },
    turma: { id: 3, codigo: 'TURMA-201', nomeDisciplina: 'Redes de Alta Velocidade' }
  }
];

const DEFAULT_TEACHERS = [
  {
    id: 1,
    matricula: 'PROF-101',
    nome: 'Dr. Marcelo Vasconcelos',
    email: 'marcelo.vasconcelos@distrischool.edu.br',
    especialidade: 'Matemática & Estatística',
    departamento: 'Ciências Exatas',
    telefone: '(85) 98888-1010'
  },
  {
    id: 2,
    matricula: 'PROF-102',
    nome: 'Dra. Juliana Freitas',
    email: 'juliana.freitas@distrischool.edu.br',
    especialidade: 'Sistemas Distribuídos & Nuvem',
    departamento: 'Engenharia de Software',
    telefone: '(85) 98888-2020'
  },
  {
    id: 3,
    matricula: 'PROF-103',
    nome: 'Me. Rodrigo Albuquerque',
    email: 'rodrigo.albuquerque@distrischool.edu.br',
    especialidade: 'Redes de Computadores & Segurança',
    departamento: 'Tecnologia da Informação',
    telefone: '(85) 98888-3030'
  }
];

// Dados sementes iniciais para Fallback
const DEFAULT_STUDENTS = [
  {
    id: 1,
    matricula: '2026101',
    nome: 'Ana Beatriz Souza',
    dataNascimento: '15/03/2007',
    endereco: 'Av. Beira Mar, 1000 - Meireles',
    contato: '(85) 99876-1234'
  },
  {
    id: 2,
    matricula: '2026102',
    nome: 'Carlos Eduardo Lima',
    dataNascimento: '22/07/2006',
    endereco: 'Rua Desembargador Moreira, 450 - Aldeota',
    contato: '(85) 98765-4321'
  },
  {
    id: 3,
    matricula: '2026103',
    nome: 'Mariana Silva Santos',
    dataNascimento: '10/11/2007',
    endereco: 'Rua Washington Soares, 1321 - Edson Queiroz',
    contato: '(85) 99123-4567'
  },
  {
    id: 4,
    matricula: '2026104',
    nome: 'Lucas Oliveira Costa',
    dataNascimento: '05/01/2006',
    endereco: 'Av. Santos Dumont, 2800 - Papicu',
    contato: '(85) 99654-7890'
  }
];

// Helper para requisições com timeout rápido
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Inicializador de LocalStorage
function getLocalStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Erro ao ler localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  return DEFAULT_STUDENTS;
}

function saveLocalStudents(students) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.warn('Erro ao salvar em localStorage:', e);
  }
}

function getLocalAttendances() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Erro ao ler attendances:', e);
  }
  const initial = [
    { id: 1, alunoId: 1, turmaId: 'TURMA-101', data: new Date().toISOString().split('T')[0], status: 'PRESENCA' },
    { id: 2, alunoId: 2, turmaId: 'TURMA-101', data: new Date().toISOString().split('T')[0], status: 'PRESENCA' },
    { id: 3, alunoId: 3, turmaId: 'TURMA-101', data: new Date().toISOString().split('T')[0], status: 'FALTA' },
    { id: 4, alunoId: 4, turmaId: 'TURMA-101', data: new Date().toISOString().split('T')[0], status: 'ATRASO' }
  ];
  localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(initial));
  return initial;
}

function saveLocalAttendances(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(records));
  } catch (e) {
    console.warn('Erro ao salvar attendances:', e);
  }
}

export const apiService = {
  isFallbackMode: false,
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify(status) {
    this.isFallbackMode = status.isFallback;
    this.listeners.forEach(l => l(status));
  },

  // Autenticação via login-service (porta 8080/api/auth/login)
  async login(credentials) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Autenticado via login-service' });
      localStorage.setItem('distrischool_current_user', JSON.stringify(data));
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Falha no login-service via Gateway:', err?.message);
      this.notify({ isFallback: true, message: 'Autenticação em Fallback Local' });
      if ((credentials.username === 'admin' || credentials.username === 'professor') && credentials.password === '123456') {
        const fallbackUser = {
          status: 'success',
          username: credentials.username,
          role: credentials.username === 'admin' ? 'ADMIN' : 'TEACHER',
          message: 'Autenticação via Fallback resiliente bem-sucedida!'
        };
        localStorage.setItem('distrischool_current_user', JSON.stringify(fallbackUser));
        return { data: fallbackUser, isFallback: true };
      }
      throw new Error('Credenciais inválidas. Utilize admin/123456 ou professor/123456.');
    }
  },

  getCurrentUser() {
    try {
      const saved = localStorage.getItem('distrischool_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao ler usuário salvo:', e);
    }
    return { username: 'admin', role: 'ADMIN', status: 'success' };
  },

  logout() {
    localStorage.removeItem('distrischool_current_user');
  },

  // Busca lista de alunos via aluno-service (porta 8080/api/students)
  async getStudents() {

    try {
      const res = await fetchWithTimeout(`${API_BASE}/students`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Conectado ao API Gateway' });
      saveLocalStudents(data);
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Conexão com API Gateway indisponível:', err?.message);
      this.notify({ isFallback: true, message: 'Modo Fallback / Resiliência Local Ativo' });
      const localData = getLocalStudents();
      return { data: localData, isFallback: true };
    }
  },

  // Salva ou atualiza aluno (aluno-service)
  async saveStudent(studentData, isEditing = false) {
    let formattedDate = studentData.dataNascimento;
    if (formattedDate && formattedDate.includes('-')) {
      const [year, month, day] = formattedDate.split('-');
      formattedDate = `${day}/${month}/${year}`;
    }

    const payload = {
      ...studentData,
      dataNascimento: formattedDate || null
    };

    try {
      const url = isEditing ? `${API_BASE}/students/${studentData.id}` : `${API_BASE}/students`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Conectado ao API Gateway' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Salvando aluno em Fallback local:', err?.message);
      this.notify({ isFallback: true, message: 'Operação realizada no Fallback Local' });
      const students = getLocalStudents();
      let updated;
      if (isEditing) {
        updated = students.map(s => s.id === studentData.id ? { ...s, ...payload } : s);
      } else {
        const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
        updated = [...students, { ...payload, id: newId }];
      }
      saveLocalStudents(updated);
      return { data: payload, isFallback: true };
    }
  },

  // Exclui aluno
  async deleteStudent(studentId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/students/${studentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isFallback: false, message: 'Conectado ao API Gateway' });
      return { success: true, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Excluindo aluno via Fallback local:', err?.message);
      this.notify({ isFallback: true, message: 'Exclusão no Fallback Local' });
      const students = getLocalStudents().filter(s => s.id !== studentId);
      saveLocalStudents(students);
      return { success: true, isFallback: true };
    }
  },

  // Registra presenças em lote no attendance-service
  async submitAttendance(studentList, attendanceMap, turmaId, dataChamada) {
    const payloads = studentList.map(s => ({
      alunoId: s.id,
      turmaId,
      data: dataChamada,
      status: attendanceMap[s.id] || 'PRESENCA'
    }));

    try {
      const promises = payloads.map(p =>
        fetchWithTimeout(`${API_BASE}/academic/presencas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
      );
      const responses = await Promise.all(promises);
      const hasError = responses.some(r => !r.ok);
      if (hasError) throw new Error('Falha em alguns registros no servidor');
      this.notify({ isFallback: false, message: 'Chamada registrada no API Gateway' });
      return { success: true, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Registrando chamada no Fallback local:', err?.message);
      this.notify({ isFallback: true, message: 'Chamada registrada no Fallback Local' });
      const current = getLocalAttendances();
      const nextId = current.length > 0 ? Math.max(...current.map(c => c.id || 0)) + 1 : 1;
      const newItems = payloads.map((p, idx) => ({ ...p, id: nextId + idx }));
      saveLocalAttendances([...newItems, ...current]);
      return { success: true, isFallback: true };
    }
  },

  // Relatório de frequência por turma
  async getReport(turmaId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/academic/presencas/relatorio?turmaId=${encodeURIComponent(turmaId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Relatório obtido do attendance-service' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Gerando relatório com Fallback local:', err?.message);
      this.notify({ isFallback: true, message: 'Relatório gerado via Fallback Local' });
      const attendances = getLocalAttendances().filter(a => a.turmaId === turmaId);
      const totalAulas = attendances.length;
      const presencas = attendances.filter(a => a.status === 'PRESENCA' || a.status === 'ATRASO').length;
      const faltas = attendances.filter(a => a.status === 'FALTA').length;
      const percentual = totalAulas > 0 ? (presencas / totalAulas) * 100 : 100.0;

      const fallbackReport = {
        totalAulas,
        presencas,
        faltas,
        percentualPresenca: percentual,
        historico: attendances
      };
      return { data: fallbackReport, isFallback: true };
    }
  },

  // Busca lista de professores via teacher-service (porta 8080/api/teachers)
  async getTeachers() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/teachers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Conectado ao teacher-service via Gateway' });
      saveLocalTeachers(data);
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] teacher-service indisponível:', err?.message);
      this.notify({ isFallback: true, message: 'teacher-service em Fallback local' });
      return { data: getLocalTeachers(), isFallback: true };
    }
  },

  // Salva ou atualiza professor (teacher-service)
  async saveTeacher(teacherData, isEditing = false) {
    try {
      const url = isEditing ? `${API_BASE}/teachers/${teacherData.id}` : `${API_BASE}/teachers`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Professor salvo no Gateway' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Salvando professor em Fallback:', err?.message);
      this.notify({ isFallback: true, message: 'Professor salvo no Fallback' });
      const teachers = getLocalTeachers();
      let updated;
      if (isEditing) {
        updated = teachers.map(t => t.id === teacherData.id ? { ...t, ...teacherData } : t);
      } else {
        const newId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
        updated = [...teachers, { ...teacherData, id: newId }];
      }
      saveLocalTeachers(updated);
      return { data: teacherData, isFallback: true };
    }
  },

  // Exclui professor
  async deleteTeacher(teacherId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/teachers/${teacherId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isFallback: false, message: 'Professor excluído via Gateway' });
      return { success: true, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Excluindo professor no Fallback:', err?.message);
      this.notify({ isFallback: true, message: 'Exclusão no Fallback Local' });
      const teachers = getLocalTeachers().filter(t => t.id !== teacherId);
      saveLocalTeachers(teachers);
      return { success: true, isFallback: true };
    }
  },

  // Busca turmas/disciplinas via class-service (porta 8080/api/classes)
  async getClasses() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/classes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Conectado ao class-service via Gateway' });
      saveLocalClasses(data);
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] class-service indisponível:', err?.message);
      this.notify({ isFallback: true, message: 'class-service em Fallback local' });
      return { data: getLocalClasses(), isFallback: true };
    }
  },

  // Salva ou edita turma/disciplina (class-service)
  async saveClass(classData, isEditing = false) {
    try {
      const url = isEditing ? `${API_BASE}/classes/${classData.id}` : `${API_BASE}/classes`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Turma salva com sucesso' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Salvando turma em Fallback:', err?.message);
      this.notify({ isFallback: true, message: 'Turma salva no Fallback local' });
      const classes = getLocalClasses();
      const teachers = getLocalTeachers();
      const assignedTeacher = teachers.find(t => t.id === Number(classData.teacherId)) || null;
      const enriched = { ...classData, teacher: assignedTeacher };
      let updated;
      if (isEditing) {
        updated = classes.map(c => c.id === classData.id ? { ...c, ...enriched } : c);
      } else {
        const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
        updated = [...classes, { ...enriched, id: newId }];
      }
      saveLocalClasses(updated);
      return { data: enriched, isFallback: true };
    }
  },

  // Exclui turma/disciplina
  async deleteClass(classId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/classes/${classId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isFallback: false, message: 'Turma excluída com sucesso' });
      return { success: true, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Excluindo turma no Fallback:', err?.message);
      this.notify({ isFallback: true, message: 'Turma excluída no Fallback' });
      const classes = getLocalClasses().filter(c => c.id !== classId);
      saveLocalClasses(classes);
      return { success: true, isFallback: true };
    }
  },

  // Busca matrículas N:N via enrollment-service (porta 8080/api/enrollments)
  async getEnrollments() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/enrollments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Conectado ao enrollment-service via Gateway' });
      saveLocalEnrollments(data);
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] enrollment-service indisponível:', err?.message);
      this.notify({ isFallback: true, message: 'enrollment-service em Fallback local' });
      return { data: getLocalEnrollments(), isFallback: true };
    }
  },

  // Realiza matrícula N:N
  async enrollStudent(alunoId, classId) {
    const payload = { alunoId: Number(alunoId), classId: Number(classId) };
    try {
      const res = await fetchWithTimeout(`${API_BASE}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || `HTTP ${res.status}`);
      }
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Matrícula realizada via Gateway' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Matrícula via Fallback local:', err?.message);
      this.notify({ isFallback: true, message: 'Matrícula efetuada no Fallback local' });
      const enrollments = getLocalEnrollments();
      const students = getLocalStudents();
      const classes = getLocalClasses();

      const exists = enrollments.some(e => e.alunoId === payload.alunoId && e.classId === payload.classId);
      if (exists) {
        throw new Error('O aluno já está matriculado nesta disciplina/turma.');
      }

      const alunoObj = students.find(s => s.id === payload.alunoId);
      const classObj = classes.find(c => c.id === payload.classId);

      const newId = enrollments.length > 0 ? Math.max(...enrollments.map(e => e.id)) + 1 : 1;
      const newEnrollment = {
        id: newId,
        alunoId: payload.alunoId,
        classId: payload.classId,
        status: 'ATIVA',
        dataMatricula: new Date().toISOString(),
        aluno: alunoObj ? { id: alunoObj.id, matricula: alunoObj.matricula, nome: alunoObj.nome } : null,
        turma: classObj ? { id: classObj.id, codigo: classObj.codigo, nomeDisciplina: classObj.nomeDisciplina } : null
      };

      saveLocalEnrollments([...enrollments, newEnrollment]);
      return { data: newEnrollment, isFallback: true };
    }
  },

  // Cancela matrícula
  async cancelEnrollment(enrollmentId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/enrollments/${enrollmentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isFallback: false, message: 'Matrícula cancelada com sucesso' });
      return { success: true, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Cancelando matrícula no Fallback:', err?.message);
      this.notify({ isFallback: true, message: 'Matrícula cancelada no Fallback' });
      const enrollments = getLocalEnrollments().filter(e => e.id !== enrollmentId);
      saveLocalEnrollments(enrollments);
      return { success: true, isFallback: true };
    }
  },

  // Busca notas de uma turma via grade-service (porta 8080/api/grades/turma/{turmaId})
  async getGrades(turmaId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/grades/turma/${encodeURIComponent(turmaId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Notas obtidas do grade-service via Gateway' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] grade-service indisponível:', err?.message);
      this.notify({ isFallback: true, message: 'grade-service em Fallback local' });
      const allGrades = getLocalGrades();
      const filtered = turmaId ? allGrades.filter(g => g.turmaId === turmaId) : allGrades;
      return { data: filtered, isFallback: true };
    }
  },

  // Lança notas e calcula médias (grade-service via RabbitMQ)
  async saveGrade(gradeData) {
    const payload = {
      alunoId: Number(gradeData.alunoId),
      turmaId: String(gradeData.turmaId),
      nota1: gradeData.nota1 !== '' && gradeData.nota1 !== null ? Number(gradeData.nota1) : null,
      nota2: gradeData.nota2 !== '' && gradeData.nota2 !== null ? Number(gradeData.nota2) : null,
      notaFinal: gradeData.notaFinal !== '' && gradeData.notaFinal !== null ? Number(gradeData.notaFinal) : null
    };

    try {
      const res = await fetchWithTimeout(`${API_BASE}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isFallback: false, message: 'Notas salvas e evento publicado no RabbitMQ' });
      return { data, isFallback: false };
    } catch (err) {
      console.debug('[DistriSchool] Lançando nota no Fallback:', err?.message);
      this.notify({ isFallback: true, message: 'Nota salva no Fallback (Evento RabbitMQ simulado)' });
      const grades = getLocalGrades();
      let media = null;
      let situacao = 'EM_ANDAMENTO';

      if (payload.nota1 !== null && payload.nota2 !== null) {
        let m = (payload.nota1 + payload.nota2) / 2.0;
        if (payload.notaFinal !== null) {
          m = (m + payload.notaFinal) / 2.0;
        }
        media = Math.round(m * 100.0) / 100.0;
        if (media >= 7.0) situacao = 'APROVADO';
        else if (media >= 4.0 && payload.notaFinal === null) situacao = 'RECUPERACAO';
        else if (media >= 5.0 && payload.notaFinal !== null) situacao = 'APROVADO_FINAL';
        else situacao = 'REPROVADO';
      }

      const existingIndex = grades.findIndex(g => g.alunoId === payload.alunoId && g.turmaId === payload.turmaId);
      let savedObj;
      if (existingIndex >= 0) {
        savedObj = {
          ...grades[existingIndex],
          ...payload,
          mediaCalculada: media,
          situacao,
          updatedAt: new Date().toISOString()
        };
        grades[existingIndex] = savedObj;
      } else {
        const newId = grades.length > 0 ? Math.max(...grades.map(g => g.id)) + 1 : 1;
        savedObj = {
          id: newId,
          ...payload,
          mediaCalculada: media,
          situacao,
          updatedAt: new Date().toISOString()
        };
        grades.push(savedObj);
      }

      saveLocalGrades(grades);
      return { data: savedObj, isFallback: true };
    }
  }
};

function getLocalGrades() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GRADES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Erro ao ler grades do localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(DEFAULT_GRADES));
  return DEFAULT_GRADES;
}

function saveLocalGrades(grades) {
  try {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  } catch (e) {
    console.warn('Erro ao salvar grades no localStorage:', e);
  }
}

function getLocalClasses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Erro ao ler classes do localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  return DEFAULT_CLASSES;
}

function saveLocalClasses(classes) {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.warn('Erro ao salvar classes no localStorage:', e);
  }
}

function getLocalEnrollments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Erro ao ler enrollments do localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(DEFAULT_ENROLLMENTS));
  return DEFAULT_ENROLLMENTS;
}

function saveLocalEnrollments(enrollments) {
  try {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  } catch (e) {
    console.warn('Erro ao salvar enrollments no localStorage:', e);
  }
}

function getLocalTeachers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Erro ao ler teachers do localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(DEFAULT_TEACHERS));
  return DEFAULT_TEACHERS;
}

function saveLocalTeachers(teachers) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.warn('Erro ao salvar teachers no localStorage:', e);
  }
}


