-- ============================================================
-- Resoluções da 37ª RO - 1ª RE - 04/09/2026
-- Vincula documentos à Comissão I (Plenário) e cria as resoluções
-- ============================================================

DO $$
DECLARE
  v_reuniao_id  uuid;
  v_comissao_id uuid;
  v_doc_id      uuid;
BEGIN

  -- IDs base
  SELECT id INTO v_reuniao_id FROM reunioes WHERE numero = '37ª RO - 1ª RE - 2026';
  SELECT id INTO v_comissao_id FROM comissoes WHERE numero = 1 AND reuniao_id IS NULL;

  IF v_reuniao_id IS NULL THEN
    RAISE EXCEPTION 'Reunião não encontrada. Execute migration 019 primeiro.';
  END IF;

  IF v_comissao_id IS NULL THEN
    RAISE EXCEPTION 'Comissão I (Plenário) não encontrada. Execute migration 008 primeiro.';
  END IF;

  -- --------------------------------------------------------
  -- 1. Atribuir Comissão I a todos os documentos da reunião
  -- --------------------------------------------------------
  UPDATE documentos
  SET comissao_id = v_comissao_id
  WHERE reuniao_id = v_reuniao_id
    AND comissao_id IS NULL;

  -- --------------------------------------------------------
  -- 2. Atualizar texto da proposta em cada documento
  -- --------------------------------------------------------

  -- Doc 01 - Termo de Convocação (arquivado, sem resolução)
  UPDATE documentos SET proposta = 'Toma-se conhecimento e arquiva-se.'
  WHERE reuniao_id = v_reuniao_id AND numero = 1;

  -- Doc 02 - Credencial IP Penha
  UPDATE documentos SET proposta = 'Toma-se conhecimento.'
  WHERE reuniao_id = v_reuniao_id AND numero = 2;

  -- Doc 03 - IP Vila Buenos Aires
  UPDATE documentos SET proposta = 'O PSSP-E 1 - 2026 Resolve: Aprovar a designação do Rev. Vagner de Jesus Queiros como Pastor Auxiliar da Igreja Presbiteriana de Vila Buenos Aires para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 3;

  -- Doc 04 - IP Penha - Campo Ministerial
  UPDATE documentos SET proposta = 'O PSSP-E 2 - 2026 Resolve: Aprovar a proposta de distribuição do campo ministerial da Igreja Presbiteriana da Penha para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 4;

  -- Doc 05 - IP Vila Lais - Rev. Maycon
  UPDATE documentos SET proposta = 'O PSSP-E 3 - 2026 Resolve: Aprovar a permanência do Rev. Maycon Rodrigues como Pastor da Igreja Presbiteriana de Vila Lais para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 5;

  -- Doc 06 - IP Jardim Popular - Rev. Laércio
  UPDATE documentos SET proposta = 'O PSSP-E 4 - 2026 Resolve: Aprovar a permanência do Rev. Laércio Máximo Rodrigues como Pastor Efetivo de tempo parcial da Igreja Presbiteriana do Jardim Popular para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 6;

  -- Doc 07 - APMT - Rev. Jessé
  UPDATE documentos SET proposta = 'O PSSP-E 5 - 2026 Resolve: Aprovar a cessão e o apoio financeiro da APMT ao Rev. Jessé Silveira Fogaça para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 7;

  -- Doc 08 - APMT - Rev. Gustavo
  UPDATE documentos SET proposta = 'O PSSP-E 6 - 2026 Resolve: Aprovar a cessão e o apoio financeiro da APMT ao Rev. Gustavo Alex Faria Custódio para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 8;

  -- Doc 09 - APMT - Rev. Jairo
  UPDATE documentos SET proposta = 'O PSSP-E 7 - 2026 Resolve: Aprovar a cessão da APMT ao Rev. Jairo Isac Rodrigues para o ano de 2027; encaminhar o apoio financeiro à Comissão de Finanças para as providências cabíveis.'
  WHERE reuniao_id = v_reuniao_id AND numero = 9;

  -- Doc 10 - APMT - Rev. Cornélio
  UPDATE documentos SET proposta = 'O PSSP-E 8 - 2026 Resolve: Aprovar a cessão da APMT ao Rev. Cornélio Caldeiras de Castro para o ano de 2027; encaminhar o apoio financeiro à Comissão de Finanças para as providências cabíveis.'
  WHERE reuniao_id = v_reuniao_id AND numero = 10;

  -- Doc 11 - Paulo Caetano Nichida Socio (Ofício)
  UPDATE documentos SET proposta = 'O PSSP-E 9 - 2026 Resolve: Aprovar a manutenção da candidatura ao Sagrado Ministério do candidato Paulo Caetano Nichida Socio, com a condição de que o candidato entregue os trabalhos exigidos até 15 de novembro de 2026.'
  WHERE reuniao_id = v_reuniao_id AND numero = 11;

  -- Doc 12 - Paulo Caetano Nichida Socio (Relatório Pastoral) - mesmo resolve do doc 11
  UPDATE documentos SET proposta = 'Vide Doc. 011.', status = 'aprovado'
  WHERE reuniao_id = v_reuniao_id AND numero = 12;

  -- Doc 13 - Congregação JP Itaquaquecetuba
  UPDATE documentos SET proposta = 'Toma-se conhecimento.'
  WHERE reuniao_id = v_reuniao_id AND numero = 13;

  -- Doc 14 - IP Jardim Castelo - Rev. Daniel
  UPDATE documentos SET proposta = 'O PSSP-E 10 - 2026 Resolve: Aprovar a permanência do Rev. Daniel Fogaça como Pastor Efetivo da Igreja Presbiteriana do Jardim Castelo para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 14;

  -- Doc 15 - Presbitério de Tatuí - Rev. Paulo Andrés
  UPDATE documentos SET proposta = 'O PSSP-E 11 - 2026 Resolve: Aprovar a transferência do Rev. Paulo Andrés Erben Castro para o Presbitério de Tatuí — PTTI, devendo ser expedida a respectiva carta de transferência.'
  WHERE reuniao_id = v_reuniao_id AND numero = 15;

  -- Doc 16 - IP Vila Esperança - Rev. Israel
  UPDATE documentos SET proposta = 'O PSSP-E 12 - 2026 Resolve: Aprovar a renovação da designação do Rev. Israel Scalioni como Pastor da Igreja Presbiteriana de Vila Esperança para o ano de 2027.'
  WHERE reuniao_id = v_reuniao_id AND numero = 16;

  -- Doc 17 - Resultado Financeiro (ciência, sem resolução)
  UPDATE documentos SET proposta = 'Toma-se conhecimento.'
  WHERE reuniao_id = v_reuniao_id AND numero = 17;

  -- --------------------------------------------------------
  -- 3. Criar resoluções e vincular aos documentos
  -- --------------------------------------------------------

  -- Resolução 1 — Doc 03
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 3;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 1,
    'Designação do Rev. Vagner de Jesus Queiros como Pastor Auxiliar da IP Vila Buenos Aires — 2027',
    'Aprovar a designação do Rev. Vagner de Jesus Queiros como Pastor Auxiliar da Igreja Presbiteriana de Vila Buenos Aires para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 2 — Doc 04
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 4;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 2,
    'Distribuição do Campo Ministerial da IP Penha — 2027',
    'Aprovar a proposta de distribuição do campo ministerial da Igreja Presbiteriana da Penha para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 3 — Doc 05
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 5;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 3,
    'Permanência do Rev. Maycon Rodrigues como Pastor da IP Vila Lais — 2027',
    'Aprovar a permanência do Rev. Maycon Rodrigues como Pastor da Igreja Presbiteriana de Vila Lais para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 4 — Doc 06
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 6;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 4,
    'Permanência do Rev. Laércio Máximo Rodrigues como Pastor Efetivo de tempo parcial da IP Jardim Popular — 2027',
    'Aprovar a permanência do Rev. Laércio Máximo Rodrigues como Pastor Efetivo de tempo parcial da Igreja Presbiteriana do Jardim Popular para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 5 — Doc 07
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 7;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 5,
    'Cessão e Apoio Financeiro da APMT ao Rev. Jessé Silveira Fogaça — 2027',
    'Aprovar a cessão e o apoio financeiro da APMT ao Rev. Jessé Silveira Fogaça para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 6 — Doc 08
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 8;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 6,
    'Cessão e Apoio Financeiro da APMT ao Rev. Gustavo Alex Faria Custódio — 2027',
    'Aprovar a cessão e o apoio financeiro da APMT ao Rev. Gustavo Alex Faria Custódio para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 7 — Doc 09
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 9;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 7,
    'Cessão da APMT ao Rev. Jairo Isac Rodrigues — 2027',
    'Aprovar a cessão da APMT ao Rev. Jairo Isac Rodrigues para o ano de 2027; encaminhar o apoio financeiro à Comissão de Finanças para as providências cabíveis.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 8 — Doc 10
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 10;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 8,
    'Cessão da APMT ao Rev. Cornélio Caldeiras de Castro — 2027',
    'Aprovar a cessão da APMT ao Rev. Cornélio Caldeiras de Castro para o ano de 2027; encaminhar o apoio financeiro à Comissão de Finanças para as providências cabíveis.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 9 — Docs 11 e 12 (vinculada ao doc 11)
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 11;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 9,
    'Manutenção de Candidatura de Paulo Caetano Nichida Socio',
    'Aprovar a manutenção da candidatura ao Sagrado Ministério do candidato Paulo Caetano Nichida Socio, com a condição de que o candidato entregue os trabalhos exigidos até 15 de novembro de 2026.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 10 — Doc 14
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 14;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 10,
    'Permanência do Rev. Daniel Fogaça como Pastor Efetivo da IP Jardim Castelo — 2027',
    'Aprovar a permanência do Rev. Daniel Fogaça como Pastor Efetivo da Igreja Presbiteriana do Jardim Castelo para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 11 — Doc 15
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 15;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 11,
    'Transferência do Rev. Paulo Andrés Erben Castro para o Presbitério de Tatuí — PTTI',
    'Aprovar a transferência do Rev. Paulo Andrés Erben Castro para o Presbitério de Tatuí — PTTI, devendo ser expedida a respectiva carta de transferência.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Resolução 12 — Doc 16
  SELECT id INTO v_doc_id FROM documentos WHERE reuniao_id = v_reuniao_id AND numero = 16;
  INSERT INTO resolucoes (documento_id, reuniao_id, numero, ementa, texto, status, data)
  VALUES (v_doc_id, v_reuniao_id, 12,
    'Renovação da designação do Rev. Israel Scalioni como Pastor da IP Vila Esperança — 2027',
    'Aprovar a renovação da designação do Rev. Israel Scalioni como Pastor da Igreja Presbiteriana de Vila Esperança para o ano de 2027.',
    'aprovada', '2026-09-04')
  ON CONFLICT (reuniao_id, numero) DO UPDATE SET
    documento_id = EXCLUDED.documento_id,
    ementa = EXCLUDED.ementa,
    texto = EXCLUDED.texto;

  -- Atualizar status dos documentos com resolução para 'aprovado'
  UPDATE documentos
  SET status = 'aprovado'
  WHERE reuniao_id = v_reuniao_id
    AND numero IN (3,4,5,6,7,8,9,10,11,12,14,15,16);

  RAISE NOTICE 'Resoluções criadas e documentos vinculados com sucesso.';
END $$;
