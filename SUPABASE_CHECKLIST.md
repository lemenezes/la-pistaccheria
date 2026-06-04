# Checklist - Supabase CMS v1

## Antes de rodar o SQL
- [ ] Projeto Supabase criado
- [ ] 3 usuarios criados em Authentication -> Users (Anne, Fz, voce)
- [ ] UUID de cada usuario copiado
- [ ] UUID de admin confirmado em supabase-setup.sql:
  - [ ] aab02bda-97ba-4404-b7f3-9879f0098bf0

## Executar setup
- [ ] SQL colado e executado uma unica vez no SQL Editor
- [ ] Tabela products criada
- [ ] Funcao is_cms_admin criada
- [ ] Trigger de updated_at criada
- [ ] RLS de products criado
- [ ] Seed com 6 produtos inserido

## Validacao funcional
- [ ] Consulta anonima retorna apenas active = true
- [ ] Usuario autenticado le todos os produtos
- [ ] Usuario fora da allowlist nao escreve
- [ ] Usuario da allowlist consegue inserir/editar/deletar
- [ ] image_url aceita URL publica (Cloudflare R2/CDN)

## Projeto local
- [ ] .env.local criado a partir de .env.example
- [ ] VITE_SUPABASE_URL preenchido
- [ ] VITE_SUPABASE_ANON_KEY preenchido
- [ ] npm run dev sobe sem erro de env
