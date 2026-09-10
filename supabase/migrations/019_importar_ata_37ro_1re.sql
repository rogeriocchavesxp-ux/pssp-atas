-- ============================================================
-- Importar Ata: 37ª RO - 1ª RE - 04/09/2026
-- Fonte: Obsidian — PSSP — 37ª RO — 1ª RE — 2026-09-04 (rascunho).md
-- ============================================================

-- Garantir que as migrations 017 e 018 estejam aplicadas
ALTER TABLE atas DROP CONSTRAINT IF EXISTS atas_status_check;
ALTER TABLE atas ADD CONSTRAINT atas_status_check
  CHECK (status IN ('rascunho','em_aprovacao','em_revisao','aprovada','publicada'));

ALTER TABLE reunioes DROP CONSTRAINT IF EXISTS reunioes_status_check;
ALTER TABLE reunioes ADD CONSTRAINT reunioes_status_check
  CHECK (status IN ('convocada','em_andamento','encerrada','ata_em_producao','ata_aprovada','publicada','realizada'));

CREATE OR REPLACE FUNCTION is_secretario()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT papel_atual() IN ('admin','secretario','secretario_executivo')
$$;

-- ============================================================
DO $$
DECLARE
  v_reuniao_id uuid;
  v_verificacao text;
  v_preparatoria text;
  v_regular text;
BEGIN

v_verificacao := $txt$ATA DO ATO DE VERIFICAÇÃO DE PODERES DA 1a REUNIÃO EXTRAORDINÁRIA DA 37a REUNIÃO ORDINÁRIA DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP Às 19h30m, do dia quatro de setembro de dois mil e vinte e seis (04/09/2026), na Igreja Presbiteriana do Jardim Popular, situada na Rua Itapiruçu n.º 347, Jardim Popular, São Paulo - Capital, reúne-se, previamente convocado, o Presbitério Leste de São Paulo - PSSP. Composição da Mesa: Reverendo Amauri Costa de Oliveira, Presidente; Reverendo Fábio Luiz de Carvalho, Vice-presidente; Presbítero Anízio Alves Borges, Secretário Executivo; Reverendo Laércio Máximo Rodrigues, 1o Secretário; Reverendo Rogério de Castro Chaves, 2o Secretário; e Reverendo Atsushi Miyajima, Tesoureiro. Feita a chamada pelo Secretário Executivo, registram-se a presença dos seguintes ministros: [MINISTROS PRESENTES]. Todos os presentes assinaram o Livro de Presença do Concílio. Ausentaram-se os seguintes ministros: [MINISTROS AUSENTES]. Registram-se a presença das seguintes igrejas, por meio de seus representantes: [IGREJAS E REPRESENTANTES]. Ausentes os representantes das Igrejas: [IGREJAS AUSENTES]. Havendo quórum, às [HORA], o Presidente, Rev. Amauri Costa de Oliveira, declara instalada a 1a Reunião Extraordinária da 37a Reunião Ordinária do Presbitério Leste de São Paulo - PSSP. Às [HORA], encerra-se a sessão de verificação de poderes com oração feita pelo Rev. [QUEM]. E para constar eu, Reverendo Rogério de Castro Chaves, 2o Secretário, a tudo presente, digito, dato, e assino a presente ATA, a qual será transcrita pelo Secretário Executivo, Presbítero Anízio Alves Borges, em livro próprio. São Paulo, 04 de setembro de 2026.$txt$;

v_preparatoria := $txt$ATA DA SESSÃO PREPARATÓRIA DA 1a REUNIÃO EXTRAORDINÁRIA DA 37a REUNIÃO ORDINÁRIA DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP Aos quatro dias do mês de setembro de dois mil e vinte e seis (04/09/2026), às 20h05m, passa-se ao exercício devocional. Entoam-se os cânticos "Grande é o Senhor" e "Grandioso és Tu", conduzidos pelo Reverendo Fábio Luiz de Carvalho. Em seguida, o Rev. César Veríssimo Marinho dos Reis ora ao Senhor, agradecendo pelas misericórdias do Senhor e pedindo que o Senhor use o Presbitério e que a reunião seja conduzida pelo poder do Espírito Santo. O Rev. Amauri Costa de Oliveira faz a leitura do texto bíblico de Atos 8.1-8 e ministra sob o tema: "Grande perseguição, grande pranto e grande alegria", fundamentando a mensagem nos seguintes argumentos: 1) Grande perseguição — a morte de Estevão, diácono de ofício nobre e papel missionário, desencadeou grande perseguição contra a Igreja em Jerusalém, dispersando todos os cristãos exceto os apóstolos; a perseguição jamais freou a Igreja, pois a maior barreira ao avanço do Evangelho não está fora, nos ataques do diabo ou de governos, mas dentro, no acovardamento e falta de comprometimento dos cristãos com a missão; 2) Grande pranto — houve grande luto pela morte injusta de Estevão e pela perda da comunidade reunida em Jerusalém, somando-se a dor pessoal, a perda de bens e estrutura, e o fim daquela celebração com milhares; 3) Grande alegria — pela providência soberana de Deus, toda tragédia serviu ao avanço do Evangelho: os dispersos pregaram por toda parte; Felipe desceu a Samaria e multidões foram convertidas, espíritos imundos expulsos e enfermos curados, culminando em grande alegria naquela cidade; o que parece derrota Deus converte em bênção, governando a história da Igreja e de cada crente até a grande alegria final. Às [HORA], encerra-se o exercício devocional com oração feita pelo Rev. Filipe Gomes Checon Pereira. E, para constar, eu, Rev. Rogério de Castro Chaves, 2o Secretário, presente a tudo, redijo, datilho e assino a presente ata, a qual será transcrita pelo Secretário Executivo, Presbítero Anízio Alves Borges. São Paulo, 04 de setembro de 2026.$txt$;

v_regular := $txt$ATA DA SESSÃO REGULAR ÚNICA DA 1a REUNIÃO EXTRAORDINÁRIA DA 37a REUNIÃO ORDINÁRIA DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP Às [HORA], sob a presidência do Rev. Amauri Costa de Oliveira, inicia-se a sessão regular única da 1a Reunião Extraordinária da 37a RO do PSSP. O Rev. [QUEM] ora ao Senhor, [DESCRIÇÃO]. Doc. 01, Termo de Convocação. Toma-se conhecimento e arquiva-se. Doc. 02, Credencial da Igreja Presbiteriana da Penha ao Presbitério para o ano de 2026. [DELIBERAÇÃO]. Doc. 03, Carta da Igreja Presbiteriana de Vila Buenos Aires solicitando a designação do Rev. Vagner de Jesus Queiros como Pastor Auxiliar para o ano de 2027. O PSSP resolve aprovar a designação do Rev. Vagner de Jesus Queiros como Pastor Auxiliar da Igreja Presbiteriana de Vila Buenos Aires para o ano de 2027. Doc. 04, Carta da Igreja Presbiteriana da Penha apresentando a distribuição do campo ministerial para o ano de 2027. O PSSP resolve aprovar a proposta apresentada. Doc. 05, Carta da Igreja Presbiteriana de Vila Lais solicitando a permanência do Rev. Maycon Rodrigues como Pastor para o ano de 2027. O PSSP resolve aprovar. Doc. 06, Carta da Igreja Presbiteriana do Jardim Popular solicitando a permanência do Rev. Laércio Máximo Rodrigues como Pastor Efetivo de tempo parcial para o ano de 2027. O PSSP resolve aprovar. Doc. 07, Carta de Cessão e Apoio Financeiro da APMT referente ao Rev. Jessé Silveira Fogaça, para o ano de 2027. O PSSP resolve aprovar a cessão e o apoio financeiro. Doc. 08, Carta de Cessão e Apoio Financeiro da APMT referente ao Rev. Gustavo Alex Faria Custódio, para o ano de 2027. O PSSP resolve aprovar a cessão e o apoio financeiro. Doc. 09, Carta de Cessão e Apoio Financeiro da APMT referente ao Rev. Jairo Isac Rodrigues, para o ano de 2027. O PSSP resolve aprovar a cessão; quanto ao apoio financeiro, encaminha-se à Comissão de Finanças para as providências cabíveis. Doc. 10, Carta de Cessão e Apoio Financeiro da APMT referente ao Rev. Cornélio Caldeiras de Castro, para o ano de 2027. O PSSP resolve aprovar a cessão; quanto ao apoio financeiro, encaminha-se à Comissão de Finanças para as providências cabíveis. Docs. 11 e 12, Ofício e Relatório Pastoral de Acompanhamento Ministerial referentes à manutenção da candidatura ao Sagrado Ministério do candidato Paulo Caetano Nichida Socio. O PSSP resolve aprovar a manutenção da candidatura, com a condição de que o candidato entregue os trabalhos exigidos até 15 de novembro de 2026. Doc. 15, Ofício do Presbitério de Tatuí — PTTI solicitando a transferência do Rev. Paulo Andrés Erben Castro para seus campos. O PSSP resolve aprovar a transferência do Rev. Paulo Andrés Erben Castro para o Presbitério de Tatuí, devendo ser expedida a respectiva carta de transferência. O Rev. Daniel Fogaça ora ao Senhor, agradecendo pela vida e ministério do Rev. Paulo Andrés Erben Castro. Doc. 14, Carta da Igreja Presbiteriana do Jardim Castelo solicitando a permanência do Rev. Daniel Fogaça como Pastor Efetivo para o ano de 2027. O PSSP resolve aprovar. Doc. 13, Relatório da Congregação Presbiteriana no Jardim Primavera — Itaquaquecetuba, referente ao ano de 2026. [DELIBERAÇÃO]. Doc. 16, Carta da Igreja Presbiteriana de Vila Esperança solicitando a renovação da designação do Rev. Israel Scalioni como Pastor para o ano de 2027. O PSSP resolve aprovar. O Rev. Vagner de Jesus Queiros apresenta, em nome da Comissão de Finanças, o resultado parcial financeiro do Presbitério referente ao exercício de 2026. Toma-se conhecimento. O Presbitério delibera sobre a situação do Rev. Carlos Roberto Spiazzi, verificando-se a ausência de pedido de campo formalizado e a ausência do referido ministro às reuniões do Concílio. O PSSP resolve que a Comissão Executiva deve acioná-lo para que regularize sua situação. Delibera-se ainda sobre a situação dos Reverendos Atsushi Miyajima e Michael Fassheber Valim Cruz, delegando-se poderes à Comissão Executiva para, uma vez recebido pedido de campo, aprovar a cessão. O Presbitério registra voto de agradecimento à Igreja Presbiteriana do Jardim Popular e seu Conselho pela cessão do templo para a realização desta reunião. Informa-se que a próxima reunião do Presbitério será realizada no dia 06 de novembro de 2026, ocasião em que se procederá à eleição da nova Diretoria. Encerra-se a reunião às 22h27m, com a oração do Rev. Ricardo Riul, que ora pela vida e pelos desafios do Rev. Cornélio Caldeiras de Castro e pelo trabalho missionário no Paraguai. E para constar eu, Rev. Rogério de Castro Chaves, 2o Secretário, a tudo presente, digito, dato e assino a presente ata, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges, em livro próprio. São Paulo, 04 de setembro de 2026.$txt$;

  -- Criar ou localizar a reunião
  INSERT INTO reunioes (numero, tipo, data_inicio, data_fim, local, cidade, status)
  VALUES (
    '37ª RO - 1ª RE - 2026',
    'extraordinaria',
    '2026-09-04',
    '2026-09-04',
    'IP Jardim Popular — Rua Itapiruçu nº 347',
    'São Paulo',
    'encerrada'
  )
  ON CONFLICT (numero) DO UPDATE
    SET status = 'encerrada', data_fim = '2026-09-04'
  RETURNING id INTO v_reuniao_id;

  -- Criar ou atualizar a ata
  INSERT INTO atas (reuniao_id, conteudo, status)
  VALUES (
    v_reuniao_id,
    json_build_object(
      'verificacao_poderes', v_verificacao,
      'sessao_preparatoria', v_preparatoria,
      'sessoes_regulares', json_build_array(v_regular),
      'observacoes', ''
    )::jsonb,
    'rascunho'
  )
  ON CONFLICT (reuniao_id) DO UPDATE
    SET conteudo = EXCLUDED.conteudo,
        updated_at = now();

  RAISE NOTICE 'Ata importada para reunião %', v_reuniao_id;
END $$;
