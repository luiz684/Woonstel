# Woonstel — Sistema de Gestão Técnica de Condomínios

Aplicação web para **centralizar o registro, o acompanhamento e o histórico das manutenções de um condomínio**, além da reserva de áreas comuns. Substitui o fluxo informal de relatos por aplicativo de mensagens por um fluxo rastreável entre **morador** e **síndico**.

> Projeto desenvolvido como Trabalho de Conclusão de Curso (Projeto Integrador) na Fatec Ipiranga.

> ⚠️ **Use a branch `angular-migration`, e não a `main`.**
> A versão atual do sistema (Angular + Supabase) está na `angular-migration`. A `main` guarda apenas o **protótipo inicial** em HTML, CSS e JavaScript, com dados simulados no navegador.
> Para baixar a branch correta: `git clone -b angular-migration https://github.com/luiz684/Woonstel.git`

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como executar](#como-executar)
- [Cadastro de moradores (fluxo de convite)](#cadastro-de-moradores-fluxo-de-convite)
- [Banco de dados](#banco-de-dados)
- [Segurança](#segurança)
- [Acessibilidade](#acessibilidade)
- [Documentação](#documentação)
- [Limitações conhecidas](#limitações-conhecidas)
- [Próximos passos](#próximos-passos)
- [Equipe](#equipe)

## Funcionalidades

### Síndico

- **Painel inicial** com aviso de solicitações pendentes e as que mais precisam de atenção (prioridade e tempo de espera).
- **Solicitações:** lista com filtros por status, detalhe com fotos e vídeo do problema, histórico, mudança de status, **alteração de prioridade com confirmação** (só enquanto pendente), **resposta ao morador** e **recusa com justificativa**.
- **Moradores:** cadastro por **convite** (link de uso único com validade), reenvio e cancelamento de convites, desativação de acesso, contagem de solicitações recusadas e **anotação privada** por morador (invisível ao morador).
- **Áreas comuns:** cadastro, edição, indisponibilização com motivo e **duração fixa por reserva** (por exemplo, 1h30 para quadra).
- **Reservas:** visão geral, filtros e **cancelamento com justificativa**.
- **Avisos:** publicar, editar e excluir.
- **Dashboard:** indicadores, gráficos por período, tempo médio de resolução, reservas por área e dia da semana, **relatório em PDF** e **exportação em CSV**.

### Morador

- **Solicitar manutenção** com categoria, prioridade e até 4 arquivos (fotos e 1 vídeo); foto ou vídeo **obrigatório** nas categorias físicas (elétrica, hidráulica e estrutural).
- **Minhas solicitações** com busca, filtros, histórico e as respostas do síndico.
- **Reservar área** por horário de início e fim, sem sobreposição, sem datas passadas e com **uma reserva ativa por vez**; cancelamento com justificativa.
- **Notificações** de mudança de status, respostas, reservas canceladas e avisos novos, com preferências por tipo.
- **Avisos do condomínio.**

### Para todos

- Login por **CPF + tipo de usuário + senha**.
- **Perfil** com foto, edição de nome e telefone, troca de senha e download dos próprios dados (LGPD).
- **Configurações** de aparência (tema claro, escuro ou automático) e de acessibilidade.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | Angular 21 (TypeScript), HTML e CSS |
| Autenticação | Supabase Auth |
| Banco de dados | PostgreSQL (Supabase) com Row Level Security |
| Arquivos | Supabase Storage (buckets privados) |
| Login por CPF | Supabase Edge Function (Deno) |
| Servidor de aplicação | Spring Boot 4.1 / Java 21 (configurado; uso previsto, veja [Limitações](#limitações-conhecidas)) |
| Versionamento | Git e GitHub |

## Arquitetura

```
Navegador (Angular, SPA)
   │
   ├── Supabase Auth ........ sessão por token JWT
   ├── API REST (PostgREST) . consultas e gravações, protegidas por RLS
   ├── Funções SQL (RPC) .... regras de negócio no banco
   ├── Storage .............. fotos, vídeos e avatares (URLs assinadas)
   └── Edge Function "login"  CPF + tipo + senha → sessão (o e-mail não vai ao navegador)

Spring Boot (backend/) ...... configurado para conectar ao PostgreSQL; regras no servidor são trabalho futuro
```

As regras importantes (reserva sem sobreposição, foto obrigatória, limite de solicitações abertas, recusa só quando pendente etc.) estão **no banco**, e não só na tela, para valerem mesmo que alguém chame a API diretamente.

## Estrutura do repositório

```
.
├── angular/        Aplicação Angular (pages, components, services, utils)
├── backend/        Projeto Spring Boot (conexão com o banco configurada)
├── banco/          Scripts SQL numerados do banco de dados
├── supabase/
│   └── functions/
│       └── login/  Edge Function de login por CPF
├── docs/           Documentação do projeto e diagramas de atividades
└── css/ js/ morador/ sindico/ *.html
                    Protótipo inicial em HTML, CSS e JavaScript (dados simulados no navegador)
```

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org) (versão LTS)
- Um projeto no [Supabase](https://supabase.com) (plano gratuito serve)
- Git
- Opcional, para o backend: JDK 21

### 1. Clonar e instalar

```bash
git clone -b angular-migration https://github.com/luiz684/Woonstel.git
cd Woonstel/angular
npm install
```

> No Windows, se o PowerShell bloquear scripts (`npm.ps1 não pode ser carregado`), use `npm.cmd install` e `npx.cmd ng serve`, ou rode `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

### 2. Configurar o Supabase

1. Em `angular/src/app/supabase.config.ts`, informe a URL do projeto, a chave pública (`sb_publishable_...`) e o nome da Edge Function de login:

   ```ts
   export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
   export const SUPABASE_KEY = 'sb_publishable_...';
   export const LOGIN_FUNCTION = 'login'; // o nome (slug) que o painel gerar
   ```

   A chave pública pode ficar no código, porque a proteção dos dados vem das políticas RLS. **Nunca** coloque a chave `secret` / `service_role` no Angular.

2. Em **SQL Editor**, rode os scripts da pasta [`banco/`](banco) **em ordem numérica** (veja [Banco de dados](#banco-de-dados)).
3. Em **Authentication > Sign In / Providers > Email**, defina o tamanho mínimo da senha em 8 e exija letras maiúsculas e minúsculas, números e símbolos. Em desenvolvimento, desative **Confirm email**.
4. Em **Edge Functions**, publique o conteúdo de [`supabase/functions/login/index.ts`](supabase/functions/login/index.ts) e **desligue "Verify JWT"** nas configurações da função.

### 3. Criar o primeiro síndico

O cadastro é **somente por convite**. Os convites de síndico só podem ser gerados por quem tem acesso ao banco (a equipe do sistema), no SQL Editor:

```sql
select public.gerar_convite_sindico('Nome do Síndico', '000.000.000-00', 'email@dominio.com');
```

O resultado é um *token*. O link do convite é `http://localhost:4200/convite/TOKEN`: ele vale por 7 dias e só pode ser usado uma vez. Depois de criar a senha, o síndico entra, cadastra o condomínio e passa a convidar os moradores pela tela **Moradores**.

### 4. Rodar a aplicação

```bash
npx ng serve
```

Abra `http://localhost:4200`.

### 5. Backend Spring Boot (opcional)

```bash
cd backend
# senha do banco: variável de ambiente ou arquivo local ignorado pelo Git
$env:DB_PASSWORD = "SENHA_DO_BANCO"          # PowerShell
.\mvnw.cmd spring-boot:run
```

Os dados de conexão (Session pooler) ficam em `backend/src/main/resources/application.properties`. A senha **nunca** é versionada: use a variável `DB_PASSWORD` ou `application-local.properties` (já listado no `.gitignore`).

## Banco de dados

Principais tabelas: `condominios`, `profiles`, `convites`, `solicitacoes`, `areas`, `reservas`, `avisos`, `notificacoes` e `notas_morador`. Todas têm RLS habilitado. As regras de negócio estão em funções e *triggers* SQL.

| Script | Conteúdo |
|---|---|
| `01-schema-inicial.sql` | Condomínios, perfis, RLS e criação de perfil |
| `02-solicitacoes-reservas-avisos.sql` | Solicitações, reservas e avisos |
| `03-areas-e-campos-morador.sql` | Áreas comuns e campos de solicitação/reserva |
| `04-storage-fotos.sql` | Armazenamento das fotos das solicitações |
| `05-areas-avisos-notificacoes.sql` | Disponibilidade de áreas e permissões de avisos |
| `06-reservas-regras.sql` | Regras de data e horário das reservas |
| `07-reservas-inicio-fim.sql` | Reservas por horário de início e fim, sem sobreposição |
| `08-limite-reserva.sql` | Uma reserva ativa por morador |
| `09-cancelamento-notificacoes.sql` | Cancelamento de reservas e notificações |
| `10-regras-solicitacao.sql` | Prioridade e resposta só em solicitações em aberto |
| `11-convites.sql` | Convites de moradores e desativação de acesso |
| `12-recusa-foto.sql` | Recusa de solicitações, foto obrigatória e contador de recusadas |
| `13-perfil-configuracoes.sql` | Perfil, avatares e preferências de notificação |
| `14-convite-sindico.sql` | Convite de síndico e cadastro somente por convite |
| `15-anexos-video.sql` | Vários anexos e vídeo nas solicitações |
| `16-dashboard.sql` | Indicadores do dashboard calculados no banco |

> Os scripts foram aplicados de forma incremental no projeto de desenvolvimento, e alguns substituem funções definidas nos anteriores. A execução do zero, em ordem, em um projeto novo ainda deve ser validada.

## Segurança

- **Row Level Security** em todas as tabelas: cada usuário só enxerga o que lhe pertence ou o que é do seu condomínio.
- **Cadastro somente por convite.** O tipo de usuário, o condomínio e a unidade vêm do convite e **não podem ser definidos pelo navegador**, o que impede que alguém se torne síndico sozinho.
- **Login por Edge Function:** o e-mail correspondente a um CPF nunca é enviado ao navegador, e todas as falhas devolvem a mesma resposta.
- **Senhas** gerenciadas pelo Supabase Auth, com regras de complexidade validadas na tela e no servidor.
- **Colunas protegidas** em `profiles`: o usuário só altera nome, telefone, foto e preferências.
- **Arquivos privados** (fotos, vídeos e avatares) com URLs assinadas de curta duração.
- **Regras no banco:** reservas sem sobreposição, sem datas passadas, uma reserva ativa por morador, foto obrigatória nas categorias físicas, limite de 5 solicitações abertas, recusa e prioridade só quando permitidas.
- **Exportação CSV** com proteção contra injeção de fórmulas em planilhas.

## Acessibilidade

Tema claro, escuro ou automático, tamanho de letra ajustável, alto contraste, opção de reduzir animações, foco visível e navegação por teclado (inclusive nos filtros), anúncio das mensagens para leitores de tela, idioma da página em `pt-BR` e tradutor de Libras (VLibras). Os componentes novos devem ser avaliados com o Lighthouse (Chrome DevTools) a cada etapa.

## Documentação

A pasta [`docs/`](docs) reúne a documentação do Projeto Integrador (requisitos, regras de negócio, casos de uso, riscos e backlog) e os **diagramas de atividades** por caso de uso.

## Limitações conhecidas

- Os módulos de **funcionário, tarefas, empresas terceirizadas e agenda** ainda não foram implementados.
- A tela de **recuperação de senha** ainda não envia e-mail, e a **troca de e-mail** não está disponível.
- As notificações são conferidas quando a tela é aberta ou recarregada (sem tempo real).
- O **Spring Boot** está configurado, mas as regras de negócio ainda estão no banco. Regras que exigem servidor (e chaves secretas), como pagamento com confirmação automática, estão previstas.
- Vídeos acima de 25 MB são recusados, e o aplicativo não os comprime.
- A **verificação de quem é síndico** é manual (feita pela equipe antes de gerar o convite).
- **Exclusão definitiva de conta** ainda não está disponível.

## Próximos passos

- Controle de pagamento das reservas (isento, a pagar, pago).
- Publicação na internet e instalação como aplicativo (PWA).
- Testes automatizados e atualização dos diagramas.
- Tarefas, prestadores de serviço e manutenção preventiva programada.
- Painel administrativo para validar síndicos.

## Equipe

- Luiz Gustavo Dantas de Jesus
- _(adicione aqui os demais integrantes)_

Fatec Ipiranga — Análise e Desenvolvimento de Sistemas.
