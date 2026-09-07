-- Presidente pode atualizar status de documentos (aprovar/rejeitar/devolver)
CREATE POLICY "Presidente atualiza documentos"
  ON documentos FOR UPDATE
  USING (papel_atual() = 'presidente')
  WITH CHECK (papel_atual() = 'presidente');

-- Presidente pode criar resoluções (ao aprovar uma proposta)
CREATE POLICY "Presidente cria resolucoes"
  ON resolucoes FOR INSERT
  WITH CHECK (papel_atual() = 'presidente');

-- Presidente lê todas as atas (não apenas aprovadas)
CREATE POLICY "Presidente le todas as atas"
  ON atas FOR SELECT
  USING (papel_atual() = 'presidente');
