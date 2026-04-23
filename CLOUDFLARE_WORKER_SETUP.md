# Cloudflare Worker para salvar a Gincana

Este projeto usa o GitHub Pages para mostrar o site e um Cloudflare Worker para salvar os dados no arquivo `data/gincana-data.json` sem expor o token do GitHub no navegador.

## Como funciona

- Os alunos carregam o site pelo GitHub Pages.
- O painel de administrador envia os dados para o Worker em `/data`.
- O Worker confere a senha de administrador.
- O Worker usa o secret `GITHUB_TOKEN` para gravar no GitHub.
- O navegador nunca recebe o token real do GitHub.

## 1. Entrar no Cloudflare pelo terminal

Dentro da pasta do Worker:

```bash
cd /Users/ciliocavalcante/Documents/Playground/gincana-2026/worker
npx wrangler login
```

## 2. Criar os secrets

Crie um token fine-grained no GitHub com acesso ao repositório `ciliocavalcante-design/gincana-ensps-2026` e permissão:

- Contents: Read and write

Depois salve o token no Cloudflare:

```bash
npx wrangler secret put GITHUB_TOKEN
```

Crie uma senha forte para o administrador e salve:

```bash
npx wrangler secret put ADMIN_SECRET
```

Essa `ADMIN_SECRET` será a senha que você digita no painel do site. Ela não precisa ser o token do GitHub.

## 3. Publicar o Worker

```bash
npx wrangler deploy
```

No final, o Cloudflare vai mostrar uma URL parecida com:

```text
https://gincana-ensps-2026.seu-subdominio.workers.dev
```

## 4. Configurar o painel do site

No site da gincana:

1. Abra a aba `Administrador`.
2. Entre em `Dados`.
3. Cole a URL do Worker.
4. Digite a senha criada em `ADMIN_SECRET`.
5. Clique em `Guardar acesso`.
6. Use `Salvar online`.

Depois disso, cada alteração feita no painel será sincronizada com o GitHub pelo Cloudflare.

## Observações

- Se você abrir o painel em outro computador, só precisa informar a URL do Worker e a senha de administrador.
- O token do GitHub fica apenas nos secrets do Cloudflare.
- Se aparecer erro de senha, rode `npx wrangler secret put ADMIN_SECRET` novamente e digite a nova senha.
