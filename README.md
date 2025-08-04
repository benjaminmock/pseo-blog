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

# Authentication Setup

## Local Authentication

mail@benjaminmock.de
test

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google OAuth API:

   - Go to "APIs & Services" > "Library"
   - Search for "Google OAuth2 API"
   - Click "Enable"

4. Configure OAuth consent screen:

   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Fill in the required information (app name, user support email, etc.)
   - Add authorized domains including your development and production domains

5. Create OAuth 2.0 Client ID:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - Development: http://localhost:3000/api/auth/callback/google
     - Production: https://yourdomain.com/api/auth/callback/google

6. Copy credentials to .env.local:

   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

7. Ensure NEXTAUTH_SECRET is set in .env.local (generate with `openssl rand -base64 32`)

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

## Inspiration

- https://www.awwwards.com/
- https://buycycle.de

## Auth

### Google

https://console.cloud.google.com/auth/clients/262795971488-n89glr1hlkhbqjs0hrkohs5oi49di9is.apps.googleusercontent.com?hl=de&inv=1&invt=AbqUuA&project=kursio-451808

### LinkedIn

https://www.linkedin.com/developers/apps
https://www.linkedin.com/company/106534618/admin/dashboard/ -> Page
https://www.linkedin.com/developers/apps/222078555/products -> App
https://www.linkedin.com/mypreferences/d/data-sharing-for-permitted-services -> permitted services

## Marketing

- Linkedin: https://www.linkedin.com/search/results/people/?geoUrn=%5B%22101282230%22%5D&keywords=yoga&origin=FACETED_SEARCH&sid=-RB

### sparring

Nick Mulder out LinkedIn
