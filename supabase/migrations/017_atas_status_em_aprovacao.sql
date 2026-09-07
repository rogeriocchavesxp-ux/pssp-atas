-- Adicionar status em_aprovacao na tabela atas
ALTER TABLE atas DROP CONSTRAINT IF EXISTS atas_status_check;
ALTER TABLE atas ADD CONSTRAINT atas_status_check
  CHECK (status IN ('rascunho','em_aprovacao','em_revisao','aprovada','publicada'));

-- Incluir secretario_executivo na função is_secretario
CREATE OR REPLACE FUNCTION is_secretario()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT papel_atual() IN ('admin','secretario','secretario_executivo')
$$;
