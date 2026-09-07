-- Adiciona novos status de documento
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_status_check;
ALTER TABLE documentos ADD CONSTRAINT documentos_status_check
  CHECK (status IN ('recebido','em_analise','em_votacao','aprovado','rejeitado','arquivado','retirado'));

-- Adiciona papel presidente em perfis
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_papel_check;
ALTER TABLE perfis ADD CONSTRAINT perfis_papel_check
  CHECK (papel IN ('admin','moderador','secretario','secretario_executivo','presbitero','pastor','presidente'));

-- Trigger: ao atribuir comissao_id, muda status para em_analise
CREATE OR REPLACE FUNCTION fn_doc_comissao_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.comissao_id IS NOT NULL AND (OLD.comissao_id IS NULL OR OLD.comissao_id != NEW.comissao_id) THEN
    IF NEW.status = 'recebido' THEN
      NEW.status := 'em_analise';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doc_comissao_status ON documentos;
CREATE TRIGGER trg_doc_comissao_status
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION fn_doc_comissao_status();
