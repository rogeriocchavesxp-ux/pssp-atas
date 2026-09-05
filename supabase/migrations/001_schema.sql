-- ============================================================
-- PSSP — Presbitério Leste de São Paulo
-- Schema completo v1.0
-- ============================================================

-- Extensão para UUID
create extension if not exists "pgcrypto";

-- Função auxiliar para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- IGREJAS
-- ============================================================
create table if not exists igrejas (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  sigla       text,
  cidade      text,
  bairro      text,
  tipo        text not null default 'sede'
                check (tipo in ('sede','congregacao','campo','missao')),
  ativa       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- OFICIAIS (pastores e presbíteros)
-- ============================================================
create table if not exists oficiais (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  tipo        text not null check (tipo in ('pastor','presbitero','diacono')),
  cargo       text,
  igreja_id   uuid references igrejas(id) on delete set null,
  email       text,
  telefone    text,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PERFIS (usuários do sistema)
-- ============================================================
create table if not exists perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  email       text not null,
  papel       text not null default 'presbitero'
                check (papel in ('admin','secretario','moderador','presbitero','pastor')),
  cargo       text,
  igreja_id   uuid references igrejas(id) on delete set null,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Trigger para criar perfil ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- REUNIÕES
-- ============================================================
create table if not exists reunioes (
  id                  uuid primary key default gen_random_uuid(),
  numero              text not null unique,   -- ex: "PSSP-E 2026", "37ª RE 2025"
  tipo                text not null default 'ordinaria'
                        check (tipo in ('ordinaria','extraordinaria','solene','administrativa')),
  data_inicio         date not null,
  data_fim            date,
  local               text,
  cidade              text,
  status              text not null default 'convocada'
                        check (status in (
                          'convocada','em_andamento','encerrada',
                          'ata_em_producao','ata_aprovada','publicada'
                        )),
  quorum_necessario   int,
  observacoes         text,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- MESA DA REUNIÃO
-- ============================================================
create table if not exists reuniao_mesa (
  id          uuid primary key default gen_random_uuid(),
  reuniao_id  uuid not null references reunioes(id) on delete cascade,
  oficial_id  uuid not null references oficiais(id) on delete cascade,
  funcao      text not null check (funcao in (
                'moderador','vice_moderador','1_secretario','2_secretario','assessor'
              )),
  unique(reuniao_id, oficial_id)
);

-- ============================================================
-- PRESENÇAS
-- ============================================================
create table if not exists reuniao_presencas (
  id              uuid primary key default gen_random_uuid(),
  reuniao_id      uuid not null references reunioes(id) on delete cascade,
  oficial_id      uuid not null references oficiais(id) on delete cascade,
  presente        boolean not null default false,
  justificativa   text,
  created_at      timestamptz not null default now(),
  unique(reuniao_id, oficial_id)
);

-- ============================================================
-- COMISSÕES
-- ============================================================
create table if not exists comissoes (
  id          uuid primary key default gen_random_uuid(),
  reuniao_id  uuid references reunioes(id) on delete cascade,  -- null = permanente
  numero      int not null,
  nome        text,
  tipo        text not null default 'temporaria'
                check (tipo in ('permanente','temporaria','especial')),
  ativa       boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists comissao_membros (
  id          uuid primary key default gen_random_uuid(),
  comissao_id uuid not null references comissoes(id) on delete cascade,
  oficial_id  uuid not null references oficiais(id) on delete cascade,
  funcao      text not null default 'membro'
                check (funcao in ('presidente','secretario','membro')),
  unique(comissao_id, oficial_id)
);

-- ============================================================
-- DOCUMENTOS (Ementário)
-- ============================================================
create table if not exists documentos (
  id          uuid primary key default gen_random_uuid(),
  reuniao_id  uuid not null references reunioes(id) on delete cascade,
  numero      int not null,
  assunto     text not null,
  oriundo     text,
  tipo        text,                          -- tipo do documento
  conteudo    text,                          -- texto completo
  pdf_url     text,                          -- link do PDF
  comissao_id uuid references comissoes(id) on delete set null,
  status      text not null default 'recebido'
                check (status in ('recebido','em_pauta','aprovado','rejeitado','arquivado','retirado')),
  created_at  timestamptz not null default now(),
  unique(reuniao_id, numero)
);

-- ============================================================
-- RESOLUÇÕES
-- ============================================================
create table if not exists resolucoes (
  id              uuid primary key default gen_random_uuid(),
  documento_id    uuid references documentos(id) on delete set null,
  reuniao_id      uuid not null references reunioes(id) on delete cascade,
  numero          int not null,
  ementa          text not null,
  texto           text,
  status          text not null default 'aprovada'
                    check (status in ('aprovada','publicada')),
  data            date not null,
  created_at      timestamptz not null default now(),
  unique(reuniao_id, numero)
);

-- ============================================================
-- ATAS
-- ============================================================
create table if not exists atas (
  id          uuid primary key default gen_random_uuid(),
  reuniao_id  uuid not null references reunioes(id) on delete cascade unique,
  numero_ata  text,
  conteudo    jsonb not null default '{
    "abertura": "",
    "verificacao_quorum": "",
    "pauta": "",
    "deliberacoes": "",
    "encerramento": "",
    "observacoes": ""
  }'::jsonb,
  status      text not null default 'rascunho'
                check (status in ('rascunho','em_revisao','aprovada','publicada')),
  aprovada_em timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists ata_aprovacoes (
  id          uuid primary key default gen_random_uuid(),
  ata_id      uuid not null references atas(id) on delete cascade,
  oficial_id  uuid not null references oficiais(id) on delete cascade,
  funcao      text not null,
  aprovado    boolean not null default false,
  data        timestamptz,
  unique(ata_id, oficial_id)
);

-- Trigger updated_at em atas
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger atas_updated_at
  before update on atas
  for each row execute function update_updated_at();

-- ============================================================
-- GRANTS
-- ============================================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on all functions in schema public to anon, authenticated;
