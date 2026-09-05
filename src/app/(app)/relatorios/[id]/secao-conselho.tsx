'use client'
import { useState } from 'react'

interface Props {
  dados: Record<string, unknown>
  readOnly: boolean
  saving: boolean
  titulo: string
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

function C({ label, name, value, onChange, readOnly, full, type = 'text' }: {
  label: string; name: string; value: unknown; onChange: (n: string, v: string) => void; readOnly: boolean; full?: boolean; type?: string
}) {
  const cls = `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {type === 'textarea'
        ? <textarea rows={3} className={cls} value={value as string ?? ''} readOnly={readOnly} onChange={e => onChange(name, e.target.value)} />
        : <input type={type} className={cls} value={value as string ?? ''} readOnly={readOnly} onChange={e => onChange(name, e.target.value)} />
      }
    </div>
  )
}

function SN({ label, name, value, onChange, readOnly }: { label: string; name: string; value: unknown; onChange: (n: string, v: string) => void; readOnly: boolean }) {
  const v = value === true || value === 'true' ? 'true' : value === false || value === 'false' ? 'false' : ''
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex gap-4">
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

function Num({ label, name, value, onChange, readOnly, full }: { label: string; name: string; value: unknown; onChange: (n: string, v: string) => void; readOnly: boolean; full?: boolean }) {
  const cls = `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="number" min={0} className={cls} value={value as number ?? ''} readOnly={readOnly} onChange={e => onChange(name, e.target.value)} />
    </div>
  )
}

function ReuniaoRow({ label, nomeTipo, nomeQtd, dados, onChange, readOnly }: {
  label: string; nomeTipo: string; nomeQtd: string; dados: Record<string, unknown>; onChange: (n: string, v: string) => void; readOnly: boolean
}) {
  const cls = `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`
  return (
    <div className="col-span-2 grid grid-cols-5 gap-3 items-center">
      <div className="col-span-2 text-sm text-gray-700">{label}</div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Tipo [1/2/3]</label>
        <select className={cls} value={dados[nomeTipo] as string ?? ''} disabled={readOnly} onChange={e => onChange(nomeTipo, e.target.value)}>
          <option value="">—</option>
          <option value="[1]">[1] Igreja</option>
          <option value="[2]">[2] Congregação</option>
          <option value="[3]">[3] Ambas</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Quantidade</label>
        <input type="number" min={0} className={cls} value={dados[nomeQtd] as number ?? ''} readOnly={readOnly} onChange={e => onChange(nomeQtd, e.target.value)} />
      </div>
    </div>
  )
}

export function SecaoConselho({ dados, readOnly, saving, titulo, onSave }: Props) {
  const [d, setD] = useState<Record<string, unknown>>(dados)

  function set(name: string, val: string) {
    setD(prev => ({ ...prev, [name]: val }))
  }

  const totalCeia = (Number(d.ceia_grupos) || 0) + (Number(d.ceia_individuos) || 0)
  const totalTextos = (Number(d.biblias) || 0) + (Number(d.novos_testamentos) || 0) + (Number(d.folhetos) || 0) + (Number(d.outras_literaturas) || 0)
  const totalAtos = (Number(d.atos_diaconal) || 0) + (Number(d.atos_outros_deptos) || 0)
  const totalVisitas = (Number(d.visitas_presbiteros_diaconos) || 0) + (Number(d.visitas_outros_deptos) || 0)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h2>
      <div className="grid grid-cols-2 gap-4">

        <Grupo titulo="I — Identificação da Igreja / Congregação" />
        <C label="Nome da Igreja / Congregação" name="nome_igreja" value={d.nome_igreja} onChange={set} readOnly={readOnly} full />
        <C label="Endereço" name="endereco" value={d.endereco} onChange={set} readOnly={readOnly} full />
        <C label="Número" name="numero" value={d.numero} onChange={set} readOnly={readOnly} />
        <C label="Complemento" name="complemento" value={d.complemento} onChange={set} readOnly={readOnly} />
        <C label="Bairro" name="bairro" value={d.bairro} onChange={set} readOnly={readOnly} />
        <C label="Cidade" name="cidade" value={d.cidade} onChange={set} readOnly={readOnly} />
        <C label="UF" name="uf" value={d.uf} onChange={set} readOnly={readOnly} />
        <C label="CEP" name="cep" value={d.cep} onChange={set} readOnly={readOnly} />
        <C label="Telefone" name="telefone" value={d.telefone} onChange={set} readOnly={readOnly} />
        <C label="E-mail" name="email" value={d.email} onChange={set} readOnly={readOnly} />
        <C label="Data de Organização" name="data_organizacao" type="date" value={d.data_organizacao} onChange={set} readOnly={readOnly} />
        <C label="CNPJ" name="cnpj" value={d.cnpj} onChange={set} readOnly={readOnly} />
        <C label="Site" name="site" value={d.site} onChange={set} readOnly={readOnly} />

        <Grupo titulo="1. Organização" />
        <SN label="1.1. Os imóveis estão documentados?" name="imoveis_documentados" value={d.imoveis_documentados} onChange={set} readOnly={readOnly} />
        <SN label="1.2. Há inventário dos móveis e utensílios?" name="inventario_moveis" value={d.inventario_moveis} onChange={set} readOnly={readOnly} />
        <SN label="1.3. Os Róis de Membros estão atualizados?" name="rois_atualizados" value={d.rois_atualizados} onChange={set} readOnly={readOnly} />
        <SN label="1.5. Inventário atualizado?" name="inventario_atualizado" value={d.inventario_atualizado} onChange={set} readOnly={readOnly} />
        <Num label="1.6. Quantas Congregações da Igreja?" name="num_congregacoes" value={d.num_congregacoes} onChange={set} readOnly={readOnly} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">1.4. Apresentou declarações do ano anterior?</label>
          <div className="flex gap-4">
            {[
              { name: 'declaracoes_irenda', label: 'IRPJ' },
              { name: 'declaracoes_rais', label: 'RAIS' },
              { name: 'declaracoes_dirf', label: 'DIRF' },
            ].map(item => (
              <label key={item.name} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox"
                  checked={d[item.name] === true || d[item.name] === 'true'}
                  disabled={readOnly}
                  onChange={e => set(item.name, String(e.target.checked))}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <Grupo titulo="2. Supervisão Espiritual — 2.1. Adoração e Comunhão" />
        <Num label="Nº de celebrações da Santa Ceia em grupos" name="ceia_grupos" value={d.ceia_grupos} onChange={set} readOnly={readOnly} />
        <Num label="Nº de ministrações da Ceia a indivíduos" name="ceia_individuos" value={d.ceia_individuos} onChange={set} readOnly={readOnly} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Total Geral</label>
          <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
            {totalCeia || '—'}
          </div>
        </div>

        <Grupo titulo="2.2. Evangelização e Missões" />
        <Num label="2.2.1. Nº de atividades evangelísticas" name="atividades_evangelisticas" value={d.atividades_evangelisticas} onChange={set} readOnly={readOnly} />
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-2">2.2.2. Textos distribuídos</label>
          <div className="grid grid-cols-5 gap-3">
            {[
              { name: 'biblias', label: 'Bíblias' },
              { name: 'novos_testamentos', label: 'Novos Testamentos' },
              { name: 'folhetos', label: 'Folhetos' },
              { name: 'outras_literaturas', label: 'Outras Literaturas' },
            ].map(item => (
              <div key={item.name}>
                <label className="block text-xs text-gray-400 mb-1">{item.label}</label>
                <input type="number" min={0}
                  className={`border border-gray-200 rounded-md px-3 py-2 text-sm w-full ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`}
                  value={d[item.name] as number ?? ''} readOnly={readOnly}
                  onChange={e => set(item.name, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Total</label>
              <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
                {totalTextos || '—'}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-2">2.2.3. Trabalho missionário com</label>
          <div className="flex gap-6">
            {[
              { name: 'missao_jmn', label: 'JMN' },
              { name: 'missao_apmt', label: 'APMT' },
              { name: 'missao_pmc', label: 'Parceria com o PMC' },
              { name: 'missao_plantacao', label: 'Plantação de Igrejas' },
            ].map(item => (
              <label key={item.name} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox"
                  checked={d[item.name] === true || d[item.name] === 'true'}
                  disabled={readOnly}
                  onChange={e => set(item.name, String(e.target.checked))}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
        <C label="2.2.4. Outra participação missionária" name="outra_missao" value={d.outra_missao} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="2.3. Educação e Aperfeiçoamento" />
        <SN label="2.3.1. Para professores de Escola Dominical" name="treinamento_professores_ed" value={d.treinamento_professores_ed} onChange={set} readOnly={readOnly} />
        <SN label="2.3.2. Para Equipe de Música" name="treinamento_equipe_musica" value={d.treinamento_equipe_musica} onChange={set} readOnly={readOnly} />
        <SN label="2.3.3. Para Oficiais (Presbíteros e Diáconos)" name="treinamento_oficiais" value={d.treinamento_oficiais} onChange={set} readOnly={readOnly} />
        <SN label="2.3.4. Para Liderança" name="treinamento_lideranca" value={d.treinamento_lideranca} onChange={set} readOnly={readOnly} />
        <Num label="2.3.5. Nº de Grupos Corais" name="num_corais" value={d.num_corais} onChange={set} readOnly={readOnly} />
        <Num label="2.3.6. Nº de Conjuntos Musicais" name="num_conjuntos_musicais" value={d.num_conjuntos_musicais} onChange={set} readOnly={readOnly} />
        <Num label="2.3.7. Nº de Discipulados Realizados" name="num_discipulados" value={d.num_discipulados} onChange={set} readOnly={readOnly} />

        <Grupo titulo="2.4. Ação Social e Visitação" />
        <Num label="2.4.1. Atos beneficentes — Junta Diaconal" name="atos_diaconal" value={d.atos_diaconal} onChange={set} readOnly={readOnly} />
        <Num label="Por outros departamentos" name="atos_outros_deptos" value={d.atos_outros_deptos} onChange={set} readOnly={readOnly} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Total Geral</label>
          <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
            {totalAtos || '—'}
          </div>
        </div>
        <Num label="2.4.2. Visitas — Presbíteros e Diáconos" name="visitas_presbiteros_diaconos" value={d.visitas_presbiteros_diaconos} onChange={set} readOnly={readOnly} />
        <Num label="Por outros departamentos" name="visitas_outros_deptos" value={d.visitas_outros_deptos} onChange={set} readOnly={readOnly} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Total Geral</label>
          <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600">
            {totalVisitas || '—'}
          </div>
        </div>

        <Grupo titulo="3. Supervisão Administrativa — Reuniões" />
        <SN label="3.1. A Igreja enviou fielmente os Dízimos dos Dízimos à Tesouraria IPB?" name="dizimos_dizimos" value={d.dizimos_dizimos} onChange={set} readOnly={readOnly} />
        <ReuniaoRow label="3.2. Conselho" nomeTipo="reunioes_conselho_tipo" nomeQtd="reunioes_conselho_qtd" dados={d} onChange={set} readOnly={readOnly} />
        <ReuniaoRow label="3.3. Junta Diaconal" nomeTipo="reunioes_junta_tipo" nomeQtd="reunioes_junta_qtd" dados={d} onChange={set} readOnly={readOnly} />
        <ReuniaoRow label="3.4. Assembleia Geral" nomeTipo="reunioes_assembleia_tipo" nomeQtd="reunioes_assembleia_qtd" dados={d} onChange={set} readOnly={readOnly} />
        <ReuniaoRow label="3.5. Mesa Administrativa da Cong. Presbiterial" nomeTipo="reunioes_mesa_tipo" nomeQtd="reunioes_mesa_qtd" dados={d} onChange={set} readOnly={readOnly} />
        <ReuniaoRow label="3.6. Comissão de Exame de Contas da Tesouraria" nomeTipo="reunioes_comissao_contas_tipo" nomeQtd="reunioes_comissao_contas_qtd" dados={d} onChange={set} readOnly={readOnly} />

        <SN label="3.7. Houve exame/aprovação de balancetes da tesouraria?" name="balancetes_aprovados" value={d.balancetes_aprovados} onChange={set} readOnly={readOnly} />
        <SN label="3.8. Há oficiais com mandato a vencer no ano a seguir?" name="oficiais_mandato_vencendo" value={d.oficiais_mandato_vencendo} onChange={set} readOnly={readOnly} />
        <SN label="3.9. Idem, dos livros e relatórios das sociedades?" name="livros_sociedades_aprovados" value={d.livros_sociedades_aprovados} onChange={set} readOnly={readOnly} />
        <Num label="Presbíteros com mandato a vencer (nº)" name="presbiteros_mandato_qtd" value={d.presbiteros_mandato_qtd} onChange={set} readOnly={readOnly} />
        <Num label="Diáconos com mandato a vencer (nº)" name="diaconos_mandato_qtd" value={d.diaconos_mandato_qtd} onChange={set} readOnly={readOnly} />
        <SN label="3.10. Houve nomeação de conselheiros às Sociedades?" name="conselheiros_nomeados" value={d.conselheiros_nomeados} onChange={set} readOnly={readOnly} />
        <C label="Quais Sociedades?" name="quais_sociedades" value={d.quais_sociedades} onChange={set} readOnly={readOnly} />
        <SN label="3.11. Houve contribuição para causas extra-locais?" name="contribuicao_extra_locais" value={d.contribuicao_extra_locais} onChange={set} readOnly={readOnly} />
        <SN label="3.12. Contribuiu com Previdência Social do(s) pastor(es)?" name="previdencia_social_pastor" value={d.previdencia_social_pastor} onChange={set} readOnly={readOnly} />
        <SN label="FAP?" name="fap" value={d.fap} onChange={set} readOnly={readOnly} />
        <SN label="IPB-PREV?" name="ipb_prev" value={d.ipb_prev} onChange={set} readOnly={readOnly} />
        <C label="3.13. Reforma e/ou Construção em projeto" name="reforma_projeto" value={d.reforma_projeto} type="textarea" onChange={set} readOnly={readOnly} full />
        <C label="3.14. Reforma e/ou Construção em andamento" name="reforma_andamento" value={d.reforma_andamento} type="textarea" onChange={set} readOnly={readOnly} full />

        <Grupo titulo="4. Planejamento Estratégico" />
        <SN label="4.1. A Igreja tem Planejamento Estratégico?" name="tem_planejamento" value={d.tem_planejamento} onChange={set} readOnly={readOnly} />
        <C label="4.2. Quais os objetivos propostos e alcançados?" name="objetivos_alcancados" type="textarea" value={d.objetivos_alcancados} onChange={set} readOnly={readOnly} full />
        <C label="4.3. Quais os objetivos propostos e NÃO alcançados? Identificar as dificuldades." name="objetivos_nao_alcancados" type="textarea" value={d.objetivos_nao_alcancados} onChange={set} readOnly={readOnly} full />

        <Grupo titulo="5. Patrimônio" />
        <SN label="5.1. A Igreja tem Seguro do bem patrimonial?" name="seguro_patrimonial" value={d.seguro_patrimonial} onChange={set} readOnly={readOnly} />
        <SN label="5.2. Tem Alvará de Funcionamento?" name="alvara_funcionamento" value={d.alvara_funcionamento} onChange={set} readOnly={readOnly} />
        <SN label="5.3. Tem Licença do Corpo de Bombeiros em dia?" name="licenca_bombeiros" value={d.licenca_bombeiros} onChange={set} readOnly={readOnly} />
        <SN label="5.4. Tem Certificado Digital?" name="certificado_digital" value={d.certificado_digital} onChange={set} readOnly={readOnly} />

        <Grupo titulo="Dados do Secretário do Conselho" />
        <C label="Nome do Secretário" name="secretario_nome" value={d.secretario_nome} onChange={set} readOnly={readOnly} full />
        <C label="Endereço" name="secretario_endereco" value={d.secretario_endereco} onChange={set} readOnly={readOnly} full />
        <C label="Número" name="secretario_numero" value={d.secretario_numero} onChange={set} readOnly={readOnly} />
        <C label="Bairro" name="secretario_bairro" value={d.secretario_bairro} onChange={set} readOnly={readOnly} />
        <C label="Cidade" name="secretario_cidade" value={d.secretario_cidade} onChange={set} readOnly={readOnly} />
        <C label="UF" name="secretario_uf" value={d.secretario_uf} onChange={set} readOnly={readOnly} />
        <C label="CEP" name="secretario_cep" value={d.secretario_cep} onChange={set} readOnly={readOnly} />
        <C label="Celular" name="secretario_celular" value={d.secretario_celular} onChange={set} readOnly={readOnly} />
        <C label="E-mail" name="secretario_email" value={d.secretario_email} onChange={set} readOnly={readOnly} />
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onSave(d)}
            disabled={saving}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: '#1B3A6B' }}
          >
            {saving ? 'Salvando...' : 'Salvar Relatório do Conselho'}
          </button>
        </div>
      )}
    </div>
  )
}
