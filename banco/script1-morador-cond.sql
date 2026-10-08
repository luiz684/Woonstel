create table public.condominios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sindico_id uuid references auth.users(id),
  created_at timestamptz default now()
);


create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  cpf text not null,
  tipo text not null check (tipo in ('condomino','sindico','funcionario')),
  condominio_id uuid references public.condominios(id),
  apto text,
  created_at timestamptz default now(),
  unique (cpf, tipo)
);


alter table public.condominios enable row level security;
alter table public.profiles enable row level security;

create policy "condominios visíveis para todos"
  on public.condominios for select using (true);

create policy "síndico cria condomínio"
  on public.condominios for insert to authenticated
  with check (auth.uid() = sindico_id);

create policy "usuário lê o próprio perfil"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "usuário atualiza o próprio perfil"
  on public.profiles for update to authenticated
  using (auth.uid() = id);


create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email, cpf, tipo, condominio_id, apto)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.email,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'tipo',
    nullif(new.raw_user_meta_data->>'condominio_id','')::uuid,
    new.raw_user_meta_data->>'apto'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


create function public.get_email_by_cpf_tipo(p_cpf text, p_tipo text)
returns text language sql security definer set search_path = public as $$
  select email from public.profiles where cpf = p_cpf and tipo = p_tipo limit 1;
$$;

grant execute on function public.get_email_by_cpf_tipo(text, text) to anon, authenticated;

