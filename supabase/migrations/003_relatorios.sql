-- Relatórios Anuais de Igreja e Ministro
-- Substitui as planilhas Excel enviadas pelas igrejas ao presbitério

CREATE TABLE relatorios_anuais (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ano integer NOT NULL,
  igreja_id uuid REFERENCES igrejas(id) ON DELETE CASCADE,
  submetido_por uuid REFERENCES perfis(id),
  status text NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','submetido','em_revisao','aprovado','devolvido')),

  -- Aba 1: Relatório do Ministro (preenchido pelo pastor)
  ministro jsonb DEFAULT '{}'::jsonb,

  -- Aba 2: Relatório do Conselho ou Mesa Administrativa
  conselho jsonb DEFAULT '{}'::jsonb,

  -- Aba 3: Congregação (opcional — para igrejas com congregações vinculadas)
  congregacao jsonb DEFAULT '{}'::jsonb,

  -- Aba 4: Cadastro & Estatística
  cadastro_estatistica jsonb DEFAULT '{}'::jsonb,

  -- Aprovação/devolução pela Comissão Executiva
  revisado_por uuid REFERENCES perfis(id),
  revisado_em timestamptz,
  observacoes_revisao text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(ano, igreja_id)
);

CREATE INDEX relatorios_anuais_ano_idx ON relatorios_anuais(ano);
CREATE INDEX relatorios_anuais_status_idx ON relatorios_anuais(status);

-- Trigger updated_at
CREATE TRIGGER relatorios_updated_at
  BEFORE UPDATE ON relatorios_anuais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE relatorios_anuais ENABLE ROW LEVEL SECURITY;

-- Secretários: acesso total
CREATE POLICY "secretarios_relatorios_all"
  ON relatorios_anuais FOR ALL
  TO authenticated
  USING (is_secretario())
  WITH CHECK (is_secretario());

-- Outros: leitura apenas de aprovados
CREATE POLICY "outros_relatorios_read_aprovados"
  ON relatorios_anuais FOR SELECT
  TO authenticated
  USING (
    NOT is_secretario()
    AND status = 'aprovado'
  );

GRANT SELECT, INSERT, UPDATE ON relatorios_anuais TO authenticated;
