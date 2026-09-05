-- Bucket de armazenamento para documentos do presbitério
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,
  20971520, -- 20 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao storage
-- Secretários: leitura e escrita totais
CREATE POLICY "secretarios_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos' AND is_secretario());

CREATE POLICY "secretarios_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documentos' AND is_secretario());

CREATE POLICY "secretarios_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documentos' AND is_secretario());

-- Outros autenticados: leitura de todos os arquivos
CREATE POLICY "autenticados_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos' AND NOT is_secretario());
