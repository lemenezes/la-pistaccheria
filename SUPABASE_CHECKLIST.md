# ✅ CHECKLIST - Preparação Supabase

## 📋 Arquivos gerados

Você recebeu 4 arquivos para configurar o Supabase:

### 1. **supabase-setup.sql** (188 linhas)
SQL completo para criar e popular o banco de dados.

**O que faz:**
- ✅ Cria tabela `cms_users`
- ✅ Cria tabela `products`
- ✅ Configura índices para performance
- ✅ Cria 11 políticas RLS de segurança
- ✅ Cria trigger para atualizar `updated_at`
- ✅ Insere 6 produtos seed (migração dos products.ts atuais)

**Como usar:**
1. Copie o conteúdo completo
2. Dashboard Supabase → SQL Editor → New Query
3. Cole tudo
4. **⚠️ ANTES de rodar**: Substitua `'YOUR-USER-ID-HERE'` pelo UUID do seu admin
5. Clique "Run"

---

### 2. **SUPABASE_SETUP.md** (Instruções passo a passo)
Guia completo de como configurar o Supabase do zero.

**Seções:**
1. Criar projeto Supabase
2. Configurar Auth (Email/Password)
3. Executar SQL (com avisos)
4. Criar Storage bucket
5. Preencher `.env.local`
6. Verificar setup
7. Troubleshooting

**Tempo estimado**: 15-20 minutos

---

### 3. **supabase-reset.sql** (Bonus/Opcional)
Script para limpar tudo e começar do zero.

**Quando usar:**
- Você errou e quer resetar
- Está testando e quer limpar dados
- Vai apresentar para os client e quer DB limpo

**Como usar:**
1. SQL Editor → New Query
2. Cole supabase-reset.sql
3. Clique "Run"
4. Depois rode supabase-setup.sql novamente

---

### 4. **DATABASE_SCHEMA.md** (Documentação técnica)
Especificação completa da arquitetura do banco.

**Seções:**
- Visão geral (diagrama ASCII)
- Definição de cada tabela (colunas, tipos, constraints)
- Políticas RLS explicadas
- Storage bucket (estrutura e URLs)
- Decisões de design (por que cada coisa foi feita assim)
- Fluxos de dados (como as requisições fluem)
- Performance & otimizações
- Queries SQL úteis para debugging

---

## 🚀 Próximas ações (para você)

### Ação imediata:
1. [ ] Criar projeto Supabase
2. [ ] Criar usuário admin (`admin@lapistaccheria.local`)
3. [ ] Copiar UUID do admin
4. [ ] Abrir `supabase-setup.sql` e substituir `YOUR-USER-ID-HERE` pelo UUID
5. [ ] Executar SQL no Supabase
6. [ ] Criar Storage bucket `la-pistaccheria`
7. [ ] Preencher `.env.local` com credenciais

### Verificação:
8. [ ] Ir para Table Editor e ver 6 produtos no banco
9. [ ] Rodar `npm run dev` e verificar console (sem erros Supabase)
10. [ ] Testar edit de um produto no Table Editor (salvar deve funcionar)

### Quando tudo funcionar:
11. [ ] Passaremos para Fase 1 (Auth - implementar login no frontend)

---

## ⚠️ Pontos importantes

### Dados seed
Os 6 produtos atuais em `src/data/products.ts` serão migrados para o banco:
- Pasta di Pistacchio (destaque = true)
- Cremino al Pistacchio (destaque = true)
- Torta Pistacchio e Limone (destaque = true)
- Cannolo al Pistacchio
- Tartufo di Pistacchio
- Granella Croccante

**Todas as imagens começam apontando para as URLs externas** (Unsplash/Wikimedia) — você pode depois fazer upload da sua própria CDN.

### RLS Security
Depois de rodar o SQL, as políticas garantem:
- ✅ Público vê apenas produtos `active = TRUE`
- ✅ Admins veem tudo
- ✅ Só admins podem criar/editar/deletar

### Como saber seu UUID de admin
Dashboard Supabase:
1. Auth → Users
2. Copie o valor na coluna `ID`
3. Exemplo: `550e8400-e29b-41d4-a716-446655440000`

---

## 📚 Referências rápidas

**Onde encontrar o quê no Supabase:**
- Project URL & Keys → Settings → API
- Auth config → Authentication → Providers
- Criar usuários → Authentication → Users
- Ver tabelas → Table Editor (esquerda)
- Executar SQL → SQL Editor
- Storage → Storage (esquerda)

**Erros comuns:**
- "UUID inválido" → Verifica se copiou certo do admin
- "Permission denied" → Você não tá logado no projeto certo
- "Table already exists" → Você rodou o SQL 2 vezes (é OK, ignore)

---

## ✅ Status

**Código do frontend:**
- ✅ Dependências instaladas
- ✅ lib/supabase.ts criado
- ✅ types/database.ts criado
- ✅ .env.example pronto
- ✅ Build passa sem erros

**Supabase setup:**
- ⏳ Pendente: Você executar os passos acima

**Próximo**:
- ⏳ Fase 1 - Auth (AuthContext, tela de login, ProtectedRoute)

---

## 💬 Resumo

Você tem tudo pronto para configurar o Supabase. Os 4 arquivos cobrem:
1. SQL para criar tudo
2. Instruções de passo a passo
3. Como resetar se errar
4. Documentação completa do schema

**Próximo passo**: Você ir ao Supabase, criar projeto, e rodar o SQL. Depois avisar quando tiver pronto para eu começar Fase 1 (Auth no frontend).

Tempo de setup total: ~20 minutos (criação do projeto + rodar SQL)

---

**Data criação**: Junho 2026  
**Status**: ✅ Pronto para você configurar Supabase
