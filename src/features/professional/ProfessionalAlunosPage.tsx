// Meus alunos — alunos com vínculo personal com o profissional logado, com a
// situação da avaliação física de cada um (junta o que antes eram as telas
// "Alunos" e "Avaliações físicas"). Ficha e nova avaliação abrem em modal.
import { useCallback, useState } from 'react'
import { ClipboardPlus } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, CampoBusca } from '../../components/common'
import { Abas, CabecalhoPagina, EstadoVazio, ItemAluno } from '../../components/painel'
import { obterAlunosDoProfissional, type SituacaoAvaliacao } from '../../data'
import { useAuthStore } from '../../store/authStore'
import { ESTILO_SITUACAO, descricaoSituacao } from './rotulos'
import { useModaisDoProfissional } from './useModaisDoProfissional'

type Filtro = 'todos' | SituacaoAvaliacao

export function ProfessionalAlunosPage() {
  const profissionalId = useAuthStore((state) => state.usuarioAtual?.refId ?? '')
  const [alunos, setAlunos] = useState(() => obterAlunosDoProfissional(profissionalId))
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const recarregar = useCallback(() => setAlunos(obterAlunosDoProfissional(profissionalId)), [profissionalId])
  const { abrirFicha, abrirNovaAvaliacao, modais } = useModaisDoProfissional(recarregar)

  const contar = (situacao: SituacaoAvaliacao) => alunos.filter((item) => item.situacao === situacao).length
  const abas: { id: Filtro; label: string }[] = [
    { id: 'todos', label: `Todos (${alunos.length})` },
    { id: 'semAvaliacao', label: `Sem avaliação (${contar('semAvaliacao')})` },
    { id: 'vencida', label: `Mensal pendente (${contar('vencida')})` },
    { id: 'emDia', label: `Em dia (${contar('emDia')})` },
  ]

  const termo = busca.trim().toLowerCase()
  const visiveis = alunos.filter(
    (item) =>
      (filtro === 'todos' || item.situacao === filtro) &&
      (!termo || item.aluno.fullName.toLowerCase().includes(termo) || item.aluno.cpf.includes(termo)),
  )

  return (
    <AppLayout>
      <CabecalhoPagina
        titulo="Meus alunos"
        descricao="Alunos com vínculo personal com você e a situação da avaliação física de cada um."
        lateral={
          <Button onClick={() => abrirNovaAvaliacao()}>
            <ClipboardPlus size={14} /> Nova avaliação
          </Button>
        }
      />

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <Abas abas={abas} ativa={filtro} onTrocar={setFiltro} />
        <CampoBusca valor={busca} onMudar={setBusca} placeholder="Buscar por nome ou CPF" className="w-full sm:w-72" />
      </div>

      {visiveis.length === 0 ? (
        <EstadoVazio
          titulo={alunos.length === 0 ? 'Você ainda não tem alunos personal.' : 'Nenhum aluno nesta lista.'}
          descricao={
            alunos.length === 0
              ? 'Quando um aluno contratar você pela vitrine, ele aparece aqui.'
              : 'Troque o filtro ou a busca.'
          }
        />
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {visiveis.map((item) => {
            const estilo = ESTILO_SITUACAO[item.situacao]
            return (
              <ItemAluno
                key={item.aluno.id}
                aluno={item.aluno}
                nome={item.aluno.fullName}
                descricao={descricaoSituacao(item)}
                selo={estilo}
                acao={{ label: 'Avaliar', onClick: () => abrirNovaAvaliacao(item.aluno.id) }}
                onAbrir={() => abrirFicha(item.aluno.id)}
              />
            )
          })}
        </ul>
      )}

      {modais}
    </AppLayout>
  )
}
