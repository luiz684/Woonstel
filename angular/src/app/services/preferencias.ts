import { Injectable, signal } from '@angular/core';

export type Tema = 'sistema' | 'claro' | 'escuro';
export type Fonte = 100 | 115 | 130;

export interface Aparencia {
  tema: Tema;
  fonte: Fonte;
  contraste: boolean;
  semMovimento: boolean;
  vlibras: boolean;
}

const CHAVE = 'woonstel_aparencia';
const PADRAO: Aparencia = { tema: 'sistema', fonte: 100, contraste: false, semMovimento: false, vlibras: false };

function carregar(): Aparencia {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? { ...PADRAO, ...JSON.parse(bruto) } : { ...PADRAO };
  } catch {
    return { ...PADRAO };
  }
}

type VLibrasWindow = Window & { VLibras?: { Widget: new (url: string) => unknown } };

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  private estado = signal<Aparencia>(carregar());
  readonly aparencia = this.estado.asReadonly();
  private iniciado = false;
  private vlibrasLigado = false;

  iniciar() {
    if (this.iniciado) return;
    this.iniciado = true;
    this.aplicar();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.aplicar());
    this.melhorarChips();
  }

  atualizar(parcial: Partial<Aparencia>) {
    const antes = this.estado();
    const depois = { ...antes, ...parcial };
    this.estado.set(depois);
    try { localStorage.setItem(CHAVE, JSON.stringify(depois)); } catch { /* sem armazenamento */ }

    if (antes.vlibras && !depois.vlibras) { location.reload(); return; }
    this.aplicar();
  }

  private aplicar() {
    const a = this.estado();
    const raiz = document.documentElement;
    const escuro = a.tema === 'escuro' ||
      (a.tema === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    raiz.classList.toggle('tema-escuro', escuro);
    raiz.classList.toggle('contraste-alto', a.contraste);
    raiz.classList.toggle('sem-movimento', a.semMovimento);
    raiz.dataset['fonte'] = String(a.fonte);

    if (a.vlibras) this.ligarVlibras();
  }

  private ligarVlibras() {
    if (this.vlibrasLigado || document.querySelector('[vw]')) return;
    this.vlibrasLigado = true;

    const caixa = document.createElement('div');
    caixa.setAttribute('vw', '');
    caixa.className = 'enabled';
    caixa.innerHTML =
      '<div vw-access-button class="active"></div>' +
      '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(caixa);

    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = () => {
      const w = window as VLibrasWindow;
      if (w.VLibras) new w.VLibras.Widget('https://vlibras.gov.br/app');
    };
    script.onerror = () => { this.vlibrasLigado = false; caixa.remove(); };
    document.body.appendChild(script);
  }

  private melhorarChips() {
    const marcar = (el: Element) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
      }
      el.setAttribute('aria-pressed', el.classList.contains('active') ? 'true' : 'false');
    };
    const varrer = (raiz: ParentNode) => raiz.querySelectorAll('.chip').forEach(marcar);

    varrer(document);
    new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.target instanceof Element && m.target.matches('.chip')) {
          marcar(m.target);
        }
        m.addedNodes.forEach(n => {
          if (n instanceof Element) {
            if (n.matches('.chip')) marcar(n);
            varrer(n);
          }
        });
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    document.addEventListener('keydown', e => {
      const t = e.target;
      if (t instanceof HTMLElement && t.matches('.chip') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        t.click();
      }
    });
  }
}