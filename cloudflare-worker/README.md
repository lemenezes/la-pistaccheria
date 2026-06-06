# Cloudflare R2 Upload Worker

Worker mínimo para a Etapa 7 da integração de mídia com Cloudflare R2.

## Objetivo desta etapa

- criar o projeto do Worker
- registrar o contrato do endpoint `POST /upload`
- declarar o binding do R2
- declarar as variáveis de ambiente necessárias
- manter o upload ainda não implementado

## Estrutura

- `wrangler.toml`: configuração do Worker, binding do R2 e variáveis
- `src/index.ts`: roteamento mínimo com `POST /upload`
- `package.json`: scripts do Worker
- `tsconfig.json`: tipos e compilação em modo estrito

## Contracto do endpoint

### Request

- `POST /upload`
- `Content-Type: multipart/form-data`
- header obrigatório: `Authorization: Bearer <supabase_access_token>`
- campos:
  - `file` obrigatório
  - `bucket_area` opcional

### Response

- sucesso: `201`
- erro previsto: `400`, `401`, `403`, `413`, `500`
- nesta etapa o endpoint retorna `501 Not Implemented` com o contrato documentado no payload

## Variáveis e binding

- binding R2: `MEDIA_ASSETS_BUCKET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEDIA_CDN_BASE_URL`

## Observação

A validação de token, o upload para R2 e o insert em `media_assets` serão implementados na próxima etapa. Nesta etapa o Worker existe apenas como estrutura e contrato.
