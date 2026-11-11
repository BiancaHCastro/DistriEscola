#!/bin/bash
set -e

echo "=== DistriSchool: Build Sequencial Otimizado (Sem Estouro de Memoria) ==="

echo "1. Limpando cache do Docker builder..."
docker builder prune -f

echo "2. Construindo cada microsservico individualmente para consumo minimo de RAM..."
services=(login-service aluno-service teacher-service class-service enrollment-service attendance-service grade-service api-gateway)

for svc in "${services[@]}"; do
    echo "--------------------------------------------------------"
    echo "--> Construindo $svc..."
    docker compose build "$svc"
done

echo "--------------------------------------------------------"
echo "3. Subindo infraestrutura (PostgreSQL, RabbitMQ), API Gateway e microsservicos..."
docker compose up -d

echo "=== Todos os servicos foram iniciados com sucesso! ==="
echo "API Gateway: http://localhost:8080"
echo "RabbitMQ Management: http://localhost:15672 (admin/password)"
