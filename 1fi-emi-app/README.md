# 1Fi EMI Product Page

A full-stack app that shows smartphones with 0%-interest and interest-bearing EMI
plans, in the spirit of 1Fi's "your investments power your purchases" model.
Built for the 1Fi SDE1 assignment.

- **Live demo:** _add your deployed URL here_
- **Video walkthrough:** _add your video link here_

## Tech stack

| Layer    | Choice                                            |
| -------- | -------------------------------------------------- |
| Frontend | React (Vite), React Router, Tailwind CSS            |
| Backend  | Node.js, Express                                    |
| Database | SQLite (via `better-sqlite3`) — file-based SQL DB   |

SQLite was chosen over Postgres/Mongo so the app runs with **zero external
services**: `npm install && npm run seed && npm start` gets you a real SQL
database with no Docker/cloud setup. The schema (`backend/db/schema.sql`) is
plain SQL and maps directly onto Postgres if you'd rather point it there.

## Project structure

```
1fi-emi-app/
├── backend/
│   ├── db/
│   │   ├── schema.sql      # table definitions
│   │   ├── seed.js         # generates products, variants, EMI plans
│   │   └── index.js        # DB connection (auto-seeds on first run)
│   ├── routes/products.js  # /api/products routes
│   ├── public/images/      # placeholder product SVGs
│   └── server.js
└── frontend/
    └── src/
        ├── components/     # ProductList, ProductPage, EmiPlanRow, ...
        ├── api.js           # fetch helpers
        └── format.js
```

## Quick start (single command)

From the project root:

```bash
npm run seed     # seeds the SQLite database
npm test         # runs automated API test suite
npm run dev      # starts both backend (:4000) and frontend (:5173) concurrently
```

Or run them individually:

**1. Backend**

```bash
cd backend
npm install
npm run seed     # creates & populates backend/db/database.sqlite
npm test         # runs backend API test suite
npm start        # http://localhost:4000
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Open `http://localhost:5173`. Each product has its own URL, e.g.
`http://localhost:5173/products/iphone-17-pro` or `http://localhost:5173/products/samsung-s24-ultra`.

## Database schema

```
products                     variants                        emi_plans
─────────                    ─────────                        ─────────
id            PK             id                PK              id                  PK
slug          UNIQUE   ┐     product_id        FK ─────────►   variant_id          FK ─────────►
name                   └───► storage                            tenure_months
brand                        color_name                         monthly_amount
category                     color_hex                          interest_rate
description                  mrp                                cashback_amount
                              price
                              image_url
                              is_default
```

- One product → many variants (storage/color combinations, each with its own
  MRP, price and image).
- One variant → many EMI plans (one row per tenure option).
- `slug` gives every product a stable, unique frontend URL
  (`/products/:slug`).

0%-interest plans split the MRP evenly across the tenure (matching how 0% EMI
is marketed — no interest means principal ÷ months). Interest-bearing plans
use the standard reducing-balance EMI formula on the sale price:
`EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)`, where `r` is the monthly rate.

## API endpoints

### `GET /api/products`

Lightweight catalog list (each product's default variant only).

```json
[
  {
    "id": 1,
    "slug": "iphone-17-pro",
    "name": "iPhone 17 Pro",
    "brand": "Apple",
    "category": "smartphone",
    "imageUrl": "/images/iphone-17-pro.svg",
    "startingPrice": 127400,
    "mrp": 134900
  }
]
```

### `GET /api/products/:idOrSlug`

Full product detail: every variant, each with its own EMI plans. Supports lookup by numeric ID (e.g. `/api/products/1`) or unique slug (e.g. `/api/products/iphone-17-pro`, `/api/products/samsung-s24-ultra`).

```json
{
  "id": 1,
  "slug": "iphone-17-pro",
  "name": "iPhone 17 Pro",
  "brand": "Apple",
  "category": "smartphone",
  "badge": "NEW",
  "description": "Apple's flagship Pro phone with the A19 Pro chip and a titanium frame.",
  "variants": [
    {
      "id": 1,
      "storage": "256GB",
      "colorName": "Cosmic Orange",
      "colorHex": "#C96A34",
      "mrp": 134900,
      "price": 127400,
      "imageUrl": "/images/iphone-17-pro-orange.svg",
      "isDefault": true,
      "emiPlans": [
        { "id": 1, "tenureMonths": 3, "monthlyAmount": 44967, "interestRate": 0, "cashbackAmount": 7500 },
        { "id": 2, "tenureMonths": 6, "monthlyAmount": 22483, "interestRate": 0, "cashbackAmount": 7500 },
        { "id": 3, "tenureMonths": 12, "monthlyAmount": 11242, "interestRate": 0, "cashbackAmount": 7500 },
        { "id": 4, "tenureMonths": 24, "monthlyAmount": 5621, "interestRate": 0, "cashbackAmount": 7500 },
        { "id": 5, "tenureMonths": 36, "monthlyAmount": 4297, "interestRate": 10.5, "cashbackAmount": 7500 },
        { "id": 6, "tenureMonths": 48, "monthlyAmount": 3385, "interestRate": 10.5, "cashbackAmount": 7500 },
        { "id": 7, "tenureMonths": 60, "monthlyAmount": 2841, "interestRate": 10.5, "cashbackAmount": 7500 }
      ]
    }
  ]
}
```

Returns `404 { "error": "No product found with identifier \"...\"" }` for an
unknown slug or ID.

### `GET /api/health`

`{ "status": "ok" }` — used for uptime checks after deployment.

## Deployment

**Backend → Render**

1. New "Web Service" → point at this repo, root directory `backend`.
2. Build command: `npm install && npm run seed`. Start command: `npm start`.
3. Render gives you a URL like `https://your-service.onrender.com`.

**Frontend → Vercel**

1. New project → point at this repo, root directory `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output `dist`.
3. Add an environment variable `VITE_API_BASE_URL` = your Render backend URL.
4. `vercel.json` in this folder rewrites all routes to `index.html` so
   client-side routes like `/products/iphone-17-pro` work on refresh/direct
   visit.

## Notes

- Product photos are simple generated SVG placeholders, not real product
  photography, to avoid using anyone else's copyrighted images in what's
  otherwise original code.
- Every product has 2–3 variants (storage and/or color), each with its own
  price, MRP and 7 EMI tenure options (3/6/12/24/36/48/60 months), matching
  the reference layout in the assignment brief.
