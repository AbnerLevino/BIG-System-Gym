// Agenda semanal RECORRENTE do profissional (RF-FUND-03, D13/D14): cada item é dia da
// semana + horário de início/fim e vale pra todas as semanas. Só o próprio profissional
// logado edita a sua grade (o profissionalId vem do usuário logado, nunca de escolha na tela).
// É a mesma agenda que a vitrine de personal do aluno lê. Adicionar horário abre um modal.
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Input, Modal } from '../../components/common'
import { CabecalhoPagina } from '../../components/painel'
import {
  DIAS_SEMANA,
  diaSemanaDeHoje,
  obterAgendaPorProfissional,
  removerItemAgenda,
  salvarItemAgenda,
} from '../../data'
import type { AgendaProfissional, DiaSemana } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { NOME_DIA } from './rotulos'

const campoClasse =
  'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30'

export function ProfessionalAgendaPage() {
  const profissionalId = useAuthStore((state) => state.usuarioAtual?.refId ?? '')

  const [grade, setGrade] = useState<AgendaProfissional[]>(() => obterAgendaPorProfissional(profissionalId))
  // Dia escolhido no "+": abre o modal já nesse dia.
  const [adicionandoEm, setAdicionandoEm] = useState<DiaSemana | null>(null)
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('12:00')
  const [erro, setErro] = useState('')

  const hoje = diaSemanaDeHoje()
  const totalHoras = grade.reduce((total, item) => {
    const [hi, mi] = item.horaInicio.split(':').map(Number)
    const [hf, mf] = item.horaFim.split(':').map(Number)
    return total + (hf * 60 + mf - (hi * 60 + mi)) / 60
  }, 0)

  function abrirAdicionar(dia: DiaSemana) {
    setAdicionandoEm(dia)
    setErro('')
  }

  function adicionarHorario() {
    if (!adicionandoEm) return
    setErro('')
    if (!horaInicio || !horaFim || horaFim <= horaInicio) {
      setErro('O horário de fim precisa ser depois do horário de início.')
      return
    }
    const conflita = grade.some(
      (item) => item.diaSemana === adicionandoEm && horaInicio < item.horaFim && item.horaInicio < horaFim,
    )
    if (conflita) {
      setErro(`Já existe um horário na ${NOME_DIA[adicionandoEm].toLowerCase()} que se sobrepõe a esse.`)
      return
    }
    salvarItemAgenda({ id: crypto.randomUUID(), profissionalId, diaSemana: adicionandoEm, horaInicio, horaFim })
    setGrade(obterAgendaPorProfissional(profissionalId))
    setAdicionandoEm(null)
  }

  function remover(id: string) {
    removerItemAgenda(id)
    setGrade(obterAgendaPorProfissional(profissionalId))
  }

  return (
    <AppLayout>
      <CabecalhoPagina
        titulo="Minha agenda"
        descricao="Seus horários de atendimento. A grade se repete toda semana e é a que os alunos veem na vitrine de personal."
        lateral={
          <p className="text-xs text-slate-500">
            {grade.length} {grade.length === 1 ? 'horário' : 'horários'} ·{' '}
            {totalHoras.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h por semana
          </p>
        }
      />

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {DIAS_SEMANA.map((dia) => {
          const itens = grade.filter((item) => item.diaSemana === dia)
          const ehHoje = dia === hoje
          return (
            <div
              key={dia}
              className={`flex flex-col rounded-2xl border bg-white p-4 ${ehHoje ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200'}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-heading text-sm font-semibold text-slate-900">
                  {NOME_DIA[dia]}
                  {ehHoje ? (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Hoje
                    </span>
                  ) : null}
                </h2>
                <button
                  type="button"
                  onClick={() => abrirAdicionar(dia)}
                  aria-label={`Adicionar horário na ${NOME_DIA[dia].toLowerCase()}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-emerald-700 hover:text-emerald-700"
                >
                  <Plus size={14} />
                </button>
              </div>
              {itens.length === 0 ? (
                <p className="text-xs text-slate-400">Sem atendimento</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {itens.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-1 rounded-xl bg-emerald-50 py-2 pl-2.5 pr-1 text-[13px] font-medium text-emerald-900"
                    >
                      <span className="whitespace-nowrap">
                        {item.horaInicio}–{item.horaFim}
                      </span>
                      <button
                        type="button"
                        onClick={() => remover(item.id)}
                        aria-label={`Remover ${NOME_DIA[dia]} ${item.horaInicio}–${item.horaFim}`}
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-white hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </section>

      <Modal
        open={adicionandoEm !== null}
        title={adicionandoEm ? `Novo horário na ${NOME_DIA[adicionandoEm].toLowerCase()}` : ''}
        onClose={() => setAdicionandoEm(null)}
      >
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-slate-700">
            Dia da semana
            <select
              value={adicionandoEm ?? 'segunda'}
              onChange={(e) => setAdicionandoEm(e.target.value as DiaSemana)}
              className={campoClasse}
            >
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>
                  {NOME_DIA[dia]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input id="inicio" label="Início" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            <Input id="fim" label="Fim" type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
          </div>
          <p className="text-xs text-slate-500">O horário se repete toda semana.</p>
          {erro ? <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{erro}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAdicionandoEm(null)}>
              Cancelar
            </Button>
            <Button onClick={adicionarHorario}>
              <Plus size={14} /> Adicionar horário
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
