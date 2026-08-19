import { useEffect, useState } from "react";
import {
  listarTurmas, criarTurma, removerTurma,
  listarAlunos, criarAluno, removerAluno,
  listarAntenas, criarAntena, removerAntena,
  listarLeituras, registrarLeitura,
} from "@/lib/dados";
import type { Turma, Aluno, Antena, Leitura } from "@/lib/supabase";

const ABAS = ["turmas", "alunos", "antenas", "simulador", "historico"] as const;
type Aba = typeof ABAS[number];

const LABEL_ABA: Record<Aba, string> = {
  turmas: "🏫 Turmas",
  alunos: "🎓 Alunos",
  antenas: "📡 Antenas",
  simulador: "🧪 Simulador",
  historico: "📋 Histórico",
};

export default function Gestao() {
  const [aba, setAba] = useState<Aba>("historico");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [antenas, setAntenas] = useState<Antena[]>([]);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [toast, setToast] = useState("");

  async function carregarTudo() {
    const [t, a, an, l] = await Promise.all([listarTurmas(), listarAlunos(), listarAntenas(), listarLeituras()]);
    setTurmas(t); setAlunos(a); setAntenas(an); setLeituras(l);
  }
  useEffect(() => { carregarTudo(); }, []);

  function avisar(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // ── Turmas ──
  const [nomeTurma, setNomeTurma] = useState("");
  async function addTurma() {
    if (!nomeTurma.trim()) return;
    await criarTurma(nomeTurma.trim());
    setNomeTurma("");
    carregarTudo();
    avisar("✅ Turma criada!");
  }

  // ── Alunos ──
  const [nomeAluno, setNomeAluno] = useState("");
  const [turmaAluno, setTurmaAluno] = useState("");
  const [chipAluno, setChipAluno] = useState("");
  async function addAluno() {
    if (!nomeAluno.trim() || !turmaAluno) { avisar("⚠️ Preencha nome e turma"); return; }
    await criarAluno(nomeAluno.trim(), turmaAluno, chipAluno.trim());
    setNomeAluno(""); setChipAluno("");
    carregarTudo();
    avisar("✅ Aluno cadastrado!");
  }

  // ── Antenas ──
  const [nomeAntena, setNomeAntena] = useState("");
  const [tipoAntena, setTipoAntena] = useState<"entrada" | "saida">("entrada");
  const [localAntena, setLocalAntena] = useState("");
  async function addAntena() {
    if (!nomeAntena.trim()) return;
    await criarAntena(nomeAntena.trim(), tipoAntena, localAntena.trim());
    setNomeAntena(""); setLocalAntena("");
    carregarTudo();
    avisar("✅ Antena cadastrada!");
  }

  // ── Simulador ──
  const [alunoSim, setAlunoSim] = useState("");
  const [antenaSim, setAntenaSim] = useState("");
  async function simular() {
    if (!alunoSim || !antenaSim) { avisar("⚠️ Escolha aluno e antena"); return; }
    const antena = antenas.find((a) => a.id === antenaSim);
    if (!antena) return;
    await registrarLeitura(alunoSim, antenaSim, antena.tipo);
    carregarTudo();
    avisar("📡 Leitura simulada registrada!");
  }

  function nomeDoAluno(id: string) { return alunos.find((a) => a.id === id)?.nome || "—"; }
  function nomeDaAntena(id: string) { return antenas.find((a) => a.id === id)?.nome || "—"; }
  function nomeDaTurma(id: string | null) { return turmas.find((t) => t.id === id)?.nome || "—"; }

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>🎛️ Painel da Gestão</h2>

      <div className="tab-row">
        {ABAS.map((a) => (
          <button
            key={a}
            className={`btn btn-sm ${aba === a ? "btn-primary" : "btn-outline"}`}
            style={{ flexShrink: 0 }}
            onClick={() => setAba(a)}
          >
            {LABEL_ABA[a]}
          </button>
        ))}
      </div>

      {toast && <div className="card" style={{ background: "#eafbea", color: "#166534", fontSize: ".85rem" }}>{toast}</div>}

      {aba === "turmas" && (
        <div className="card">
          <h3 style={{ marginBottom: ".8rem" }}>Cadastrar turma</h3>
          <input className="input" placeholder="Nome da turma (ex: 1º Ano A)" value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} />
          <button className="btn btn-primary" onClick={addTurma}>+ Adicionar</button>
          <div style={{ marginTop: "1.2rem" }}>
            {turmas.map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".5rem 0", borderBottom: "1px dashed var(--borda)" }}>
                <span>{t.nome}</span>
                <button className="btn btn-sm btn-danger" onClick={() => removerTurma(t.id).then(carregarTudo)}>Remover</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === "alunos" && (
        <div className="card">
          <h3 style={{ marginBottom: ".8rem" }}>Cadastrar aluno</h3>
          <input className="input" placeholder="Nome do aluno" value={nomeAluno} onChange={(e) => setNomeAluno(e.target.value)} />
          <select className="input" value={turmaAluno} onChange={(e) => setTurmaAluno(e.target.value)}>
            <option value="">Selecione a turma</option>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <input className="input" placeholder="UID do chip RFID (opcional por enquanto)" value={chipAluno} onChange={(e) => setChipAluno(e.target.value)} />
          <button className="btn btn-primary" onClick={addAluno}>+ Adicionar</button>
          <div style={{ marginTop: "1.2rem" }}>
            {alunos.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".5rem 0", borderBottom: "1px dashed var(--borda)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{a.nome}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--texto2)" }}>{nomeDaTurma(a.turma_id)} · chip: {a.chip_uid || "sem chip ainda"}</div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => removerAluno(a.id).then(carregarTudo)}>Remover</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === "antenas" && (
        <div className="card">
          <h3 style={{ marginBottom: ".8rem" }}>Cadastrar antena/leitor</h3>
          <input className="input" placeholder="Nome (ex: Portão Principal)" value={nomeAntena} onChange={(e) => setNomeAntena(e.target.value)} />
          <select className="input" value={tipoAntena} onChange={(e) => setTipoAntena(e.target.value as "entrada" | "saida")}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input className="input" placeholder="Local (ex: Portão A)" value={localAntena} onChange={(e) => setLocalAntena(e.target.value)} />
          <button className="btn btn-primary" onClick={addAntena}>+ Adicionar</button>
          <div style={{ marginTop: "1.2rem" }}>
            {antenas.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".5rem 0", borderBottom: "1px dashed var(--borda)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{a.nome}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--texto2)" }}>{a.tipo === "entrada" ? "Entrada" : "Saída"} · {a.local}</div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => removerAntena(a.id).then(carregarTudo)}>Remover</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === "simulador" && (
        <div className="card">
          <h3 style={{ marginBottom: ".5rem" }}>🧪 Simulador de Leitura</h3>
          <p style={{ fontSize: ".82rem", color: "var(--texto2)", marginBottom: "1rem" }}>
            Enquanto o hardware de RFID não está instalado, use isso pra simular uma leitura e testar o sistema.
          </p>
          <select className="input" value={alunoSim} onChange={(e) => setAlunoSim(e.target.value)}>
            <option value="">Selecione o aluno</option>
            {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <select className="input" value={antenaSim} onChange={(e) => setAntenaSim(e.target.value)}>
            <option value="">Selecione a antena</option>
            {antenas.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.tipo})</option>)}
          </select>
          <button className="btn btn-primary" onClick={simular}>📡 Simular Leitura</button>
        </div>
      )}

      {aba === "historico" && (
        <div className="card">
          <h3 style={{ marginBottom: ".8rem" }}>Últimas leituras</h3>
          {leituras.length === 0 ? (
            <p style={{ fontSize: ".85rem", color: "var(--texto2)" }}>Nenhuma leitura registrada ainda.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Aluno</th><th>Antena</th><th>Tipo</th><th>Quando</th></tr>
              </thead>
              <tbody>
                {leituras.map((l) => (
                  <tr key={l.id}>
                    <td>{nomeDoAluno(l.aluno_id)}</td>
                    <td>{nomeDaAntena(l.antena_id)}</td>
                    <td>
                      <span className="pill" style={{ background: l.tipo === "entrada" ? "var(--verde)" : "var(--amarelo)" }}>
                        {l.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td>{new Date(l.criado_em).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
