// Serviço de comunicação HTTP direta com o API Gateway do Spring Cloud (:8080)
// Conecta diretamente ao backend real (PostgreSQL, RabbitMQ e Microsserviços).

const DEFAULT_API_BASE = 'http://localhost:8080/api';
const TIMEOUT_MS = 8000; // 8s de timeout para respostas do backend

export function getApiBase() {
  try {
    return localStorage.getItem('distrischool_gateway_url') || DEFAULT_API_BASE;
  } catch {
    return DEFAULT_API_BASE;
  }
}

export function setApiBase(url) {
  try {
    localStorage.setItem('distrischool_gateway_url', url);
  } catch (e) {
    console.warn('Erro ao salvar gateway URL:', e);
  }
}

// Helper para requisições com timeout
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
    if (error.name === 'AbortError') {
      throw new Error(`Tempo limite esgotado (${timeout / 1000}s) ao contatar o servidor.`);
    }
    throw error;
  }
}

export const apiService = {
  isConnected: false,
  lastError: null,
  listeners: [],

  getGatewayUrl() {
    return getApiBase();
  },

  setGatewayUrl(url) {
    setApiBase(url);
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify(status) {
    this.isConnected = !status.isError;
    this.lastError = status.isError ? status.error : null;
    this.listeners.forEach(l => l({
      isConnected: this.isConnected,
      isFallback: status.isError,
      message: status.message,
      error: status.error
    }));
  },

  // Verifica conectividade com o API Gateway
  async checkHealth() {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/actuator/health`, { timeout: 3000 });
      if (res.ok) {
        this.notify({ isError: false, message: 'API Gateway online' });
        return true;
      }
    } catch {
      try {
        const res2 = await fetchWithTimeout(`${base}/students`, { timeout: 3000 });
        if (res2.ok) {
          this.notify({ isError: false, message: 'Serviços conectados' });
          return true;
        }
      } catch (err2) {
        this.notify({ isError: true, error: err2.message });
        return false;
      }
    }
    this.notify({ isError: true, error: 'Servidor indisponível' });
    return false;
  },

  // Autenticação via login-service (porta 8080/api/auth/login)
  async login(credentials) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Falha na autenticação (HTTP ${res.status})`);
      }
      const data = await res.json();
      this.notify({ isError: false, message: 'Autenticado via login-service' });
      localStorage.setItem('distrischool_current_user', JSON.stringify(data));
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao conectar ao login-service: ${err.message}. Verifique se os contêineres Docker estão ativos.`);
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
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/students`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Alunos carregados do banco de dados' });
      return { data: Array.isArray(data) ? data : [], isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao buscar alunos no aluno-service: ${err.message}`);
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

    const base = getApiBase();
    try {
      const url = isEditing ? `${base}/students/${studentData.id}` : `${base}/students`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }
      const data = await res.json();
      this.notify({ isError: false, message: 'Aluno salvo no banco de dados' });
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao salvar aluno no servidor: ${err.message}`);
    }
  },

  // Exclui aluno
  async deleteStudent(studentId) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/students/${studentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isError: false, message: 'Aluno excluído no banco de dados' });
      return { success: true, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao excluir aluno no servidor: ${err.message}`);
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

    const base = getApiBase();
    try {
      const promises = payloads.map(p =>
        fetchWithTimeout(`${base}/academic/presencas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
      );
      const responses = await Promise.all(promises);
      const failed = responses.find(r => !r.ok);
      if (failed) throw new Error(`Falha no registro: HTTP ${failed.status}`);
      this.notify({ isError: false, message: 'Presenças salvas no attendance-service' });
      return { success: true, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao registrar chamada no servidor: ${err.message}`);
    }
  },

  // Relatório de frequência por turma
  async getReport(turmaId) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/academic/presencas/relatorio?turmaId=${encodeURIComponent(turmaId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Relatório obtido do attendance-service' });
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao obter relatório no servidor: ${err.message}`);
    }
  },

  // Busca lista de professores via teacher-service (porta 8080/api/teachers)
  async getTeachers() {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/teachers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Professores carregados do banco de dados' });
      return { data: Array.isArray(data) ? data : [], isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao buscar professores no teacher-service: ${err.message}`);
    }
  },

  // Salva ou atualiza professor (teacher-service)
  async saveTeacher(teacherData, isEditing = false) {
    const base = getApiBase();
    try {
      const url = isEditing ? `${base}/teachers/${teacherData.id}` : `${base}/teachers`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Professor salvo com sucesso' });
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao salvar professor no servidor: ${err.message}`);
    }
  },

  // Exclui professor
  async deleteTeacher(teacherId) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/teachers/${teacherId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isError: false, message: 'Professor excluído com sucesso' });
      return { success: true, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao excluir professor no servidor: ${err.message}`);
    }
  },

  // Busca turmas/disciplinas via class-service (porta 8080/api/classes)
  async getClasses() {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/classes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Turmas carregadas do banco de dados' });
      return { data: Array.isArray(data) ? data : [], isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao buscar turmas no class-service: ${err.message}`);
    }
  },

  // Salva ou edita turma/disciplina (class-service)
  async saveClass(classData, isEditing = false) {
    const base = getApiBase();
    try {
      const url = isEditing ? `${base}/classes/${classData.id}` : `${base}/classes`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Turma salva com sucesso' });
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao salvar turma no servidor: ${err.message}`);
    }
  },

  // Exclui turma/disciplina
  async deleteClass(classId) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/classes/${classId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isError: false, message: 'Turma excluída com sucesso' });
      return { success: true, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao excluir turma no servidor: ${err.message}`);
    }
  },

  // Busca matrículas N:N via enrollment-service (porta 8080/api/enrollments)
  async getEnrollments() {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/enrollments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Matrículas carregadas do banco de dados' });
      return { data: Array.isArray(data) ? data : [], isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao buscar matrículas no enrollment-service: ${err.message}`);
    }
  },

  // Realiza matrícula N:N
  async enrollStudent(alunoId, classId) {
    const payload = { alunoId: Number(alunoId), classId: Number(classId) };
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || `HTTP ${res.status}`);
      }
      const data = await res.json();
      this.notify({ isError: false, message: 'Matrícula efetuada no servidor' });
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao matricular aluno no servidor: ${err.message}`);
    }
  },

  // Cancela matrícula
  async cancelEnrollment(enrollmentId) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/enrollments/${enrollmentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.notify({ isError: false, message: 'Matrícula cancelada com sucesso' });
      return { success: true, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao cancelar matrícula no servidor: ${err.message}`);
    }
  },

  // Busca notas de uma turma via grade-service (porta 8080/api/grades/turma/{turmaId})
  async getGrades(turmaId) {
    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/grades/turma/${encodeURIComponent(turmaId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.notify({ isError: false, message: 'Notas obtidas do grade-service' });
      return { data: Array.isArray(data) ? data : [], isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao buscar notas no grade-service: ${err.message}`);
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

    const base = getApiBase();
    try {
      const res = await fetchWithTimeout(`${base}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }
      const data = await res.json();
      this.notify({ isError: false, message: 'Notas salvas e evento publicado no RabbitMQ' });
      return { data, isFallback: false };
    } catch (err) {
      this.notify({ isError: true, error: err.message });
      throw new Error(`Erro ao salvar notas no servidor: ${err.message}`);
    }
  }
};
