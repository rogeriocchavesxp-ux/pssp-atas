CREATE TABLE IF NOT EXISTS candidatos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text NOT NULL,
  email          text,
  telefone       text,
  data_candidatura date,
  tutor_id       uuid REFERENCES oficiais(id) ON DELETE SET NULL,
  igreja_id      uuid REFERENCES igrejas(id) ON DELETE SET NULL,
  status         text NOT NULL DEFAULT 'em_processo'
                   CHECK (status IN ('em_processo', 'aprovado', 'recusado', 'desistiu')),
  observacoes    text,
  ativo          boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos leem candidatos" ON candidatos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Secretário gerencia candidatos" ON candidatos FOR ALL USING (is_secretario());

GRANT ALL ON candidatos TO authenticated;
