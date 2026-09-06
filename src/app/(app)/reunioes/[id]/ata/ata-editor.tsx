'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Ata, Reuniao, AtaConteudo } from '@/types/database'

type SecaoKey = keyof AtaConteudo

const SECOES: { key: SecaoKey; label: string; titulo: string; placeholder: string }[] = [
  {
    key: 'verificacao_poderes',
    label: 'Verificação de Poderes',
    titulo: 'ATA DO ATO DE VERIFICAÇÃO DE PODERES',
    placeholder:
      `ATA DO ATO DE VERIFICAÇÃO DE PODERES DA [Nº] REUNIÃO [ORDINÁRIA/EXTRAORDINÁRIA] DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP

Às [HORA], do dia [DATA POR EXTENSO], na [LOCAL], reúne-se, previamente convocado, o Presbitério Leste de São Paulo - PSSP.

Composição da Mesa: Reverendo Amauri Costa de Oliveira, Presidente; Reverendo Fábio Luiz de Carvalho, Vice-presidente; Presbítero Anízio Alves Borges, Secretário Executivo; Reverendo Laércio Máximo Rodrigues, 1º Secretário; Reverendo Rogério de Castro Chaves, 2º Secretário; e Reverendo Atsushi Miyajima, Tesoureiro.

Feita a chamada pelo Secretário Executivo, registram-se a presença dos seguintes ministros:
[LISTA DE MINISTROS PRESENTES]

Todos os presentes assinaram o Livro de Presença do Concílio.

Ausentaram-se os seguintes ministros:
[LISTA DE AUSENTES]

Registram-se a presença das seguintes igrejas, por meio de seus representantes:
[IGREJAS E REPRESENTANTES PRESENTES]

Ausentes os representantes das Igrejas:
[IGREJAS AUSENTES]

Havendo quórum, às [HORA], o Presidente, Rev. Amauri Costa de Oliveira, declara instalada a [Nº] Reunião do Presbitério Leste de São Paulo - PSSP.

Às [HORA], encerra-se a sessão de verificação de poderes com oração feita pelo Rev. [QUEM].

E para constar eu, Rev. Rogério de Castro Chaves, 2º Secretário, a tudo presente, digito, dato e assino a presente ATA, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges, em livro próprio.

São Paulo, [DATA].`,
  },
  {
    key: 'sessao_preparatoria',
    label: 'Sessão Preparatória',
    titulo: 'ATA DA SESSÃO PREPARATÓRIA',
    placeholder:
      `ATA DA SESSÃO PREPARATÓRIA DA [Nº] REUNIÃO [ORDINÁRIA/EXTRAORDINÁRIA] DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP

Aos [DATA POR EXTENSO], às [HORA], passa-se ao exercício devocional.

Entoam-se os cânticos [CÂNTICOS], conduzidos pelo Rev. [QUEM].

Em seguida, o Rev. [QUEM] ora ao Senhor, [DESCRIÇÃO DA ORAÇÃO].

O Rev. [QUEM] faz a leitura do texto bíblico de [REFERÊNCIA BÍBLICA] e ministra sob o tema: "[TEMA]", fundamentando a mensagem nos seguintes argumentos:
1) [ARGUMENTO 1];
2) [ARGUMENTO 2]; e
3) [ARGUMENTO 3].

Às [HORA], encerra-se o exercício devocional com oração feita pelo Rev. [QUEM].

E para constar eu, Rev. Rogério de Castro Chaves, 2º Secretário, a tudo presente, redijo, datilho e assino a presente ata, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges.

São Paulo, [DATA].`,
  },
  {
    key: 'sessao_regular',
    label: 'Sessão Regular',
    titulo: 'ATA DA SESSÃO REGULAR',
    placeholder:
      `ATA DA SESSÃO REGULAR [ÚNICA/Nº] DA [Nº] REUNIÃO [ORDINÁRIA/EXTRAORDINÁRIA] DO PRESBITÉRIO LESTE DE SÃO PAULO - PSSP

Às [HORA], sob a presidência do Rev. Amauri Costa de Oliveira, inicia-se a sessão regular.

O Rev. [QUEM] ora ao Senhor, [DESCRIÇÃO].

Doc. 01, [DESCRIÇÃO DO DOCUMENTO].
[DELIBERAÇÃO — ex.: "Toma-se conhecimento e arquiva-se." ou "Após deliberação, o PSSP resolve..."]

Doc. 02, [DESCRIÇÃO DO DOCUMENTO].
[DELIBERAÇÃO]

Doc. 03, [DESCRIÇÃO DO DOCUMENTO].
[DELIBERAÇÃO]

Encerra-se a reunião às [HORA], com a oração do Rev. [QUEM].

E para constar eu, Rev. Rogério de Castro Chaves, 2º Secretário, a tudo presente, digito, dato e assino a presente ata, a qual será transcrita pelo Secretário Executivo, Presb. Anízio Alves Borges, em livro próprio.

São Paulo, [DATA].`,
  },
  {
    key: 'observacoes',
    label: 'Observações',
    titulo: 'Observações',
    placeholder: 'Registros adicionais, notas para revisão, pendências...',
  },
]

const CONTEUDO_VAZIO: AtaConteudo = {
  verificacao_poderes: '',
  sessao_preparatoria: '',
  sessao_regular: '',
  observacoes: '',
}

function migrarConteudoAntigo(conteudo: Record<string, string>): AtaConteudo {
  if ('verificacao_poderes' in conteudo) return conteudo as unknown as AtaConteudo
  // migração de dados antigos: concatenar seções antigas nas novas
  const verificacao_poderes = [conteudo.abertura, conteudo.verificacao_quorum].filter(Boolean).join('\n\n')
  const sessao_regular = [conteudo.pauta, conteudo.deliberacoes, conteudo.encerramento].filter(Boolean).join('\n\n')
  return {
    verificacao_poderes,
    sessao_preparatoria: '',
    sessao_regular,
    observacoes: conteudo.observacoes ?? '',
  }
}

export function AtaEditor({ reuniaoId, ata, reuniao }: { reuniaoId: string; ata: Ata | null; reuniao: Reuniao }) {
  const router = useRouter()
  const supabase = createClient()
  const [conteudo, setConteudo] = useState<AtaConteudo>(
    ata ? migrarConteudoAntigo(ata.conteudo as unknown as Record<string, string>) : CONTEUDO_VAZIO
  )
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoKey>('verificacao_poderes')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setSecao(key: SecaoKey, value: string) {
    setConteudo(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function salvar() {
    setSaving(true)
    if (ata) {
      await supabase.from('atas').update({ conteudo }).eq('id', ata.id)
    } else {
      await supabase.from('atas').insert({
        reuniao_id: reuniaoId,
        conteudo,
        status: 'rascunho',
      })
    }
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  const secaoAtual = SECOES.find(s => s.key === secaoAtiva)!
  const preenchimento = SECOES.filter(s => s.key !== 'observacoes')
    .filter(s => (conteudo[s.key] ?? '').trim().length > 0).length
  const totalPrincipais = 3

  return (
    <div className="card p-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {SECOES.map(s => {
          const preenchida = (conteudo[s.key] ?? '').trim().length > 0
          const isObs = s.key === 'observacoes'
          return (
            <button
              key={s.key}
              onClick={() => setSecaoAtiva(s.key)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                secaoAtiva === s.key
                  ? 'border-navy-700 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              style={secaoAtiva === s.key ? { borderBottomColor: '#1B3A6B' } : {}}
            >
              {preenchida && !isObs && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              )}
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Editor area */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{secaoAtual.titulo}</h3>
            {secaoAtiva === 'verificacao_poderes' && (
              <p className="text-xs text-gray-400 mt-0.5">Abertura formal, composição da mesa, chamada, quórum</p>
            )}
            {secaoAtiva === 'sessao_preparatoria' && (
              <p className="text-xs text-gray-400 mt-0.5">Devocional, cânticos, oração, mensagem bíblica</p>
            )}
            {secaoAtiva === 'sessao_regular' && (
              <p className="text-xs text-gray-400 mt-0.5">Documentos, deliberações, encerramento</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-500">Salvo</span>}
            <button
              onClick={salvar}
              disabled={saving}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: '#1B3A6B' }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        <textarea
          value={conteudo[secaoAtiva] ?? ''}
          onChange={e => setSecao(secaoAtiva, e.target.value)}
          placeholder={secaoAtual.placeholder}
          rows={20}
          className="w-full text-sm text-gray-800 leading-relaxed resize-none focus:outline-none font-mono"
          style={{ fontFamily: 'ui-monospace, "Courier New", monospace', fontSize: 13 }}
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {ata
            ? `Última atualização: ${new Date(ata.updated_at).toLocaleString('pt-BR')}`
            : 'Ata não iniciada'}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{preenchimento}/{totalPrincipais} seções preenchidas</span>
          <div className="flex items-center gap-1">
            {SECOES.filter(s => s.key !== 'observacoes').map(s => (
              <div
                key={s.key}
                title={s.label}
                className={`w-2 h-2 rounded-full ${(conteudo[s.key] ?? '').trim() ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
