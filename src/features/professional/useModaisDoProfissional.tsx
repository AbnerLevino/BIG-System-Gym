// Ficha do aluno e "Nova avaliação" abrem em modal por cima da tela atual (mesmo
// padrão do atendente). O estado fica na URL:
//   ?aluno=id                    -> ficha do aluno
//   ?avaliacao=novo[&aluno=id]   -> nova avaliação (sem aluno, começa escolhendo)
// Assim o "voltar" do navegador fecha o modal e o link abre direto.
import { useSearchParams } from 'react-router-dom'
import { Modal } from '../../components/common'
import { useAuthStore } from '../../store/authStore'
import { FichaAlunoProfissional } from './FichaAlunoProfissional'
import { NovaAvaliacaoFluxo } from './NovaAvaliacaoFluxo'

export function useModaisDoProfissional(onAlterado: () => void) {
  const profissionalId = useAuthStore((state) => state.usuarioAtual?.refId ?? '')
  const [searchParams, setSearchParams] = useSearchParams()
  const alunoId = searchParams.get('aluno')
  const avaliando = searchParams.get('avaliacao') === 'novo'

  const abrirFicha = (id: string) => setSearchParams({ aluno: id })
  const abrirNovaAvaliacao = (id?: string) => setSearchParams(id ? { avaliacao: 'novo', aluno: id } : { avaliacao: 'novo' })
  const fechar = () => setSearchParams({})

  const modais = (
    <>
      <Modal open={alunoId !== null && !avaliando} title="Ficha do aluno" size="xl" onClose={fechar}>
        {alunoId && !avaliando ? (
          <FichaAlunoProfissional
            key={alunoId}
            alunoId={alunoId}
            profissionalId={profissionalId}
            onNovaAvaliacao={() => abrirNovaAvaliacao(alunoId)}
          />
        ) : null}
      </Modal>

      <Modal open={avaliando} title="Nova avaliação física" size="lg" onClose={fechar}>
        {avaliando ? (
          <NovaAvaliacaoFluxo
            key={alunoId ?? 'escolher'}
            alunoIdInicial={alunoId}
            profissionalId={profissionalId}
            onRegistrada={onAlterado}
            onVerFicha={abrirFicha}
            onFechar={fechar}
          />
        ) : null}
      </Modal>
    </>
  )

  return { abrirFicha, abrirNovaAvaliacao, modais }
}
