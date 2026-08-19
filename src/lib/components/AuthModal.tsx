import { useEffect, useState } from "react";
import { cadastrar, entrar, type Cargo } from "@/lib/auth";
import { listarTurmas, listarAlunos, vincularProfessorTurma, vincularResponsavelAluno } from "@/lib/dados";
import type { Turma, Aluno } from "@/lib/supabase";

interface Props {
  onClose: () => void;
  onLogged: (uid: string) => void;
}

export default function AuthModal({ onClose, onLogged }: Props) {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<Cargo>("responsavel");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmasEscolhidas, setTurmasEscolhidas] = useState<string[]>([]);
  const [alunosEscolhidos, setAlunosEscolhidos] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    listarTurmas().then(setTurmas);
    listarAlunos().then(setAlunos);
  }, []);

  function alternarTurma(id: string) {
    setTurmasEscolhidas((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }
  function alternarAluno(id: string) {
    setAlunosEscolhidos((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function enviar() {
    setErro("");
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setCarregando(true);
    try {
      if (modo === "cadastro") {
        if (!nome) { setErro("Informe seu nome."); setCarregando(false); return; }
        const uid = await cadastrar(nome, email, senha, role);

        if (role === "professor") {
          for (const turmaId of turmasEscolhidas) await vincularProfessorTurma(uid, turmaId);
        }
        if (role === "responsavel") {
          for (const alunoId of alunosEscolhidos) await vincularResponsavelAluno(uid, alunoId);
        }

        onLogged(uid);
        onClose();
      } else {
        const user = await entrar(email, senha);
        if (user) { onLogged(user.id); onClose(); }
      }
    } catch (e: any) {
      setErro(e?.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : e?.message || "Algo deu errado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: "1rem" }}>{modo === "login" ? "Entrar" : "Criar conta"}</h3>
        <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.2rem" }}>
          <button className={`btn btn-sm ${modo === "login" ? "btn-primary" : "btn-outline"}`} onClick={() => setModo("login")}>Já tenho conta</button>
          <button className={`btn btn-sm ${modo === "cadastro" ? "btn-primary" : "btn-outline"}`} onClick={() => setModo("cadastro")}>Criar conta</button>
        </div>

        {modo === "cadastro" && (
          <>
            <label style={{ fontSize: ".8rem", color: "var(--texto2)" }}>Eu sou</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Cargo)}>
              <option value="responsavel">Responsável / Estudante</option>
              <option value="professor">Professor(a)</option>
              <option value="gestao">Gestão escolar</option>
            </select>
            <input className="input" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />

            {role === "professor" && (
              <>
                <label style={{ fontSize: ".8rem", color: "var(--texto2)" }}>Turmas que você leciona</label>
                <div style={{ maxHeight: 130, overflowY: "auto", border: "1.5px solid var(--borda)", borderRadius: 8, padding: ".5rem", marginBottom: ".8rem" }}>
                  {turmas.length === 0 && <p style={{ fontSize: ".8rem", color: "var(--texto2)" }}>Nenhuma turma cadastrada ainda.</p>}
                  {turmas.map((t) => (
                    <label key={t.id} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".3rem 0", fontSize: ".86rem" }}>
                      <input type="checkbox" checked={turmasEscolhidas.includes(t.id)} onChange={() => alternarTurma(t.id)} />
                      {t.nome}
                    </label>
                  ))}
                </div>
              </>
            )}

            {role === "responsavel" && (
              <>
                <label style={{ fontSize: ".8rem", color: "var(--texto2)" }}>Selecione o(s) estudante(s)</label>
                <div style={{ maxHeight: 130, overflowY: "auto", border: "1.5px solid var(--borda)", borderRadius: 8, padding: ".5rem", marginBottom: ".8rem" }}>
                  {alunos.length === 0 && <p style={{ fontSize: ".8rem", color: "var(--texto2)" }}>Nenhum estudante cadastrado ainda.</p>}
                  {alunos.map((a) => (
                    <label key={a.id} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".3rem 0", fontSize: ".86rem" }}>
                      <input type="checkbox" checked={alunosEscolhidos.includes(a.id)} onChange={() => alternarAluno(a.id)} />
                      {a.nome}
                    </label>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <input className="input" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} />

        {erro && <p style={{ color: "#dc2626", fontSize: ".82rem" }}>{erro}</p>}

        <div style={{ display: "flex", gap: ".6rem", marginTop: ".6rem" }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={enviar} disabled={carregando}>
            {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
