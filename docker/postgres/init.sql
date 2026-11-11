-- Script de Inicialização do PostgreSQL para o DistriSchool
-- Criação de schemas dedicados para garantir isolamento e desacoplamento entre os microsserviços

CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS aluno_schema;
CREATE SCHEMA IF NOT EXISTS teacher_schema;
CREATE SCHEMA IF NOT EXISTS class_schema;
CREATE SCHEMA IF NOT EXISTS enrollment_schema;
CREATE SCHEMA IF NOT EXISTS attendance_schema;
CREATE SCHEMA IF NOT EXISTS grade_schema;

-- Concede privilégios ao usuário da aplicação
GRANT ALL ON SCHEMA auth_schema TO admin;
GRANT ALL ON SCHEMA aluno_schema TO admin;
GRANT ALL ON SCHEMA teacher_schema TO admin;
GRANT ALL ON SCHEMA class_schema TO admin;
GRANT ALL ON SCHEMA enrollment_schema TO admin;
GRANT ALL ON SCHEMA attendance_schema TO admin;
GRANT ALL ON SCHEMA grade_schema TO admin;
