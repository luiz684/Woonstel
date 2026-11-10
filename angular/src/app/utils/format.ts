export function initials(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}

export function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatDateOnlyBR(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function brl(valor: number): string {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

export const BADGE_STATUS: Record<string, string> = {
  'Pendente': 'badge-amber',
  'Em andamento': 'badge-blue',
  'Resolvida': 'badge-green',
};

export const BADGE_PRIO: Record<string, string> = {
  'Alta': 'badge-red',
  'Média': 'badge-amber',
  'Baixa': 'badge-gray',
};

export function dataHoraLabel(d: Date = new Date()): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function dataHoraBR(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

type ReservaTempo = {
  status: string;
  data: string;
  horario_inicio?: string | null;
  horario_fim?: string | null;
};

export function reservaAtiva(r: ReservaTempo): boolean {
  return r.status === 'Confirmada' &&
    new Date(`${r.data}T${r.horario_fim ?? '23:59:59'}`) > new Date();
}

export function rotuloReserva(r: ReservaTempo): string {
  if (r.status === 'Cancelada') return 'Cancelada';
  const agora = new Date();
  const fim = new Date(`${r.data}T${r.horario_fim ?? '23:59:59'}`);
  if (fim <= agora) return 'Concluída';
  const inicio = new Date(`${r.data}T${r.horario_inicio ?? '00:00:00'}`);
  return inicio <= agora ? 'Em andamento' : 'Confirmada';
}

export const BADGE_RESERVA: Record<string, string> = {
  'Confirmada': 'badge-amber',
  'Em andamento': 'badge-blue',
  'Concluída': 'badge-green',
  'Cancelada': 'badge-red',
};

export function ordenarReservas<T extends { status: string; data: string; horario_inicio: string; horario_fim: string }>(lista: T[]): T[] {
  const ativas = lista
    .filter(r => reservaAtiva(r))
    .sort((a, b) => (a.data + a.horario_inicio).localeCompare(b.data + b.horario_inicio));
  const resto = lista.filter(r => !reservaAtiva(r));
  return [...ativas, ...resto];
}

export const MOTIVOS_MORADOR = [
  'Mudança de planos',
  'Reservei o horário errado',
  'Reservei a área errada',
  'Imprevisto pessoal',
  'O evento foi cancelado',
  'Outro',
];

export const MOTIVOS_SINDICO = [
  'Área em manutenção ou reforma',
  'Uso pelo condomínio (assembleia ou evento)',
  'Descumprimento das regras de uso',
  'Reserva duplicada ou feita por engano',
  'Problema de segurança ou clima',
  'Outro',
];

export const FILTROS_SOLICITACAO = ['Em aberto', 'Pendente', 'Em andamento', 'Resolvida', 'Todas'];
export const FILTROS_RESERVA = ['Em aberto', 'Confirmada', 'Em andamento', 'Concluída', 'Cancelada', 'Todas'];

export function solicitacaoNoFiltro(status: string, filtro: string): boolean {
  if (filtro === 'Todas') return true;
  if (filtro === 'Em aberto') return status !== 'Resolvida';
  return status === filtro;
}

export function reservaNoFiltro(rotulo: string, filtro: string): boolean {
  if (filtro === 'Todas') return true;
  if (filtro === 'Em aberto') return rotulo === 'Confirmada' || rotulo === 'Em andamento';
  return rotulo === filtro;
}