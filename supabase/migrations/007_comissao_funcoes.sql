-- Atualiza funções dos membros de comissão: relator e membro
ALTER TABLE comissao_membros DROP CONSTRAINT IF EXISTS comissao_membros_funcao_check;
ALTER TABLE comissao_membros ADD CONSTRAINT comissao_membros_funcao_check
  CHECK (funcao IN ('relator','membro'));

-- Migra registros existentes
UPDATE comissao_membros SET funcao = 'relator' WHERE funcao IN ('presidente','secretario');
ALTER TABLE comissao_membros ALTER COLUMN funcao SET DEFAULT 'membro';
