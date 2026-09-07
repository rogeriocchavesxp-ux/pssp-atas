ALTER TABLE seminaristas
  ADD COLUMN IF NOT EXISTS ano_inicio   integer,
  ADD COLUMN IF NOT EXISTS ano_formacao integer;
