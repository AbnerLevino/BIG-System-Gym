// Agenda semanal RECORRENTE do profissional (RF-FUND-03, D13/D14): cada item é dia da
// semana + horário de início/fim e vale pra todas as semanas. Só o próprio profissional
// logado edita a sua grade (o profissionalId vem do usuário logado, nunca de escolha na tela).
// É a mesma agenda que a vitrine de personal do aluno lê.
import { useState } from 'react'
import { CalendarDays, Clock3, Plus, Trash2 } from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Button, Card } from '../../components/common'
import {
  DIAS_SEMANA,
  diaSemanaDeHoje,
  obterAgendaPorProfissional,
  removerItemAgenda,
  salvarItemAgenda,
} from '../../data'
import type { AgendaProfissional, DiaSemana } from '../../types'
import { useAuthStore } from '../../store/authStore'

const NOME_DIA: Record<DiaSemana, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const campoClasse =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'

export function ProfessionalAgendaPage() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const profissionalId = usuarioAtual?.refId ?? ''

  const [grade, setGrade] = useState<AgendaProfissional[]>(() => obterAgendaPorProfissional(profissionalId))
  const [diaSemana, setDiaSemana] = useState<DiaSemana>('segunda')
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('12:00')
  const [erro, setErro] = useState('')

  const hoje = diaSemanaDeHoje()

  function recarregar() {
    setGrade(obterAgendaPorProfissional(profissionalId))
  }

  function adicionarHorario() {
    setErro('')
    if (!horaInicio || !horaFim || horaFim <= horaInicio) {
      setErro('O horário de fim precisa ser depois do horário de início.')
      return
    }
    const conflita = grade.some(
      (item) => item.diaSemana === diaSemana && horaInicio < item.horaFim && item.horaInicio < horaFim,
    )
    if (conflita) {
      setErro(`Já existe um horário em ${NOME_DIA[diaSemana]} que se sobrepõe a esse.`)
      return
    }
    salvarItemAgenda({ id: crypto.randomUUID(), profissionalId, diaSemana, horaInicio, horaFim })
    recarregar()
  }

  function remover(id: string) {
    removerItemAgenda(id)
    recarregar()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium text-emerald-700">Área profissional</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900">Agenda semanal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Seus horários de atendimento. A grade se repete toda semana e é a que os alunos veem na vitrine de personal.
          </p>
        </header>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Plus className="text-emerald-700" size={18} />
            <h2 className="font-semibold text-slate-900">Adicionar horário</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Dia da semana</span>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value as DiaSemana)}
                className={campoClasse}
              >
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia} value={dia}>
                    {NOME_DIA[dia]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Início</span>
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={campoClasse} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Fim</span>
              <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className={campoClasse} />
            </label>
            <Button type="button" onClick={adicionarHorario}>
              <Plus size={16} />
              Adicionar
            </Button>
          </div>
          {erro && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
        </Card>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {DIAS_SEMANA.map((dia) => {
            const itens = grade.filter((item) => item.diaSemana === dia)
            return (
              <Card key={dia} className={`!p-4 ${dia === hoje ? 'ring-2 ring-emerald-600' : ''}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">{NOME_DIA[dia]}</h3>
                  {dia === hoje && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Hoje
                    </span>
                  )}
                </div>
                {itens.length === 0 ? (
                  <p className="text-xs text-slate-400">Sem atendimento</p>
                ) : (
                  <ul className="space-y-2">
                    {itens.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-sm text-emerald-900"
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
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
              </Card>
            )
          })}
        </section>

        {grade.length === 0 && (
          <Card>
            <div className="py-6 text-center">
              <CalendarDays className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="font-medium text-slate-700">Nenhum horário cadastrado</p>
              <p className="mt-1 text-sm text-slate-500">Adicione seus horários de atendimento acima.</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
