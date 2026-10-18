# Agenda |sistema de agendamento|

Profissionais (barbeiro, personal, clinica...) cadastram servicos e horarios de atendimento;
clientes escolhem um horario livre e agendam.

## Stack

- **Backend:** Java 25, Spring Boot 3.5 (Web, Data JPA, Security, OAuth2 Resource Server/JWT, Validation)
- **Banco:** PostgreSQL 16 com migrations Flyway
- **Docs da API:** Swagger em `http://localhost:8080/swagger-ui.html`
- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query

## Como rodar

```bash
docker compose up -d          # sobe o Postgres
cd backend
.\mvnw spring-boot:run        # sobe a API em http://localhost:8080
.\mvnw test                   # testes
```

O Maven Wrapper (`mvnw`) baixa o Maven sozinho; so e preciso ter o JDK 25.

Em outro terminal, o frontend:

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 (o Vite repassa /api para a porta 8080)
```

Para testar, crie uma conta de profissional e outra de cliente pela tela de cadastro.

Variaveis de ambiente opcionais: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGENS`.

## Estrutura (por funcionalidade)

```
backend/src/main/java/br/com/agenda/
  auth/            registro, login, geracao de JWT
  usuario/         entidade Usuario e roles (CLIENTE, PROFISSIONAL, ADMIN)
  servico/         servicos do profissional (nome, duracao, preco)
  disponibilidade/ grade semanal de atendimento
  agendamento/     regras de agendamento + calculo de horarios livres
  profissional/    endpoints publicos para o cliente navegar
  common/          excecoes e tratamento de erros (ProblemDetail)
  config/          seguranca, CORS, propriedades
```

## Endpoints

| Metodo | Rota | Quem | Descricao |
|---|---|---|---|
| POST | `/api/auth/registro` | publico | Cria conta (`CLIENTE` ou `PROFISSIONAL`) e retorna token |
| POST | `/api/auth/login` | publico | Retorna token JWT |
| GET | `/api/profissionais` | publico | Lista profissionais |
| GET | `/api/profissionais/{id}/servicos` | publico | Servicos ativos |
| GET | `/api/profissionais/{id}/disponibilidades` | publico | Grade semanal |
| GET | `/api/profissionais/{id}/horarios-livres?servicoId=&data=` | publico | Horarios livres no dia |
| GET/POST | `/api/me/servicos` | profissional | Lista/cria seus servicos |
| PUT | `/api/me/servicos/{id}` | profissional | Edita servico |
| GET/PUT | `/api/me/disponibilidades` | profissional | Le/substitui a grade semanal |
| POST | `/api/agendamentos` | cliente | Agenda `{ servicoId, inicio }` |
| GET | `/api/agendamentos/meus` | logado | Agendamentos do usuario |
| PATCH | `/api/agendamentos/{id}/cancelar` | cliente ou profissional | Cancela |
| PATCH | `/api/agendamentos/{id}/concluir` | profissional | Marca como concluido |

Rotas protegidas exigem o header `Authorization: Bearer <token>`.
