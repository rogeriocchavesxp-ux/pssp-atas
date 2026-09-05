'use client'
import { useState } from 'react'

interface Props {
  dados: Record<string, unknown>
  readOnly: boolean
  saving: boolean
  onSave: (dados: unknown) => void
}

const cls = (readOnly: boolean) =>
  `border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`

function Grupo({ titulo }: { titulo: string }) {
  return (
    <div className="col-span-full pt-4 pb-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{titulo}</h3>
      <div className="mt-1 border-b border-gray-100" />
    </div>
  )
}

function N({ label, name, d, set, readOnly, cols = 1 }: {
  label: string; name: string; d: Record<string, unknown>; set: (n: string, v: string) => void; readOnly: boolean; cols?: number
}) {
  return (
    <div style={{ gridColumn: cols > 1 ? `span ${cols}` : undefined }}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="number" min={0} className={cls(readOnly)}
        value={d[name] as number ?? ''} readOnly={readOnly}
        onChange={e => set(name, e.target.value)} />
    </div>
  )
}

function T({ label, name, d, set, readOnly, cols = 1 }: {
  label: string; name: string; d: Record<string, unknown>; set: (n: string, v: string) => void; readOnly: boolean; cols?: number
}) {
  return (
    <div style={{ gridColumn: cols > 1 ? `span ${cols}` : undefined }}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="text" className={cls(readOnly)}
        value={d[name] as string ?? ''} readOnly={readOnly}
        onChange={e => set(name, e.target.value)} />
    </div>
  )
}

function Moeda({ label, name, d, set, readOnly }: {
  label: string; name: string; d: Record<string, unknown>; set: (n: string, v: string) => void; readOnly: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
        <input type="number" min={0} step={0.01} className={`${cls(readOnly)} pl-8`}
          value={d[name] as number ?? ''} readOnly={readOnly}
          onChange={e => set(name, e.target.value)} />
      </div>
    </div>
  )
}

function Calculado({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
        <div className="border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm bg-gray-50 text-gray-700 font-medium">
          {value ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
        </div>
      </div>
    </div>
  )
}

// Linha do rol com 3 colunas: Masc | Fem | Total automático
function RolRow({ label, nM, nF, d, set, readOnly }: {
  label: string; nM: string; nF: string; d: Record<string, unknown>; set: (n: string, v: string) => void; readOnly: boolean
}) {
  const m = Number(d[nM]) || 0
  const f = Number(d[nF]) || 0
  return (
    <tr>
      <td className="py-1.5 pr-3 text-sm text-gray-700 whitespace-nowrap">{label}</td>
      <td className="py-1 pr-2">
        <input type="number" min={0} className={`${cls(readOnly)} text-center`}
          value={d[nM] as number ?? ''} readOnly={readOnly}
          onChange={e => set(nM, e.target.value)} />
      </td>
      <td className="py-1 pr-2">
        <input type="number" min={0} className={`${cls(readOnly)} text-center`}
          value={d[nF] as number ?? ''} readOnly={readOnly}
          onChange={e => set(nF, e.target.value)} />
      </td>
      <td className="py-1">
        <div className="border border-gray-100 rounded-md px-3 py-2 text-sm bg-gray-50 text-center text-gray-600">
          {m + f || '—'}
        </div>
      </td>
    </tr>
  )
}

function RolSection({ titulo, rows, d, set, readOnly }: {
  titulo: string
  rows: { label: string; nM: string; nF: string }[]
  d: Record<string, unknown>
  set: (n: string, v: string) => void
  readOnly: boolean
}) {
  return (
    <>
      <tr>
        <td colSpan={4} className="pt-4 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{titulo}</span>
        </td>
      </tr>
      {rows.map(row => (
        <RolRow key={row.nM} {...row} d={d} set={set} readOnly={readOnly} />
      ))}
    </>
  )
}

function somaMovimento(d: Record<string, unknown>, keys: string[]) {
  return keys.reduce((acc, k) => acc + (Number(d[k]) || 0), 0)
}

export function SecaoEstatistica({ dados, readOnly, saving, onSave }: Props) {
  const [d, setD] = useState<Record<string, unknown>>(dados)

  function set(name: string, val: string) {
    setD(prev => ({ ...prev, [name]: val }))
  }

  // Cálculos automáticos — Comungantes
  const cAdm = somaMovimento(d, [
    'c_adm_profissao_fe_m','c_adm_profissao_fe_f',
    'c_adm_profissao_fe_batismo_m','c_adm_profissao_fe_batismo_f',
    'c_adm_transferencia_m','c_adm_transferencia_f',
    'c_adm_jurisdicao_m','c_adm_jurisdicao_f',
    'c_adm_restauracao_m','c_adm_restauracao_f',
    'c_adm_designacao_m','c_adm_designacao_f',
  ])
  const cDem = somaMovimento(d, [
    'c_dem_transferencia_m','c_dem_transferencia_f',
    'c_dem_falecimento_m','c_dem_falecimento_f',
    'c_dem_exclusao_m','c_dem_exclusao_f',
    'c_dem_ordenacao_m','c_dem_ordenacao_f',
    'c_dem_rol_separado_m','c_dem_rol_separado_f',
  ])
  const cAntM = Number(d.c_ano_anterior_m) || 0
  const cAntF = Number(d.c_ano_anterior_f) || 0
  const cDifM = somaMovimento(d, ['c_adm_profissao_fe_m','c_adm_profissao_fe_batismo_m','c_adm_transferencia_m','c_adm_jurisdicao_m','c_adm_restauracao_m','c_adm_designacao_m'])
             - somaMovimento(d, ['c_dem_transferencia_m','c_dem_falecimento_m','c_dem_exclusao_m','c_dem_ordenacao_m','c_dem_rol_separado_m'])
  const cDifF = somaMovimento(d, ['c_adm_profissao_fe_f','c_adm_profissao_fe_batismo_f','c_adm_transferencia_f','c_adm_jurisdicao_f','c_adm_restauracao_f','c_adm_designacao_f'])
             - somaMovimento(d, ['c_dem_transferencia_f','c_dem_falecimento_f','c_dem_exclusao_f','c_dem_ordenacao_f','c_dem_rol_separado_f'])
  const cAtualM = cAntM + cDifM
  const cAtualF = cAntF + cDifF

  // Não-comungantes
  const ncAdm = somaMovimento(d, ['nc_adm_batismo_m','nc_adm_batismo_f','nc_adm_transferencia_m','nc_adm_transferencia_f','nc_adm_jurisdicao_m','nc_adm_jurisdicao_f'])
  const ncDem = somaMovimento(d, ['nc_dem_profissao_fe_m','nc_dem_profissao_fe_f','nc_dem_transferencia_m','nc_dem_transferencia_f','nc_dem_falecimento_m','nc_dem_falecimento_f','nc_dem_exclusao_m','nc_dem_exclusao_f'])
  const ncAntM = Number(d.nc_ano_anterior_m) || 0
  const ncAntF = Number(d.nc_ano_anterior_f) || 0
  const ncDifM = somaMovimento(d, ['nc_adm_batismo_m','nc_adm_transferencia_m','nc_adm_jurisdicao_m'])
              - somaMovimento(d, ['nc_dem_profissao_fe_m','nc_dem_transferencia_m','nc_dem_falecimento_m','nc_dem_exclusao_m'])
  const ncDifF = somaMovimento(d, ['nc_adm_batismo_f','nc_adm_transferencia_f','nc_adm_jurisdicao_f'])
              - somaMovimento(d, ['nc_dem_profissao_fe_f','nc_dem_transferencia_f','nc_dem_falecimento_f','nc_dem_exclusao_f'])
  const ncAtualM = ncAntM + ncDifM
  const ncAtualF = ncAntF + ncDifF

  const rolAtualM = cAtualM + ncAtualM
  const rolAtualF = cAtualF + ncAtualF

  // Cálculos financeiros — ano anterior
  const antReceita = somaMovimento(d, ['ant_dizimos','ant_ofertas','ant_ofertas_missionarias','ant_ofertas_especificas','ant_receitas_financeiras','ant_emprestimos','ant_parcerias','ant_outras_receitas'])
  const antDespesa = somaMovimento(d, ['ant_desp_patrimonio','ant_desp_causas_locais','ant_desp_evangelismo','ant_desp_missoes','ant_desp_acao_social','ant_desp_sustento_pastoral','ant_desp_verba_presbiterial','ant_desp_dizimo_sc','ant_desp_emprestimos','ant_desp_outras'])
  const antSaldoInicial = Number(d.ant_saldo_inicial) || 0
  const antGrandeTotal = antSaldoInicial + antReceita
  const antSaldoFinal = antGrandeTotal - antDespesa

  // Previsão
  const prevReceita = somaMovimento(d, ['prev_dizimos','prev_ofertas','prev_ofertas_missionarias','prev_ofertas_especificas','prev_receitas_financeiras','prev_emprestimos','prev_parcerias','prev_outras_receitas'])
  const prevDespesa = somaMovimento(d, ['prev_desp_patrimonio','prev_desp_causas_locais','prev_desp_evangelismo','prev_desp_missoes','prev_desp_acao_social','prev_desp_sustento_pastoral','prev_desp_verba_presbiterial','prev_desp_dizimo_sc','prev_desp_emprestimos','prev_desp_outras'])
  const prevSaldoInicial = Number(d.prev_saldo_inicial) || 0
  const prevGrandeTotal = prevSaldoInicial + prevReceita
  const prevSaldoFinal = prevGrandeTotal - prevDespesa

  void cAdm; void cDem; void ncAdm; void ncDem // suppress unused

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">

        <Grupo titulo="I — Identificação da Igreja ou Congregação" />
        <T label="Nome da Igreja / Congregação" name="nome_igreja" d={d} set={set} readOnly={readOnly} cols={4} />
        <T label="Endereço" name="endereco" d={d} set={set} readOnly={readOnly} cols={2} />
        <T label="Número" name="numero" d={d} set={set} readOnly={readOnly} />
        <T label="Complemento" name="complemento" d={d} set={set} readOnly={readOnly} />
        <T label="Bairro" name="bairro" d={d} set={set} readOnly={readOnly} />
        <T label="Cidade" name="cidade" d={d} set={set} readOnly={readOnly} />
        <T label="UF" name="uf" d={d} set={set} readOnly={readOnly} />
        <T label="CEP" name="cep" d={d} set={set} readOnly={readOnly} />
        <T label="Telefone 1" name="telefone1" d={d} set={set} readOnly={readOnly} />
        <T label="Telefone 2" name="telefone2" d={d} set={set} readOnly={readOnly} />
        <T label="E-mail" name="email" d={d} set={set} readOnly={readOnly} />
        <T label="Data de Organização" name="data_organizacao" d={d} set={set} readOnly={readOnly} />
        <T label="CNPJ" name="cnpj" d={d} set={set} readOnly={readOnly} />
        <T label="Site" name="site" d={d} set={set} readOnly={readOnly} />

        <Grupo titulo="II — Estrutura da Comunidade · Liderança Formal" />
        <N label="Pastores" name="pastores" d={d} set={set} readOnly={readOnly} />
        <N label="Licenciados" name="licenciados" d={d} set={set} readOnly={readOnly} />
        <N label="Presbíteros" name="presbiteros" d={d} set={set} readOnly={readOnly} />
        <N label="Diáconos" name="diaconos" d={d} set={set} readOnly={readOnly} />
        <N label="Evangelistas" name="evangelistas" d={d} set={set} readOnly={readOnly} />
        <N label="Missionários" name="missionarios" d={d} set={set} readOnly={readOnly} />
        <N label="Candidatos" name="candidatos" d={d} set={set} readOnly={readOnly} />

        <Grupo titulo="Estrutura do Trabalho" />
        <N label="Congregações da Igreja" name="congregacoes" d={d} set={set} readOnly={readOnly} />
        <N label="Pontos de Pregação" name="pontos_pregacao" d={d} set={set} readOnly={readOnly} />
        <N label="Escolas Dominicais" name="escolas_dominicais" d={d} set={set} readOnly={readOnly} />
        <N label="Professores da Escola Dominical" name="professores_ed" d={d} set={set} readOnly={readOnly} />
        <N label="Alunos Escola Dominical (ano atual)" name="alunos_ed_atual" d={d} set={set} readOnly={readOnly} />
        <N label="Alunos Escola Dominical (ano anterior)" name="alunos_ed_anterior" d={d} set={set} readOnly={readOnly} />

        <Grupo titulo="Departamentos Internos" />
        <div className="col-span-full">
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-400 mb-2">
            <div className="col-span-1">Departamento</div>
            <div>Nº Deptos</div>
            <div>Nº Membros</div>
          </div>
          {[
            { label: 'UCP', qKey: 'ucp_qtd', mKey: 'ucp_membros' },
            { label: 'UPA', qKey: 'upa_qtd', mKey: 'upa_membros' },
            { label: 'UMP', qKey: 'ump_qtd', mKey: 'ump_membros' },
            { label: 'SAF', qKey: 'saf_qtd', mKey: 'saf_membros' },
            { label: 'UPH', qKey: 'uph_qtd', mKey: 'uph_membros' },
            { label: 'Outras', qKey: 'outras_qtd', mKey: 'outras_membros' },
          ].map(row => (
            <div key={row.label} className="grid grid-cols-7 gap-2 mb-1.5 items-center">
              <div className="col-span-1 text-sm text-gray-700">{row.label}</div>
              <input type="number" min={0} className={`${cls(readOnly)} text-center`}
                value={d[row.qKey] as number ?? ''} readOnly={readOnly}
                onChange={e => set(row.qKey, e.target.value)} />
              <input type="number" min={0} className={`${cls(readOnly)} text-center`}
                value={d[row.mKey] as number ?? ''} readOnly={readOnly}
                onChange={e => set(row.mKey, e.target.value)} />
            </div>
          ))}
          <div className="grid grid-cols-7 gap-2 mt-2 items-center font-medium">
            <div className="col-span-1 text-sm text-gray-700">TOTAIS</div>
            <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-center text-gray-600">
              {somaMovimento(d, ['ucp_qtd','upa_qtd','ump_qtd','saf_qtd','uph_qtd','outras_qtd']) || '—'}
            </div>
            <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-center text-gray-600">
              {somaMovimento(d, ['ucp_membros','upa_membros','ump_membros','saf_membros','uph_membros','outras_membros']) || '—'}
            </div>
          </div>
        </div>

        <Grupo titulo="III — Rol de Membros" />
        <div className="col-span-full overflow-x-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Comungantes */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                COMUNGANTES
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left py-1 pr-3 font-medium">Movimento</th>
                    <th className="text-center py-1 w-20 font-medium">Masc.</th>
                    <th className="text-center py-1 w-20 font-medium">Fem.</th>
                    <th className="text-center py-1 w-20 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <RolSection titulo="ADMISSÃO" rows={[
                    { label: 'Profissão de Fé', nM: 'c_adm_profissao_fe_m', nF: 'c_adm_profissao_fe_f' },
                    { label: 'Profissão de Fé e Batismo', nM: 'c_adm_profissao_fe_batismo_m', nF: 'c_adm_profissao_fe_batismo_f' },
                    { label: 'Transferência', nM: 'c_adm_transferencia_m', nF: 'c_adm_transferencia_f' },
                    { label: 'Jurisdição', nM: 'c_adm_jurisdicao_m', nF: 'c_adm_jurisdicao_f' },
                    { label: 'Restauração', nM: 'c_adm_restauracao_m', nF: 'c_adm_restauracao_f' },
                    { label: 'Designação do Presbitério', nM: 'c_adm_designacao_m', nF: 'c_adm_designacao_f' },
                  ]} d={d} set={set} readOnly={readOnly} />
                  <RolSection titulo="DEMISSÃO" rows={[
                    { label: 'Transferência', nM: 'c_dem_transferencia_m', nF: 'c_dem_transferencia_f' },
                    { label: 'Falecimento', nM: 'c_dem_falecimento_m', nF: 'c_dem_falecimento_f' },
                    { label: 'Exclusão', nM: 'c_dem_exclusao_m', nF: 'c_dem_exclusao_f' },
                    { label: 'Ordenação', nM: 'c_dem_ordenacao_m', nF: 'c_dem_ordenacao_f' },
                    { label: 'Rol Separado', nM: 'c_dem_rol_separado_m', nF: 'c_dem_rol_separado_f' },
                  ]} d={d} set={set} readOnly={readOnly} />
                  <tr className="border-t border-gray-200">
                    <td className="py-1.5 pr-3 text-sm font-medium text-gray-700">Diferença (Adm − Dem)</td>
                    <td className="py-1 text-center text-sm font-medium text-gray-700">{cDifM || '—'}</td>
                    <td className="py-1 text-center text-sm font-medium text-gray-700">{cDifF || '—'}</td>
                    <td className="py-1 text-center text-sm font-medium text-gray-700">{cDifM + cDifF || '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-3 text-sm text-gray-700">Comungantes Ano Anterior</td>
                    <td className="py-1 pr-2">
                      <input type="number" min={0} className={`${cls(readOnly)} text-center`}
                        value={d.c_ano_anterior_m as number ?? ''} readOnly={readOnly}
                        onChange={e => set('c_ano_anterior_m', e.target.value)} />
                    </td>
                    <td className="py-1 pr-2">
                      <input type="number" min={0} className={`${cls(readOnly)} text-center`}
                        value={d.c_ano_anterior_f as number ?? ''} readOnly={readOnly}
                        onChange={e => set('c_ano_anterior_f', e.target.value)} />
                    </td>
                    <td className="py-1 text-center text-sm text-gray-600">{cAntM + cAntF || '—'}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="py-1.5 pr-3 text-sm font-semibold text-gray-800">Comungantes Ano Atual</td>
                    <td className="py-1 text-center text-sm font-semibold">{cAtualM || '—'}</td>
                    <td className="py-1 text-center text-sm font-semibold">{cAtualF || '—'}</td>
                    <td className="py-1 text-center text-sm font-semibold">{cAtualM + cAtualF || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Não-comungantes */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                NÃO-COMUNGANTES
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left py-1 pr-3 font-medium">Movimento</th>
                    <th className="text-center py-1 w-20 font-medium">Masc.</th>
                    <th className="text-center py-1 w-20 font-medium">Fem.</th>
                    <th className="text-center py-1 w-20 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <RolSection titulo="ADMISSÃO" rows={[
                    { label: 'Batismo', nM: 'nc_adm_batismo_m', nF: 'nc_adm_batismo_f' },
                    { label: 'Transferência', nM: 'nc_adm_transferencia_m', nF: 'nc_adm_transferencia_f' },
                    { label: 'Jurisdição ex-officio', nM: 'nc_adm_jurisdicao_m', nF: 'nc_adm_jurisdicao_f' },
                  ]} d={d} set={set} readOnly={readOnly} />
                  <RolSection titulo="DEMISSÃO" rows={[
                    { label: 'Profissão de Fé', nM: 'nc_dem_profissao_fe_m', nF: 'nc_dem_profissao_fe_f' },
                    { label: 'Transferência', nM: 'nc_dem_transferencia_m', nF: 'nc_dem_transferencia_f' },
                    { label: 'Falecimento', nM: 'nc_dem_falecimento_m', nF: 'nc_dem_falecimento_f' },
                    { label: 'Exclusão', nM: 'nc_dem_exclusao_m', nF: 'nc_dem_exclusao_f' },
                  ]} d={d} set={set} readOnly={readOnly} />
                  <tr className="border-t border-gray-200">
                    <td className="py-1.5 pr-3 text-sm font-medium text-gray-700">Diferença (Adm − Dem)</td>
                    <td className="py-1 text-center text-sm font-medium text-gray-700">{ncDifM || '—'}</td>
                    <td className="py-1 text-center text-sm font-medium text-gray-700">{ncDifF || '—'}</td>
                    <td className="py-1 text-center text-sm font-medium text-gray-700">{ncDifM + ncDifF || '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-3 text-sm text-gray-700">Não-Comungantes Ano Anterior</td>
                    <td className="py-1 pr-2">
                      <input type="number" min={0} className={`${cls(readOnly)} text-center`}
                        value={d.nc_ano_anterior_m as number ?? ''} readOnly={readOnly}
                        onChange={e => set('nc_ano_anterior_m', e.target.value)} />
                    </td>
                    <td className="py-1 pr-2">
                      <input type="number" min={0} className={`${cls(readOnly)} text-center`}
                        value={d.nc_ano_anterior_f as number ?? ''} readOnly={readOnly}
                        onChange={e => set('nc_ano_anterior_f', e.target.value)} />
                    </td>
                    <td className="py-1 text-center text-sm text-gray-600">{ncAntM + ncAntF || '—'}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="py-1.5 pr-3 text-sm font-semibold text-gray-800">Não-Comungantes Ano Atual</td>
                    <td className="py-1 text-center text-sm font-semibold">{ncAtualM || '—'}</td>
                    <td className="py-1 text-center text-sm font-semibold">{ncAtualF || '—'}</td>
                    <td className="py-1 text-center text-sm font-semibold">{ncAtualM + ncAtualF || '—'}</td>
                  </tr>
                  <tr className="bg-navy" style={{ background: '#1B3A6B' }}>
                    <td className="py-2 pr-3 text-sm font-bold text-white">ROL ATUAL (Com + Não-Com)</td>
                    <td className="py-1 text-center text-sm font-bold text-white">{rolAtualM || '—'}</td>
                    <td className="py-1 text-center text-sm font-bold text-white">{rolAtualF || '—'}</td>
                    <td className="py-1 text-center text-sm font-bold text-white">{rolAtualM + rolAtualF || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Grupo titulo="IV — Informações Financeiras · Movimento do Ano Anterior" />
        {/* Dois painéis lado a lado */}
        <div className="col-span-full grid grid-cols-2 gap-8">
          {/* Ano Anterior */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-200">
              Movimento Financeiro do Ano Anterior
            </div>
            <div className="space-y-2">
              <Moeda label="Saldo — Ano Anterior" name="ant_saldo_inicial" d={d} set={set} readOnly={readOnly} />
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Receitas</div>
              <Moeda label="Dízimos" name="ant_dizimos" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ofertas" name="ant_ofertas" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ofertas Missionárias" name="ant_ofertas_missionarias" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ofertas Específicas" name="ant_ofertas_especificas" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Receitas Financeiras" name="ant_receitas_financeiras" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Empréstimos IPB / JPEF" name="ant_emprestimos" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Parcerias" name="ant_parcerias" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Outras Receitas" name="ant_outras_receitas" d={d} set={set} readOnly={readOnly} />
              <Calculado label="Total da Receita Anual" value={antReceita} />
              <Calculado label="Grande Total" value={antGrandeTotal} />
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Despesas</div>
              <Moeda label="Patrimônio" name="ant_desp_patrimonio" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Causas Locais" name="ant_desp_causas_locais" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Evangelismo Local" name="ant_desp_evangelismo" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Missões" name="ant_desp_missoes" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ação Social" name="ant_desp_acao_social" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Sustento Pastoral" name="ant_desp_sustento_pastoral" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Verba Presbiterial" name="ant_desp_verba_presbiterial" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Dízimo ao Supremo Concílio" name="ant_desp_dizimo_sc" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Empréstimos IPB / JPEF" name="ant_desp_emprestimos" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Outras Despesas" name="ant_desp_outras" d={d} set={set} readOnly={readOnly} />
              <Calculado label="Total da Despesa Anual" value={antDespesa} />
              <Calculado label="Saldo — Ano Seguinte" value={antSaldoFinal} />
              <Calculado label="Grande Total" value={antGrandeTotal} />
            </div>
          </div>

          {/* Previsão orçamentária */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-200">
              Previsão Orçamentária — Próximo Exercício
            </div>
            <div className="space-y-2">
              <Moeda label="Saldo — Ano Anterior" name="prev_saldo_inicial" d={d} set={set} readOnly={readOnly} />
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Receitas</div>
              <Moeda label="Dízimos" name="prev_dizimos" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ofertas" name="prev_ofertas" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ofertas Missionárias" name="prev_ofertas_missionarias" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ofertas Específicas" name="prev_ofertas_especificas" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Receitas Financeiras" name="prev_receitas_financeiras" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Empréstimos IPB / JPEF" name="prev_emprestimos" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Parcerias" name="prev_parcerias" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Outras Receitas" name="prev_outras_receitas" d={d} set={set} readOnly={readOnly} />
              <Calculado label="Total da Receita Anual" value={prevReceita} />
              <Calculado label="Grande Total" value={prevGrandeTotal} />
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-2">Despesas</div>
              <Moeda label="Patrimônio" name="prev_desp_patrimonio" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Causas Locais" name="prev_desp_causas_locais" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Evangelismo Local" name="prev_desp_evangelismo" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Missões" name="prev_desp_missoes" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Ação Social" name="prev_desp_acao_social" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Sustento Pastoral" name="prev_desp_sustento_pastoral" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Verba Presbiterial" name="prev_desp_verba_presbiterial" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Dízimo ao Supremo Concílio" name="prev_desp_dizimo_sc" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Empréstimos IPB / JPEF" name="prev_desp_emprestimos" d={d} set={set} readOnly={readOnly} />
              <Moeda label="Outras Despesas" name="prev_desp_outras" d={d} set={set} readOnly={readOnly} />
              <Calculado label="Total da Despesa Anual" value={prevDespesa} />
              <Calculado label="Saldo — Ano Seguinte" value={prevSaldoFinal} />
              <Calculado label="Grande Total" value={prevGrandeTotal} />
            </div>
          </div>
        </div>

        <Grupo titulo="VI — Informações Finais" />
        <T label="Secretário do Conselho" name="secretario_nome" d={d} set={set} readOnly={readOnly} cols={2} />
        <T label="Endereço" name="secretario_endereco" d={d} set={set} readOnly={readOnly} cols={2} />
        <T label="Número" name="secretario_numero" d={d} set={set} readOnly={readOnly} />
        <T label="Bairro" name="secretario_bairro" d={d} set={set} readOnly={readOnly} />
        <T label="Cidade" name="secretario_cidade" d={d} set={set} readOnly={readOnly} />
        <T label="UF" name="secretario_uf" d={d} set={set} readOnly={readOnly} />
        <T label="CEP" name="secretario_cep" d={d} set={set} readOnly={readOnly} />
        <T label="Celular" name="secretario_celular" d={d} set={set} readOnly={readOnly} />
        <T label="E-mail" name="secretario_email" d={d} set={set} readOnly={readOnly} />
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onSave(d)}
            disabled={saving}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: '#1B3A6B' }}
          >
            {saving ? 'Salvando...' : 'Salvar Cadastro & Estatística'}
          </button>
        </div>
      )}
    </div>
  )
}
