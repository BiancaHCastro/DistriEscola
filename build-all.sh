#!/bin/bash
set -e

echo "=== DistriSchool: Build e Execução dos Microsserviços ==="
echo "1. Limpando cache do Docker builder para evitar erros de socket/EOF..."
docker builder prune -f

echo "2. Construindo imagens de forma sequencial para máxima estabilidade e baixo uso de RAM..."
docker compose build --parallel=false

echo "3. Subindo infraestrutura (PostgreSQL, RabbitMQ), API Gateway e microsserviços..."
docker compose up -d

echo "=== Todos os serviços iniciados com sucesso! ==="
echo "API Gateway: http://localhost:8080"
echo "RabbitMQ Management: http://localhost:15672 (admin/password)"
