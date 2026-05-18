# TrocaCopa

Aplicação web mobile-first para facilitar trocas reais de figurinhas da Copa. O colecionador cadastra figurinhas faltantes e repetidas por código, encontra matches com outros colecionadores e chama a pessoa pelo WhatsApp.

## Stack travada para o MVP

- Next.js `15.1.6` com App Router
- React `19.0.0`
- TypeScript `5.7.3`
- Tailwind CSS `3.4.17`
- ESLint `9.18.0` com `eslint-config-next` `15.1.6`
- Supabase Auth/SSR/JS `0.6.1` e `2.48.1`
- Supabase/PostgreSQL
- Deploy futuro na Vercel

As versões estão travadas no `package.json` para reduzir variação entre ambientes durante o MVP.

## Funcionalidades do MVP

- Login simples por magic link do Supabase Auth.
- Perfil do colecionador com nome, WhatsApp, cidade, bairro e ponto de troca opcional.
- Cadastro rápido de figurinhas por código como `faltando` ou `repetida`.
- Home com progresso, repetidas, matches, CTA principal e bloco “Rolando agora”.
- Tela Adicionar com input grande, limpeza automática, foco mantido e últimas adicionadas.
- Tela Trocas com match perfeito/simples, “você ganha”, “você manda” e botão para WhatsApp quando informado.
- Perfil com painel, progresso, atividade recente e chamada social orgânica.

## Setup local

1. Instale as dependências:

```bash
npm install
```

2. Crie `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. No Supabase, abra o SQL Editor e execute o arquivo:

```bash
supabase/schema.sql
```

4. Rode o app:

```bash
npm run dev
```

5. Acesse `http://localhost:3000` em viewport mobile.

## Checklist de validação local

Execute sempre nesta ordem antes de abrir PR:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

## Status real dos checks neste ambiente

- `npm install` com proxy configurado no ambiente falhou com `403 Forbidden` ao acessar o npm registry.
- Uma segunda tentativa sem as variáveis de proxy não retornou resposta útil dentro do tempo operacional e foi interrompida.
- `npm run lint` falhou porque `@eslint/eslintrc` não está instalado localmente sem `npm install`.
- `npm run typecheck` falhou por ausência dos tipos/pacotes de `next`, `react`, `@supabase/*` e `@types/node`.
- `npm run build` falhou porque o binário `next` não existe sem `node_modules`.
- Por isso, esta entrega inclui revisão estática dos arquivos críticos, mas a validação completa precisa ser repetida em ambiente com acesso ao npm registry.

## Estrutura principal

```text
src/app              Rotas do App Router
src/components       Componentes mobile-first reutilizáveis
src/lib/supabase     Clients Supabase e tipos do banco
src/lib/stickers.ts  CRUD e matching inicial em TypeScript
supabase/schema.sql  Schema PostgreSQL, RLS e triggers
```

## Modelo de dados

- `profiles`: dados públicos do colecionador para contato e local de troca.
- `stickers`: catálogo simples por código, com metadados opcionais.
- `user_stickers`: relação do usuário com a figurinha e status `missing` ou `duplicate`.

## Matching principal

O matching principal do MVP está em `src/lib/stickers.ts`. O schema SQL não mantém uma segunda função de matching para evitar divergência de regra neste momento.

O MVP considera:

- **Match perfeito**: outra pessoa tem uma repetida que você precisa e também precisa de uma repetida sua.
- **Match simples**: existe apenas um lado claro da troca, ainda útil para chamar no WhatsApp e combinar.

## Riscos conhecidos do MVP

- O progresso usa uma estimativa fixa de 670 figurinhas enquanto não houver catálogo oficial completo.
- O matching em TypeScript é simples e adequado para o MVP, mas pode precisar migrar para função SQL/RPC quando houver maior volume de usuários e figurinhas.
- A política de leitura de `user_stickers` permite consulta autenticada ampla para viabilizar matching inicial; deve ser revisitada antes de escala pública.
- A validação completa depende de ambiente com acesso ao npm registry para gerar `package-lock.json` e executar os checks.

## Restrições de produto mantidas

Não há chat interno, marketplace, pontos, ranking, scanner, OCR, IA, geolocalização em tempo real ou recompensa por convite. O foco é combinar trocas reais pelo WhatsApp.
