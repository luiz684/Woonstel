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
