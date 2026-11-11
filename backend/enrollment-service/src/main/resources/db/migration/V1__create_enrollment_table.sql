-- Flyway Migration V1: Criação da tabela de Matrículas (N:N entre Alunos e Turmas/Disciplinas)
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ATIVA',
    CONSTRAINT uq_aluno_class UNIQUE (aluno_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_aluno ON enrollments (aluno_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments (class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments (status);
