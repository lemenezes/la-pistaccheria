# 📐 Arquitetura do Banco de Dados - La Pistaccheria

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │    auth.users    │        │   cms_users      │          │
│  │  (Supabase)      │        │  (Custom)        │          │
│  ├──────────────────┤        ├──────────────────┤          │
│  │ id (UUID)        │◄───────│ id (FK)          │          │
│  │ email            │        │ full_name        │          │
│  │ password         │        │ role: admin/editor
│  │ created_at       │        │ created_at       │          │
│  └──────────────────┘        └──────────────────┘          │
│                                     △                       │
│                                     │                       │
│                              ┌──────┴──────┐                │
│                              │  products   │                │
│                              ├─────────────┤                │
│                              │ id (UUID)   │                │
│                              │ slug        │                │
│                              │ name        │                │
│                              │ category    │                │
│                              │ price       │                │
│                              │ image_url   │                │
│                              │ active      │                │
│                              │ featured    │                │
│                              │ created_by  │ (FK)          │
│                              │ created_at  │                │
│                              └─────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ Referencia
         ▼
    Storage Bucket:
    la-pistaccheria/
    ├── products/
    │   ├── pasta-di-pistacchio/
    │   ├── cremino-al-pistacchio/
    │   └── ...
```

---

## Tabelas

### 1. `auth.users` (Supabase built-in)
Gerenciado pelo Supabase Auth. Não precisamos criar.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `email` | TEXT | Email do usuário |
| `encrypted_password` | TEXT | Senha (criptografada) |
| `created_at` | TIMESTAMP | Quando foi criado |
| `last_sign_in_at` | TIMESTAMP | Último login |

---

### 2. `cms_users` (Custom)
Extensão de `auth.users` com dados específicos do CMS.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK, FK `auth.users` | Identificador único |
| `full_name` | TEXT | nullable | Nome completo (Anne, Fz, etc) |
| `role` | TEXT | NOT NULL, default 'editor' | Cargo: 'admin' ou 'editor' |
| `created_at` | TIMESTAMP | default NOW() | Quando foi adicionado ao CMS |
| `updated_at` | TIMESTAMP | default NOW() | Última atualização |

**Políticas RLS:**
- ✅ Usuários podem ler seus próprios dados
- ✅ Admins podem ler todos os cms_users
- ✅ (Futuro) Admins podem atualizar/deletar cms_users

---

### 3. `products` (Custom)
Armazena todos os produtos da loja.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly (ex: `pasta-di-pistacchio`) |
| `name` | TEXT | NOT NULL | Nome do produto |
| `category` | TEXT | NOT NULL | Categoria (ex: `Pasta Artesanal`) |
| `short_description` | TEXT | NOT NULL | Descrição curta (para cards) |
| `description` | TEXT | NOT NULL | Descrição completa (página detalhe) |
| `price` | NUMERIC(10,2) | NOT NULL, CHECK > 0 | Preço em BRL |
| `weight` | TEXT | nullable | Peso/embalagem (ex: `200g`) |
| `badge` | TEXT | nullable | Badge especial (Novo/Destaque/Edição Limitada) |
| `featured` | BOOLEAN | default FALSE | Mostrar na home? |
| `active` | BOOLEAN | default TRUE | Produto ativo/visível? |
| `image_url` | TEXT | nullable | URL da imagem (upload ou externa) |
| `image_storage_path` | TEXT | nullable | Path no Storage (para deletar depois) |
| `created_at` | TIMESTAMP | default NOW() | Quando foi criado |
| `updated_at` | TIMESTAMP | default NOW() | Última atualização |
| `created_by` | UUID | NOT NULL, FK `auth.users` | Quem criou |

**Indexes:**
```sql
idx_products_slug           -- Buscar por slug rápido
idx_products_category       -- Filtrar por categoria
idx_products_active         -- Mostrar só ativos
idx_products_featured       -- Mostrar destaques
idx_products_created_by     -- Listar por criador
```

**Políticas RLS:**
- ✅ Qualquer um lê produtos `active = TRUE`
- ✅ Autenticados leem todos (incluindo inativos)
- ✅ Admins criam produtos
- ✅ Admins atualizam/deletam produtos

---

## Storage

### Bucket: `la-pistaccheria` (Público)

Armazena imagens de produtos.

**Estrutura:**
```
la-pistaccheria/
├── products/
│   ├── pasta-di-pistacchio/
│   │   ├── pasta-di-pistacchio-1717420800.jpg  (original uploaded)
│   │   └── pasta-di-pistacchio-1717420800-opt.webp (otimizado)
│   ├── cremino-al-pistacchio/
│   └── ...
```

**Configuração:**
- 🔓 **Public** (qualquer um pode ler URLs públicas)
- Max file size: ~50MB (default Supabase)
- Tipos permitidos: images/*, PDFs, etc (configurável)

**Geração de URLs:**
```typescript
// URL pública
https://xxxxx.supabase.co/storage/v1/object/public/la-pistaccheria/products/pasta-di-pistacchio/pasta-di-pistacchio-1717420800.jpg

// Ou usar helper:
supabase.storage.from('la-pistaccheria').getPublicUrl(path)
```

---

## Decisões de Design

### 1. **Por que `slug` é UNIQUE?**
- Cada produto tem uma URL amigável (`/produto/pasta-di-pistacchio`)
- Slug nunca pode ser duplicado
- Índice garante busca O(1)

### 2. **Por que `image_storage_path` separado de `image_url`?**
- `image_url` pode ser externa (Unsplash, Wikimedia) ou do Storage
- `image_storage_path` só existe se for upload nosso
- Permite deletar o arquivo quando editar/deletar produto

### 3. **Por que `active` e não deletar direto?**
- Soft delete: preserva histórico e referências
- Permite restaurar sem perder dados
- Melhor para auditoria

### 4. **Por que `featured` é boolean e não `priority: INT`?**
- CMS v1 é simples: ou destaca ou não
- Futuro: pode-se adicionar `position: INT` para ordenação manual

### 5. **Por que `created_by` não é deletável?**
- Auditoria: rastreia quem criou cada produto
- Futura: pode-se ver histórico de edições
- Constraint `ON DELETE SET NULL` preserva o registro

---

## Fluxos de Dados

### 🔐 Autenticação
```
Login
  ↓
Supabase Auth (email/password)
  ↓
JWT Token em localStorage
  ↓
AuthContext gerencia sessão
  ↓
ProtectedRoute verifica permissão
```

### 📦 Listar Produtos
```
Frontend
  ↓
TanStack Query (cache)
  ↓
supabase.from('products').select()
  ↓
RLS valida permissão
  ↓
Retorna dados (apenas ativos se não autenticado)
```

### ➕ Criar Produto
```
Admin preenche formulário
  ↓
Upload imagem → Storage
  ↓
INSERT products (com image_url + image_storage_path)
  ↓
RLS valida: user.role = 'admin'?
  ↓
Sucesso → Cache invalidado → UI atualiza
```

### ✏️ Editar Produto
```
Admin altera campos
  ↓
Se imagem mudou:
  DELETE old image from Storage
  UPLOAD new image
  ↓
UPDATE products
  ↓
RLS valida: user.role = 'admin'?
  ↓
updated_at atualizado por TRIGGER
  ↓
Sucesso → Cache invalidado
```

---

## Performance & Otimizações

### 1. **Índices**
Todos os campos comumente filtrados têm índices:
- `slug` (busca individual)
- `category`, `active`, `featured` (filtros comuns)
- `created_by` (listar por usuário - futuro)

### 2. **RLS Policies**
- Public reads são cachéados por CDN
- Queries autenticadas usam JWT token
- Sem RLS policies, seria 403 Unauthorized

### 3. **Paginação** (futuro)
Quando houver muitos produtos:
```typescript
const limit = 20;
const offset = (page - 1) * limit;

supabase
  .from('products')
  .select('*')
  .range(offset, offset + limit - 1)
```

### 4. **Select específico** (futuro)
```typescript
// Bom:
supabase.from('products').select('id, name, slug, price')

// Evitar:
supabase.from('products').select('*')  // traz tudo
```

---

## Migrations Futuras

Se precisar alterar schema:

```bash
# Supabase detecta mudanças automático
# Mas manual é melhor para produção:

supabase migrations new add_bestseller_field
# → Edita migration file
supabase db push
```

Exemplos de mudanças futuras:
- [ ] Adicionar `stock_quantity: INT`
- [ ] Adicionar `on_sale: BOOLEAN + discount_percentage: INT`
- [ ] Adicionar `reviews` table (comentários dos clientes)
- [ ] Adicionar `audit_log` table (quem editou o quê)

---

## Referências SQL

### Queries úteis para debugging

```sql
-- Ver todos os produtos
SELECT * FROM products ORDER BY created_at DESC;

-- Ver produtos ativos
SELECT * FROM products WHERE active = TRUE;

-- Ver destaques
SELECT * FROM products WHERE featured = TRUE ORDER BY name;

-- Ver por categoria
SELECT DISTINCT category FROM products;
SELECT * FROM products WHERE category = 'Pasta Artesanal';

-- Ver cms_users
SELECT * FROM cms_users;

-- Ver quem criou cada produto
SELECT p.name, u.email, p.created_at 
FROM products p 
JOIN auth.users u ON p.created_by = u.id;

-- Resetar featured (todos false)
UPDATE products SET featured = FALSE;

-- Ativar todos
UPDATE products SET active = TRUE;
```

---

**Status**: ✅ Documentação de design concluída
