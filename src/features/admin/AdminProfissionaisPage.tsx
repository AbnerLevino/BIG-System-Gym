import FuncionariosPage from './FuncionariosPage';
import { obterProfissionais, salvarProfissional } from '../../data';

export default function AdminProfissionaisPage() {
  return (
    <FuncionariosPage
      titulo="Profissionais"
      comCref
      obter={() => obterProfissionais() as never}
      salvar={(f) => salvarProfissional(f as never)}
    />
  );
}
