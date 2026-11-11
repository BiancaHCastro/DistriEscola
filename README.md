# 🎓 DistriSchool - Plataforma de Gestão Escolar Distribuída

O **DistriSchool** é um sistema de gestão escolar baseado em uma arquitetura de microsserviços. Ele foi projetado para ser escalável e tolerante a falhas.

## 🛠 Tecnologias Utilizadas
* **Backend:** Java 17, Spring Boot 3 (Web, Data JPA, Security, Actuator)
* **Frontend:** React + Vite + Tailwind CSS
* **Banco de Dados:** PostgreSQL 16 (Relacional com schemas isolados por microsserviço)
* **Mensageria:** RabbitMQ 3.13 (Gerenciamento AMQP para eventos assíncronos)
* **Infraestrutura:** Docker e Docker Compose (com limites de memória configurados)

> **Nota sobre o MongoDB:** O MongoDB **não** está sendo utilizado pelo sistema. Toda a persistência é gerenciada com isolamento no PostgreSQL (`distrischool_db`), o que reduz consideravelmente o consumo de RAM da sua máquina.

## 🏗 Estrutura do Repositório (Monorepo)
* `/backend` - Contém os 8 microsserviços Spring Boot.
* `/frontend` - Aplicação web em React.
* `docker-compose.yml` - Orquestração local (PostgreSQL, RabbitMQ, Gateway e serviços).

## 🚀 Como Executar o Ambiente Local

**Pré-requisitos:** Docker e Docker Compose.

### Opção 1: Usando os scripts sequenciais otimizados (Recomendado)
- **Linux / macOS:**
  ```bash
  chmod +x build-sequential.sh
  ./build-sequential.sh        # Constrói e sobe todos os serviços
  # OU para economia máxima de RAM em máquinas com pouca memória:
  ./build-sequential.sh core   # Sobe apenas o essencial (PostgreSQL, RabbitMQ, Gateway, Login, Aluno, Teacher)
  ```
- **Windows:**
  ```cmd
  build-sequential.bat         rem Constrói e sobe todos os serviços
  rem OU para economia de memória:
  build-sequential.bat core    rem Sobe apenas os serviços essenciais
  ```

### Opção 2: Manualmente via terminal
```bash
# 1. Limpa o cache do Docker builder
docker builder prune -f

# 2. Constrói as imagens sequencialmente (baixo uso de RAM e CPU)
docker compose build login-service aluno-service teacher-service api-gateway

# 3. Sobe os contêineres em segundo plano
docker compose up -d
```

### URLs de Acesso
- **Frontend Web:** `http://localhost:3000`
- **Spring Cloud API Gateway:** `http://localhost:8080`
- **RabbitMQ Dashboard:** `http://localhost:15672` (login: `admin` / senha: `password`)
- **PostgreSQL:** `localhost:5432` (`distrischool_db`)
