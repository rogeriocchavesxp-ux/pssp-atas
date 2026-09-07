-- ============================================================
-- Migration 010: Dados históricos extraídos das atas do PSSP
-- Fonte: 15ª RO (2014), 34ª RO (2024), 35ª–37ª RO (2024–2026)
-- Executar UMA VEZ em banco vazio (sem igrejas/oficiais/seminaristas)
-- ============================================================

-- ── IGREJAS ──────────────────────────────────────────────────

INSERT INTO igrejas (nome, sigla, cidade, bairro, tipo, ativa) VALUES
  ('Igreja Presbiteriana da Penha',               'IPPenha',        'São Paulo',       'Penha',            'sede',       true),
  ('Igreja Presbiteriana de Vila Buenos Aires',   'IP VBA',         'São Paulo',       'Vila Buenos Aires','sede',       true),
  ('Igreja Presbiteriana do Jardim Castelo',      'IP Jd Castelo',  'São Paulo',       'Jardim Castelo',   'sede',       true),
  ('Igreja Presbiteriana do Jardim Popular',      'IP Jd Popular',  'Itaquaquecetuba', 'Jardim Popular',   'sede',       true),
  ('Igreja Presbiteriana de Vila Lais',           'IP Vila Lais',   'São Paulo',       'Vila Lais',        'sede',       true),
  ('Igreja Presbiteriana de Vila Esperança',      'IP V Esperança', 'São Paulo',       'Vila Esperança',   'sede',       true),
  ('Congregação Presbiteriana Anália Franco',     'CP Anália',      'São Paulo',       'Vila Formosa',     'congregacao',true),
  ('Congregação Presbiteriana Jardim Primavera',  'CP Jd Primavera','Itaquaquecetuba', 'Jardim Primavera', 'congregacao',true),
  ('Congregação Presbiteriana Vila Rosária',      'CP V Rosária',   'São Paulo',       'Vila Rosária',     'congregacao',true),
  ('Igreja Presbiteriana Hispana',                'IP Hispana',     'São Paulo',       'Cangaíba',         'missao',     true)
ON CONFLICT DO NOTHING;

-- ── OFICIAIS – PASTORES ──────────────────────────────────────

-- IP da Penha
INSERT INTO oficiais (nome, tipo, cargo, email, telefone, igreja_id, ativo)
SELECT v.nome, v.tipo, v.cargo, v.email, v.telefone,
       (SELECT id FROM igrejas WHERE sigla = 'IPPenha'),
       true
FROM (VALUES
  ('Amauri Costa de Oliveira',          'pastor', 'Pastor Efetivo',               null::text,             '11954022717'::text),
  ('Adriano Pedrosa Ferreira',          'pastor', 'Pastor Auxiliar',              null,                    null),
  ('Atsushi Miyajima',                  'pastor', 'Pastor Auxiliar',              null,                    null),
  ('Carlos Alberto Henrique',           'pastor', 'Pastor Auxiliar',              null,                    '11983354528'),
  ('Carlos Eduardo Corrêa Lima',        'pastor', 'Pastor Auxiliar',              null,                    '11993812917'),
  ('Cornélio Caldeira de Castro',       'pastor', 'Pastor Auxiliar',              null,                    null),
  ('Fábio Luiz de Carvalho',            'pastor', 'Pastor Auxiliar',              null,                    null),
  ('Filipe Gomes Checon Pereira',       'pastor', 'Pastor Auxiliar',              null,                    '11949369668'),
  ('Jean Francesco Afonso Lima Gomes',  'pastor', 'Pastor Auxiliar (EUA)',        null,                    null),
  ('Juliano Caetano Socio',             'pastor', 'Pastor Auxiliar (EUA)',        null,                    null),
  ('Ricardo Riul',                      'pastor', 'Pastor Auxiliar',              null,                    null),
  ('Rogério de Castro Chaves',          'pastor', 'Pastor Auxiliar',              'rgocastro@icloud.com',  null),
  ('Wellington Aparecido Costa Baldez', 'pastor', 'Pastor Auxiliar (Bolívia)',    null,                    null),
  ('Paulo Andrés Erben Castro',         'pastor', 'Pastor Auxiliar',              'erbenpaulo@gmail.com',  null),
  ('Ayrton da Silva Moreira Gomes',     'pastor', 'Licença art. 37 CI/IPB',      null,                    null)
) AS v(nome, tipo, cargo, email, telefone)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- IP de Vila Buenos Aires
INSERT INTO oficiais (nome, tipo, cargo, email, telefone, igreja_id, ativo)
SELECT nome, tipo, cargo, null, telefone,
       (SELECT id FROM igrejas WHERE sigla = 'IP VBA'),
       true
FROM (VALUES
  ('César Veríssimo Marinho dos Reis', 'pastor', 'Pastor Efetivo',  '11997175538'),
  ('Vagner de Jesus Queirós',          'pastor', 'Pastor Auxiliar', null)
) AS v(nome, tipo, cargo, telefone)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- IP do Jardim Castelo
INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Daniel Fogaça', 'pastor', 'Pastor Efetivo', '11981005990',
       (SELECT id FROM igrejas WHERE sigla = 'IP Jd Castelo'), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Daniel Fogaça');

-- IP do Jardim Popular
INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Laércio Máximo Rodrigues', 'pastor', 'Pastor Efetivo', '11974027852',
       (SELECT id FROM igrejas WHERE sigla = 'IP Jd Popular'), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Laércio Máximo Rodrigues');

-- IP de Vila Lais
INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Maycon Rodrigues', 'pastor', 'Pastor', '11973820399',
       (SELECT id FROM igrejas WHERE sigla = 'IP Vila Lais'), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Maycon Rodrigues');

-- IP de Vila Esperança
INSERT INTO oficiais (nome, tipo, cargo, igreja_id, ativo)
SELECT 'Israel Scalioni', 'pastor', 'Pastor',
       (SELECT id FROM igrejas WHERE sigla = 'IP V Esperança'), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Israel Scalioni');

-- CP Anália Franco
INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT 'Michael Fassheber Valim Cruz', 'pastor', 'Pastor', '11996813220',
       (SELECT id FROM igrejas WHERE sigla = 'CP Anália'), true
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE nome = 'Michael Fassheber Valim Cruz');

-- Missionários (sem vínculo de campo local)
INSERT INTO oficiais (nome, tipo, cargo, telefone, igreja_id, ativo)
SELECT nome, 'pastor', cargo, telefone, null, true
FROM (VALUES
  ('Gustavo Alex Faria Custódio',  'Pastor Missionário (Grécia)',     '11981829196'),
  ('Jairo Isac Rodrigues',         'Pastor Missionário (Hispanos)',   '11955581969'),
  ('Jessé Silveira Fogaça',        'Pastor Missionário (Timor Leste)','117762 6495'),
  ('Carlos Roberto Spiazzi',       'Em disponibilidade',               null)
) AS v(nome, cargo, telefone)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- ── OFICIAIS – PRESBÍTEROS ───────────────────────────────────

INSERT INTO oficiais (nome, tipo, cargo, igreja_id, ativo)
SELECT v.nome, 'presbitero', v.cargo,
       (SELECT id FROM igrejas WHERE sigla = v.sigla),
       true
FROM (VALUES
  ('Anízio Alves Borges',            'Secretário Executivo do PSSP', 'IPPenha'),
  ('Idenal Nishimura',               'Representante',                 'IP VBA'),
  ('William Cruz da Silva',          'Representante',                 'IP Jd Castelo'),
  ('Mauro Cruz',                     'Representante',                 'IP Jd Popular'),
  ('Cleber Rodrigues do Nascimento', 'Representante',                 'IP Vila Lais'),
  ('Eduardo Mendes Machado',         'Representante',                 'IP V Esperança'),
  ('Valdir Soranso',                 null,                            'IP Vila Lais'),
  ('Laércio Ferreira Lima',          null,                            'IPPenha')
) AS v(nome, cargo, sigla)
WHERE NOT EXISTS (SELECT 1 FROM oficiais WHERE oficiais.nome = v.nome);

-- ── SEMINARISTAS ─────────────────────────────────────────────

INSERT INTO seminaristas (nome, email, seminario, curso_ano, status, igreja_id, ativo)
SELECT v.nome, v.email, v.seminario, v.curso_ano, v.status,
       CASE WHEN v.sigla IS NOT NULL THEN (SELECT id FROM igrejas WHERE sigla = v.sigla) ELSE null END,
       true
FROM (VALUES
  -- cursando (posição em jan/2026 — 37ª RO)
  ('Guilherme Francisco Rodrigues Paes Athú', 'guilhermeathu@gmail.com',   'JMC',               2::int,    'cursando',    'IPPenha'::text),
  ('Tiago Rocha Vargas Henrique',             'henriquertiago@outlook.com','SPS',               3::int,    'cursando',    'IPPenha'),
  ('Daniel Simões de Carvalho',               'dani3l244@gmail.com',       'SPS',               4::int,    'cursando',    'IPPenha'),
  ('Rafael Garcia de Sá',                     'rafagsa@gmail.com',         'SPS',               2::int,    'cursando',    null),
  ('Lucas Johann Cruvinel Carvalho',          'johanncruvinel@gmail.com',  'JMC',               3::int,    'cursando',    null),
  ('Sidney Faria dos Reis Júnior',            null::text,                  'SPS',               4::int,    'cursando',    'IPPenha'),
  ('Gladston Lucas Oliveira',                 null::text,                  'Andrew Jumper (EAD)',null::int, 'cursando',    'IPPenha'),
  -- licenciado (concluiu o curso, aguardando)
  ('Éfferson Soares Luz',                     null::text,                  'JMC',               null::int, 'licenciado',  null::text),
  -- aprovados / ordenados
  ('Paulo Andrés Erben Castro',               'erbenpaulo@gmail.com',      'JMC',               null::int, 'aprovado',    'IPPenha'),
  ('Gabriel Bastos Ricci Justino',            null::text,                  'SPS',               null::int, 'aprovado',    null::text)
) AS v(nome, email, seminario, curso_ano, status, sigla)
WHERE NOT EXISTS (SELECT 1 FROM seminaristas WHERE seminaristas.nome = v.nome);

-- ── COMISSÃO EXECUTIVA (histórico) ───────────────────────────

INSERT INTO comissao_executiva (ano, cargo, nome) VALUES
  -- 2014 — 15ª RO
  (2014, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2014, 'vice_presidente',       'Rev. Laércio Máximo Rodrigues'),
  (2014, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2014, '1_secretario',          'Rev. Daniel Fogaça'),
  (2014, '2_secretario',          'Rev. Wanderley Donizete Morelli Pedrosa'),
  (2014, 'tesoureiro',            'Rev. Carlos Roberto Spiaze'),
  -- 2024 — 34ª RO (agosto 2024)
  (2024, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2024, 'vice_presidente',       'Rev. Carlos Alberto Henrique'),
  (2024, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2024, '1_secretario',          'Rev. Daniel Fogaça'),
  (2024, '2_secretario',          'Rev. César Veríssimo Marinho dos Reis'),
  (2024, 'tesoureiro',            'Presb. Valdir Soranso'),
  -- 2025 — eleita na 35ª RO (dezembro 2024)
  (2025, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2025, 'vice_presidente',       'Rev. Carlos Alberto Henrique'),
  (2025, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2025, '1_secretario',          'Rev. Daniel Fogaça'),
  (2025, '2_secretario',          'Rev. Rogério de Castro Chaves'),
  (2025, 'tesoureiro',            'Rev. Atsushi Miyajima'),
  -- 2026 — eleita na 4ª RE da 36ª RO (novembro 2025)
  (2026, 'presidente',            'Rev. Amauri Costa de Oliveira'),
  (2026, 'vice_presidente',       'Rev. Fábio Luiz de Carvalho'),
  (2026, 'secretario_executivo',  'Presb. Anízio Alves Borges'),
  (2026, '1_secretario',          'Rev. Laércio Máximo Rodrigues'),
  (2026, '2_secretario',          'Rev. Rogério de Castro Chaves'),
  (2026, 'tesoureiro',            'Rev. Atsushi Miyajima')
ON CONFLICT (ano, cargo) DO NOTHING;
