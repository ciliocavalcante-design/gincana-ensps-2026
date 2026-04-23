# Cloudflare Pages + Access

Este projeto deve rodar no Cloudflare Pages para que o painel de administrador e a página de ensaios possam ser protegidos por login, sem digitar token ou senha dentro do site.

## Páginas

- `index.html`: página geral dos alunos, pública.
- `admin.html`: painel completo de administrador, protegido pelo Cloudflare Access.
- `ensaios.html`: página para marcação de ensaios, protegida pelo Cloudflare Access.
- `/api/data`: Function do Cloudflare Pages que lê e grava `data/gincana-data.json` no GitHub.

## Secrets e variáveis

No Cloudflare Pages, configure:

- `GITHUB_OWNER=ciliocavalcante-design`
- `GITHUB_REPO=gincana-ensps-2026`
- `GITHUB_BRANCH=main`
- `GITHUB_DATA_PATH=data/gincana-data.json`

E crie o secret:

- `GITHUB_TOKEN`

O `GITHUB_TOKEN` precisa ser um Fine-grained Personal Access Token com acesso ao repositório `ciliocavalcante-design/gincana-ensps-2026` e permissão:

- Contents: Read and write

## Deploy pelo terminal

```bash
npx wrangler pages project create gincana-ensps-2026 --production-branch main
npx wrangler pages secret put GITHUB_TOKEN --project-name gincana-ensps-2026
npx wrangler pages deploy . --project-name gincana-ensps-2026 --branch main
```

## Cloudflare Access

Depois do deploy, no painel do Cloudflare:

1. Abra `Zero Trust`.
2. Vá em `Access` > `Applications`.
3. Crie uma aplicação do tipo `Self-hosted`.
4. Proteja os caminhos:
   - `/admin.html`
   - `/ensaios.html`
   - `/api/data`
5. Permita apenas os e-mails autorizados.

Com isso, quem entrar em `admin.html` ou `ensaios.html` fará login pelo Cloudflare. Depois do login, os botões de salvar online funcionam sem pedir senha dentro da página.
