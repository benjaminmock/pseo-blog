This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# IMPROTANT

0. `npm i`
1. `.env.local` contains the `NEXT_PUBLIC_BASE_URL` which has to be adjusted for each domain / installation.
2. Which configuration will be used is set in src/config/index.tsx as `ACTIVE_CONFIGURATION`
3. The remaining config can be found in src/config/keyword/index.tsx
4. The port has to be adjusted in the package.json on the start script `PORT=300x`.
5. `npm run build`
6. start with `pm2 start npm --name "monetera_de" -- run start`

# LOGIN

mail@benjaminmock.de
test

# URLs

## Pages

/ Home

/seite/[page]

/t/[slug] Thema

/p/[slug] Stadt Seite
/p/[slug]/[category] Kategorie in Stadt
/p/[slug]/[category]/add Kurs hinzufügen
/p/[slug]/[category]/add/success Kurs erfolgreich hinzugefügt

/suche

### AUTH

/login
/register

### LEGAL

/impressum

## API Routes

/api/add
/api/auth/login
/api/auth/logout
/api/auth/register
/api/hero-image/[slug]
/api/search
/api/waitlist

---

# DB

## Commands

.tables
.schema table_name

## Tables

cities | Stadt und Inhalte für Stadt
nearby_cities | Städte in der Nähe einer Stadt (für Cross Linking)
nearby_city_distances | Entfernungen zwischen Städten

categories | Kategories, die es für auf der Seite gibt (Yoga, Pilates, etc)

posts | Inhalte für Stadt -> Kategorie (linked via slugs)
entries | Link Einträge mit URL und Title (linked zu city und category via slugs)

topics | allein stehende Themen / Blogposts

Trainers | Trainer / Profil
Courses | Kurse mit Fremdschlüssel auf Trainer

waitlist |

users |
sessions |
