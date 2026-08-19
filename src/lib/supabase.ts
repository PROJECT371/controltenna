import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jcjelaqoekyzpelrqaxk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_AOlIjSGGBcw8bzxeamW40A_6P58CJJu";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = {
  id: string;
  nome: string;
  role: "gestao" | "professor" | "responsavel";
  created_at?: string;
};

export type Turma = {
  id: string;
  nome: string;
};

export type Aluno = {
  id: string;
  nome: string;
  turma_id: string | null;
  chip_uid: string | null;
  created_at?: string;
};

export type Antena = {
  id: string;
  nome: string;
  tipo: "entrada" | "saida";
  local: string | null;
};

export type Leitura = {
  id: string;
  aluno_id: string;
  antena_id: string;
  tipo: "entrada" | "saida";
  criado_em: string;
};
