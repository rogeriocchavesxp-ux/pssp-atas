-- Relatórios Ministeriais Anuais (IPB - Relatório Ministerial)
CREATE TABLE IF NOT EXISTS relatorios_ministeriais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficial_id UUID NOT NULL REFERENCES oficiais(id) ON DELETE RESTRICT,
  ano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'submetido' CHECK (status IN ('submetido', 'em_revisao', 'aprovado')),

  -- I. Identificação (nome mantido como referência do formulário original)
  nome_ministro TEXT NOT NULL,
  igrejas TEXT,
  congregacoes TEXT,

  -- III. Atuação Ministerial (valores numéricos por seção)
  -- Estrutura: { campo: N, fora: N, total: N }
  doutrinacao JSONB NOT NULL DEFAULT '{}',
  atos_pastorais JSONB NOT NULL DEFAULT '{}',
  assistencia_pastoral JSONB NOT NULL DEFAULT '{}',

  -- IV. Atuação Conciliar
  atuacao_conciliar JSONB NOT NULL DEFAULT '{}',

  -- Textos descritivos
  ministerio_designado TEXT,
  cargos_comissoes TEXT,
  atualizacao_aperfeicoamento TEXT,
  atividades_extra TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (oficial_id, ano)
);

CREATE INDEX IF NOT EXISTS idx_relmin_ano ON relatorios_ministeriais (ano);
CREATE INDEX IF NOT EXISTS idx_relmin_oficial ON relatorios_ministeriais (oficial_id);

-- RLS
ALTER TABLE relatorios_ministeriais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relmin_select" ON relatorios_ministeriais
  FOR SELECT USING (true);

CREATE POLICY "relmin_insert" ON relatorios_ministeriais
  FOR INSERT WITH CHECK (true);

CREATE POLICY "relmin_update" ON relatorios_ministeriais
  FOR UPDATE USING (true);
