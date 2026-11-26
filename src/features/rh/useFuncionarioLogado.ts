import { useAuthStore } from '../../store/authStore';
import type { TipoFuncionario } from '../../types/horarioTrabalho';

// ÚNICO lugar que descobre "quem é o funcionário logado".
// ATENÇÃO: assume que user.id é o id do Atendente/Profissional e que user.role
// é 'atendente' ou 'professional'. Se o id do funcionário for outro, ajustar só aqui.
export function useFuncionarioLogado(): { id: string; tipo: TipoFuncionario } | null {
  const user = useAuthStore((s) => s.user) as unknown as { id: string; role: string } | null;
  if (!user) return null;
  if (user.role === 'atendente') return { id: user.id, tipo: 'atendente' };
  if (user.role === 'professional') return { id: user.id, tipo: 'professional' };
  return null;
}
