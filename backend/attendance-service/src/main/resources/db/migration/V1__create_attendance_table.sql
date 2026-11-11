-- Flyway Migration V1: Criação da tabela de Presenças (attendances)
CREATE TABLE IF NOT EXISTS attendances (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    turma_id VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendances_aluno ON attendances (aluno_id);
CREATE INDEX IF NOT EXISTS idx_attendances_turma ON attendances (turma_id);
CREATE INDEX IF NOT EXISTS idx_attendances_data ON attendances (data);
