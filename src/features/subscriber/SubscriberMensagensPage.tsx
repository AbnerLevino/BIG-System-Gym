import { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { Button, Card, Input } from '../../components/common';
import { obterMensagensPorRemetente, salvarMensagem } from '../../data';
import { useAuthStore } from '../../store/authStore';
import type { Mensagem } from '../../types/mensagem';

export default function SubscriberMensagensPage() {
  const user = useAuthStore((s) => s.user); // ajustar se o store usar outro nome
  // ATENÇÃO: assume que user.id é o id do aluno. Se for diferente, buscar o aluno pelo usuário.
  const meuId = user?.id ?? '';

  const [assunto, setAssunto] = useState('');
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [enviadas, setEnviadas] = useState<Mensagem[]>(() => obterMensagensPorRemetente(meuId));

  function enviar() {
    if (!assunto.trim() || !texto.trim()) {
      setErro('Preencha o assunto e a mensagem.');
      return;
    }
    salvarMensagem({
      id: crypto.randomUUID(),
      remetenteId: meuId,
      assunto: assunto.trim(),
      texto: texto.trim(),
      dataEnvio: new Date().toISOString(),
      lida: false,
    });
    setEnviadas(obterMensagensPorRemetente(meuId));
    setAssunto('');
    setTexto('');
    setErro('');
  }

  return (
    <AppLayout>
      <h1 className="font-heading text-2xl text-slate-800 mb-4">Falar com a recepção</h1>

      <Card title="Nova mensagem">
        <div className="space-y-3">
          <Input label="Assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          <label className="block text-sm text-slate-700">
            Mensagem
            <textarea
              rows={4}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <Button variant="primary" onClick={enviar}>Enviar</Button>
        </div>
      </Card>

      <div className="mt-6 space-y-3">
        <h2 className="font-heading text-lg text-slate-800">Enviadas</h2>
        {enviadas.length === 0 && <Card>Você ainda não enviou mensagens.</Card>}
        {enviadas.map((m) => (
          <Card key={m.id} title={m.assunto}>
            <p className="text-slate-700 whitespace-pre-wrap">{m.texto}</p>
            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>{new Date(m.dataEnvio).toLocaleString('pt-BR')}</span>
              <span>{m.lida ? 'Lida pela recepção' : 'Aguardando leitura'}</span>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
