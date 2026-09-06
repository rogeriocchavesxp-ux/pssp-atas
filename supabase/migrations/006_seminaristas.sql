CREATE TABLE IF NOT EXISTS seminaristas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  email       text,
  telefone    text,
  seminario   text,
  curso_ano   integer,
  status      text NOT NULL DEFAULT 'cursando'
                CHECK (status IN ('cursando','licenciado','aprovado','desistiu')),
  igreja_id   uuid REFERENCES igrejas(id) ON DELETE SET NULL,
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seminaristas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos leem seminaristas" ON seminaristas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Secretário gerencia seminaristas" ON seminaristas FOR ALL USING (is_secretario());

GRANT ALL ON seminaristas TO authenticated;
GRANT ALL ON seminaristas TO anon;
