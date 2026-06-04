# 🗃️ Supabase Setup - La Pistaccheria CMS

> **Status**: Preparação para Fase 1 (Auth)  
> **Data**: Junho 2026  
> **Próximo passo**: Implementar AuthContext e tela de login

---

## 📋 Índice

1. [Criar projeto Supabase](#1-criar-projeto-supabase)
2. [Configurar Auth](#2-configurar-auth)
3. [Executar SQL de setup](#3-executar-sql-de-setup)
4. [Criar Storage bucket](#4-criar-storage-bucket)
5. [Preencher .env.local](#5-preencher-envlocal)
6. [Verificar setup](#6-verificar-setup)

---

## 1. Criar projeto Supabase

### Passo 1.1: Criar conta/login
- Acesse [supabase.com](https://supabase.com)
- Faça login com GitHub (recomendado)
- Clique em **"New project"**

### Passo 1.2: Configurar projeto
- **Name**: `la-pistaccheria` (ou similar)
- **Database Password**: Gere uma senha forte (Supabase fornece opção)
- **Region**: Escolha a mais próxima do Brasil (ex: `South America (São Paulo)` se disponível, ou `US East` como fallback)
- Clique em **"Create new project"**

⏱️ Aguarde ~2 minutos enquanto o projeto é criado...

### Passo 1.3: Copiar credenciais
Quando o projeto estiver pronto, vá para **Settings → API**:
- Copie `Project URL` (ex: `https://xxxxx.supabase.co`)
- Copie `anon public` key

Salve essas credenciais — vão ser usadas em `.env.local`.

---

## 2. Configurar Auth

### Passo 2.1: Habilitar Email/Password Auth
No menu lateral:
- Clique em **Authentication**
- Clique em **Providers**
- Procure por **Email** e garanta que está ativado (deve estar por padrão)
- Verifique se "Confirm email" está **desativado** (para dev local)

### Passo 2.2: Configurar JWT Secret (opcional para dev, importante para prod)
Ainda em **Authentication → Providers**:
- Vá para **JWT Settings**
- Copie o `JWT Secret` (você vai usar apenas em prod, ignore por enquanto)

### Passo 2.3: Criar primeiro usuário admin
- Vá para **Authentication → Users**
- Clique em **"Add user"** → **"Create new user"**
- Email: `admin@lapistaccheria.local` (para dev)
- Password: Digite uma senha forte
- Confirme

⚠️ **IMPORTANTE**: Copie o `UUID` desse usuário (aparece na lista) — você vai precisar no SQL seed!

---

## 3. Executar SQL de setup

### Passo 3.1: Preparar SQL
1. Abra `supabase-setup.sql` neste repositório
2. **Encontre todas as ocorrências de `'YOUR-USER-ID-HERE'`**
3. **Substitua** pelo UUID do usuário admin que você copinou no Passo 2.3

Exemplo:
```sql
-- Antes:
created_by = 'YOUR-USER-ID-HERE'

-- Depois (exemplo real):
created_by = '550e8400-e29b-41d4-a716-446655440000'
```

### Passo 3.2: Executar no Supabase
- Dashboard → **SQL Editor**
- Clique em **"New Query"**
- **Cole o conteúdo completo do supabase-setup.sql modificado**
- Clique em **"Run"** (triângulo ▶️)

✅ Se tudo correr bem, você verá:
```
Query complete, X rows affected
```

### Passo 3.3: Verificar tabelas
- Vá para **Table Editor** no menu lateral
- Você deve ver:
  - ✅ `products` (6 produtos seed)
  - ✅ `cms_users` (vazio por enquanto)

**Se tiver erros**, clique em cada um e veja a mensagem. Erros comuns:
- "Tabela já existe" → Você pode rodar safe (não causa problema)
- "UUID inválido" → Verifica se você substituiu `YOUR-USER-ID-HERE` corretamente

---

## 4. Criar Storage bucket

### Passo 4.1: Criar bucket
- Dashboard → **Storage** (lado esquerdo)
- Clique em **"Create bucket"**
- Name: `la-pistaccheria`
- Deixe **"Public bucket"** ativado (vamos usar URLs públicas)
- Clique em **"Create bucket"**

### Passo 4.2: Configurar CORS (opcional, mas recomendado)
- Clique no bucket `la-pistaccheria`
- Vá para **Settings**
- Em **CORS Configuration**, deixe em branco (Supabase default é permissivo para dev)

✅ Seu bucket está pronto para receber uploads!

---

## 5. Preencher .env.local

### Passo 5.1: Criar arquivo .env.local
```bash
# Na raiz do projeto
cp .env.example .env.local
```

### Passo 5.2: Preencher credenciais
```bash
# .env.local

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

Substitua com as credenciais que você salvou no Passo 1.3.

### Passo 5.3: Verificar
```bash
# Rodar dev para testar
npm run dev
```

Abra o browser em `http://localhost:5173` — se funcionar sem erros de console sobre Supabase, você está pronto!

---

## 6. Verificar setup

### Checklist final

- [ ] Projeto Supabase criado
- [ ] Auth Email/Password habilitado
- [ ] Usuário admin criado (Email: `admin@lapistaccheria.local`)
- [ ] SQL executado com sucesso
  - [ ] Tabela `products` com 6 registros
  - [ ] Tabela `cms_users` criada
  - [ ] Políticas RLS criadas
- [ ] Storage bucket `la-pistaccheria` criado (público)
- [ ] `.env.local` preenchido com credenciais
- [ ] `npm run dev` funciona sem erros

### Teste manual (opcional)

Se quiser testar a conexão antes de implementar o frontend:

1. Abra **Table Editor → products**
2. Verá os 6 produtos seed
3. Clique em um produto
4. Mude `active = FALSE`
5. Clique em **"Save"**
6. Se salvou, RLS e database estão funcionando ✅

---

## 🆘 Troubleshooting

### "Permission denied" ao executar SQL
**Causa**: Você não tem credenciais de admin  
**Solução**: Certifique-se de que está logado no Supabase com a conta proprietária do projeto

### "UUID inválido" no seed
**Causa**: Você não substituiu `YOUR-USER-ID-HERE` corretamente  
**Solução**: 
1. Vá para **Authentication → Users**
2. Copie exatamente o UUID do admin (sem espaços)
3. Vá para **SQL Editor**
4. Execute: `SELECT id FROM public.cms_users LIMIT 1;` para ver IDs inseridos

### "Bucket já existe"
**Causa**: Você criou o bucket manualmente antes  
**Solução**: OK, você pode usar o bucket existente. Só garanta que é público.

### "VITE_SUPABASE_URL not found" no browser console
**Causa**: `.env.local` não foi criado ou não foi lido pelo Vite  
**Solução**:
```bash
# Certificar que .env.local existe
ls -la .env.local

# Se não existe, criar:
cp .env.example .env.local
# editar com credenciais corretas

# Reiniciar dev server:
npm run dev
```

---

## 📚 Próximos passos

Quando tudo estiver funcionando:

1. **Fase 1 - Auth**: Implementar `AuthContext`, tela de login, `ProtectedRoute`
2. **Fase 2 - Listagem**: Build `AdminProducts.tsx` e queries
3. **Fase 3 - CRUD**: Build `AdminProductForm.tsx`
4. **Fase 4 - Integração**: Conectar frontend ao banco de dados

---

## 🔗 Referências úteis

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status**: ✅ Pronto para Fase 1
