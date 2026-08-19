import { db, type Turma, type Aluno, type Antena, type Leitura, type Profile } from "@/lib/supabase";

/* ===== Turmas ===== */
export async function listarTurmas(): Promise<Turma[]> {
  const { data, error } = await db.from("turmas").select("*").order("nome");
  if (error || !data) return [];
  return data as Turma[];
}
export async function criarTurma(nome: string) {
  const { error } = await db.from("turmas").insert({ nome });
  if (error) throw error;
}
export async function removerTurma(id: string) {
  const { error } = await db.from("turmas").delete().eq("id", id);
  if (error) throw error;
}

/* ===== Alunos ===== */
export async function listarAlunos(): Promise<Aluno[]> {
  const { data, error } = await db.from("alunos").select("*").order("nome");
  if (error || !data) return [];
  return data as Aluno[];
}
export async function criarAluno(nome: string, turmaId: string, chipUid: string) {
  const { error } = await db.from("alunos").insert({ nome, turma_id: turmaId, chip_uid: chipUid || null });
  if (error) throw error;
}
export async function atualizarAluno(id: string, campos: Partial<Aluno>) {
  const { error } = await db.from("alunos").update(campos).eq("id", id);
  if (error) throw error;
}
export async function removerAluno(id: string) {
  const { error } = await db.from("alunos").delete().eq("id", id);
  if (error) throw error;
}

/* ===== Antenas ===== */
export async function listarAntenas(): Promise<Antena[]> {
  const { data, error } = await db.from("antenas").select("*").order("nome");
  if (error || !data) return [];
  return data as Antena[];
}
export async function criarAntena(nome: string, tipo: "entrada" | "saida", local: string) {
  const { error } = await db.from("antenas").insert({ nome, tipo, local });
  if (error) throw error;
}
export async function removerAntena(id: string) {
  const { error } = await db.from("antenas").delete().eq("id", id);
  if (error) throw error;
}

/* ===== Leituras ===== */
export async function listarLeituras(limite = 200): Promise<Leitura[]> {
  const { data, error } = await db.from("leituras").select("*").order("criado_em", { ascending: false }).limit(limite);
  if (error || !data) return [];
  return data as Leitura[];
}
export async function registrarLeitura(alunoId: string, antenaId: string, tipo: "entrada" | "saida") {
  const { error } = await db.from("leituras").insert({ aluno_id: alunoId, antena_id: antenaId, tipo });
  if (error) throw error;
}

/* ===== Vínculos: professor <-> turma ===== */
export async function listarTurmasDoProfessor(professorId: string): Promise<string[]> {
  const { data, error } = await db.from("professor_turma").select("turma_id").eq("professor_id", professorId);
  if (error || !data) return [];
  return data.map((d) => d.turma_id);
}
export async function vincularProfessorTurma(professorId: string, turmaId: string) {
  const { error } = await db.from("professor_turma").insert({ professor_id: professorId, turma_id: turmaId });
  if (error) throw error;
}
export async function desvincularProfessorTurma(professorId: string, turmaId: string) {
  const { error } = await db.from("professor_turma").delete().eq("professor_id", professorId).eq("turma_id", turmaId);
  if (error) throw error;
}
export async function listarProfessores(): Promise<Profile[]> {
  const { data, error } = await db.from("profiles").select("*").eq("role", "professor").order("nome");
  if (error || !data) return [];
  return data as Profile[];
}

/* ===== Vínculos: responsável <-> aluno ===== */
export async function listarAlunosDoResponsavel(responsavelId: string): Promise<string[]> {
  const { data, error } = await db.from("responsavel_aluno").select("aluno_id").eq("responsavel_id", responsavelId);
  if (error || !data) return [];
  return data.map((d) => d.aluno_id);
}
export async function vincularResponsavelAluno(responsavelId: string, alunoId: string) {
  const { error } = await db.from("responsavel_aluno").insert({ responsavel_id: responsavelId, aluno_id: alunoId });
  if (error) throw error;
}
