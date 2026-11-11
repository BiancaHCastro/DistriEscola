# 🎓 DistriSchool - Plataforma de Gestão Escolar Distribuída

O **DistriSchool** é um sistema de gestão escolar baseado em uma arquitetura de microsserviços. Ele foi projetado para ser escalável e tolerante a falhas.

## 🛠 Tecnologias Utilizadas
* **Backend:** Java 17, Spring Boot (Web, Data JPA, Security)
* **Frontend:** React + Vite + Thymeleaf
* **Banco de Dados:** PostgreSQL (Relacional) e MongoDB (NoSQL)
* **Mensageria:** Apache Kafka
* **Infraestrutura:** Docker e Kubernetes (K8s)

## 🏗 Estrutura do Repositório (Monorepo)
* `/backend` - Contém os microsserviços Spring Boot.
* `/frontend` - Aplicação web em React.
* `docker-compose.yml` - Infraestrutura local (Bancos de Dados, Kafka, Zookeeper).

## 🚀 Como Executar o Ambiente Local

**Pré-requisitos:** Docker e Docker Compose.

### Opção 1: Usando os scripts sequenciais otimizados (Recomendado)
- **Linux / macOS:**
  ```bash
  chmod +x build-sequential.sh
  ./build-sequential.sh
  ```
- **Windows:**
  ```cmd
  build-sequential.bat
  ```

### Opção 2: Manualmente via terminal
```bash
# 1. Limpa o cache do Docker builder
docker builder prune -f

# 2. Constrói as imagens sequencialmente (baixo uso de RAM e CPU)
docker compose build --parallel=false

# 3. Sobe todos os contêineres em segundo plano
docker compose up -d
```

### URLs de Acesso
- **Frontend Web:** `http://localhost:3000`
- **Spring Cloud API Gateway:** `http://localhost:8080`
- **RabbitMQ Dashboard:** `http://localhost:15672` (login: `admin` / senha: `password`)
- **PostgreSQL:** `localhost:5432` (`distrischool_db`)
