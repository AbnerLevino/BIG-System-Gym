import { useState } from 'react';
import { AppLayout } from '../../components/layout';
import { Button, Card, Input, Modal, Table } from '../../components/common';
import type { DadosRh, TipoContratacao } from '../../types/dadosRh';

type Funcionario = DadosRh & { id: string; cref?: string };

interface Props {
  titulo: string;
  comCref: boolean;
  obter: () => Funcionario[];
  salvar: (f: Funcionario) => void;
}

const VAZIO: Omit<Funcionario, 'id'> = {
  nomeCompleto: '', cpf: '', rg: '', endereco: '', telefone: '',
  contatoEmergencia: '', banco: '', agencia: '', conta: '',
  tipoContratacao: 'clt', cargo: '', dataAdmissao: '', salario: 0, cref: '',
};

const TIPOS: TipoContratacao[] = ['clt', 'pj', 'estagio', 'autonomo'];

export default function FuncionariosPage({ titulo, comCref, obter, salvar }: Props) {
  const [lista, setLista] = useState<Funcionario[]>(() => obter());
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Funcionario>({ id: '', ...VAZIO });
  const [erro, setErro] = useState('');

  const campo = <K extends keyof Funcionario>(k: K, v: Funcionario[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function novo() {
    setForm({ id: '', ...VAZIO });
    setErro('');
    setAberto(true);
  }

  function editar(f: Funcionario) {
    setForm(f);
    setErro('');
    setAberto(true);
  }

  function confirmar() {
    if (!form.nomeCompleto.trim() || !form.cpf.trim() || !form.cargo.trim() || !form.dataAdmissao) {
      setErro('Preencha nome, CPF, cargo e data de admissão.');
      return;
    }
    salvar({ ...form, id: form.id || crypto.randomUUID() });
    setLista(obter());
    setAberto(false);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl text-slate-800">{titulo}</h1>
        <Button variant="primary" onClick={novo}>Novo cadastro</Button>
      </div>

      <Card>
        <Table
          columns={[
            { header: 'Nome', render: (f: Funcionario) => f.nomeCompleto },
            { header: 'Cargo', render: (f: Funcionario) => f.cargo },
            { header: 'Contratação', render: (f: Funcionario) => f.tipoContratacao.toUpperCase() },
            { header: 'Admissão', render: (f: Funcionario) => f.dataAdmissao },
            {
              header: '',
              render: (f: Funcionario) => (
                <Button variant="secondary" onClick={() => editar(f)}>Editar</Button>
              ),
            },
          ]}
          rows={lista}
          rowKey={(f: Funcionario) => f.id}
        />
      </Card>

      <Modal open={aberto} title={form.id ? 'Editar cadastro' : 'Novo cadastro'} onClose={() => setAberto(false)}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Nome completo" value={form.nomeCompleto} onChange={(e) => campo('nomeCompleto', e.target.value)} />
          <Input label="CPF" value={form.cpf} onChange={(e) => campo('cpf', e.target.value)} />
          <Input label="RG" value={form.rg} onChange={(e) => campo('rg', e.target.value)} />
          <Input label="Endereço" value={form.endereco} onChange={(e) => campo('endereco', e.target.value)} />
          <Input label="Telefone" value={form.telefone} onChange={(e) => campo('telefone', e.target.value)} />
          <Input label="Contato de emergência" value={form.contatoEmergencia} onChange={(e) => campo('contatoEmergencia', e.target.value)} />
          <Input label="Banco" value={form.banco} onChange={(e) => campo('banco', e.target.value)} />
          <Input label="Agência" value={form.agencia} onChange={(e) => campo('agencia', e.target.value)} />
          <Input label="Conta" value={form.conta} onChange={(e) => campo('conta', e.target.value)} />

          <label className="block text-sm text-slate-700">
            Tipo de contratação
            <select
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              value={form.tipoContratacao}
              onChange={(e) => campo('tipoContratacao', e.target.value as TipoContratacao)}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </label>

          <Input label="Cargo / função" value={form.cargo} onChange={(e) => campo('cargo', e.target.value)} />
          <Input label="Data de admissão" type="date" value={form.dataAdmissao} onChange={(e) => campo('dataAdmissao', e.target.value)} />
          <Input label="Salário (R$)" type="number" min={0} value={form.salario} onChange={(e) => campo('salario', Number(e.target.value))} />
          {comCref && (
            <Input label="CREF (opcional)" value={form.cref ?? ''} onChange={(e) => campo('cref', e.target.value)} />
          )}

          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button variant="primary" onClick={confirmar}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
