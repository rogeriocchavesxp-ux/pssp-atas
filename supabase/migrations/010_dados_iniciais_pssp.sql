-- ============================================================
-- Migration 010: Dados históricos extraídos das atas do PSSP
-- Fonte: 15ª RO (2014), 34ª RO (2024), 35ª–37ª RO (2024–2026)
-- Idempotente: usa WHERE NOT EXISTS em todas as inserções
-- ============================================================

-- ── IGREJAS ──────────────────────────────────────────────────

INSERT INTO igrejas (nome, sigla, cidade, bairro, tipo, ativa)
SELECT v.nome, v.sigla, v.cidade, v.bairro, v.tipo, v.ativa
FROM (VALUES
  ('Igreja Presbiteriana da Penha',              'IPPenha',        'São Paulo',       'Penha',            'sede'::text,        true),
  ('Igreja Presbiteriana de Vila Buenos Aires',  'IP VBA',         'São Paulo',       'Vila Buenos Aires','sede',              true),
  ('Igreja Presbiteriana do Jardim Castelo',     'IP Jd Castelo',  'São Paulo',       'Jardim Castelo',   'sede',              true),
  ('Igreja Presbiteriana do Jardim Popular',     'IP Jd Popular',  'Itaquaquecetuba', 'Jardim Popular',   'sede',              true),
  ('Igreja Presbiteriana de Vila Lais',          'IP Vila Lais',   'São Paulo',       'Vila Lais',        'sede',              true),
  ('Igreja Presbiteriana de Vila Esperança',     'IP V Esperança', 'São Paulo',       'Vila Esperança',   'sede',              true),
  ('Congregação Presbiteriana Anália Franco',    'CP Anália',      'São Paulo',       'Vila Formosa',     'congregacao',       true),
  ('Congregação Presbiteriana Jardim Primavera', 'CP Jd Primavera','Itaquaquecetuba', 'Jardim Primavera', 'congregacao',       true),
  ('Congregação Presbiteriana Vila Rosária',     'CP V Rosária',   'São Paulo',       'Vila Rosária',     'congregacao',       true),
  ('Igreja Presbiteriana Hispana',               'IP Hispana',     'São Paulo',       'Cangaíba',         'missao',            true)
) AS v(nome, sigla, cidade, bairro, tipo, ativa)
WHERE NOT EXISTS (SELECT 1 FROM igrejas WHERE igrejas.sigla = v.sigla);

-- ── OFICIAIS – PASTORES (IP da Penha) ────────────────────────

INSERT INTO oficiais (nome, tipo, cargo, email, telefone, igreja_id, ativo)
SELECT v.nome, v.tipo, v.cargo, v.email, v.telefone,
       (SELECT id FROM igrejas WHERE sigla = 'IPPenha' LIMIT 1),
       true
FROM (VALUES
  ('Amauri Costa de Oliveira',          'pastor'::text, 'Pastor Efetivo',            null::text,             '11954022717'::text),
  ('Adriano Pedrosa Ferreira',          'pastor',       'Pastor Auxiliar',           null,                    null),
  ('Atsushi Miyajima',                  'pastor',       'Pastor Auxiliar',           null,                    null),
  ('Carlos Alberto Henrique',           'pastor',       'Pastor Auxiliar',           null,                    '11983354528'),
  ('Carlos Eduardo Corrêa Lima',        'pastor',       'Pastor Auxiliar',           null,                    '11993812917'),
  ('Cornélio Caldeira de Castro',       'pastor',       'Pastor Auxiliar',           null,                    null),
  ('Fábio Luiz de Carvalho',            'pastor',       'Pastor Auxiliar',           null,                    null),
  ('Filipe Gomes Checon Pereira',       'pastor',       'Pastor Auxiliar',           null,                    '11949369668'),
  ('Jean Francesco Afonso Lima Gomes',  'pastor',       'Pastor Auxiliar (EUA)',     null,                    null),
  ('Juliano Caetano Socio',             'pastor',       'Pastor Auxiliar (EUA)',     null,                    null),
  ('Ricardo Riul',                      'pastor',       'Pastor Auxiliar',           null,                    null),
  ('Rogério de Castro Chaves',          'pastor',       'Pastor Auxiliar',           'rgocastro@icloud.com',  null),
  ('Wellington Aparecido Costa Baldez', 'pastor',       'Pastor Auxiliar (Bolívia)', null,                    null),
  ('Paulo Andrés Erben Castro',         'pastor',       'Pastor Auxiliar',           'erbenpaulo@gmail.com',  null),
  ('Ayrton da Silva Moreira Gomes',     'pastor',       'Licença art. 37 CI/IPB',   null,                    null)
) AS v(nome, tipo, cargo, email, telefone)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- ── OFICIAIS – PASTORES (IP Vila Buenos Aires) ───────────────

INSERT INTO oficiais (nome, tipo, cargo, email, telefone, igreja_id, ativo)
SELECT v.nome, v.tipo, v.cargo, null, v.telefone,
       (SELECT id FROM igrejas WHERE sigla = 'IP VBA' LIMIT 1),
       true
FROM (VALUES
  ('César Veríssimo Marinho dos Reis', 'pastor'::text, 'Pastor Efetivo',  '11997175538'::text),
  ('Vagner de Jesus Queirós',          'pastor',       'Pastor Auxiliar', null)
) AS v(nome, tipo, cargo, telefone)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- ── OFICIAIS – PASTORES (demais igrejas, um por vez) ─────────

INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Daniel Fogaça', 'pastor', 'Pastor Efetivo', '11981005990',
       (SELECT id FROM igrejas WHERE sigla = 'IP Jd Castelo' LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Daniel Fogaça');

INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Laércio Máximo Rodrigues', 'pastor', 'Pastor Efetivo', '11974027852',
       (SELECT id FROM igrejas WHERE sigla = 'IP Jd Popular' LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Laércio Máximo Rodrigues');

INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Maycon Rodrigues', 'pastor', 'Pastor', '11973820399',
       (SELECT id FROM igrejas WHERE sigla = 'IP Vila Lais' LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Maycon Rodrigues');

INSERT INTO oficiais (nome, tipo, cargo, igreja_id, ativo)
SELECT 'Israel Scalioni', 'pastor', 'Pastor',
       (SELECT id FROM igrejas WHERE sigla = 'IP V Esperança' LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Israel Scalioni');

INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Michael Fassheber Valim Cruz', 'pastor', 'Pastor', '11996813220',
       (SELECT id FROM igrejas WHERE sigla = 'CP Anália' LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Michael Fassheber Valim Cruz');

-- ── OFICIAIS – PASTORES (missionários / sem campo local) ─────

INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT v.nome, 'pastor', v.cargo, v.telefone, null, true
FROM (VALUES
  ('Gustavo Alex Faria Custódio',  'Pastor Missionário (Grécia)',      '11981829196'::text),
  ('Jairo Isac Rodrigues',         'Pastor Missionário (Hispanos)',    '11955581969'),
  ('Jessé Silveira Fogaça',        'Pastor Missionário (Timor Leste)', '117762 6495'),
  ('Carlos Roberto Spiazzi',       'Em disponibilidade',               null)
) AS v(nome, cargo, telefone)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- ── OFICIAIS – PRESBÍTEROS ───────────────────────────────────

INSERT INTO oficiais (nome, tipo, cargo, igreja_id, ativo)
SELECT v.nome, 'presbitero', v.cargo,
       (SELECT id FROM igrejas WHERE sigla = v.sigla LIMIT 1),
       true
FROM (VALUES
  ('Anízio Alves Borges',            'Secretário Executivo do PSSP', 'IPPenha'::text),
  ('Idenal Nishimura',               'Representante',                 'IP VBA'),
  ('William Cruz da Silva',          'Representante',                 'IP Jd Castelo'),
  ('Mauro Cruz',                     'Representante',                 'IP Jd Popular'),
  ('Cleber Rodrigues do Nascimento', 'Representante',                 'IP Vila Lais'),
  ('Eduardo Mendes Machado',         'Representante',                 'IP V Esperança'),
  ('Valdir Soranso',                 null::text,                      'IP Vila Lais'),
  ('Laércio Ferreira Lima',          null::text,                      'IPPenha')
) AS v(nome, cargo, sigla)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- ── SEMINARISTAS ─────────────────────────────────────────────

INSERT INTO seminaristas (nome, email, seminario, curso_ano, ano_inicio, ano_formacao, status, igreja_id, ativo)
SELECT v.nome, v.email, v.seminario, v.curso_ano, v.ano_inicio, v.ano_formacao, v.status,
       CASE WHEN v.sigla IS NOT NULL
            THEN (SELECT id FROM igrejas WHERE sigla = v.sigla LIMIT 1)
            ELSE null
       END,
       true
FROM (VALUES
  --                                                                                         curso  inicio    formação  (4 anos de curso)
  ('Guilherme Francisco Rodrigues Paes Athú', 'guilhermeathu@gmail.com',    'JMC',          2::int, 2025::int, 2028::int, 'cursando'::text,  'IPPenha'::text),
  ('Tiago Rocha Vargas Henrique',             'henriquertiago@outlook.com', 'SPS',          3::int, 2024::int, 2027::int, 'cursando',        'IPPenha'),
  ('Daniel Simões de Carvalho',               'dani3l244@gmail.com',        'SPS',          4::int, 2023::int, 2026::int, 'cursando',        'IPPenha'),
  ('Rafael Garcia de Sá',                     'rafagsa@gmail.com',          'SPS',          2::int, 2025::int, 2028::int, 'cursando',        null),
  ('Lucas Johann Cruvinel Carvalho',          'johanncruvinel@gmail.com',   'JMC',          3::int, 2024::int, 2027::int, 'cursando',        null),
  ('Sidney Faria dos Reis Júnior',            null::text,                   'SPS',          4::int, 2023::int, 2026::int, 'cursando',        'IPPenha'),
  ('Éfferson Soares Luz',                     null::text,                   'JMC',          null::int, null::int, 2024::int, 'licenciado',    null::text),
  ('Paulo Andrés Erben Castro',               'erbenpaulo@gmail.com',       'JMC',          null::int, 2022::int, 2025::int, 'aprovado',      'IPPenha'),
  ('Gabriel Bastos Ricci Justino',            null::text,                   'SPS',          null::int, null::int, 2025::int, 'aprovado',      null::text)
) AS v(nome, email, seminario, curso_ano, ano_inicio, ano_formacao, status, sigla)
WHERE NOT EXISTS (SELECT 1 FROM seminaristas WHERE seminaristas.nome = v.nome);

-- ── CANDIDATOS ───────────────────────────────────────────────

INSERT INTO candidatos (nome, data_candidatura, tutor_id, igreja_id, status, observacoes, ativo)
SELECT
  'Gladston Lucas Oliveira',
  '2026-01-30',
  (SELECT id FROM oficiais WHERE nome = 'Rogério de Castro Chaves' LIMIT 1),
  (SELECT id FROM igrejas WHERE sigla = 'IPPenha' LIMIT 1),
  'em_processo',
  'Missionário há 20 anos na Espanha (Salamanca). Pós-graduação EAD no Seminário Andrew Jumper. Aprovado como candidato na 37ª RO (jan/2026).',
  true
WHERE NOT EXISTS (SELECT 1 FROM candidatos WHERE nome = 'Gladston Lucas Oliveira');

-- ── COMISSÃO EXECUTIVA (histórico) ───────────────────────────

INSERT INTO comissao_executiva (ano, cargo, nome) VALUES
  (2014, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2014, 'vice_presidente',       'Rev. Laércio Máximo Rodrigues'),
  (2014, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2014, '1_secretario',          'Rev. Daniel Fogaça'),
  (2014, '2_secretario',          'Rev. Wanderley Donizete Morelli Pedrosa'),
  (2014, 'tesoureiro',            'Rev. Carlos Roberto Spiaze'),
  (2024, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2024, 'vice_presidente',       'Rev. Carlos Alberto Henrique'),
  (2024, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2024, '1_secretario',          'Rev. Daniel Fogaça'),
  (2024, '2_secretario',          'Rev. César Veríssimo Marinho dos Reis'),
  (2024, 'tesoureiro',            'Presb. Valdir Soranso'),
  (2025, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2025, 'vice_presidente',       'Rev. Carlos Alberto Henrique'),
  (2025, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2025, '1_secretario',          'Rev. Daniel Fogaça'),
  (2025, '2_secretario',          'Rev. Rogério de Castro Chaves'),
  (2025, 'tesoureiro',            'Rev. Atsushi Miyajima'),
  (2026, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2026, 'vice_presidente',       'Rev. Fábio Luiz de Carvalho'),
  (2026, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2026, '1_secretario',          'Rev. Laércio Máximo Rodrigues'),
  (2026, '2_secretario',          'Rev. Rogério de Castro Chaves'),
  (2026, 'tesoureiro',            'Rev. Atsushi Miyajima')
ON CONFLICT (ano, cargo) DO NOTHING;
