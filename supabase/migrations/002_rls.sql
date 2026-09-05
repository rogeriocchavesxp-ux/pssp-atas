-- ============================================================
-- RLS — Row Level Security
-- ============================================================

-- Função auxiliar: papel do usuário logado
create or replace function papel_atual()
returns text language sql security definer stable set search_path = public as $$
  select papel from perfis where id = auth.uid()
$$;

-- Secretários podem fazer tudo
create or replace function is_secretario()
returns boolean language sql security definer stable set search_path = public as $$
  select papel_atual() in ('admin','secretario')
$$;

-- Habilitar RLS
alter table perfis enable row level security;
alter table igrejas enable row level security;
alter table oficiais enable row level security;
alter table reunioes enable row level security;
alter table reuniao_mesa enable row level security;
alter table reuniao_presencas enable row level security;
alter table comissoes enable row level security;
alter table comissao_membros enable row level security;
alter table documentos enable row level security;
alter table resolucoes enable row level security;
alter table atas enable row level security;
alter table ata_aprovacoes enable row level security;

-- ---- perfis ----
create policy "Usuário vê próprio perfil" on perfis for select using (id = auth.uid());
create policy "Admin vê todos os perfis" on perfis for all using (is_secretario());

-- ---- igrejas ----
create policy "Todos autenticados leem igrejas" on igrejas for select using (auth.uid() is not null);
create policy "Secretário gerencia igrejas" on igrejas for all using (is_secretario());

-- ---- oficiais ----
create policy "Todos autenticados leem oficiais" on oficiais for select using (auth.uid() is not null);
create policy "Secretário gerencia oficiais" on oficiais for all using (is_secretario());

-- ---- reunioes ----
create policy "Todos autenticados leem reuniões" on reunioes for select using (auth.uid() is not null);
create policy "Secretário gerencia reuniões" on reunioes for all using (is_secretario());

-- ---- reuniao_mesa ----
create policy "Todos leem mesa" on reuniao_mesa for select using (auth.uid() is not null);
create policy "Secretário gerencia mesa" on reuniao_mesa for all using (is_secretario());

-- ---- presencas ----
create policy "Todos leem presenças" on reuniao_presencas for select using (auth.uid() is not null);
create policy "Secretário gerencia presenças" on reuniao_presencas for all using (is_secretario());

-- ---- comissoes ----
create policy "Todos leem comissões" on comissoes for select using (auth.uid() is not null);
create policy "Secretário gerencia comissões" on comissoes for all using (is_secretario());
create policy "Todos leem membros comissão" on comissao_membros for select using (auth.uid() is not null);
create policy "Secretário gerencia membros comissão" on comissao_membros for all using (is_secretario());

-- ---- documentos ----
create policy "Todos leem documentos" on documentos for select using (auth.uid() is not null);
create policy "Secretário gerencia documentos" on documentos for all using (is_secretario());

-- ---- resolucoes ----
create policy "Todos leem resoluções" on resolucoes for select using (auth.uid() is not null);
create policy "Secretário gerencia resoluções" on resolucoes for all using (is_secretario());

-- ---- atas ----
create policy "Todos leem atas aprovadas" on atas for select
  using (auth.uid() is not null and (status in ('aprovada','publicada') or is_secretario()));
create policy "Secretário gerencia atas" on atas for all using (is_secretario());

-- ---- ata_aprovacoes ----
create policy "Todos leem aprovações" on ata_aprovacoes for select using (auth.uid() is not null);
create policy "Secretário gerencia aprovações" on ata_aprovacoes for all using (is_secretario());
