-- Corrige pdf_url dos documentos importados:
-- Remove o prefixo da URL pública e mantém só o caminho no bucket
UPDATE documentos
SET pdf_url = regexp_replace(pdf_url, '^.*/object/public/documentos/', '')
WHERE pdf_url LIKE '%/object/public/documentos/%';
