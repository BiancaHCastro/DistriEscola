-- Flyway Migration V1: Criação da tabela de Notas e Avaliações (grades)
CREATE TABLE IF NOT EXISTS grades (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    turma_id VARCHAR(50) NOT NULL,
    nota1 NUMERIC(4, 2),
    nota2 NUMERIC(4, 2),
    nota_final NUMERIC(4, 2),
    media_calculada NUMERIC(4, 2),
    situacao VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_grade_aluno_turma UNIQUE (aluno_id, turma_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_aluno ON grades (aluno_id);
CREATE INDEX IF NOT EXISTS idx_grades_turma ON grades (turma_id);
CREATE INDEX IF NOT EXISTS idx_grades_situacao ON grades (situacao);
