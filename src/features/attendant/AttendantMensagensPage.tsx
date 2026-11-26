import { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { Button, Card } from '../../components/common';
import { obterAlunoPorId, obterMensagens, salvarMensagem } from '../../data';
import { useAuthStore } from '../../store/authStore';
import type { Mensagem } from '../../types/mensagem';

export default function AttendantMensagensPage() {
  const user = useAuthStore((s) => s.user); // ajustar se o store usar outro nome
  const [caixa, setCaixa] = useState<Mensagem[]>(() => obterMensagens());

  const nomeAluno = (id: string) => {
    const a = obterAlunoPorId(id) as unknown as { nomeCompleto?: string; name?: string } | undefined;
    return a?.nomeCompleto ?? a?.name ?? 'Aluno';
  };

  function marcarLida(m: Mensagem) {
    salvarMensagem({ ...m, lida: true, lidaPorId: user?.id });
    setCaixa(obterMensagens());
  }

  const naoLidas = caixa.filter((m) => !m.lida).length;

  return (
    <AppLayout>
      <h1 className="font-heading text-2xl text-slate-800 mb-1">Mensagens dos alunos</h1>
      <p className="text-sm text-slate-600 mb-4">{naoLidas} não lida(s)</p>

      <div className="space-y-3">
        {caixa.length === 0 && <Card>Nenhuma mensagem.</Card>}
        {caixa.map((m) => (
          <div key={m.id} className="transition-all duration-200 ease-out hover:scale-105">
            <Card title={`${m.assunto} — ${nomeAluno(m.remetenteId)}`}>
              <p className="text-slate-700 whitespace-pre-wrap">{m.texto}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(m.dataEnvio).toLocaleString('pt-BR')}</span>
                {m.lida ? (
                  <span>Lida</span>
                ) : (
                  <Button variant="secondary" onClick={() => marcarLida(m)}>Marcar como lida</Button>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
