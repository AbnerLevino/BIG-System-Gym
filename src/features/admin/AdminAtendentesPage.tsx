import FuncionariosPage from './FuncionariosPage';
import { obterAtendentes, salvarAtendente } from '../../data';

export default function AdminAtendentesPage() {
  return (
    <FuncionariosPage
      titulo="Atendentes"
      comCref={false}
      obter={() => obterAtendentes() as never}
      salvar={(f) => salvarAtendente(f as never)}
    />
  );
}
