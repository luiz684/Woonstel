function renderSindicoNav(active){
  const items = [
    {id:'inicio', label:'Início', href:'inicio.html', icon:'<path d="M4 11l8-7 8 7v8a2 2 0 01-2 2h-3v-6H9v6H6a2 2 0 01-2-2v-8z"/>'},
    {id:'solicitacoes', label:'Solicitações', href:'solicitacoes.html', icon:'<path d="M9 5h6M9 3v4M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"/>'},
    {id:'reservas', label:'Reservas', href:'reservas.html', icon:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'},
    {id:'perfil', label:'Perfil', href:'perfil.html', icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5"/>'}
  ];
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';
  nav.innerHTML = items.map(it=>`
    <a class="nav-item ${it.id===active?'active':''}" href="${it.href}">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${it.icon}</svg>
      ${it.label}
    </a>`).join('');
  document.querySelector('.app-frame').appendChild(nav);
}
