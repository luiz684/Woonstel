/* Convive — camada de dados mock (localStorage). Sem backend real:
   pronto para ser trocado por chamadas de API mantendo a mesma interface. */

const DB_KEYS = {
  users: 'convive_users',
  condominios: 'convive_condominios',
  solicitacoes: 'convive_solicitacoes',
  areas: 'convive_areas',
  reservas: 'convive_reservas',
  avisos: 'convive_avisos',
  session: 'convive_session'
};

function seedDB(){
  if(localStorage.getItem(DB_KEYS.users)) return;

  const condominios = [{
    id: 'c1',
    nome: 'Residencial Bosque Verde',
    endereco: 'Rua das Palmeiras, 480 — Vila Ipê, São Paulo/SP',
    unidades: 96,
    blocos: 4,
    sindicoId: 'u-sindico',
    codigo: 'BOSQUE480'
  }];

  const users = [
    {
      id:'u-sindico', nome:'Marina Duarte', email:'marina.duarte@email.com',
      cpf:'111.111.111-11', senha:'123456', tipo:'sindico',
      condominioId:'c1'
    },
    {
      id:'u-morador', nome:'Carlos Ferreira', email:'carlosferreira@email.com',
      cpf:'222.222.222-22', senha:'123456', tipo:'condomino',
      condominioId:'c1', apto:'142B'
    },
    {
      id:'u-morador2', nome:'Ana Carolina Souza', email:'anacarolina@email.com',
      cpf:'333.333.333-33', senha:'123456', tipo:'condomino',
      condominioId:'c1', apto:'304A'
    }
  ];

  const solicitacoes = [
    {
      id:'s1', condominioId:'c1', moradorId:'u-morador', moradorNome:'Carlos Ferreira', apto:'142B',
      titulo:'Infiltração parede garagem G2', categoria:'Hidráulica', prioridade:'Alta',
      status:'Pendente', localizacao:'Garagem G2, vaga 44',
      descricao:'Identificado vazamento constante escorrendo pela parede da vaga 44, provocando poça de água no chão e molhando o teto do bloco vizinho.',
      criadoEm:'2026-10-18T10:15:00',
      foto:true,
      historico:[
        {status:'Solicitação registrada', data:'18 Out · 10:15', done:true},
        {status:'Solicitação validada pela adm', data:'18 Out · 14:30', done:true},
        {status:'Especialista atribuído', data:'19 Out · 09:00', done:true},
        {status:'Serviço concluído', data:'Aguardando execução', done:false}
      ]
    },
    {
      id:'s2', condominioId:'c1', moradorId:'u-morador', moradorNome:'Carlos Ferreira', apto:'142B',
      titulo:'Troca de lâmpadas hall bloco A', categoria:'Elétrica', prioridade:'Média',
      status:'Em andamento', localizacao:'Hall de entrada, bloco A',
      descricao:'Três lâmpadas queimadas no hall de entrada do bloco A, deixando o ambiente escuro à noite.',
      criadoEm:'2026-10-15T09:00:00',
      foto:false,
      historico:[
        {status:'Solicitação registrada', data:'15 Out · 09:00', done:true},
        {status:'Solicitação validada pela adm', data:'15 Out · 11:20', done:true},
        {status:'Especialista atribuído', data:'16 Out · 08:40', done:false}
      ]
    },
    {
      id:'s3', condominioId:'c1', moradorId:'u-morador2', moradorNome:'Ana Carolina Souza', apto:'304A',
      titulo:'Ajuste mola porta hall entrada', categoria:'Estrutural', prioridade:'Baixa',
      status:'Resolvida', localizacao:'Hall de entrada principal',
      descricao:'A porta de vidro do hall principal está batendo com força por causa da mola desregulada.',
      criadoEm:'2026-10-10T08:00:00',
      foto:false,
      historico:[
        {status:'Solicitação registrada', data:'10 Out · 08:00', done:true},
        {status:'Solicitação validada pela adm', data:'10 Out · 10:00', done:true},
        {status:'Especialista atribuído', data:'11 Out · 09:00', done:true},
        {status:'Serviço concluído', data:'12 Out · 16:40', done:true}
      ]
    }
  ];

  const areas = [
    {id:'a1', condominioId:'c1', nome:'Salão de Festas', capacidade:'Até 50 pessoas', taxa:150},
    {id:'a2', condominioId:'c1', nome:'Churrasqueira', capacidade:'Até 20 pessoas', taxa:80},
    {id:'a3', condominioId:'c1', nome:'Quadra Poliesportiva', capacidade:'Até 16 pessoas', taxa:0}
  ];

  const reservas = [
    {id:'r1', condominioId:'c1', areaId:'a1', areaNome:'Salão de Festas', moradorId:'u-morador', moradorNome:'Carlos Ferreira', apto:'142B', data:'2026-10-28', horario:'12:00', periodo:'Tarde (12:00 às 18:00)', valor:150, status:'Confirmada'}
  ];

  const avisos = [
    {id:'v1', condominioId:'c1', titulo:'Manutenção do elevador do Bloco B', mensagem:'O elevador social do Bloco B ficará em manutenção preventiva na quinta-feira, das 9h às 12h.', autor:'Marina Duarte', data:'2026-10-16T09:00:00'},
    {id:'v2', condominioId:'c1', titulo:'Dedetização das áreas comuns', mensagem:'Na próxima segunda, faremos a dedetização do hall e do salão de festas. Pedimos que animais de estimação não circulem pelas áreas comuns nesse dia.', autor:'Marina Duarte', data:'2026-10-12T14:00:00'}
  ];

  localStorage.setItem(DB_KEYS.users, JSON.stringify(users));
  localStorage.setItem(DB_KEYS.condominios, JSON.stringify(condominios));
  localStorage.setItem(DB_KEYS.solicitacoes, JSON.stringify(solicitacoes));
  localStorage.setItem(DB_KEYS.areas, JSON.stringify(areas));
  localStorage.setItem(DB_KEYS.reservas, JSON.stringify(reservas));
  localStorage.setItem(DB_KEYS.avisos, JSON.stringify(avisos));
}
seedDB();

const store = {
  get(key){ return JSON.parse(localStorage.getItem(key) || '[]'); },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },

  getUsers(){ return this.get(DB_KEYS.users); },
  saveUser(user){ const u=this.getUsers(); u.push(user); this.set(DB_KEYS.users,u); },
  findUserByCpfTipo(cpf,tipo){ return this.getUsers().find(u=>u.cpf===cpf && u.tipo===tipo); },
  findUserByEmail(email){ return this.getUsers().find(u=>u.email.toLowerCase()===email.toLowerCase()); },

  getCondominios(){ return this.get(DB_KEYS.condominios); },
  getCondominio(id){ return this.getCondominios().find(c=>c.id===id); },
  saveCondominio(c){ const list=this.getCondominios(); list.push(c); this.set(DB_KEYS.condominios,list); },
  updateCondominio(c){ const list=this.getCondominios().map(x=>x.id===c.id?c:x); this.set(DB_KEYS.condominios,list); },

  getSolicitacoes(){ return this.get(DB_KEYS.solicitacoes); },
  getSolicitacoesByCondominio(cid){ return this.getSolicitacoes().filter(s=>s.condominioId===cid); },
  getSolicitacoesByMorador(uid){ return this.getSolicitacoes().filter(s=>s.moradorId===uid); },
  getSolicitacao(id){ return this.getSolicitacoes().find(s=>s.id===id); },
  saveSolicitacao(s){ const list=this.getSolicitacoes(); list.unshift(s); this.set(DB_KEYS.solicitacoes,list); },
  updateSolicitacao(s){ const list=this.getSolicitacoes().map(x=>x.id===s.id?s:x); this.set(DB_KEYS.solicitacoes,list); },

  getAreas(cid){ return this.get(DB_KEYS.areas).filter(a=>a.condominioId===cid); },

  getReservas(){ return this.get(DB_KEYS.reservas); },
  getReservasByCondominio(cid){ return this.getReservas().filter(r=>r.condominioId===cid); },
  getReservasByMorador(uid){ return this.getReservas().filter(r=>r.moradorId===uid); },
  saveReserva(r){ const list=this.getReservas(); list.unshift(r); this.set(DB_KEYS.reservas,list); },

  getAvisos(cid){ return this.get(DB_KEYS.avisos).filter(a=>a.condominioId===cid).sort((a,b)=>new Date(b.data)-new Date(a.data)); },
  saveAviso(a){ const list=this.get(DB_KEYS.avisos); list.unshift(a); this.set(DB_KEYS.avisos,list); },

  getMoradoresByCondominio(cid){ return this.getUsers().filter(u=>u.tipo==='condomino' && u.condominioId===cid); },

  getSession(){ return JSON.parse(localStorage.getItem(DB_KEYS.session) || 'null'); },
  setSession(userId){ localStorage.setItem(DB_KEYS.session, JSON.stringify({userId})); },
  clearSession(){ localStorage.removeItem(DB_KEYS.session); },
  getCurrentUser(){ const s=this.getSession(); if(!s) return null; return this.getUsers().find(u=>u.id===s.userId) || null; }
};

function requireAuth(tipoEsperado){
  const user = store.getCurrentUser();
  if(!user){ window.location.href = tipoEsperado==='sindico' ? '../index.html' : '../index.html'; return null; }
  if(tipoEsperado && user.tipo !== tipoEsperado){
    window.location.href = user.tipo==='sindico' ? '../sindico/inicio.html' : '../morador/inicio.html';
    return null;
  }
  return user;
}

function logout(){ store.clearSession(); window.location.href = (location.pathname.includes('/morador/')||location.pathname.includes('/sindico/')) ? '../index.html' : 'index.html'; }

function initials(nome){ return nome.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase(); }

function formatDateBR(iso){
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'});
}

function showToast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}
