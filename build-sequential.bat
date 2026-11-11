@echo off
set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=all

echo === DistriSchool: Build Sequencial Otimizado (Windows) ===
echo Modo de execucao: %PROFILE%

echo 1. Limpando cache do Docker builder...
docker builder prune -f

echo --------------------------------------------------------
echo --^> Construindo login-service...
docker compose build login-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar login-service & pause & exit /b %ERRORLEVEL% )

echo --------------------------------------------------------
echo --^> Construindo aluno-service...
docker compose build aluno-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar aluno-service & pause & exit /b %ERRORLEVEL% )

echo --------------------------------------------------------
echo --^> Construindo teacher-service...
docker compose build teacher-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar teacher-service & pause & exit /b %ERRORLEVEL% )

if "%PROFILE%"=="core" goto skip_extended

echo --------------------------------------------------------
echo --^> Construindo class-service...
docker compose build class-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar class-service & pause & exit /b %ERRORLEVEL% )

echo --------------------------------------------------------
echo --^> Construindo enrollment-service...
docker compose build enrollment-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar enrollment-service & pause & exit /b %ERRORLEVEL% )

echo --------------------------------------------------------
echo --^> Construindo attendance-service...
docker compose build attendance-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar attendance-service & pause & exit /b %ERRORLEVEL% )

echo --------------------------------------------------------
echo --^> Construindo grade-service...
docker compose build grade-service
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar grade-service & pause & exit /b %ERRORLEVEL% )

:skip_extended

echo --------------------------------------------------------
echo --^> Construindo api-gateway...
docker compose build api-gateway
if %ERRORLEVEL% NEQ 0 ( echo Falha ao compilar api-gateway & pause & exit /b %ERRORLEVEL% )

echo --------------------------------------------------------
if "%PROFILE%"=="core" (
    echo 3. Subindo PostgreSQL, RabbitMQ, Gateway e servicos CORE...
    docker compose up -d postgres rabbitmq api-gateway login-service aluno-service teacher-service
) else (
    echo 3. Subindo infraestrutura (PostgreSQL, RabbitMQ), API Gateway e todos os microsservicos...
    docker compose up -d
)

echo === Servicos iniciados com sucesso! ===
echo Frontend: http://localhost:3000
echo API Gateway: http://localhost:8080
echo RabbitMQ Management: http://localhost:15672 (admin/password)
pause
