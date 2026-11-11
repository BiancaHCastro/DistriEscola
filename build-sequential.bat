@echo off
echo === DistriSchool: Build Sequencial e Execucao (Windows) ===

echo 1. Limpando cache do Docker builder...
docker builder prune -f

echo 2. Construindo imagens sequencialmente (baixo consumo de memoria)...
docker compose build --parallel=false

echo 3. Subindo banco de dados, RabbitMQ, Gateway e microsservicos...
docker compose up -d

echo === Todos os servicos iniciados com sucesso! ===
echo API Gateway: http://localhost:8080
echo RabbitMQ Management: http://localhost:15672 (admin/password)
pause
