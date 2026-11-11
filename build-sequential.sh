#!/bin/bash
set -e

PROFILE="${1:-all}"

echo "=== DistriSchool: Build Sequencial Otimizado (Sem Estouro de Memoria) ==="
echo "Modo de execucao: $PROFILE"

echo "1. Limpando cache do Docker builder..."
docker builder prune -f

if [ "$PROFILE" = "core" ]; then
    echo "2. Construindo servicos essenciais (perfil CORE: login, aluno, teacher, gateway)..."
    services=(login-service aluno-service teacher-service api-gateway)
else
    echo "2. Construindo todos os microsservicos individualmente para consumo minimo de RAM..."
    services=(login-service aluno-service teacher-service class-service enrollment-service attendance-service grade-service api-gateway)
fi

for svc in "${services[@]}"; do
    echo "--------------------------------------------------------"
    echo "--> Construindo $svc..."
    docker compose build "$svc"
done

echo "--------------------------------------------------------"
if [ "$PROFILE" = "core" ]; then
    echo "3. Subindo PostgreSQL, RabbitMQ, Gateway e servicos CORE..."
    docker compose up -d postgres rabbitmq api-gateway login-service aluno-service teacher-service
else
    echo "3. Subindo infraestrutura (PostgreSQL, RabbitMQ), API Gateway e todos os microsservicos..."
    docker compose up -d
fi

echo "=== Servicos iniciados com sucesso! ==="
echo "Frontend: http://localhost:3000"
echo "API Gateway: http://localhost:8080"
echo "RabbitMQ Management: http://localhost:15672 (admin/password)"
