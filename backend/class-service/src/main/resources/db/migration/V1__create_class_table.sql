-- Flyway Migration V1: Criação da tabela de Turmas e Disciplinas (classes)
CREATE TABLE IF NOT EXISTS classes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome_disciplina VARCHAR(255) NOT NULL,
    semestre VARCHAR(20) NOT NULL,
    horario VARCHAR(100),
    sala VARCHAR(50),
    capacidade_maxima INT NOT NULL DEFAULT 40,
    teacher_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classes_codigo ON classes (codigo);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes (teacher_id);
