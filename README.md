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

URLs
Pages
Public Pages
/ - Home page
/auth/error - Authentication error page
/auth/verify-request - Email verification request page
/events - Events listing page
/events/[eventSlug] - Individual event details page
/events/payment/failure - Event payment failure page
/events/payment/success - Event payment success page
/impressum - Legal imprint page
/kurse - Courses listing page
/kurse/[courseSlug] - Individual course details page
/login - User login page
/p/[slug] - City-specific page
/p/[slug]/[category] - Category page within a city
/p/[slug]/[category]/add - Add new course page
/p/[slug]/[category]/add/success - Course addition success page
/profil - User profile page
/register - User registration page
/seite/[page] - Dynamic content pages
/suche - Search results page
/t/[slug] - Topic/blog post page
/trainer/[slug] - Trainer profile page
Event Management
/event/neu - Create new event page
/event/[eventId]/bearbeiten - Edit existing event page
/events/[eventSlug]/bearbeiten - Edit event page (alternative route)
Course Management
/kurs/neu - Create new course page
/kurs/[courseId]/bearbeiten - Edit existing course page
Trainer Management
/trainer/neu - Create new trainer profile page
Internal Admin Pages
/intern/attendance - Attendance tracking dashboard
/intern/enrollments - Enrollment management
/intern/enrollments/[enrollmentId] - Individual enrollment details
/intern/enrollments/new - Create new enrollment
/intern/events - Events management dashboard
/intern/kurse - Courses management dashboard
/intern/participants/[participantId]/edit - Edit participant information
/intern/participants/new - Add new participant
/intern/payments/[paymentId] - Payment details page
/intern/payments/new - Create new payment record
API Routes
Authentication & User Management
/api/auth/[...nextauth] - NextAuth.js authentication endpoints
/api/auth/register - User registration endpoint
/api/auth/update-role - Update user roles and permissions
/api/profile/update - Update user profile information
Content Management
/api/add - Add new content/courses
/api/cities - City data management
/api/hero-image/[slug] - Serve hero images for cities
/api/search - Search functionality endpoint
/api/test/seed-trainer - Test data seeding endpoint
Course Management
/api/courses/deactivate - Deactivate courses
/api/courses/delete - Delete courses
/api/courses/my - Get user's courses
/api/courses/stats - Course statistics
/api/courses/update - Update course information
/api/kurs/create - Create new course
Event Management
/api/event/create - Create new event
/api/events - Events CRUD operations
/api/events/[eventId]/register - Event registration
/api/events/deactivate - Deactivate events
/api/events/delete - Delete events
/api/events/my - Get user's events
/api/events/stats - Event statistics
/api/events/update - Update event information
Enrollment & Attendance
/api/attendance - Attendance management
/api/attendance/bulk - Bulk attendance operations
/api/enrollments - Enrollment management
/api/enrollments/[enrollmentId] - Individual enrollment operations
/api/enrollments/course/[courseId] - Course-specific enrollments
/api/enrollments/stats - Enrollment statistics
Participant Management
/api/participants - Participants CRUD operations
/api/participants/[participantId] - Individual participant operations
Payment Processing
/api/payments - Payments management
/api/payments/[paymentId] - Individual payment operations
/api/payments/stats - Payment statistics
/api/webhooks/stripe - Stripe webhook handling
Waitlist & Registrations
/api/registrations - Registration management
/api/waitlist - Waitlist management
/api/waitlist/[waitlistId] - Individual waitlist operations
Trainer Management
/api/trainer/create - Create new trainer
/api/trainer/update - Update trainer information
