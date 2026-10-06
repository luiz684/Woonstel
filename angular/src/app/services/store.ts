import { Injectable } from '@angular/core';

export interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  tipo: 'condomino' | 'sindico' | 'funcionario';
  condominioId?: string;
  apto?: string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {

  getCondominios(): { id: string; nome: string }[] {
    return JSON.parse(localStorage.getItem('condominios') || '[]');
  }

  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  findUserByCpfTipo(cpf: string, tipo: string): User | undefined {
    return this.getUsers().find(u => u.cpf === cpf && u.tipo === tipo);
  }

  saveUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  setSession(id: string) { localStorage.setItem('session', id); }
  clearSession() { localStorage.removeItem('session'); }

  getCurrentUser(): User | undefined {
    const id = localStorage.getItem('session');
    return this.getUsers().find(u => u.id === id);
  }
}