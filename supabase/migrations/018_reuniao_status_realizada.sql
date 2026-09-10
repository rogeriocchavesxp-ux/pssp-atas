-- Adicionar status 'realizada' ao CHECK constraint de reunioes
ALTER TABLE reunioes DROP CONSTRAINT IF EXISTS reunioes_status_check;
ALTER TABLE reunioes ADD CONSTRAINT reunioes_status_check
  CHECK (status IN ('convocada','em_andamento','encerrada','ata_em_producao','ata_aprovada','publicada','realizada'));
