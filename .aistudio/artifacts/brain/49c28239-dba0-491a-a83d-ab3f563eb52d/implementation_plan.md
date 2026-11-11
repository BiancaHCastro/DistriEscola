# DistriSchool: Conexão Estrita com Microsserviços e Otimização Local

Transição do frontend para comunicação estrita via API real (eliminando o fallback estático), configuração de proxy reverso no Vite fixado em `localhost:3000` e otimização de memória com perfis no Docker Compose para evitar estouro de RAM na máquina do desenvolvedor.

---

### Decisões Confirmadas pelo Usuário

> [!IMPORTANT]
> **Decisões alinhadas na Fase 1:**
> 1. **Kubernetes descartado**: Evita o overhead de 1.5GB a 2.5GB de RAM do control plane (etcd, apiserver, kubelet). Mantido Docker Compose com perfis para uso eficiente de recursos.
> 2. **Modo Estrito no Frontend**: O frontend deixará de utilizar fallbacks de `localStorage`/dados estáticos e se comunicará exclusivamente com os servidores reais via `/api`. Erros de rede serão reportados de forma clara na interface com opção de retry.
> 3. **Vite Simplificado em localhost:3000 com Proxy**: Remoção de `host: '0.0.0.0'` para eliminar a lista de interfaces de rede (`192.168.*`, `172.29.*`) e adição de proxy reverso `/api -> http://localhost:8080` (Spring Cloud API Gateway).

---

## 1. Visão Geral e Arquitetura

O sistema passará a operar em **modo 100% integrado**:

```
┌────────────────────────────────────────────────────────┐
│                   Navegador Web                        │
│             http://localhost:3000                      │
└──────────────────────────┬─────────────────────────────┘
                           │ chamadas /api/* (sem CORS)
                           ▼
┌────────────────────────────────────────────────────────┐
│              Vite Dev Server (Proxy)                   │
│         localhost:3000 -> localhost:8080               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│         Spring Cloud API Gateway (:8080)               │
│               Roteador Central Docker                  │
└──────┬──────────────┬──────────────┬─────────────┬─────┘
       │              │              │             │
       ▼              ▼              ▼             ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐  ┌──────────┐
  │  Login   │   │  Aluno   │   │ Teacher  │  │  Class   │
  │  :8081   │   │  :8082   │   │  :8083   │  │  :8085   │
  └──────────┘   └──────────┘   └──────────┘  └──────────┘
       │              │              │             │
  ┌──────────┐   ┌──────────┐   ┌──────────┐       │
  │Enrollment│   │Attendance│   │  Grade   │       │
  │  :8086   │   │  :8084   │   │  :8087   │       │
  └──────────┘   └──────────┘   └──────────┘       │
       │              │              │             │
       └──────────────┴──────┬───────┴─────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   ┌──────────────────┐             ┌──────────────────┐
   │  PostgreSQL 16   │             │   RabbitMQ 3.13  │
   │  Schemas únicos  │             │   Fila de eventos│
   └──────────────────┘             └──────────────────┘
```

---

## 2. Mudanças e Implementações Detalhadas

### 2.1. Simplificação do Vite (`frontend/vite.config.js`)
- **Remover** `host: '0.0.0.0'` e `allowedHosts: true`.
- **Definir** `server.host: 'localhost'` e `port: 3000`.
- **Configurar proxy reverso:**
  ```javascript
  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
  ```
- **Resultado:** O console do terminal do frontend exibirá apenas `http://localhost:3000` (sem IPs de adaptadores de rede de VM/WSL) e todas as requisições `/api` serão direcionadas transparentemente ao API Gateway.

### 2.2. Modo Estrito no Frontend (`frontend/src/services/api.js` e `App.jsx`)
- **Remoção de Mocks Silenciosos:**
  - Desativar a substituição automática por dados do `localStorage` quando a chamada HTTP falhar.
  - Eliminar o timeout curto de 1.5s (`TIMEOUT_MS = 1500`), aumentando para 10s para acomodar inicialização e processamento real dos serviços.
- **Tratamento Real de Erros na UI:**
  - Quando a API estiver inacessível, exibir um banner destacado: *"Não foi possível conectar ao API Gateway (http://localhost:8080). Certifique-se de que os contêineres Docker estão em execução."* com botão de **"Tentar Conectar Novamente"**.
  - O indicador de status no topo (`ConnectionBadge`) mostrará com fidelidade se os serviços em Docker estão online ou offline, sem falsos positivos.

### 2.3. Otimização de Recursos no Docker Compose (`docker-compose.yml`)
- **Perfis de Execução (Docker Compose Profiles):**
  - **Perfil `core` (baixo consumo de RAM, ~1.5GB total):**
    - `postgres`, `rabbitmq`, `api-gateway`, `login-service`, `aluno-service`, `teacher-service`.
  - **Perfil `full` (todos os 8 microsserviços):**
    - Adiciona `class-service`, `enrollment-service`, `attendance-service`, `grade-service`.
- Isso permite que o usuário suba o ambiente com `docker compose --profile core up -d` em máquinas com memória restrita, subindo o restante conforme a demanda.
- Atualização dos scripts `build-sequential.sh` e `build-sequential.bat` para permitir a escolha entre o perfil essencial (`core`) e o completo (`full`).

---

## 3. Plano de Verificação e Testes

1. **Validação do Vite:**
   - Iniciar o servidor de desenvolvimento e confirmar que escuta exclusivamente em `localhost:3000`.
   - Verificar se as chamadas para `/api/alunos`, `/api/professores`, etc., são enviadas pelo proxy.
2. **Validação do Modo Estrito:**
   - Verificar se a aplicação consome diretamente os endpoints do Spring Boot sem carregar dados em mock.
   - Confirmar o comportamento dos alertas de erro e botão de retry caso o Gateway esteja indisponível.
3. **Compilação e Lint:**
   - Executar `compile_applet` e `lint_applet` para garantir zero erros de sintaxe ou dependências.
