-- Adiciona papel secretario_executivo ao check constraint
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_papel_check;
ALTER TABLE perfis ADD CONSTRAINT perfis_papel_check
  CHECK (papel IN ('admin','secretario','secretario_executivo','moderador','presbitero','pastor'));
