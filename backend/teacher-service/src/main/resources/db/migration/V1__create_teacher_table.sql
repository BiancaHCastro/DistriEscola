-- Flyway Migration V1: Criação da tabela de Professores (teachers)
CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    especialidade VARCHAR(255) NOT NULL,
    departamento VARCHAR(100),
    telefone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teachers_matricula ON teachers (matricula);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers (email);
