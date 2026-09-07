CREATE TABLE IF NOT EXISTS comissao_executiva (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL,
  cargo text NOT NULL CHECK (cargo IN (
    'presidente', 'vice_presidente', 'secretario_executivo',
    '1_secretario', '2_secretario', 'tesoureiro'
  )),
  nome text NOT NULL,
  oficial_id uuid REFERENCES oficiais(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ano, cargo)
);

ALTER TABLE comissao_executiva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos leem comissao_executiva"
  ON comissao_executiva FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Secretário gerencia comissao_executiva"
  ON comissao_executiva FOR ALL USING (is_secretario());

GRANT ALL ON comissao_executiva TO authenticated;
