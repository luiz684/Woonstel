import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, LOGIN_FUNCTION } from '../supabase.config';
import { dataHoraLabel } from '../utils/format';

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
  ativo: boolean;
  telefone: string | null;
  foto_path: string | null;
  preferencias: Preferencias | null;
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
  comentario?: string;
}

export interface Reserva {
  id: string;
  area_nome: string | null;
  data: string;
  periodo: string | null;
  valor: number;
  status: string;
  horario_inicio: string;
  horario_fim: string;
  cancelada_por_tipo: 'morador' | 'sindico' | null;
  motivo_cancelamento: string | null;
}

export interface ReservaSindico extends Reserva {
  morador_nome: string | null;
  apto: string | null;
}

export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  link: string | null;
  lida: boolean;
  created_at: string;
}

export interface SolicitacaoDetalhe {
  id: string;
  morador_id: string;
  morador_nome: string | null;
  apto: string | null;
  titulo: string;
  categoria: string | null;
  prioridade: 'Baixa' | 'Média' | 'Alta' | null;
  status: 'Pendente' | 'Em andamento' | 'Resolvida' | 'Recusada';
  localizacao: string | null;
  descricao: string | null;
  foto: boolean;
  foto_path: string | null;
  historico: HistoricoItem[];
  created_at: string;
  motivo_recusa: string | null;
  foto_origem: 'camera' | 'galeria' | null;
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
  duracao_min: number | null;
}


export interface ReservaAtiva {
  id: string;
  area_nome: string | null;
  data: string;
  horario_inicio: string;
  horario_fim: string;
}

export interface ConviteMorador {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  apto: string;
  token: string;
  expira_em: string;
  usado_em: string | null;
  cancelado_em: string | null;
  created_at: string;
}

export interface ConviteInfo {
  nome: string;
  email: string;
  tipo: string;
  condominio: string;
  apto: string | null;
}

export interface Preferencias {
  notificacoes?: Partial<Record<'status' | 'comentario' | 'reserva_cancelada' | 'aviso', boolean>>;
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
    const { data, error } = await this.supabase.functions.invoke(LOGIN_FUNCTION, {
      body: { cpf, tipo, senha },
    });

    if (error) {
  
      const status = (error as { context?: Response }).context?.status;
      if (status !== 401) console.error('Falha na função de login:', error);
      return null;
    }
    if (!data?.access_token) return null;

    const { error: e2 } = await this.supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (e2) return null;
    return this.getCurrentProfile();
  }

    async getCurrentProfile(): Promise<Profile | null> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return null;
    const { data } = await this.supabase
      .from('profiles').select('*').eq('id', userId).single();
    const perfil = (data as Profile) ?? null;
    if (perfil && perfil.ativo === false) {
      await this.supabase.auth.signOut();
      return null;
    }
    return perfil;
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
    prioridade: string; fotoPath: string | null; fotoOrigem: 'camera' | 'galeria' | null; dataLabel: string;
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
      foto_origem: d.fotoPath ? d.fotoOrigem : null,
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
      .select('id, nome, capacidade, taxa, disponivel, motivo_indisponibilidade, duracao_min')
      .eq('condominio_id', condId).order('nome');
    return (data as Area[]) ?? [];
  }

    async criarArea(condId: string, a: {
    nome: string; capacidade: string; taxa: number; duracao_min: number | null;
  }) {
    return this.supabase.from('areas').insert({ condominio_id: condId, ...a });
  }

    async excluirArea(id: string) {
    return this.supabase.from('areas').delete().eq('id', id).select('id');
  }

  async getReservasDoMorador(moradorId: string): Promise<Reserva[]> {
    const { data } = await this.supabase
      .from('reservas')
      .select('id, area_nome, data, periodo, valor, status, horario_inicio, horario_fim, cancelada_por_tipo, motivo_cancelamento')
      .eq('morador_id', moradorId)
      .order('data', { ascending: false });
    return (data as Reserva[]) ?? [];
  }

   async criarReserva(p: Profile, area: Area, d: { data: string; inicio: string; fim: string }) {
    return this.supabase.from('reservas').insert({
      condominio_id: p.condominio_id,
      morador_id: p.id,
      morador_nome: p.nome,
      apto: p.apto,
      area_id: area.id,
      area_nome: area.nome,
      data: d.data,
      horario_inicio: d.inicio,
      horario_fim: d.fim,
      periodo: `${d.inicio} às ${d.fim}`,
      valor: area.taxa,
      status: 'Confirmada',
    });
  }

  async getReservasDoCondominio(condId: string): Promise<ReservaSindico[]> {
    const { data } = await this.supabase
      .from('reservas')
      .select('id, area_nome, morador_nome, apto, data, periodo, valor, status, horario_inicio, horario_fim, cancelada_por_tipo, motivo_cancelamento')
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
     async atualizarArea(id: string, a: {
    nome: string; capacidade: string; taxa: number; duracao_min: number | null;
  }) {
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

    async getHorariosOcupados(areaId: string, data: string): Promise<{ inicio: string; fim: string }[]> {
    const { data: res, error } = await this.supabase.rpc('horarios_ocupados', {
      p_area: areaId,
      p_data: data,
    });
    if (error) { console.error(error); return []; }
    return ((res as { inicio: string; fim: string }[]) ?? []).map(r => ({
      inicio: r.inicio.slice(0, 5),
      fim: r.fim.slice(0, 5),
    }));
  }

  async getReservaAtiva(moradorId: string): Promise<ReservaAtiva | null> {
    const hoje = new Date();
    const dataHoje = hoje.getFullYear() + '-' +
      String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoje.getDate()).padStart(2, '0');

    const { data } = await this.supabase
      .from('reservas')
      .select('id, area_nome, data, horario_inicio, horario_fim')
      .eq('morador_id', moradorId)
      .eq('status', 'Confirmada')
      .gte('data', dataHoje)
      .order('data')
      .order('horario_inicio');

    const agora = new Date();
    const ativa = ((data as ReservaAtiva[]) ?? []).find(
      r => new Date(`${r.data}T${r.horario_fim}`) > agora);
    return ativa ?? null;
  }

    async cancelarReserva(id: string, motivo: string) {
    return this.supabase.rpc('cancelar_reserva', { p_id: id, p_motivo: motivo });
  }

    async atualizarPrioridade(s: SolicitacaoDetalhe, nova: 'Baixa' | 'Média' | 'Alta') {
    return this.supabase
      .from('solicitacoes')
      .update({
        prioridade: nova,
        historico: [
          ...(s.historico ?? []),
          { status: `Prioridade alterada: ${s.prioridade ?? '—'} → ${nova}`, data: dataHoraLabel(), done: true },
        ],
      })
      .eq('id', s.id)
      .select('id');
  }

  async responderSolicitacao(s: SolicitacaoDetalhe, texto: string) {
    return this.supabase
      .from('solicitacoes')
      .update({
        historico: [
          ...(s.historico ?? []),
          { status: 'Resposta do síndico', data: dataHoraLabel(), done: true, comentario: texto },
        ],
      })
      .eq('id', s.id)
      .select('id');
  }

  async getNotificacoes(): Promise<Notificacao[]> {
    const { data } = await this.supabase
      .from('notificacoes').select('*')
      .order('created_at', { ascending: false }).limit(50);
    return (data as Notificacao[]) ?? [];
  }

  async countNotificacoesNaoLidas(): Promise<number> {
    const { count } = await this.supabase
      .from('notificacoes').select('id', { count: 'exact', head: true })
      .eq('lida', false);
    return count ?? 0;
  }

  async marcarNotificacoesLidas() {
    return this.supabase.from('notificacoes').update({ lida: true }).eq('lida', false);
  }

    async criarConvite(d: { nome: string; cpf: string; email: string; apto: string }) {
    return this.supabase.rpc('criar_convite', {
      p_nome: d.nome, p_cpf: d.cpf, p_email: d.email, p_apto: d.apto,
    });
  }

  async getConvites(condId: string): Promise<ConviteMorador[]> {
    const { data } = await this.supabase
      .from('convites').select('*')
      .eq('condominio_id', condId)
      .is('usado_em', null).is('cancelado_em', null)
      .order('created_at', { ascending: false });
    return (data as ConviteMorador[]) ?? [];
  }

  async renovarConvite(id: string) {
    return this.supabase.rpc('renovar_convite', { p_id: id });
  }

  async cancelarConvite(id: string) {
    return this.supabase.rpc('cancelar_convite', { p_id: id });
  }

  async definirAcessoMorador(id: string, ativo: boolean) {
    return this.supabase.rpc('definir_acesso_morador', { p_id: id, p_ativo: ativo });
  }

  async getConviteInfo(token: string): Promise<ConviteInfo | null> {
    const { data } = await this.supabase.rpc('get_convite', { p_token: token });
    const lista = (data as ConviteInfo[]) ?? [];
    return lista[0] ?? null;
  }

  async signUpPorConvite(token: string, email: string, senha: string) {
    return this.supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { convite: token } },
    });
  }

    async recusarSolicitacao(id: string, motivo: string) {
    return this.supabase.rpc('recusar_solicitacao', { p_id: id, p_motivo: motivo });
  }

  async getRecusadasPorMorador(condId: string): Promise<Record<string, number>> {
    const { data } = await this.supabase.rpc('contagem_recusadas', { p_cond: condId });
    const mapa: Record<string, number> = {};
    for (const r of (data as { morador_id: string; total: number }[]) ?? []) {
      mapa[r.morador_id] = Number(r.total);
    }
    return mapa;
  }

  async contarRecusadasDoMorador(moradorId: string): Promise<number> {
    const { count } = await this.supabase
      .from('solicitacoes').select('id', { count: 'exact', head: true })
      .eq('morador_id', moradorId).eq('status', 'Recusada');
    return count ?? 0;
  }

  async getNotas(condId: string): Promise<Record<string, string>> {
    const { data } = await this.supabase
      .from('notas_morador').select('morador_id, nota').eq('condominio_id', condId);
    const mapa: Record<string, string> = {};
    for (const n of (data as { morador_id: string; nota: string }[]) ?? []) mapa[n.morador_id] = n.nota;
    return mapa;
  }

  async salvarNota(condId: string, moradorId: string, autorId: string, texto: string) {
    const nota = texto.trim();
    if (!nota) {
      return this.supabase.from('notas_morador').delete().eq('morador_id', moradorId);
    }
    return this.supabase.from('notas_morador').upsert({
      morador_id: moradorId,
      condominio_id: condId,
      nota,
      atualizado_em: new Date().toISOString(),
      atualizado_por: autorId,
    }, { onConflict: 'morador_id' });
  }

    private avatarCache = new Map<string, { url: string; ate: number }>();

  async getAvatarUrl(path: string | null): Promise<string | null> {
    if (!path) return null;
    const c = this.avatarCache.get(path);
    if (c && c.ate > Date.now()) return c.url;
    const { data, error } = await this.supabase.storage.from('avatares').createSignedUrl(path, 3600);
    if (error || !data) {
      console.error('Erro ao gerar URL do avatar:', error?.message);
      return null;
    }
    this.avatarCache.set(path, { url: data.signedUrl, ate: Date.now() + 50 * 60 * 1000 });
    return data.signedUrl;
  }

  async enviarAvatar(p: Profile, file: File): Promise<string | null> {
    const novo = `${p.id}/avatar-${Date.now()}.jpg`;
    const up = await this.supabase.storage.from('avatares').upload(novo, file, { contentType: file.type });
    if (up.error) return 'Não foi possível enviar a foto: ' + up.error.message;

    const { data, error } = await this.supabase
      .from('profiles').update({ foto_path: novo }).eq('id', p.id).select('id');
    if (error || !data || data.length === 0) {
      await this.supabase.storage.from('avatares').remove([novo]);
      return 'Não foi possível salvar a foto no perfil.';
    }
    if (p.foto_path) await this.supabase.storage.from('avatares').remove([p.foto_path]);
    return null;
  }

  async removerAvatar(p: Profile): Promise<string | null> {
    if (!p.foto_path) return null;
    const { data, error } = await this.supabase
      .from('profiles').update({ foto_path: null }).eq('id', p.id).select('id');
    if (error || !data || data.length === 0) return 'Não foi possível remover a foto.';
    await this.supabase.storage.from('avatares').remove([p.foto_path]);
    return null;
  }

  async atualizarPerfil(id: string, d: { nome: string; telefone: string | null }) {
    return this.supabase.from('profiles').update(d).eq('id', id).select('id');
  }

  async salvarPreferencias(id: string, prefs: Preferencias) {
    return this.supabase.from('profiles').update({ preferencias: prefs }).eq('id', id).select('id');
  }

  async alterarSenha(email: string, atual: string, nova: string): Promise<string | null> {
    const { error: e1 } = await this.supabase.auth.signInWithPassword({ email, password: atual });
    if (e1) return 'A senha atual está incorreta.';
    const { error: e2 } = await this.supabase.auth.updateUser({ password: nova });
    if (e2) {
      return e2.message.toLowerCase().includes('different')
        ? 'A nova senha precisa ser diferente da atual.'
        : 'Não foi possível alterar a senha: ' + e2.message;
    }
    return null;
  }

  async exportarDados(p: Profile): Promise<Record<string, unknown>> {
    const [sols, reservas, notifs] = await Promise.all([
      this.supabase.from('solicitacoes').select('*').eq('morador_id', p.id),
      this.supabase.from('reservas').select('*').eq('morador_id', p.id),
      this.supabase.from('notificacoes').select('*').eq('usuario_id', p.id),
    ]);
    return {
      gerado_em: new Date().toISOString(),
      perfil: p,
      solicitacoes: sols.data ?? [],
      reservas: reservas.data ?? [],
      notificacoes: notifs.data ?? [],
    };
  }
}
