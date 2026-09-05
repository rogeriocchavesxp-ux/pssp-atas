'use client'
import { useState } from 'react'

interface Props {
  dados: Record<string, unknown>
  readOnly: boolean
  saving: boolean
  onSave: (dados: unknown) => void
}

function Grupo({ titulo }: { titulo: string }) {
  return (
    <div className="col-span-2 pt-4 pb-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{titulo}</h3>
      <div className="mt-1 border-b border-gray-100" />
    </div>
  )
}

function Campo({
  label, name, value, onChange, readOnly, type = 'text', opcoes, full, rows,
}: {
  label: string
  name: string
  value: string | number | undefined
  onChange: (name: string, val: string) => void
  readOnly: boolean
  type?: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'radio'
  opcoes?: { value: string; label: string }[]
  full?: boolean
  rows?: number
}) {
  const cls = `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-300 ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`

  if (type === 'select') {
    return (
      <div className={full ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <select className={cls} value={value ?? ''} disabled={readOnly} onChange={e => onChange(name, e.target.value)}>
          <option value="">—</option>
          {opcoes?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  if (type === 'textarea') {
    return (
      <div className={full ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <textarea
          className={cls}
          rows={rows ?? 3}
          value={value ?? ''}
          readOnly={readOnly}
          onChange={e => onChange(name, e.target.value)}
        />
      </div>
    )
  }
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        className={cls}
        value={value ?? ''}
        readOnly={readOnly}
        onChange={e => onChange(name, e.target.value)}
      />
    </div>
  )
}

function CampoNumero({
  label, name, value, onChange, readOnly, full,
}: {
  label: string; name: string; value: unknown; onChange: (n: string, v: string) => void; readOnly: boolean; full?: boolean
}) {
  const cls = `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-300 ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="number" min={0} className={cls} value={value as number ?? ''} readOnly={readOnly} onChange={e => onChange(name, e.target.value)} />
    </div>
  )
}

function SimNao({ label, name, value, onChange, readOnly }: { label: string; name: string; value: unknown; onChange: (n: string, v: string) => void; readOnly: boolean }) {
  const v = value === true || value === 'true' ? 'true' : value === false || value === 'false' ? 'false' : ''
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex gap-4 mt-1">
        {['true', 'false'].map(opt => (
          <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" name={name} value={opt} checked={v === opt} disabled={readOnly} onChange={() => onChange(name, opt)} />
            {opt === 'true' ? 'Sim' : 'Não'}
          </label>
        ))}
      </div>
    </div>
  )
}

function DuploCampo({ label1, name1, label2, name2, dados, onChange, readOnly }: {
  label1: string; name1: string; label2: string; name2: string
  dados: Record<string, unknown>; onChange: (n: string, v: string) => void; readOnly: boolean
}) {
  const cls = `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-300 ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`
  return (
    <div className="col-span-2 grid grid-cols-3 gap-3 items-end">
      <div className="col-span-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">{label1} — No campo</label>
        <input type="number" min={0} className={cls} value={dados[name1] as number ?? ''} readOnly={readOnly} onChange={e => onChange(name1, e.target.value)} />
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">{label2} — Fora do campo</label>
        <input type="number" min={0} className={cls} value={dados[name2] as number ?? ''} readOnly={readOnly} onChange={e => onChange(name2, e.target.value)} />
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
        <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
          {((Number(dados[name1]) || 0) + (Number(dados[name2]) || 0)) || '—'}
        </div>
      </div>
    </div>
  )
}

export function SecaoMinistro({ dados, readOnly, saving, onSave }: Props) {
  const [d, setD] = useState<Record<string, unknown>>(dados)

  function set(name: string, val: string) {
    setD(prev => ({ ...prev, [name]: val }))
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Grupo titulo="I — Identificação do Ministro" />
        <Campo label="Nome completo" name="nome" value={d.nome as string} onChange={set} readOnly={readOnly} full />
        <Campo label="Filiação (pai)" name="filiacao_pai" value={d.filiacao_pai as string} onChange={set} readOnly={readOnly} />
        <Campo label="Filiação (mãe)" name="filiacao_mae" value={d.filiacao_mae as string} onChange={set} readOnly={readOnly} />
        <Campo label="Data de Nascimento" name="data_nascimento" type="date" value={d.data_nascimento as string} onChange={set} readOnly={readOnly} />
        <Campo label="Local de Nascimento" name="local_nascimento" value={d.local_nascimento as string} onChange={set} readOnly={readOnly} />
        <Campo label="RG" name="rg" value={d.rg as string} onChange={set} readOnly={readOnly} />
        <Campo label="Órgão Emissor" name="orgao_emissor" value={d.orgao_emissor as string} onChange={set} readOnly={readOnly} />
        <Campo label="CPF" name="cpf" value={d.cpf as string} onChange={set} readOnly={readOnly} />
        <Campo label="Estado Civil" name="estado_civil" type="select" opcoes={[
          { value: 'Solteiro', label: 'Solteiro' },
          { value: 'Casado', label: 'Casado' },
          { value: 'Viúvo', label: 'Viúvo' },
          { value: 'Divorciado', label: 'Divorciado' },
        ]} value={d.estado_civil as string} onChange={set} readOnly={readOnly} />
        <Campo label="Nome do Cônjuge" name="conjuge" value={d.conjuge as string} onChange={set} readOnly={readOnly} />
        <Campo label="Aniversário do Cônjuge" name="aniversario_conjuge" type="date" value={d.aniversario_conjuge as string} onChange={set} readOnly={readOnly} />
        <CampoNumero label="Nº de Dependentes" name="num_dependentes" value={d.num_dependentes} onChange={set} readOnly={readOnly} />
        <Campo label="Nomes dos filhos" name="nomes_filhos" value={d.nomes_filhos as string} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="Endereço" />
        <Campo label="Endereço (rua/av)" name="endereco" value={d.endereco as string} onChange={set} readOnly={readOnly} full />
        <Campo label="Número" name="numero" value={d.numero as string} onChange={set} readOnly={readOnly} />
        <Campo label="Complemento" name="complemento" value={d.complemento as string} onChange={set} readOnly={readOnly} />
        <Campo label="Bairro" name="bairro" value={d.bairro as string} onChange={set} readOnly={readOnly} />
        <Campo label="Cidade" name="cidade" value={d.cidade as string} onChange={set} readOnly={readOnly} />
        <Campo label="UF" name="uf" value={d.uf as string} onChange={set} readOnly={readOnly} />
        <Campo label="CEP" name="cep" value={d.cep as string} onChange={set} readOnly={readOnly} />
        <Campo label="Tel. Celular" name="tel_celular" value={d.tel_celular as string} onChange={set} readOnly={readOnly} />
        <Campo label="Tel. Residência" name="tel_residencia" value={d.tel_residencia as string} onChange={set} readOnly={readOnly} />
        <Campo label="Tel. Igreja" name="tel_igreja" value={d.tel_igreja as string} onChange={set} readOnly={readOnly} />
        <Campo label="E-mail" name="email" type="text" value={d.email as string} onChange={set} readOnly={readOnly} />

        <Grupo titulo="Condições de Moradia" />
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-2">Tipo de moradia</label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'casa_pastoral', label: 'Casa/Apto Pastoral' },
              { value: 'aluguel_pago_igreja', label: 'Aluguel pago pela Igreja' },
              { value: 'aluguel_pago_ministro', label: 'Aluguel pago pelo Ministro' },
              { value: 'propria_quitada', label: 'Moradia Própria Quitada' },
              { value: 'propria_financiada', label: 'Moradia Própria Financiada' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" name="moradia" value={opt.value} checked={d.moradia === opt.value} disabled={readOnly}
                  onChange={() => set('moradia', opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="flex gap-6 mt-3">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="moradia_localizacao" value="dentro" checked={d.moradia_nos_limites === true || d.moradia_nos_limites === 'true'} disabled={readOnly}
                onChange={() => set('moradia_nos_limites', 'true')} />
              Nos limites do Campo
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="moradia_localizacao" value="fora" checked={d.moradia_nos_limites === false || d.moradia_nos_limites === 'false'} disabled={readOnly}
                onChange={() => set('moradia_nos_limites', 'false')} />
              Fora do Campo
            </label>
          </div>
        </div>

        <Grupo titulo="Ordenação e Ministério" />
        <Campo label="Data de Ordenação" name="data_ordenacao" type="date" value={d.data_ordenacao as string} onChange={set} readOnly={readOnly} />
        <Campo label="Presbitério de Ordenação" name="presbitério_ordenacao" value={d.presbitério_ordenacao as string} onChange={set} readOnly={readOnly} />

        <div className="col-span-2 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Dedicação ao Ministério</label>
            <div className="flex gap-4">
              {['integral', 'parcial'].map(v => (
                <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="dedicacao" value={v} checked={d.dedicacao === v} disabled={readOnly}
                    onChange={() => set('dedicacao', v)} />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Férias</label>
            <div className="flex flex-col gap-1">
              {[
                { value: 'regulares', label: 'Regulares' },
                { value: 'parciais', label: 'Parciais' },
                { value: 'nao_teve', label: 'Não teve' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="ferias" value={opt.value} checked={d.ferias === opt.value} disabled={readOnly}
                    onChange={() => set('ferias', opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Côngruas (R$)</label>
            <input type="number" min={0} step={0.01}
              className={`border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`}
              value={d.congruas as number ?? ''} readOnly={readOnly}
              onChange={e => set('congruas', e.target.value)} />
          </div>
        </div>

        <SimNao label="Aposentadoria pública?" name="aposentadoria_publica" value={d.aposentadoria_publica} onChange={set} readOnly={readOnly} />
        <SimNao label="Aposentadoria privada?" name="aposentadoria_privada" value={d.aposentadoria_privada} onChange={set} readOnly={readOnly} />
        <SimNao label="Plano de Saúde?" name="plano_saude" value={d.plano_saude} onChange={set} readOnly={readOnly} />
        <SimNao label="Contribui para o INSS sobre Côngruas?" name="contribui_inss" value={d.contribui_inss} onChange={set} readOnly={readOnly} />
        <CampoNumero label="Valor da Contribuição INSS (R$)" name="valor_inss" value={d.valor_inss} onChange={set} readOnly={readOnly} />
        <SimNao label="Contribui para Previdência Privada?" name="contribui_prev_privada" value={d.contribui_prev_privada} onChange={set} readOnly={readOnly} />

        <Grupo titulo="II — Campo de Trabalho" />
        <Campo label="Igreja(s)" name="campos_trabalho_igrejas" value={d.campos_trabalho_igrejas as string} onChange={set} readOnly={readOnly} full />
        <Campo label="Congregação(ões)" name="campos_trabalho_congregacoes" value={d.campos_trabalho_congregacoes as string} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="III — Atuação Ministerial · 1. Doutrinação (No campo | Fora do campo)" />
        <DuploCampo label1="Pregações" name1="pregacoes_campo" label2="Pregações" name2="pregacoes_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Aulas de Escola Dominical" name1="aulas_ed_campo" label2="Aulas de Escola Dominical" name2="aulas_ed_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Trabalhos de Evangelização" name1="trab_evangelizacao_campo" label2="Trabalhos de Evangelização" name2="trab_evangelizacao_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Estudos Bíblicos" name1="estudos_biblicos_campo" label2="Estudos Bíblicos" name2="estudos_biblicos_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Palestras / Preleções especiais" name1="palestras_campo" label2="Palestras / Preleções especiais" name2="palestras_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Mensagens Rádio/TV" name1="mensagens_radio_tv_campo" label2="Mensagens Rádio/TV" name2="mensagens_radio_tv_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Artigos (jornais, boletins, revistas)" name1="artigos_campo" label2="Artigos" name2="artigos_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Entrevistas" name1="entrevistas_campo" label2="Entrevistas" name2="entrevistas_fora" dados={d} onChange={set} readOnly={readOnly} />

        <Grupo titulo="2. Atos Pastorais (No campo | Fora do campo)" />
        <DuploCampo label1="Santas Ceias" name1="santas_ceias_campo" label2="Santas Ceias" name2="santas_ceias_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Bênçãos Nupciais" name1="bencaos_nupciais_campo" label2="Bênçãos Nupciais" name2="bencaos_nupciais_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Funerais" name1="funerais_campo" label2="Funerais" name2="funerais_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Batismos Infantis" name1="batismos_infantis_campo" label2="Batismos Infantis" name2="batismos_infantis_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Profissões de Fé" name1="profissoes_fe_campo" label2="Profissões de Fé" name2="profissoes_fe_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Profissões de Fé & Batismos" name1="profissoes_fe_batismo_campo" label2="Profissões de Fé & Batismos" name2="profissoes_fe_batismo_fora" dados={d} onChange={set} readOnly={readOnly} />

        <Grupo titulo="3. Assistência Pastoral (No campo | Fora do campo)" />
        <DuploCampo label1="Aconselhamentos/Orientações" name1="aconselhamentos_campo" label2="Aconselhamentos/Orientações" name2="aconselhamentos_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Visitas (Evangélicos ou não)" name1="visitas_evangelicos_campo" label2="Visitas (Evangélicos ou não)" name2="visitas_evangelicos_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Visitas a Pontos de Pregação / Congregações" name1="visitas_pontos_campo" label2="Visitas a Pontos / Congregações" name2="visitas_pontos_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Visitas a Departamentos Internos" name1="visitas_deptos_campo" label2="Visitas a Departamentos Internos" name2="visitas_deptos_fora" dados={d} onChange={set} readOnly={readOnly} />

        <Grupo titulo="4. Ministério Designado (Art. 37 da CI/IPB)" />
        <Campo label="Descrição das atividades" name="ministerio_art37" type="textarea" rows={4} value={d.ministerio_art37 as string} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="IV — Atuação Conciliar · 1. Concílios da IPB (No campo | Fora do campo)" />
        <DuploCampo label1="Reuniões do Conselho" name1="reunioes_conselho_campo" label2="Reuniões do Conselho" name2="reunioes_conselho_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Assembleias Gerais da Igreja" name1="assembleias_gerais_campo" label2="Assembleias Gerais" name2="assembleias_gerais_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Diáconos Ordenados/Investidos" name1="diaconos_ordenados_campo" label2="Diáconos Ordenados/Investidos" name2="diaconos_ordenados_fora" dados={d} onChange={set} readOnly={readOnly} />
        <DuploCampo label1="Presbíteros Ordenados/Investidos" name1="presbiteros_ordenados_campo" label2="Presbíteros Ordenados/Investidos" name2="presbiteros_ordenados_fora" dados={d} onChange={set} readOnly={readOnly} />

        <CampoNumero label="Reuniões do Presbitério" name="reunioes_presbitério" value={d.reunioes_presbitério} onChange={set} readOnly={readOnly} />
        <CampoNumero label="Reuniões do Sínodo" name="reunioes_sinodo" value={d.reunioes_sinodo} onChange={set} readOnly={readOnly} />
        <CampoNumero label="Reuniões do Supremo Concílio" name="reunioes_supremo_concilio" value={d.reunioes_supremo_concilio} onChange={set} readOnly={readOnly} />
        <Campo label="Comentários" name="comentarios" type="textarea" rows={3} value={d.comentarios as string} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="2. Cargos em Comissões Executivas e Concílios" />
        <Campo label="No Presbitério" name="cargos_presbitério" type="textarea" rows={2} value={d.cargos_presbitério as string} onChange={set} readOnly={readOnly} full />
        <Campo label="No Sínodo" name="cargos_sinodo" type="textarea" rows={2} value={d.cargos_sinodo as string} onChange={set} readOnly={readOnly} full />
        <Campo label="No Supremo Concílio" name="cargos_supremo_concilio" type="textarea" rows={2} value={d.cargos_supremo_concilio as string} onChange={set} readOnly={readOnly} full />
        <Campo label="Em Juntas, Comissões e Autarquias da IPB" name="cargos_juntas" type="textarea" rows={2} value={d.cargos_juntas as string} onChange={set} readOnly={readOnly} full />
        <Campo label="Texto Complementar" name="texto_complementar" type="textarea" rows={3} value={d.texto_complementar as string} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="V — Outras Atividades" />
        <Campo label="1. Atualização e Aperfeiçoamento (cursos, leituras, encontros, congressos)" name="atualizacao_aperfeicoamento" type="textarea" rows={3} value={d.atualizacao_aperfeicoamento as string} onChange={set} readOnly={readOnly} full />
        <Campo label="2. Atividades em entidades para-eclesiásticas" name="entidades_para_eclesiasticas" type="textarea" rows={3} value={d.entidades_para_eclesiasticas as string} onChange={set} readOnly={readOnly} full />
        <Campo label="3. Atividades Extra Ministeriais (advocacia, magistério, etc.)" name="atividades_extra_ministeriais" type="textarea" rows={3} value={d.atividades_extra_ministeriais as string} onChange={set} readOnly={readOnly} full />
        <Campo label="Outras" name="outras" type="textarea" rows={2} value={d.outras as string} onChange={set} readOnly={readOnly} full />
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onSave(d)}
            disabled={saving}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: '#1B3A6B' }}
          >
            {saving ? 'Salvando...' : 'Salvar Relatório do Ministro'}
          </button>
        </div>
      )}
    </div>
  )
}
