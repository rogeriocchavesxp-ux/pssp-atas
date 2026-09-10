-- Relatório do Conselho ou Mesa Administrativa
CREATE TABLE IF NOT EXISTS relatorios_conselho (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE RESTRICT,
  ano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'submetido' CHECK (status IN ('submetido', 'em_revisao', 'aprovado')),
  nome_igreja TEXT NOT NULL,

  supervisao_espiritual JSONB NOT NULL DEFAULT '{}',
  supervisao_administrativa JSONB NOT NULL DEFAULT '{}',
  planejamento_alcancado TEXT,
  planejamento_nao_alcancado TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (igreja_id, ano)
);

-- Cadastro e Estatística
CREATE TABLE IF NOT EXISTS relatorios_estatistica (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE RESTRICT,
  ano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'submetido' CHECK (status IN ('submetido', 'em_revisao', 'aprovado')),
  nome_igreja TEXT NOT NULL,

  lideranca JSONB NOT NULL DEFAULT '{}',
  estrutura JSONB NOT NULL DEFAULT '{}',
  rol_comungantes JSONB NOT NULL DEFAULT '{}',
  rol_nao_comungantes JSONB NOT NULL DEFAULT '{}',
  financeiro JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (igreja_id, ano)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_relcons_ano ON relatorios_conselho (ano);
CREATE INDEX IF NOT EXISTS idx_relcons_igreja ON relatorios_conselho (igreja_id);
CREATE INDEX IF NOT EXISTS idx_relest_ano ON relatorios_estatistica (ano);
CREATE INDEX IF NOT EXISTS idx_relest_igreja ON relatorios_estatistica (igreja_id);

-- RLS
ALTER TABLE relatorios_conselho ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "relcons_select" ON relatorios_conselho;
DROP POLICY IF EXISTS "relcons_insert" ON relatorios_conselho;
DROP POLICY IF EXISTS "relcons_update" ON relatorios_conselho;
CREATE POLICY "relcons_select" ON relatorios_conselho FOR SELECT USING (true);
CREATE POLICY "relcons_insert" ON relatorios_conselho FOR INSERT WITH CHECK (true);
CREATE POLICY "relcons_update" ON relatorios_conselho FOR UPDATE USING (true);

ALTER TABLE relatorios_estatistica ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "relest_select" ON relatorios_estatistica;
DROP POLICY IF EXISTS "relest_insert" ON relatorios_estatistica;
DROP POLICY IF EXISTS "relest_update" ON relatorios_estatistica;
CREATE POLICY "relest_select" ON relatorios_estatistica FOR SELECT USING (true);
CREATE POLICY "relest_insert" ON relatorios_estatistica FOR INSERT WITH CHECK (true);
CREATE POLICY "relest_update" ON relatorios_estatistica FOR UPDATE USING (true);
