import { useEffect, useState } from "react";
import { listarTurmasDoProfessor, listarAlunos, listarLeituras } from "@/lib/dados";
import type { Turma, Aluno, Leitura, Profile } from "@/lib/supabase";
import { db } from "@/lib/supabase";

interface Props {
  perfil: Profile;
}

export default function ProfessorPainel({ perfil }: Props) {
  const [turmasIds, setTurmasIds] = useState<string[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ids = await listarTurmasDoProfessor(perfil.id);
      setTurmasIds(ids);
      const { data: todasTurmas } = await db.from("turmas").select("*");
      setTurmas((todasTurmas || []).filter((t: Turma) => ids.includes(t.id)));
      if (ids[0]) setTurmaSelecionada(ids[0]);
      setAlunos(await listarAlunos());
      setLeituras(await listarLeituras());
      setLoading(false);
    })();
  }, [perfil.id]);

  const alunosDaTurma = alunos.filter((a) => a.turma_id === turmaSelecionada);

  function statusHoje(alunoId: string) {
    const hoje = new Date().toDateString();
    const doAluno = leituras.filter((l) => l.aluno_id === alunoId && new Date(l.criado_em).toDateString() === hoje);
    if (doAluno.length === 0) return { texto: "Sem registro hoje", cor: "var(--texto2)" };
    const ultima = doAluno[0]; // já vem ordenado desc
    const hora = new Date(ultima.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return ultima.tipo === "entrada"
      ? { texto: `Presente · entrou às ${hora}`, cor: "var(--verde)" }
      : { texto: `Saiu às ${hora}`, cor: "var(--amarelo)" };
  }

  if (loading) return <p style={{ padding: "2rem", textAlign: "center", color: "var(--texto2)" }}>Carregando...</p>;

  if (turmas.length === 0) {
    return <p style={{ padding: "2rem", textAlign: "center", color: "var(--texto2)" }}>Você ainda não está vinculado a nenhuma turma.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>👨‍🏫 Frequência das suas turmas</h2>

      <div className="tab-row">
        {turmas.map((t) => (
          <button
            key={t.id}
            className={`btn btn-sm ${turmaSelecionada === t.id ? "btn-primary" : "btn-outline"}`}
            style={{ flexShrink: 0 }}
            onClick={() => setTurmaSelecionada(t.id)}
          >
            {t.nome}
          </button>
        ))}
      </div>

      <div className="card">
        {alunosDaTurma.length === 0 ? (
          <p style={{ fontSize: ".85rem", color: "var(--texto2)" }}>Nenhum aluno cadastrado nessa turma ainda.</p>
        ) : alunosDaTurma.map((a) => {
          const status = statusHoje(a.id);
          return (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".6rem 0", borderBottom: "1px dashed var(--borda)" }}>
              <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{a.nome}</span>
              <span style={{ fontSize: ".78rem", color: status.cor, fontWeight: 600 }}>{status.texto}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
