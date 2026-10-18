-- Necessaria para a constraint de exclusao que combina "=" com sobreposicao de intervalos
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE usuario (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(160) NOT NULL UNIQUE,
    senha_hash  VARCHAR(100) NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('CLIENTE', 'PROFISSIONAL', 'ADMIN')),
    criado_em   TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE servico (
    id                BIGSERIAL PRIMARY KEY,
    profissional_id   BIGINT        NOT NULL REFERENCES usuario (id),
    nome              VARCHAR(120)  NOT NULL,
    duracao_minutos   INT           NOT NULL CHECK (duracao_minutos BETWEEN 5 AND 480),
    preco             NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    ativo             BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_servico_profissional ON servico (profissional_id);

-- Janela semanal recorrente de atendimento (ex.: segunda 09:00-12:00)
CREATE TABLE disponibilidade (
    id               BIGSERIAL PRIMARY KEY,
    profissional_id  BIGINT      NOT NULL REFERENCES usuario (id),
    dia_semana       VARCHAR(10) NOT NULL,
    hora_inicio      TIME        NOT NULL,
    hora_fim         TIME        NOT NULL,
    CHECK (hora_fim > hora_inicio)
);

CREATE INDEX idx_disponibilidade_profissional ON disponibilidade (profissional_id, dia_semana);

CREATE TABLE agendamento (
    id               BIGSERIAL PRIMARY KEY,
    cliente_id       BIGINT      NOT NULL REFERENCES usuario (id),
    profissional_id  BIGINT      NOT NULL REFERENCES usuario (id),
    servico_id       BIGINT      NOT NULL REFERENCES servico (id),
    inicio           TIMESTAMP   NOT NULL,
    fim              TIMESTAMP   NOT NULL,
    status           VARCHAR(20) NOT NULL CHECK (status IN ('AGENDADO', 'CANCELADO', 'CONCLUIDO')),
    criado_em        TIMESTAMP   NOT NULL DEFAULT now(),
    version          BIGINT      NOT NULL DEFAULT 0,
    CHECK (fim > inicio),
    -- Garantia final contra horario duplicado: mesmo com duas requisicoes simultaneas,
    -- o banco recusa dois agendamentos ativos sobrepostos para o mesmo profissional.
    CONSTRAINT agendamento_sem_sobreposicao EXCLUDE USING gist (
        profissional_id WITH =,
        tsrange(inicio, fim) WITH &&
    ) WHERE (status <> 'CANCELADO')
);

CREATE INDEX idx_agendamento_cliente ON agendamento (cliente_id, inicio);
