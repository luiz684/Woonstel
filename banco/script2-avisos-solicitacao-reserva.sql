alter table public.condominios
  add column endereco text,
  add column unidades int,
  add column blocos int,
  add column codigo text;


create function public.is_sindico_of(cond uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from condominios where id = cond and sindico_id = auth.uid());
$$;

create function public.my_condominio()
returns uuid language sql security definer stable set search_path = public as $$
  select condominio_id from profiles where id = auth.uid();
$$;


create table public.solicitacoes (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  morador_id uuid not null references public.profiles(id) on delete cascade,
  morador_nome text,
  apto text,
  titulo text not null,
  descricao text,
  status text not null default 'Pendente' check (status in ('Pendente','Em andamento','Resolvida')),
  created_at timestamptz default now()
);

create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  morador_id uuid not null references public.profiles(id) on delete cascade,
  area text not null,
  data date not null,
  created_at timestamptz default now()
);

create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  autor text,
  created_at timestamptz default now()
);

alter table public.solicitacoes enable row level security;
alter table public.reservas enable row level security;
alter table public.avisos enable row level security;


create policy "síndico atualiza condomínio"
  on public.condominios for update to authenticated
  using (auth.uid() = sindico_id);


create policy "síndico lê moradores"
  on public.profiles for select to authenticated
  using (tipo = 'condomino' and public.is_sindico_of(condominio_id));


create policy "ver solicitações"
  on public.solicitacoes for select to authenticated
  using (morador_id = auth.uid() or public.is_sindico_of(condominio_id));
create policy "morador cria solicitação"
  on public.solicitacoes for insert to authenticated
  with check (morador_id = auth.uid());
create policy "síndico atualiza solicitação"
  on public.solicitacoes for update to authenticated
  using (public.is_sindico_of(condominio_id));


create policy "ver reservas"
  on public.reservas for select to authenticated
  using (morador_id = auth.uid() or public.is_sindico_of(condominio_id));
create policy "morador cria reserva"
  on public.reservas for insert to authenticated
  with check (morador_id = auth.uid());


create policy "ver avisos"
  on public.avisos for select to authenticated
  using (condominio_id = public.my_condominio() or public.is_sindico_of(condominio_id));
create policy "síndico cria aviso"
  on public.avisos for insert to authenticated
  with check (public.is_sindico_of(condominio_id));