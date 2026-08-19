import { useEffect, useState } from "react";
import { listarAlunosDoResponsavel, listarAlunos, listarLeituras, listarAntenas } from "@/lib/dados";
import type { Aluno, Leitura, Antena, Profile } from "@/lib/supabase";

interface Props {
  perfil: Profile;
}

export default function ResponsavelPainel({ perfil }: Props) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [antenas, setAntenas] = useState<Antena[]>([]);
  const [alunoAberto, setAlunoAberto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ids = await listarAlunosDoResponsavel(perfil.id);
      const todos = await listarAlunos();
      const meus = todos.filter((a) => ids.includes(a.id));
      setAlunos(meus);
      if (meus[0]) setAlunoAberto(meus[0].id);
      setLeituras(await listarLeituras());
      setAntenas(await listarAntenas());
      setLoading(false);
    })();
  }, [perfil.id]);

  function nomeAntena(id: string) { return antenas.find((a) => a.id === id)?.nome || "—"; }

  const leiturasDoAberto = leituras.filter((l) => l.aluno_id === alunoAberto).slice(0, 20);

  if (loading) return <p style={{ padding: "2rem", textAlign: "center", color: "var(--texto2)" }}>Carregando...</p>;

  if (alunos.length === 0) {
    return <p style={{ padding: "2rem", textAlign: "center", color: "var(--texto2)" }}>Nenhum estudante vinculado à sua conta ainda.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>👨‍👩‍👧 Frequência</h2>

      <div className="tab-row">
        {alunos.map((a) => (
          <button
            key={a.id}
            className={`btn btn-sm ${alunoAberto === a.id ? "btn-primary" : "btn-outline"}`}
            style={{ flexShrink: 0 }}
            onClick={() => setAlunoAberto(a.id)}
          >
            {a.nome}
          </button>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: ".8rem" }}>Histórico recente</h3>
        {leiturasDoAberto.length === 0 ? (
          <p style={{ fontSize: ".85rem", color: "var(--texto2)" }}>Nenhum registro de frequência ainda.</p>
        ) : (
          <table>
            <thead><tr><th>Tipo</th><th>Antena</th><th>Quando</th></tr></thead>
            <tbody>
              {leiturasDoAberto.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="pill" style={{ background: l.tipo === "entrada" ? "var(--verde)" : "var(--amarelo)" }}>
                      {l.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td>{nomeAntena(l.antena_id)}</td>
                  <td>{new Date(l.criado_em).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
