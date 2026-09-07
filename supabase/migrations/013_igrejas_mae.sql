ALTER TABLE igrejas
  ADD COLUMN IF NOT EXISTS igreja_mae_id uuid REFERENCES igrejas(id) ON DELETE SET NULL;

-- Vincula congregações e missão da IP Penha
UPDATE igrejas
SET igreja_mae_id = (SELECT id FROM igrejas WHERE sigla = 'IPPenha' LIMIT 1)
WHERE sigla IN ('CP Anália', 'CP Jd Primavera', 'CP V Rosária', 'IP Hispana');
