
import { useMemo, useState, type ReactNode } from "react";
import {
  UserPlus,
  ClipboardCheck,
  GraduationCap,
  Search,
  CheckCircle2,
  Circle,
} from "lucide-react";

// Tipos utilizados no módulo de RH

type StatusCandidato =
  | "Currículo recebido"
  | "Entrevista marcada"
  | "Aprovado";

type Candidato = {
  id: number;
  nome: string;
  vaga: string;
  status: StatusCandidato;
};

type TarefaIntegracao = {
  id: number;
  descricao: string;
  concluida: boolean;
};

type Treinamento = {
  id: number;
  colaborador: string;
  nome: string;
  data: string;
};

// Dados iniciais de exemplo

const candidatosIniciais: Candidato[] = [
  {
    id: 1,
    nome: "Mariana Oliveira",
    vaga: "Recepcionista",
    status: "Entrevista marcada",
  },
  {
    id: 2,
    nome: "Lucas Ferreira",
    vaga: "Instrutor",
    status: "Currículo recebido",
  },
  {
    id: 3,
    nome: "Beatriz Santos",
    vaga: "Recepcionista",
    status: "Aprovado",
  },
];

const tarefasIniciais: TarefaIntegracao[] = [
  {
    id: 1,
    descricao: "Conhecer as instalações da academia",
    concluida: false,
  },
  {
    id: 2,
    descricao: "Conhecer o sistema BigGym",
    concluida: false,
  },
  {
    id: 3,
    descricao: "Realizar treinamento de atendimento",
    concluida: false,
  },
  {
    id: 4,
    descricao: "Conhecer as regras e os procedimentos internos",
    concluida: false,
  },
];

const treinamentosIniciais: Treinamento[] = [
  {
    id: 1,
    colaborador: "Ana Costa",
    nome: "Atendimento ao cliente",
    data: "10/11/2026",
  },
  {
    id: 2,
    colaborador: "Pedro Almeida",
    nome: "Procedimentos de segurança",
    data: "18/11/2026",
  },
];

const statusCandidato: StatusCandidato[] = [
  "Currículo recebido",
  "Entrevista marcada",
  "Aprovado",
];

// Página principal do RH

export default function RHDashboardPage() {
  const [abaAtiva, setAbaAtiva] = useState<
    "candidatos" | "integracao" | "treinamentos"
  >("candidatos");

  const [candidatos, setCandidatos] =
    useState<Candidato[]>(candidatosIniciais);

  const [tarefas, setTarefas] =
    useState<TarefaIntegracao[]>(tarefasIniciais);

  const [treinamentos, setTreinamentos] =
    useState<Treinamento[]>(treinamentosIniciais);

  const [busca, setBusca] = useState("");
  const [nomeCandidato, setNomeCandidato] = useState("");
  const [vagaCandidato, setVagaCandidato] =
    useState("Recepcionista");

  const [nomeColaborador, setNomeColaborador] = useState("");
  const [nomeTreinamento, setNomeTreinamento] = useState("");
  const [dataTreinamento, setDataTreinamento] = useState("");

  // Pesquisa de candidatos

  const candidatosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    if (!termo) return candidatos;

    return candidatos.filter((candidato) =>
      `${candidato.nome} ${candidato.vaga} ${candidato.status}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo),
    );
  }, [busca, candidatos]);

  // Adicionar candidato

  function adicionarCandidato() {
    if (!nomeCandidato.trim()) return;

    const novoCandidato: Candidato = {
      id: Date.now(),
      nome: nomeCandidato.trim(),
      vaga: vagaCandidato,
      status: "Currículo recebido",
    };

    setCandidatos((lista) => [
      novoCandidato,
      ...lista,
    ]);

    setNomeCandidato("");
  }

  // Alterar status do candidato

  function alterarStatus(
    id: number,
    novoStatus: StatusCandidato,
  ) {
    setCandidatos((lista) =>
      lista.map((candidato) =>
        candidato.id === id
          ? { ...candidato, status: novoStatus }
          : candidato,
      ),
    );
  }

  // Marcar tarefa como concluída

  function alternarTarefa(id: number) {
    setTarefas((lista) =>
      lista.map((tarefa) =>
        tarefa.id === id
          ? {
              ...tarefa,
              concluida: !tarefa.concluida,
            }
          : tarefa,
      ),
    );
  }

  // Registrar treinamento

  function adicionarTreinamento() {
    if (
      !nomeColaborador.trim() ||
      !nomeTreinamento.trim() ||
      !dataTreinamento
    ) {
      return;
    }

    setTreinamentos((lista) => [
      {
        id: Date.now(),
        colaborador: nomeColaborador.trim(),
        nome: nomeTreinamento.trim(),
        data: new Date(
          `${dataTreinamento}T12:00:00`,
        ).toLocaleDateString("pt-BR"),
      },
      ...lista,
    ]);

    setNomeColaborador("");
    setNomeTreinamento("");
    setDataTreinamento("");
  }

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.concluida,
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Cabeçalho */}

        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            BigGym • Recursos Humanos
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Contratação e treinamento
          </h1>

          <p className="mt-2 text-slate-600">
            Acompanhe candidatos, organize a integração e consulte os
            treinamentos dos colaboradores.
          </p>
        </header>

        {/* Resumo */}

        <section className="grid gap-4 sm:grid-cols-3">
          <Resumo
            titulo="Candidatos cadastrados"
            valor={candidatos.length}
            icone={<UserPlus size={20} />}
          />

          <Resumo
            titulo="Tarefas de integração"
            valor={`${tarefasConcluidas}/${tarefas.length}`}
            icone={<ClipboardCheck size={20} />}
          />

          <Resumo
            titulo="Treinamentos registrados"
            valor={treinamentos.length}
            icone={<GraduationCap size={20} />}
          />
        </section>

        {/* Abas de navegação */}

        <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">

          <Aba
            ativa={abaAtiva === "candidatos"}
            onClick={() => setAbaAtiva("candidatos")}
          >
            <UserPlus size={17} />
            Candidatos
          </Aba>

          <Aba
            ativa={abaAtiva === "integracao"}
            onClick={() => setAbaAtiva("integracao")}
          >
            <ClipboardCheck size={17} />
            Integração
          </Aba>

          <Aba
            ativa={abaAtiva === "treinamentos"}
            onClick={() => setAbaAtiva("treinamentos")}
          >
            <GraduationCap size={17} />
            Treinamentos
          </Aba>

        </nav>

        {/* ÁREA 1 - CANDIDATOS */}

        {abaAtiva === "candidatos" && (
          <section className="space-y-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-semibold">
                Adicionar candidato
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">

                <input
                  value={nomeCandidato}
                  onChange={(evento) =>
                    setNomeCandidato(evento.target.value)
                  }
                  placeholder="Nome do candidato"
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-700"
                />

                <select
                  value={vagaCandidato}
                  onChange={(evento) =>
                    setVagaCandidato(evento.target.value)
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-700"
                >
                  <option>Recepcionista</option>
                  <option>Instrutor</option>
                  <option>Auxiliar de limpeza</option>
                  <option>Gestor</option>
                </select>

                <button
                  onClick={adicionarCandidato}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
                >
                  <UserPlus size={17} />
                  Adicionar
                </button>

              </div>
            </div>

            {/* Lista de candidatos */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <h2 className="text-lg font-semibold">
                  Acompanhamento de candidatos
                </h2>

                <div className="relative">

                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={busca}
                    onChange={(evento) =>
                      setBusca(evento.target.value)
                    }
                    placeholder="Buscar candidato..."
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-emerald-700 sm:w-64"
                  />

                </div>
              </div>

              <div className="mt-4 overflow-x-auto">

                <table className="w-full min-w-[620px] text-left text-sm">

                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-3 font-semibold">
                        Candidato
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Vaga
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Status
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {candidatosFiltrados.map((candidato) => (
                      <tr
                        key={candidato.id}
                        className="border-t border-slate-100"
                      >

                        <td className="px-3 py-3 font-medium">
                          {candidato.nome}
                        </td>

                        <td className="px-3 py-3">
                          {candidato.vaga}
                        </td>

                        <td className="px-3 py-3">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              candidato.status === "Aprovado"
                                ? "bg-emerald-100 text-emerald-800"
                                : candidato.status === "Entrevista marcada"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {candidato.status}
                          </span>

                        </td>

                        <td className="px-3 py-3">

                          <select
                            value={candidato.status}
                            onChange={(evento) =>
                              alterarStatus(
                                candidato.id,
                                evento.target.value as StatusCandidato,
                              )
                            }
                            className="rounded-md border border-slate-300 px-2 py-1.5"
                            aria-label={`Alterar status de ${candidato.nome}`}
                          >
                            {statusCandidato.map((status) => (
                              <option key={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                        </td>

                      </tr>
                    ))}

                    {candidatosFiltrados.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-slate-500"
                        >
                          Nenhum candidato encontrado.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>

              </div>
            </div>
          </section>
        )}

        {/* ÁREA 2 - INTEGRAÇÃO */}

        {abaAtiva === "integracao" && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  Checklist dos primeiros dias
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Marque cada atividade quando ela for concluída pelo novo colaborador.
                </p>

              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                {tarefasConcluidas} de {tarefas.length} concluídas
              </span>

            </div>

            {/* Barra de progresso */}

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{
                  width: `${
                    tarefas.length
                      ? (tarefasConcluidas / tarefas.length) * 100
                      : 0
                  }%`,
                }}
              />

            </div>

            {/* Lista de tarefas */}

            <ul className="mt-5 divide-y divide-slate-100">

              {tarefas.map((tarefa) => (
                <li
                  key={tarefa.id}
                  className="flex items-center gap-3 py-4"
                >

                  <button
                    onClick={() => alternarTarefa(tarefa.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                    aria-pressed={tarefa.concluida}
                  >

                    {tarefa.concluida ? (
                      <CheckCircle2 className="shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="shrink-0 text-slate-400" />
                    )}

                    <span
                      className={
                        tarefa.concluida
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }
                    >
                      {tarefa.descricao}
                    </span>

                  </button>

                  <span className="text-xs text-slate-500">
                    {tarefa.concluida ? "Concluída" : "Pendente"}
                  </span>

                </li>
              ))}

            </ul>
          </section>
        )}

        {/* ÁREA 3 - TREINAMENTOS */}

        {abaAtiva === "treinamentos" && (
          <section className="space-y-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-semibold">
                Registrar treinamento
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-3">

                <input
                  value={nomeColaborador}
                  onChange={(evento) =>
                    setNomeColaborador(evento.target.value)
                  }
                  placeholder="Nome do colaborador"
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-700"
                />

                <input
                  value={nomeTreinamento}
                  onChange={(evento) =>
                    setNomeTreinamento(evento.target.value)
                  }
                  placeholder="Nome do treinamento"
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-700"
                />

                <input
                  type="date"
                  value={dataTreinamento}
                  onChange={(evento) =>
                    setDataTreinamento(evento.target.value)
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-700"
                />

              </div>

              <button
                onClick={adicionarTreinamento}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
              >
                <GraduationCap size={17} />
                Salvar treinamento
              </button>

            </div>

            {/* Histórico */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-semibold">
                Histórico de treinamentos
              </h2>

              <div className="mt-4 overflow-x-auto">

                <table className="w-full min-w-[520px] text-left text-sm">

                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-3 font-semibold">
                        Colaborador
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Treinamento
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Data de conclusão
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {treinamentos.map((treinamento) => (
                      <tr
                        key={treinamento.id}
                        className="border-t border-slate-100"
                      >

                        <td className="px-3 py-3 font-medium">
                          {treinamento.colaborador}
                        </td>

                        <td className="px-3 py-3">
                          {treinamento.nome}
                        </td>

                        <td className="px-3 py-3">
                          {treinamento.data}
                        </td>

                      </tr>
                    ))}

                    {treinamentos.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-8 text-center text-slate-500"
                        >
                          Nenhum treinamento registrado.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>

              </div>
            </div>
          </section>
        )}

        <p className="text-xs text-slate-500">
          Protótipo acadêmico: os dados de exemplo ficam apenas na memória
          da página e são reiniciados quando ela é recarregada.
        </p>

      </div>
    </main>
  );
}

// Componente dos cartões de resumo

function Resumo({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: string | number;
  icone: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-600">
          {titulo}
        </p>

        <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
          {icone}
        </span>

      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {valor}
      </p>

    </div>
  );
}

// Componente das abas

function Aba({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        ativa
          ? "bg-emerald-700 text-white"
          : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
