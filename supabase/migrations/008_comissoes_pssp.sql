-- Comissões permanentes do PSSP
INSERT INTO comissoes (numero, nome, tipo, ativa) VALUES
  (1,  'Plenário',                                          'permanente', true),
  (2,  'Legislação e Justiça',                              'permanente', true),
  (3,  'Candidatos',                                        'permanente', true),
  (4,  'Exame de Contas da Tesouraria',                     'permanente', true),
  (5,  'Estado Religioso',                                  'permanente', true),
  (6,  'Exame de Livro de Atas',                            'permanente', true),
  (7,  'Finanças',                                          'permanente', true),
  (8,  'Estatística',                                       'permanente', true),
  (9,  'Relatório de Ministros',                            'permanente', true),
  (10, 'Comissão Esp. de Plantação e Revitalização de Igrejas', 'especial', true)
ON CONFLICT DO NOTHING;
