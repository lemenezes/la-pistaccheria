# Supabase Setup - La Pistaccheria CMS v1

Status: schema final simplificado (sem cms_users e sem Supabase Storage)

## 1) Criar projeto no Supabase
1. Acesse supabase.com e crie um projeto novo.
2. Regiao recomendada: mais proxima do Brasil.
3. Em Settings -> API, copie:
- Project URL
- anon public key

## 2) Criar usuarios no Auth
1. Va em Authentication -> Users.
2. Crie os 3 usuarios do CMS (Anne, Fz e voce).
3. Copie os UUIDs de cada usuario.

## 3) Preparar o SQL consolidado
Arquivo: supabase-setup.sql

Antes de executar, confirme o UUID de admin no script:
- aab02bda-97ba-4404-b7f3-9879f0098bf0

Onde achar os UUIDs:
- Supabase Dashboard -> Authentication -> Users -> coluna ID

## 4) Executar SQL em uma unica vez
1. Abra SQL Editor -> New Query.
2. Cole o conteudo completo de supabase-setup.sql.
3. Execute uma vez.

O script cria:
- funcao public.is_cms_admin() com allowlist de UUIDs
- tabela public.products
- indices
- trigger de updated_at
- RLS de products
- seed com os 6 produtos atuais

## 5) Configurar variaveis locais
1. Na raiz do projeto, copie .env.example para .env.local.
2. Preencha:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 6) Validacao rapida
No Supabase:
- Table Editor: products com 6 registros
- SQL: funcao is_cms_admin criada

No projeto:
- npm run dev sem erro de variavel ausente

## Observacoes importantes
- created_by e nullable por design (ON DELETE SET NULL).
- Leitura publica retorna apenas active = true.
- Usuarios autenticados conseguem ler todos os produtos (area admin).
- Escrita (insert/update/delete) exige is_cms_admin().
- gallery_urls e JSONB com default [] para suportar multiplas imagens no futuro.
- image_url no CMS v1 e preenchido manualmente com URL publica (Cloudflare R2/CDN).
- Upload direto para R2/CDN fica para fase futura.
