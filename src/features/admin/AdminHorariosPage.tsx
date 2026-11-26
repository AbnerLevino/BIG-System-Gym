import { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { Button, Card, Input, Modal, Table } from '../../components/common';
import {
  obterAtendentes,
  obterHorarioTrabalhoPorFuncionario,
  obterProfissionais,
  obterRegistroPontoAberto,
  obterRegistrosPonto,
  salvarHorarioTrabalho,
} from '../../data';
import {
  DIAS_SEMANA,
  estaNoTurnoAgora,
  formatarData,
  formatarDuracao,
  formatarHora,
  minutosTrabalhados,
  nomeFuncionario,
  resumoGrade,
  turnoDoDia,
} from '../../data/escalaService';
import type { TipoFuncionario, TurnoTrabalho } from '../../types/horarioTrabalho';
import type { RegistroPonto } from '../../types/registroPonto';

interface Linha {
  id: string;
  tipo: TipoFuncionario;
  nome: string;
}

type Rascunho = Record<number, { ativo: boolean; inicio: string; fim: string }>;

function rascunhoVazio(): Rascunho {
  const r: Rascunho = {};
  for (let d = 0; d < 7; d++) r[d] = { ativo: false, inicio: '08:00', fim: '12:00' };
  return r;
}

export default function AdminHorariosPage() {
  const [, setVersao] = useState(0);
  const [editando, setEditando] = useState<Linha | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho>(rascunhoVazio());
  const [erro, setErro] = useState('');

  const funcionarios: Linha[] = [
    ...obterAtendentes().map((a) => ({ id: (a as { id: string }).id, tipo: 'atendente' as const, nome: nomeFuncionario(a) })),
    ...obterProfissionais().map((p) => ({ id: (p as { id: string }).id, tipo: 'professional' as const, nome: nomeFuncionario(p) })),
  ];
  const nomePorId = (id: string) => funcionarios.find((f) => f.id === id)?.nome ?? 'Funcionário';

  function abrirEdicao(f: Linha) {
    const atual = obterHorarioTrabalhoPorFuncionario(f.id);
    const r = rascunhoVazio();
    atual?.turnos.forEach((t) => {
      r[t.diaSemana] = { ativo: true, inicio: t.inicio, fim: t.fim };
    });
    setRascunho(r);
    setErro('');
    setEditando(f);
  }

  function salvar() {
    if (!editando) return;
    const turnos: TurnoTrabalho[] = [];
    for (let d = 0; d < 7; d++) {
      const dia = rascunho[d];
      if (!dia.ativo) continue;
      if (!dia.inicio || !dia.fim || dia.fim <= dia.inicio) {
        setErro(`${DIAS_SEMANA[d]}: o horário de saída precisa ser depois da entrada.`);
        return;
      }
      turnos.push({ diaSemana: d, inicio: dia.inicio, fim: dia.fim });
    }
    const existente = obterHorarioTrabalhoPorFuncionario(editando.id);
    salvarHorarioTrabalho({
      id: existente?.id ?? crypto.randomUUID(),
      funcionarioId: editando.id,
      funcionarioTipo: editando.tipo,
      turnos,
    });
    setEditando(null);
    setVersao((v) => v + 1);
  }

  const hoje = new Date().getDay();
  const registros = obterRegistrosPonto().slice(0, 30);

  return (
    <AppLayout>
      <h1 className="font-heading text-2xl text-slate-800 mb-4">Horários de trabalho</h1>

      <Card title="Equipe">
        <Table
          columns={[
            { header: 'Nome', render: (f: Linha) => f.nome },
            { header: 'Função', render: (f: Linha) => (f.tipo === 'atendente' ? 'Atendente' : 'Profissional') },
            {
              header: 'Grade semanal',
              render: (f: Linha) => resumoGrade(obterHorarioTrabalhoPorFuncionario(f.id)?.turnos ?? []),
            },
            {
              header: 'Hoje',
              render: (f: Linha) => {
                const t = turnoDoDia(obterHorarioTrabalhoPorFuncionario(f.id)?.turnos ?? [], hoje);
                return t ? `${t.inicio}–${t.fim}` : 'Folga';
              },
            },
            {
              header: 'Agora',
              render: (f: Linha) => {
                const aberto = obterRegistroPontoAberto(f.id);
                const noTurno = estaNoTurnoAgora(obterHorarioTrabalhoPorFuncionario(f.id)?.turnos ?? []);
                if (aberto) return <span className="text-emerald-700">Em serviço desde {formatarHora(aberto.entrada)}</span>;
                if (noTurno) return <span className="text-red-600">Deveria estar em serviço</span>;
                return 'Fora de serviço';
              },
            },
            {
              header: '',
              render: (f: Linha) => (
                <Button variant="secondary" onClick={() => abrirEdicao(f)}>Editar horário</Button>
              ),
            },
          ]}
          rows={funcionarios}
          rowKey={(f: Linha) => f.id}
        />
      </Card>

      <div className="mt-6">
        <Card title="Últimos registros de ponto">
          <Table
            columns={[
              { header: 'Funcionário', render: (r: RegistroPonto) => nomePorId(r.funcionarioId) },
              { header: 'Data', render: (r: RegistroPonto) => formatarData(r.data) },
              { header: 'Entrada', render: (r: RegistroPonto) => formatarHora(r.entrada) },
              { header: 'Saída', render: (r: RegistroPonto) => (r.saida ? formatarHora(r.saida) : 'Em aberto') },
              {
                header: 'Total',
                render: (r: RegistroPonto) => (r.saida ? formatarDuracao(minutosTrabalhados(r)) : '—'),
              },
            ]}
            rows={registros}
            rowKey={(r: RegistroPonto) => r.id}
          />
        </Card>
      </div>

      <Modal open={editando !== null} title={`Horário de ${editando?.nome ?? ''}`} onClose={() => setEditando(null)}>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {DIAS_SEMANA.map((nome, d) => (
            <div key={d} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-28 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="accent-emerald-700"
                  checked={rascunho[d].ativo}
                  onChange={(e) => setRascunho((r) => ({ ...r, [d]: { ...r[d], ativo: e.target.checked } }))}
                />
                {nome}
              </label>
              <Input
                label=""
                type="time"
                disabled={!rascunho[d].ativo}
                value={rascunho[d].inicio}
                onChange={(e) => setRascunho((r) => ({ ...r, [d]: { ...r[d], inicio: e.target.value } }))}
              />
              <span className="text-slate-500">às</span>
              <Input
                label=""
                type="time"
                disabled={!rascunho[d].ativo}
                value={rascunho[d].fim}
                onChange={(e) => setRascunho((r) => ({ ...r, [d]: { ...r[d], fim: e.target.value } }))}
              />
            </div>
          ))}
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button variant="primary" onClick={salvar}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
