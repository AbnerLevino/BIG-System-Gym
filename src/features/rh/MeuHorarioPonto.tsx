import { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { Button, Card, Table } from '../../components/common';
import {
  obterHorarioTrabalhoPorFuncionario,
  obterRegistroPontoAberto,
  obterRegistrosPontoPorFuncionario,
  registrarEntrada,
  registrarSaida,
} from '../../data';
import {
  dataLocal,
  formatarData,
  formatarDuracao,
  formatarHora,
  minutosTrabalhados,
  resumoGrade,
} from '../../data/escalaService';
import type { RegistroPonto } from '../../types/registroPonto';
import GradeSemanal from './GradeSemanal';
import { useFuncionarioLogado } from './useFuncionarioLogado';

// Tela do funcionário (atendente ou profissional): consulta o próprio horário e marca ponto.
export default function MeuHorarioPonto() {
  const func = useFuncionarioLogado();
  const [, setVersao] = useState(0);
  const atualizar = () => setVersao((v) => v + 1);

  if (!func) {
    return (
      <AppLayout>
        <Card>Não foi possível identificar o funcionário logado.</Card>
      </AppLayout>
    );
  }

  const horario = obterHorarioTrabalhoPorFuncionario(func.id);
  const aberto = obterRegistroPontoAberto(func.id);
  const registros = obterRegistrosPontoPorFuncionario(func.id);

  const mesAtual = dataLocal(new Date()).slice(0, 7);
  const minutosNoMes = registros
    .filter((r) => r.data.startsWith(mesAtual))
    .reduce((soma, r) => soma + minutosTrabalhados(r), 0);

  function entrar() {
    registrarEntrada(func!.id, func!.tipo);
    atualizar();
  }

  function sair() {
    registrarSaida(func!.id);
    atualizar();
  }

  return (
    <AppLayout>
      <h1 className="font-heading text-2xl text-slate-800 mb-4">Meu horário e ponto</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Meu horário de trabalho">
          {horario && horario.turnos.length > 0 ? (
            <>
              <p className="text-sm text-slate-600 mb-3">{resumoGrade(horario.turnos)}</p>
              <GradeSemanal turnos={horario.turnos} />
            </>
          ) : (
            <p className="text-slate-600">A gestão ainda não definiu o seu horário.</p>
          )}
        </Card>

        <Card title="Ponto de hoje">
          <p className="text-slate-700 mb-3">
            {aberto
              ? `Você está em serviço desde as ${formatarHora(aberto.entrada)}.`
              : 'Você ainda não registrou entrada.'}
          </p>
          {aberto ? (
            <Button variant="danger" onClick={sair}>Registrar saída</Button>
          ) : (
            <Button variant="primary" onClick={entrar}>Registrar entrada</Button>
          )}
          <p className="mt-4 text-sm text-slate-600">
            Horas registradas neste mês: <strong>{formatarDuracao(minutosNoMes)}</strong>
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Meu histórico de ponto">
          <Table
            columns={[
              { header: 'Data', render: (r: RegistroPonto) => formatarData(r.data) },
              { header: 'Entrada', render: (r: RegistroPonto) => formatarHora(r.entrada) },
              { header: 'Saída', render: (r: RegistroPonto) => (r.saida ? formatarHora(r.saida) : 'Em aberto') },
              {
                header: 'Total',
                render: (r: RegistroPonto) => (r.saida ? formatarDuracao(minutosTrabalhados(r)) : '—'),
              },
            ]}
            rows={registros.slice(0, 15)}
            rowKey={(r: RegistroPonto) => r.id}
          />
        </Card>
      </div>
    </AppLayout>
  );
}
