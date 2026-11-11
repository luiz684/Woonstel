export interface RegraSenha { texto: string; ok: boolean; }

export function avaliarSenha(s: string): RegraSenha[] {
  return [
    { texto: 'De 8 a 64 caracteres', ok: s.length >= 8 && s.length <= 64 },
    { texto: 'Uma letra maiúscula', ok: /[A-Z]/.test(s) },
    { texto: 'Uma letra minúscula', ok: /[a-z]/.test(s) },
    { texto: 'Um número', ok: /\d/.test(s) },
    { texto: 'Um símbolo (ex.: ! @ # $ %)', ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(s) },
  ];
}

export function senhaValida(s: string): boolean {
  return avaliarSenha(s).every(r => r.ok);
}