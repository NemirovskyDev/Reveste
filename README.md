# Reveste

Loja de aluguel de roupas de marca por assinatura. Plano mensal de 4 peças ou aluguel avulso de 7, 14 ou 30 dias.

Next.js 16, React 19, TypeScript, Tailwind v4, React Three Fiber (arara 3D), GSAP, Lenis, Motion, Zustand e Zod.

## Rodar

```bash
npm install
```

```bash
npm run dev
```

Abra `http://localhost:3000`. O site funciona sem backend: login, sacola, plano, pagamento e pedidos usam armazenamento local no navegador.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera o site estático em `out/` |
| `npm run typecheck` | verificação de tipos |
| `npm run lint` | ESLint |
| `npm test` | testes unitários (Vitest) |

Copie `.env.example` para `.env.local` e ajuste `NEXT_PUBLIC_SITE_URL`.

## Publicação

O workflow `.github/workflows/pages.yml` gera o site e publica no GitHub Pages a cada push na `main`. Em Settings > Pages, selecione "GitHub Actions" como fonte.

Como o site é estático, não há cabeçalhos de segurança configurados pelo servidor, e os dados ficam apenas no navegador de quem usa.
