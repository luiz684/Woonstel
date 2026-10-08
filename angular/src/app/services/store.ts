import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../supabase.config';

export type Tipo = 'condomino' | 'sindico' | 'funcionario';

export interface CondominioCompleto {
  id: string;
  nome: string;
  endereco: string | null;
  unidades: number | null;
  blocos: number | null;
  codigo: string | null;
  sindico_id: string | null;
}

export interface Solicitacao {
  id: string;
  titulo: string;
  status: 'Pendente' | 'Em andamento' | 'Resolvida';
  morador_nome: string | null;
  apto: string | null;
}

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  autor: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  tipo: Tipo;
  condominio_id: string | null;
  apto: string | null;
}

export interface Condominio {
  id: string;
  nome: string;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  tipo: Tipo;
  condominioId?: string;
  apto?: string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

  async getCondominios(): Promise<Condominio[]> {
    const { data, error } = await this.supabase
      .from('condominios')
      .select('id, nome')
      .order('nome');
    if (error) console.error(error);
    return data ?? [];
  }

  async findEmailByCpfTipo(cpf: string, tipo: string): Promise<string | null> {
    const { data, error } = await this.supabase.rpc('get_email_by_cpf_tipo', {
      p_cpf: cpf,
      p_tipo: tipo,
    });
    if (error) console.error(error);
    return data ?? null;
  }

  async signUp(u: NovoUsuario) {
    return this.supabase.auth.signUp({
      email: u.email,
      password: u.senha,
      options: {
        data: {
          nome: u.nome,
          cpf: u.cpf,
          tipo: u.tipo,
          condominio_id: u.condominioId ?? '',
          apto: u.apto ?? '',
        },
      },
    });
  }

  async signIn(cpf: string, tipo: string, senha: string): Promise<Profile | null> {
    const email = await this.findEmailByCpfTipo(cpf, tipo);
    if (!email) return null;

    const { error } = await this.supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return null;

    return this.getCurrentProfile();
  }

  async getCurrentProfile(): Promise<Profile | null> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return null;

    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return (data as Profile) ?? null;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

    
  async requireProfile(tipo: Tipo): Promise<Profile | null> {
    const p = await this.getCurrentProfile();
    return p && p.tipo === tipo ? p : null;
  }

  async getCondominio(id: string | null): Promise<CondominioCompleto | null> {
    if (!id) return null;
    const { data } = await this.supabase.from('condominios').select('*').eq('id', id).maybeSingle();
    return (data as CondominioCompleto) ?? null;
  }

  async getCondominioDoSindico(sindicoId: string): Promise<CondominioCompleto | null> {
    const { data } = await this.supabase
      .from('condominios').select('*').eq('sindico_id', sindicoId).maybeSingle();
    return (data as CondominioCompleto) ?? null;
  }

  async criarCondominio(c: {
    nome: string; endereco: string; unidades: number; blocos: number; sindicoId: string;
  }) {
    const codigo =
      c.nome.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() +
      Math.floor(Math.random() * 900 + 100);
    return this.supabase.from('condominios').insert({
      nome: c.nome, endereco: c.endereco, unidades: c.unidades,
      blocos: c.blocos, sindico_id: c.sindicoId, codigo,
    });
  }

  async atualizarCondominio(id: string, c: {
    nome: string; endereco: string; unidades: number; blocos: number;
  }) {
    return this.supabase.from('condominios').update(c).eq('id', id);
  }

  async getSolicitacoesByCondominio(condId: string): Promise<Solicitacao[]> {
    const { data } = await this.supabase
      .from('solicitacoes')
      .select('id, titulo, status, morador_nome, apto')
      .eq('condominio_id', condId)
      .order('created_at', { ascending: false });
    return (data as Solicitacao[]) ?? [];
  }

  async getSolicitacoesByMorador(moradorId: string): Promise<Solicitacao[]> {
    const { data } = await this.supabase
      .from('solicitacoes')
      .select('id, titulo, status, morador_nome, apto')
      .eq('morador_id', moradorId)
      .order('created_at', { ascending: false });
    return (data as Solicitacao[]) ?? [];
  }

  async countMoradores(condId: string): Promise<number> {
    const { count } = await this.supabase
      .from('profiles').select('id', { count: 'exact', head: true })
      .eq('condominio_id', condId).eq('tipo', 'condomino');
    return count ?? 0;
  }

  async countReservas(condId: string): Promise<number> {
    const { count } = await this.supabase
      .from('reservas').select('id', { count: 'exact', head: true })
      .eq('condominio_id', condId);
    return count ?? 0;
  }

  async getAvisos(condId: string | null): Promise<Aviso[]> {
    if (!condId) return [];
    const { data } = await this.supabase
      .from('avisos').select('id, titulo, mensagem, autor, created_at')
      .eq('condominio_id', condId)
      .order('created_at', { ascending: false });
    return (data as Aviso[]) ?? [];
  }
}