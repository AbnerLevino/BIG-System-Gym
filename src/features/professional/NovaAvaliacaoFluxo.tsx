// Lançamento de avaliação física (RF-PRO-03) em modal: escolher o aluno (quando
// não veio da ficha) -> preencher -> concluído. O tipo (principal/mensal) é decidido
// por registrarAvaliacaoFisica(); aqui só mostramos de antemão qual será. Numa
// mensal, cada campo mostra o valor da avaliação anterior como referência.
import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, Search } from 'lucide-react'
import { Button, Input } from '../../components/common'
import { AvatarAluno } from '../../components/aluno'
import { EstadoVazio, formatarDataBr } from '../../components/painel'
import {
  dataLocalISO,
  obterAlunoPorId,
  obterAlunosDoProfissional,
  obterUltimaAvaliacaoPorAluno,
  profissionalAtendeAluno,
  registrarAvaliacaoFisica,
} from '../../data'
import type { AvaliacaoFisica } from '../../types'
import { ESTILO_SITUACAO, formatarNumero, rotuloMedida } from './rotulos'

const MEDIDAS_PADRAO = ['peito', 'braco', 'cintura', 'quadril', 'coxa']

interface NovaAvaliacaoFluxoProps {
  alunoIdInicial: string | null
  profissionalId: string
  onRegistrada: () => void
  onVerFicha: (alunoId: string) => void
  onFechar: () => void
}

type Etapa = 'aluno' | 'dados' | 'concluido'

interface Rascunho {
  objective: string
  assessmentDate: string
  weight: string
  description: string
  notes: string
  measurements: Record<string, string>
}

function rascunhoInicial(anterior?: AvaliacaoFisica): Rascunho {
  const nomes = anterior ? Object.keys(anterior.measurements) : MEDIDAS_PADRAO
  return {
    objective: anterior?.objective ?? '',
    assessmentDate: dataLocalISO(),
    weight: '',
    description: '',
    notes: '',
    measurements: Object.fromEntries(nomes.map((nome) => [nome, ''])),
  }
}

export function NovaAvaliacaoFluxo({
  alunoIdInicial,
  profissionalId,
  onRegistrada,
  onVerFicha,
  onFechar,
}: NovaAvaliacaoFluxoProps) {
  const [alunoId, setAlunoId] = useState(alunoIdInicial)
  const [etapa, setEtapa] = useState<Etapa>(alunoIdInicial ? 'dados' : 'aluno')
  const [busca, setBusca] = useState('')
  const [rascunho, setRascunho] = useState<Rascunho>(() =>
    rascunhoInicial(alunoIdInicial ? obterUltimaAvaliacaoPorAluno(alunoIdInicial) : undefined),
  )
  const [erro, setErro] = useState('')
  const [registrada, setRegistrada] = useState<AvaliacaoFisica | null>(null)

  const alunos = useMemo(() => obterAlunosDoProfissional(profissionalId), [profissionalId])
  const aluno = alunoId ? obterAlunoPorId(alunoId) : undefined
  const anterior = alunoId ? obterUltimaAvaliacaoPorAluno(alunoId) : undefined
  const seraPrincipal = !anterior

  function escolher(id: string) {
    setAlunoId(id)
    setRascunho(rascunhoInicial(obterUltimaAvaliacaoPorAluno(id)))
    setErro('')
    setEtapa('dados')
  }

  function salvar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    if (!alunoId || !profissionalAtendeAluno(profissionalId, alunoId)) {
      setErro('Só o personal vinculado ao aluno pode lançar avaliação.')
      return
    }
    const peso = Number(rascunho.weight.replace(',', '.'))
    if (!rascunho.objective.trim() || !rascunho.description.trim() || !(peso > 0)) {
      setErro('Preencha objetivo, descrição e um peso válido.')
      return
    }
    const nova = registrarAvaliacaoFisica({
      alunoId,
      objective: rascunho.objective.trim(),
      description: rascunho.description.trim(),
      notes: rascunho.notes.trim(),
      assessmentDate: rascunho.assessmentDate,
      weight: peso,
      measurements: Object.fromEntries(
        Object.entries(rascunho.measurements).map(([nome, valor]) => [nome, Number(valor.replace(',', '.')) || 0]),
      ),
    })
    setRegistrada(nova)
    setEtapa('concluido')
    onRegistrada()
  }

  // ---------- 1. Escolher o aluno ----------
  if (etapa === 'aluno') {
    const termo = busca.trim().toLowerCase()
    const filtrados = alunos.filter(
      (item) => !termo || item.aluno.fullName.toLowerCase().includes(termo) || item.aluno.cpf.includes(termo),
    )
    return (
      <div>
        <p className="text-sm text-slate-500">Escolha o aluno que vai ser avaliado.</p>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-emerald-700">
          <Search size={16} className="text-slate-400" />
          <input
            autoFocus
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF"
            className="w-full text-sm outline-none"
          />
        </label>
        {filtrados.length === 0 ? (
          <EstadoVazio titulo="Nenhum aluno encontrado." descricao="Só aparecem alunos com vínculo personal com você." />
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {filtrados.map((item) => {
              const estilo = ESTILO_SITUACAO[item.situacao]
              return (
                <li key={item.aluno.id}>
                  <button
                    type="button"
                    onClick={() => escolher(item.aluno.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-emerald-600/40"
                  >
                    <AvatarAluno aluno={item.aluno} tamanho="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{item.aluno.fullName}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${estilo.classes}`}>
                      {estilo.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  // ---------- 3. Concluído ----------
  if (etapa === 'concluido' && registrada && aluno) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-700" size={44} />
        <p className="mt-3 font-heading text-lg font-semibold text-slate-900">
          Avaliação {registrada.tipo} registrada
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {aluno.fullName} · {formatarDataBr(registrada.assessmentDate)} · {formatarNumero(registrada.weight)} kg
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={onFechar}>
            Fechar
          </Button>
          <Button onClick={() => onVerFicha(aluno.id)}>Ver ficha do aluno</Button>
        </div>
      </div>
    )
  }

  // ---------- 2. Dados da avaliação ----------
  if (!aluno) return <p className="text-sm text-slate-600">Aluno não encontrado.</p>

  const referencia = (valor: number | undefined, unidade: string) =>
    valor !== undefined && valor > 0 ? `Anterior: ${formatarNumero(valor)} ${unidade}` : undefined

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <AvatarAluno aluno={aluno} tamanho="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{aluno.fullName}</p>
          {!alunoIdInicial ? (
            <button type="button" onClick={() => setEtapa('aluno')} className="text-xs font-semibold text-emerald-700 hover:underline">
              Trocar aluno
            </button>
          ) : null}
        </div>
      </div>

      <p
        className={`rounded-xl border px-4 py-3 text-sm ${
          seraPrincipal ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-zinc-50 text-slate-700'
        }`}
      >
        {seraPrincipal ? (
          <>
            Esta será a <strong>avaliação principal</strong> — a referência para medir a evolução do aluno.
          </>
        ) : (
          <>
            Esta será uma <strong>avaliação mensal</strong> de acompanhamento. Os valores da última avaliação (
            {formatarDataBr(anterior?.assessmentDate)}) aparecem como referência.
          </>
        )}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input
            id="objetivo"
            label="Objetivo"
            value={rascunho.objective}
            onChange={(e) => setRascunho({ ...rascunho, objective: e.target.value })}
            placeholder="Ex.: Hipertrofia"
          />
        </div>
        <Input
          id="data"
          label="Data"
          type="date"
          value={rascunho.assessmentDate}
          onChange={(e) => setRascunho({ ...rascunho, assessmentDate: e.target.value })}
        />
        <div>
          <Input
            id="peso"
            label="Peso (kg)"
            inputMode="decimal"
            value={rascunho.weight}
            onChange={(e) => setRascunho({ ...rascunho, weight: e.target.value })}
            placeholder="Ex.: 72,5"
          />
          {referencia(anterior?.weight, 'kg') ? (
            <p className="mt-1 text-xs text-slate-500">{referencia(anterior?.weight, 'kg')}</p>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medidas corporais (cm)</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {Object.entries(rascunho.measurements).map(([nome, valor]) => (
            <div key={nome}>
              <Input
                id={`medida-${nome}`}
                label={rotuloMedida(nome)}
                inputMode="decimal"
                value={valor}
                onChange={(e) =>
                  setRascunho({ ...rascunho, measurements: { ...rascunho.measurements, [nome]: e.target.value } })
                }
              />
              {referencia(anterior?.measurements[nome], 'cm') ? (
                <p className="mt-1 text-xs text-slate-500">{referencia(anterior?.measurements[nome], 'cm')}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Descrição da avaliação
        <textarea
          rows={3}
          value={rascunho.description}
          onChange={(e) => setRascunho({ ...rascunho, description: e.target.value })}
          placeholder="Condições e observações da avaliação"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
        />
      </label>
      <Input
        id="observacoes"
        label="Observações (opcional)"
        value={rascunho.notes}
        onChange={(e) => setRascunho({ ...rascunho, notes: e.target.value })}
      />

      {erro ? <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{erro}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onFechar}>
          Cancelar
        </Button>
        <Button type="submit">Registrar avaliação {seraPrincipal ? 'principal' : 'mensal'}</Button>
      </div>
    </form>
  )
}
