export type Papel = 'admin' | 'moderador' | 'secretario' | 'secretario_executivo' | 'presbitero' | 'pastor'

export type TipoReuniao = 'ordinaria' | 'extraordinaria' | 'solene' | 'administrativa'

export type StatusReuniao =
  | 'convocada'
  | 'em_andamento'
  | 'encerrada'
  | 'ata_em_producao'
  | 'ata_aprovada'
  | 'publicada'

export type FuncaoMesa =
  | 'moderador'
  | 'vice_moderador'
  | '1_secretario'
  | '2_secretario'
  | 'assessor'

export type TipoOficial = 'pastor' | 'presbitero' | 'diacono'

export type StatusDocumento =
  | 'recebido'
  | 'em_pauta'
  | 'aprovado'
  | 'rejeitado'
  | 'arquivado'
  | 'retirado'

export type StatusAta = 'rascunho' | 'em_revisao' | 'aprovada' | 'publicada'

export type StatusRelatorio = 'rascunho' | 'submetido' | 'em_revisao' | 'aprovado' | 'devolvido'

// ─── Relatório do Ministro ───────────────────────────────────────────────────

export interface RelMinistroIdentificacao {
  nome: string
  filiacao_pai: string
  filiacao_mae: string
  data_nascimento: string
  local_nascimento: string
  uf_nascimento: string
  rg: string
  orgao_emissor: string
  cpf: string
  estado_civil: string
  conjuge: string
  aniversario_conjuge: string
  num_dependentes: number | ''
  nomes_filhos: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  tel_celular: string
  tel_residencia: string
  tel_igreja: string
  email: string
  moradia: string // 'casa_pastoral' | 'aluguel_pago_igreja' | 'aluguel_pago_ministro' | 'propria_quitada' | 'propria_financiada'
  moradia_nos_limites: boolean
  data_ordenacao: string
  presbitério_ordenacao: string
  dedicacao: 'integral' | 'parcial' | ''
  ferias: 'regulares' | 'parciais' | 'nao_teve' | ''
  congruas: number | ''
  aposentadoria_publica: boolean | ''
  aposentadoria_privada: boolean | ''
  plano_saude: boolean | ''
  contribui_inss: boolean | ''
  valor_inss: number | ''
  contribui_prev_privada: boolean | ''
}

export interface RelMinistroAtuacao {
  // 1. Doutrinação (no campo / fora do campo)
  pregacoes_campo: number | ''
  pregacoes_fora: number | ''
  aulas_ed_campo: number | ''
  aulas_ed_fora: number | ''
  trab_evangelizacao_campo: number | ''
  trab_evangelizacao_fora: number | ''
  estudos_biblicos_campo: number | ''
  estudos_biblicos_fora: number | ''
  palestras_campo: number | ''
  palestras_fora: number | ''
  mensagens_radio_tv_campo: number | ''
  mensagens_radio_tv_fora: number | ''
  artigos_campo: number | ''
  artigos_fora: number | ''
  entrevistas_campo: number | ''
  entrevistas_fora: number | ''
  // 2. Atos Pastorais
  santas_ceias_campo: number | ''
  santas_ceias_fora: number | ''
  bencaos_nupciais_campo: number | ''
  bencaos_nupciais_fora: number | ''
  funerais_campo: number | ''
  funerais_fora: number | ''
  batismos_infantis_campo: number | ''
  batismos_infantis_fora: number | ''
  profissoes_fe_campo: number | ''
  profissoes_fe_fora: number | ''
  profissoes_fe_batismo_campo: number | ''
  profissoes_fe_batismo_fora: number | ''
  // 3. Assistência Pastoral
  aconselhamentos_campo: number | ''
  aconselhamentos_fora: number | ''
  visitas_evangelicos_campo: number | ''
  visitas_evangelicos_fora: number | ''
  visitas_pontos_campo: number | ''
  visitas_pontos_fora: number | ''
  visitas_deptos_campo: number | ''
  visitas_deptos_fora: number | ''
  // 4. Ministério Art. 37
  ministerio_art37: string
}

export interface RelMinistroAtuacaoConciliar {
  reunioes_conselho_campo: number | ''
  reunioes_conselho_fora: number | ''
  assembleias_gerais_campo: number | ''
  assembleias_gerais_fora: number | ''
  reunioes_presbitério: number | ''
  reunioes_sinodo: number | ''
  reunioes_supremo_concilio: number | ''
  diaconos_ordenados_campo: number | ''
  diaconos_ordenados_fora: number | ''
  presbiteros_ordenados_campo: number | ''
  presbiteros_ordenados_fora: number | ''
  comentarios: string
  cargos_presbitério: string
  cargos_sinodo: string
  cargos_supremo_concilio: string
  cargos_juntas: string
  texto_complementar: string
}

export interface RelMinistroOutras {
  atualizacao_aperfeicoamento: string
  entidades_para_eclesiasticas: string
  atividades_extra_ministeriais: string
  outras: string
}

export interface RelatorioMinistro {
  campos_trabalho_igrejas: string
  campos_trabalho_congregacoes: string
  identificacao: Partial<RelMinistroIdentificacao>
  atuacao: Partial<RelMinistroAtuacao>
  atuacao_conciliar: Partial<RelMinistroAtuacaoConciliar>
  outras_atividades: Partial<RelMinistroOutras>
}

// ─── Relatório do Conselho / Mesa / Congregação ──────────────────────────────

export interface RelConselhoOrganizacao {
  imoveis_documentados: boolean | ''
  inventario_moveis: boolean | ''
  rois_atualizados: boolean | ''
  declaracoes_irenda: boolean
  declaracoes_rais: boolean
  declaracoes_dirf: boolean
  inventario_atualizado: boolean | ''
  num_congregacoes: number | ''
}

export interface RelConselhoSupervisaoEspiritual {
  ceia_grupos: number | ''
  ceia_individuos: number | ''
  atividades_evangelisticas: number | ''
  biblias: number | ''
  novos_testamentos: number | ''
  folhetos: number | ''
  outras_literaturas: number | ''
  missao_jmn: boolean
  missao_apmt: boolean
  missao_pmc: boolean
  missao_plantacao: boolean
  outra_missao: string
  treinamento_professores_ed: boolean | ''
  treinamento_equipe_musica: boolean | ''
  treinamento_oficiais: boolean | ''
  treinamento_lideranca: boolean | ''
  num_corais: number | ''
  num_conjuntos_musicais: number | ''
  num_discipulados: number | ''
  atos_diaconal: number | ''
  atos_outros_deptos: number | ''
  visitas_presbiteros_diaconos: number | ''
  visitas_outros_deptos: number | ''
}

export interface RelConselhoAdministrativo {
  dizimos_dizimos: boolean | ''
  reunioes_conselho_tipo: string
  reunioes_conselho_qtd: number | ''
  reunioes_junta_tipo: string
  reunioes_junta_qtd: number | ''
  reunioes_assembleia_tipo: string
  reunioes_assembleia_qtd: number | ''
  reunioes_mesa_tipo: string
  reunioes_mesa_qtd: number | ''
  reunioes_comissao_contas_tipo: string
  reunioes_comissao_contas_qtd: number | ''
  balancetes_aprovados: boolean | ''
  oficiais_mandato_vencendo: boolean | ''
  livros_sociedades_aprovados: boolean | ''
  presbiteros_mandato_qtd: number | ''
  diaconos_mandato_qtd: number | ''
  conselheiros_nomeados: boolean | ''
  quais_sociedades: string
  contribuicao_extra_locais: boolean | ''
  previdencia_social_pastor: boolean | ''
  fap: boolean | ''
  ipb_prev: boolean | ''
  reforma_projeto: string
  reforma_andamento: string
}

export interface RelConselhoEstrategico {
  tem_planejamento: boolean | ''
  objetivos_alcancados: string
  objetivos_nao_alcancados: string
}

export interface RelConselhoPatrimonio {
  seguro_patrimonial: boolean | ''
  alvara_funcionamento: boolean | ''
  licenca_bombeiros: boolean | ''
  certificado_digital: boolean | ''
}

export interface RelatorioConselho {
  // Identificação da Igreja
  nome_igreja: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  telefone: string
  email: string
  data_organizacao: string
  cnpj: string
  site: string
  // Seções
  organizacao: Partial<RelConselhoOrganizacao>
  supervisao_espiritual: Partial<RelConselhoSupervisaoEspiritual>
  administrativo: Partial<RelConselhoAdministrativo>
  estrategico: Partial<RelConselhoEstrategico>
  patrimonio: Partial<RelConselhoPatrimonio>
  // Secretário
  secretario_nome: string
  secretario_endereco: string
  secretario_numero: string
  secretario_bairro: string
  secretario_cidade: string
  secretario_uf: string
  secretario_cep: string
  secretario_celular: string
  secretario_residencia: string
  secretario_email: string
}

// ─── Cadastro & Estatística ──────────────────────────────────────────────────

export interface RelEstatisticaLideranca {
  pastores: number | ''
  licenciados: number | ''
  presbiteros: number | ''
  diaconos: number | ''
  evangelistas: number | ''
  missionarios: number | ''
  candidatos: number | ''
}

export interface RelEstatisticaEstrutura {
  congregacoes: number | ''
  pontos_pregacao: number | ''
  escolas_dominicais: number | ''
  professores_ed: number | ''
  alunos_ed_atual: number | ''
  alunos_ed_anterior: number | ''
}

export interface RelEstatisticaDepartamento {
  ucp_qtd: number | ''
  ucp_membros: number | ''
  upa_qtd: number | ''
  upa_membros: number | ''
  ump_qtd: number | ''
  ump_membros: number | ''
  saf_qtd: number | ''
  saf_membros: number | ''
  uph_qtd: number | ''
  uph_membros: number | ''
  outras_qtd: number | ''
  outras_membros: number | ''
}

export interface RelRolMovimento {
  // Comungantes — admissão
  c_adm_profissao_fe_m: number | ''
  c_adm_profissao_fe_f: number | ''
  c_adm_profissao_fe_batismo_m: number | ''
  c_adm_profissao_fe_batismo_f: number | ''
  c_adm_transferencia_m: number | ''
  c_adm_transferencia_f: number | ''
  c_adm_jurisdicao_m: number | ''
  c_adm_jurisdicao_f: number | ''
  c_adm_restauracao_m: number | ''
  c_adm_restauracao_f: number | ''
  c_adm_designacao_m: number | ''
  c_adm_designacao_f: number | ''
  // Comungantes — demissão
  c_dem_transferencia_m: number | ''
  c_dem_transferencia_f: number | ''
  c_dem_falecimento_m: number | ''
  c_dem_falecimento_f: number | ''
  c_dem_exclusao_m: number | ''
  c_dem_exclusao_f: number | ''
  c_dem_ordenacao_m: number | ''
  c_dem_ordenacao_f: number | ''
  c_dem_rol_separado_m: number | ''
  c_dem_rol_separado_f: number | ''
  // Comungantes — totais históricos
  c_ano_anterior_m: number | ''
  c_ano_anterior_f: number | ''
  // Não-comungantes — admissão
  nc_adm_batismo_m: number | ''
  nc_adm_batismo_f: number | ''
  nc_adm_transferencia_m: number | ''
  nc_adm_transferencia_f: number | ''
  nc_adm_jurisdicao_m: number | ''
  nc_adm_jurisdicao_f: number | ''
  // Não-comungantes — demissão
  nc_dem_profissao_fe_m: number | ''
  nc_dem_profissao_fe_f: number | ''
  nc_dem_transferencia_m: number | ''
  nc_dem_transferencia_f: number | ''
  nc_dem_falecimento_m: number | ''
  nc_dem_falecimento_f: number | ''
  nc_dem_exclusao_m: number | ''
  nc_dem_exclusao_f: number | ''
  // Não-comungantes — totais históricos
  nc_ano_anterior_m: number | ''
  nc_ano_anterior_f: number | ''
}

export interface RelFinanceiro {
  // Movimento do ano anterior
  ant_saldo_inicial: number | ''
  ant_dizimos: number | ''
  ant_ofertas: number | ''
  ant_ofertas_missionarias: number | ''
  ant_ofertas_especificas: number | ''
  ant_receitas_financeiras: number | ''
  ant_emprestimos: number | ''
  ant_parcerias: number | ''
  ant_outras_receitas: number | ''
  ant_desp_patrimonio: number | ''
  ant_desp_causas_locais: number | ''
  ant_desp_evangelismo: number | ''
  ant_desp_missoes: number | ''
  ant_desp_acao_social: number | ''
  ant_desp_sustento_pastoral: number | ''
  ant_desp_verba_presbiterial: number | ''
  ant_desp_dizimo_sc: number | ''
  ant_desp_emprestimos: number | ''
  ant_desp_outras: number | ''
  // Previsão orçamentária próximo exercício
  prev_saldo_inicial: number | ''
  prev_dizimos: number | ''
  prev_ofertas: number | ''
  prev_ofertas_missionarias: number | ''
  prev_ofertas_especificas: number | ''
  prev_receitas_financeiras: number | ''
  prev_emprestimos: number | ''
  prev_parcerias: number | ''
  prev_outras_receitas: number | ''
  prev_desp_patrimonio: number | ''
  prev_desp_causas_locais: number | ''
  prev_desp_evangelismo: number | ''
  prev_desp_missoes: number | ''
  prev_desp_acao_social: number | ''
  prev_desp_sustento_pastoral: number | ''
  prev_desp_verba_presbiterial: number | ''
  prev_desp_dizimo_sc: number | ''
  prev_desp_emprestimos: number | ''
  prev_desp_outras: number | ''
}

export interface RelatorioCadastroEstatistica {
  // Identificação (espelha Conselho)
  nome_igreja: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  telefone1: string
  telefone2: string
  email: string
  data_organizacao: string
  cnpj: string
  site: string
  // Seções
  lideranca: Partial<RelEstatisticaLideranca>
  estrutura: Partial<RelEstatisticaEstrutura>
  departamentos: Partial<RelEstatisticaDepartamento>
  rol: Partial<RelRolMovimento>
  financeiro: Partial<RelFinanceiro>
  // Secretário
  secretario_nome: string
  secretario_endereco: string
  secretario_numero: string
  secretario_bairro: string
  secretario_cidade: string
  secretario_uf: string
  secretario_cep: string
  secretario_celular: string
  secretario_email: string
}

export interface RelatorioAnual {
  id: string
  ano: number
  igreja_id: string
  submetido_por: string | null
  status: StatusRelatorio
  ministro: RelatorioMinistro | null
  conselho: RelatorioConselho | null
  congregacao: RelatorioConselho | null
  cadastro_estatistica: RelatorioCadastroEstatistica | null
  revisado_por: string | null
  revisado_em: string | null
  observacoes_revisao: string | null
  created_at: string
  updated_at: string
  igreja?: Igreja
}

export interface Seminarista {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  seminario: string | null
  curso_ano: number | null
  status: 'cursando' | 'licenciado' | 'aprovado' | 'desistiu'
  igreja_id: string | null
  ativo: boolean
  created_at: string
  igreja?: Igreja
}

export interface Perfil {
  id: string
  nome: string
  email: string
  papel: Papel
  cargo: string | null
  igreja_id: string | null
  ativo: boolean
  created_at: string
}

export interface Igreja {
  id: string
  nome: string
  sigla: string | null
  cidade: string | null
  bairro: string | null
  pastor_id: string | null
  tipo: 'sede' | 'congregacao' | 'campo' | 'missao'
  ativa: boolean
  created_at: string
}

export interface Oficial {
  id: string
  nome: string
  tipo: TipoOficial
  cargo: string | null
  igreja_id: string | null
  email: string | null
  telefone: string | null
  ativo: boolean
  created_at: string
  igreja?: Igreja
}

export interface Reuniao {
  id: string
  numero: string
  tipo: TipoReuniao
  data_inicio: string
  data_fim: string | null
  local: string | null
  cidade: string | null
  status: StatusReuniao
  quorum_necessario: number | null
  observacoes: string | null
  created_at: string
  mesa?: ReuniaoMesa[]
  _count?: { presencas: number; documentos: number; resolucoes: number }
}

export interface ReuniaoMesa {
  id: string
  reuniao_id: string
  oficial_id: string
  funcao: FuncaoMesa
  oficial?: Oficial
}

export interface ReuniaoPresenca {
  id: string
  reuniao_id: string
  oficial_id: string
  presente: boolean
  justificativa: string | null
  oficial?: Oficial
}

export interface Comissao {
  id: string
  reuniao_id: string | null
  numero: number
  nome: string | null
  tipo: 'permanente' | 'temporaria' | 'especial'
  ativa: boolean
  created_at: string
  membros?: ComissaoMembro[]
}

export interface ComissaoMembro {
  id: string
  comissao_id: string
  oficial_id: string
  funcao: 'presidente' | 'secretario' | 'membro'
  oficial?: Oficial
}

export interface Documento {
  id: string
  reuniao_id: string
  numero: number
  assunto: string
  oriundo: string | null
  comissao_id: string | null
  tipo: string | null
  conteudo: string | null
  pdf_url: string | null
  status: StatusDocumento
  created_at: string
  comissao?: Comissao
  resolucao?: Resolucao
}

export interface Resolucao {
  id: string
  documento_id: string
  reuniao_id: string
  numero: number
  ementa: string
  texto: string | null
  status: 'aprovada' | 'publicada'
  data: string
  created_at: string
}

export interface Ata {
  id: string
  reuniao_id: string
  numero_ata: string | null
  conteudo: AtaConteudo
  status: StatusAta
  aprovada_em: string | null
  created_at: string
  updated_at: string
  reuniao?: Reuniao
  aprovacoes?: AtaAprovacao[]
}

export interface AtaConteudo {
  verificacao_poderes: string
  sessao_preparatoria: string
  sessoes_regulares: string[]
  observacoes?: string
}

export interface AtaAprovacao {
  id: string
  ata_id: string
  oficial_id: string
  funcao: FuncaoMesa
  aprovado: boolean
  data: string
  oficial?: Oficial
}

export interface ComissaoExecutiva {
  id: string
  ano: number
  cargo: string
  nome: string
  oficial_id: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      perfis: { Row: Perfil }
      igrejas: { Row: Igreja }
      oficiais: { Row: Oficial }
      reunioes: { Row: Reuniao }
      reuniao_mesa: { Row: ReuniaoMesa }
      reuniao_presencas: { Row: ReuniaoPresenca }
      comissoes: { Row: Comissao }
      comissao_membros: { Row: ComissaoMembro }
      documentos: { Row: Documento }
      resolucoes: { Row: Resolucao }
      atas: { Row: Ata }
      ata_aprovacoes: { Row: AtaAprovacao }
      comissao_executiva: { Row: ComissaoExecutiva }
    }
  }
}
