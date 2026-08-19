import { useEffect, useState } from "react";
import { db } from "@/lib/supabase";
import { buscarPerfil, sair } from "@/lib/auth";
import type { Profile } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import Gestao from "@/pages/Gestao";
import ProfessorPainel from "@/pages/Professor";
import ResponsavelPainel from "@/pages/Responsavel";

export default function App() {
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [mostrarAuth, setMostrarAuth] = useState(false);

  useEffect(() => {
    db.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      if (uid) setPerfil(await buscarPerfil(uid));
      setCarregandoSessao(false);
    });
  }, []);

  async function aoLogar(uid: string) {
    setPerfil(await buscarPerfil(uid));
  }

  async function sairDaConta() {
    await sair();
    setPerfil(null);
  }

  if (carregandoSessao) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--texto2)" }}>Carregando...</div>;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ background: "var(--azul)", color: "#fff", padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.1rem" }}>📡 Control Tenna</h1>
          <div style={{ fontSize: ".72rem", opacity: 0.75 }}>Controle de frequência via RFID</div>
        </div>
        {perfil ? (
          <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
            <span style={{ fontSize: ".85rem" }}>{perfil.nome}</span>
            <button className="btn btn-sm btn-outline" style={{ background: "transparent", color: "#fff", borderColor: "#fff" }} onClick={sairDaConta}>Sair</button>
          </div>
        ) : (
          <button className="btn btn-sm" style={{ background: "#fff", color: "var(--azul)" }} onClick={() => setMostrarAuth(true)}>Entrar</button>
        )}
      </header>

      <main>
        {!perfil && (
          <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--texto2)" }}>
            <p>Faça login como gestão, professor(a) ou responsável/estudante pra acessar os dados de frequência.</p>
          </div>
        )}
        {perfil?.role === "gestao" && <Gestao />}
        {perfil?.role === "professor" && <ProfessorPainel perfil={perfil} />}
        {perfil?.role === "responsavel" && <ResponsavelPainel perfil={perfil} />}
      </main>

      {mostrarAuth && <AuthModal onClose={() => setMostrarAuth(false)} onLogged={aoLogar} />}
    </div>
  );
}
