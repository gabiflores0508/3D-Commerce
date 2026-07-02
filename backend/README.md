# 3D Commerce — Backend

API REST do projeto 3D Commerce. Construída com **Express + TypeScript**, arquitetura modular por domínio.

> **Estado atual: R1 — Fundação.**
> Só `GET /health` responde com dados. Os módulos estão estruturados mas vazios e serão preenchidos a partir da R2.

---

## Stack

- Node 18+
- Express 4
- TypeScript 5
- Zod (validação de env e payloads)
- dotenv, cors
- Prisma (R2)
- bcrypt + JSON Web Token (R3)
- Multer (R4/R6)

---

## Estrutura

```
backend/
├── prisma/                  # Schema + migrations (R2)
├── uploads/                 # Multer destino local
│   ├── products/
│   └── quotes/
├── src/
│   ├── app.ts               # Factory do Express
│   ├── server.ts            # Bootstrap + graceful shutdown
│   ├── config/
│   │   └── env.ts           # Validação de env via Zod
│   ├── lib/                 # Clientes (prisma, etc) — R2
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   └── requestLogger.ts
│   ├── modules/
│   │   ├── auth/            # R3
│   │   ├── users/           # R3+
│   │   ├── categories/      # R4
│   │   ├── products/        # R4
│   │   ├── cart/            # R5
│   │   ├── orders/          # R5
│   │   ├── quotes/          # R6
│   │   ├── settings/        # R8
│   │   └── dashboard/       # R7
│   ├── routes/
│   │   ├── index.ts         # Router agregador
│   │   └── health.routes.ts
│   └── utils/
│       ├── apiResponse.ts   # ok / created / fail / noContent
│       ├── asyncHandler.ts
│       └── httpError.ts
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Como rodar localmente

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Servidor sobe em `http://localhost:3333`.

Teste o health check:

```bash
curl http://localhost:3333/health
# { "status": "ok", "service": "3D Commerce API" }

curl http://localhost:3333/api/health
# envelope completo com uptime + timestamp
```

---

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | tsx watch — reinicia ao salvar |
| `npm run build` | `tsc` para `dist/` |
| `npm start` | `node dist/server.js` (precisa `build` antes) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:generate` | placeholder até R2 |
| `npm run prisma:migrate` | placeholder até R2 |
| `npm run prisma:studio` | placeholder até R2 |
| `npm run prisma:seed` | placeholder até R2 |

---

## Padrão de resposta

**Sucesso**

```json
{ "ok": true, "data": { /* ... */ } }
```

**Erro**

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { /* opcional */ } } }
```

Lance erros via `HttpError` para serem tratados pelo middleware global. `ZodError`, JSON inválido e payload grande já são reconhecidos automaticamente.
