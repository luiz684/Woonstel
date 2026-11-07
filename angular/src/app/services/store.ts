import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../supabase.config';

export type Tipo = 'condomino' | 'sindico' | 'funcionario';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  tipo: Tipo;
  condominio_id: string | null;
  apto: string | null;
  avisos_lidos_ate: string | null;
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

export interface CondominioCompleto {
  id: string;
  nome: string;
  endereco: string | null;
  unidades: number | null;
  blocos: number | null;
  codigo: string | null;
  sindico_id: string | null;
}

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  autor: string | null;
  created_at: string;
}

export interface HistoricoItem {
  status: string;
  data: string;
  done: boolean;
}

export interface SolicitacaoDetalhe {
  id: string;
  morador_id: string;
  morador_nome: string | null;
  apto: string | null;
  titulo: string;
  categoria: string | null;
  prioridade: 'Baixa' | 'Média' | 'Alta' | null;
  status: 'Pendente' | 'Em andamento' | 'Resolvida';
  localizacao: string | null;
  descricao: string | null;
  foto: boolean;
  foto_path: string | null;
  historico: HistoricoItem[];
  created_at: string;
}

export type Solicitacao = Pick<
  SolicitacaoDetalhe,
  'id' | 'titulo' | 'status' | 'morador_nome' | 'apto'
>;

export interface Area {
  id: string;
  nome: string;
  capacidade: string | null;
  taxa: number;
  disponivel: boolean;
  motivo_indisponibilidade: string | null;
}

export interface Reserva {
  id: string;
  area_nome: string | null;
  data: string;
  periodo: string | null;
  valor: number;
  status: string;
}

export interface ReservaSindico {
  id: string;
  area_nome: string | null;
  morador_nome: string | null;
  apto: string | null;
  data: string;
  periodo: string | null;
  valor: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


  async getCondominios(): Promise<Condominio[]> {
    const { data, error } = await this.supabase
      .from('condominios').select('id, nome').order('nome');
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
      .from('profiles').select('*').eq('id', userId).single();
    return (data as Profile) ?? null;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  async requireProfile(tipo: Tipo): Promise<Profile | null> {
    const p = await this.getCurrentProfile();
    return p && p.tipo === tipo ? p : null;
  }

  async requireSindico(): Promise<{ perfil: Profile; cond: CondominioCompleto | null } | null> {
    const perfil = await this.requireProfile('sindico');
    if (!perfil) return null;
    return { perfil, cond: await this.getCondominioDoSindico(perfil.id) };
  }



  async getCondominio(id: string | null): Promise<CondominioCompleto | null> {
    if (!id) return null;
    const { data } = await this.supabase
      .from('condominios').select('*').eq('id', id).maybeSingle();
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

  async countMoradores(condId: string): Promise<number> {
    const { count } = await this.supabase
      .from('profiles').select('id', { count: 'exact', head: true })
      .eq('condominio_id', condId).eq('tipo', 'condomino');
    return count ?? 0;
  }

  async getMoradores(condId: string): Promise<Profile[]> {
    const { data } = await this.supabase
      .from('profiles').select('*')
      .eq('condominio_id', condId).eq('tipo', 'condomino')
      .order('nome');
    return (data as Profile[]) ?? [];
  }


  async getSolicitacoesDoCondominio(condId: string): Promise<SolicitacaoDetalhe[]> {
    const { data } = await this.supabase
      .from('solicitacoes').select('*')
      .eq('condominio_id', condId)
      .order('created_at', { ascending: false });
    return (data as SolicitacaoDetalhe[]) ?? [];
  }

  async getSolicitacoesByCondominio(condId: string): Promise<SolicitacaoDetalhe[]> {
    return this.getSolicitacoesDoCondominio(condId);
  }

  async getSolicitacoesDoMorador(moradorId: string): Promise<SolicitacaoDetalhe[]> {
    const { data } = await this.supabase
      .from('solicitacoes').select('*')
      .eq('morador_id', moradorId)
      .order('created_at', { ascending: false });
    return (data as SolicitacaoDetalhe[]) ?? [];
  }

  async getSolicitacoesByMorador(moradorId: string): Promise<SolicitacaoDetalhe[]> {
    return this.getSolicitacoesDoMorador(moradorId);
  }

  async getSolicitacao(id: string): Promise<SolicitacaoDetalhe | null> {
    const { data } = await this.supabase
      .from('solicitacoes').select('*').eq('id', id).maybeSingle();
    return (data as SolicitacaoDetalhe) ?? null;
  }

  async criarSolicitacao(p: Profile, d: {
    titulo: string; categoria: string; descricao: string; localizacao: string;
    prioridade: string; fotoPath: string | null; dataLabel: string;
  }) {
    return this.supabase.from('solicitacoes').insert({
      condominio_id: p.condominio_id,
      morador_id: p.id,
      morador_nome: p.nome,
      apto: p.apto,
      titulo: d.titulo,
      categoria: d.categoria,
      descricao: d.descricao,
      localizacao: d.localizacao,
      prioridade: d.prioridade,
      foto: !!d.fotoPath,
      foto_path: d.fotoPath,
      status: 'Pendente',
      historico: [{ status: 'Solicitação registrada', data: d.dataLabel, done: true }],
    });
  }

  async atualizarStatusSolicitacao(s: SolicitacaoDetalhe, novo: 'Em andamento' | 'Resolvida') {
    const texto = novo === 'Em andamento' ? 'Solicitação validada pela adm' : 'Serviço concluído';
    const now = new Date();
    const dataLabel =
      now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') +
      ' · ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return this.supabase
      .from('solicitacoes')
      .update({
        status: novo,
        historico: [...(s.historico ?? []), { status: texto, data: dataLabel, done: true }],
      })
      .eq('id', s.id)
      .select('id');
  }


  async uploadFotoSolicitacao(p: Profile, file: File): Promise<string | null> {
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${p.condominio_id}/${p.id}/${Date.now()}.${ext || 'jpg'}`;
    const { error } = await this.supabase.storage
      .from('solicitacoes')
      .upload(path, file, { contentType: file.type });
    if (error) { console.error(error); return null; }
    return path;
  }

  async getFotoUrl(path: string | null): Promise<string | null> {
    if (!path) return null;
    const { data, error } = await this.supabase.storage
      .from('solicitacoes')
      .createSignedUrl(path, 3600);
    if (error) {
      console.error('Erro ao gerar URL da foto:', error.message);
      return null;
    }
    return data?.signedUrl ?? null;
  }


    async getAreas(condId: string | null): Promise<Area[]> {
    if (!condId) return [];
    const { data } = await this.supabase
      .from('areas')
      .select('id, nome, capacidade, taxa, disponivel, motivo_indisponibilidade')
      .eq('condominio_id', condId).order('nome');
    return (data as Area[]) ?? [];
  }

    async criarArea(condId: string, a: { nome: string; capacidade: string; taxa: number }) {
    return this.supabase.from('areas').insert({
      condominio_id: condId,
      nome: a.nome,
      capacidade: a.capacidade,
      taxa: a.taxa,
    });
  }

  async excluirArea(id: string) {
    return this.supabase.from('areas').delete().eq('id', id);
  }

  async getReservasDoMorador(moradorId: string): Promise<Reserva[]> {
    const { data } = await this.supabase
      .from('reservas').select('id, area_nome, data, periodo, valor, status')
      .eq('morador_id', moradorId)
      .order('data', { ascending: false });
    return (data as Reserva[]) ?? [];
  }

  async criarReserva(p: Profile, area: Area, d: { data: string; horario: string; periodo: string }) {
    return this.supabase.from('reservas').insert({
      condominio_id: p.condominio_id,
      morador_id: p.id,
      morador_nome: p.nome,
      apto: p.apto,
      area_id: area.id,
      area_nome: area.nome,
      data: d.data,
      horario: d.horario,
      periodo: d.periodo,
      valor: area.taxa,
      status: 'Confirmada',
    });
  }

  async getReservasDoCondominio(condId: string): Promise<ReservaSindico[]> {
    const { data } = await this.supabase
      .from('reservas')
      .select('id, area_nome, morador_nome, apto, data, periodo, valor, status')
      .eq('condominio_id', condId)
      .order('data', { ascending: false });
    return (data as ReservaSindico[]) ?? [];
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

  async criarAviso(condId: string, titulo: string, mensagem: string, autor: string) {
    return this.supabase.from('avisos').insert({
      condominio_id: condId, titulo, mensagem, autor,
    });

  }
    async atualizarArea(id: string, a: { nome: string; capacidade: string; taxa: number }) {
    return this.supabase.from('areas').update(a).eq('id', id).select('id');
  }

  async definirDisponibilidade(id: string, disponivel: boolean, motivo: string | null) {
    return this.supabase.from('areas')
      .update({ disponivel, motivo_indisponibilidade: disponivel ? null : motivo })
      .eq('id', id).select('id');
  }

  async atualizarAviso(id: string, titulo: string, mensagem: string) {
    return this.supabase.from('avisos').update({ titulo, mensagem }).eq('id', id).select('id');
  }

  async excluirAviso(id: string) {
    return this.supabase.from('avisos').delete().eq('id', id).select('id');
  }

  async marcarAvisosLidos(moradorId: string) {
    return this.supabase.from('profiles')
      .update({ avisos_lidos_ate: new Date().toISOString() })
      .eq('id', moradorId);
  }
}