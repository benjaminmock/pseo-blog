# Authentication Fixes for Production

## Issues Fixed

### 1. LinkedIn Login Error

**Problem**: `unexpected iss value, expected undefined, got: https://www.linkedin.com/oauth`

**Solution**: Removed the explicit `issuer` configuration from the LinkedIn provider in [`src/auth.ts`](src/auth.ts:44). LinkedIn's OAuth implementation handles the issuer automatically through the well-known configuration.

### 2. Session Persistence Issue

**Problem**: Google login appeared successful but sessions weren't persisting on protected pages like `/intern`.

**Solution**:

- Changed session strategy from `"database"` to `"jwt"` in [`src/auth.ts`](src/auth.ts:178)
- Updated session callback to fetch user data from database using token
- Updated JWT callback to include user ID in token
- Removed conflicting custom session handling from [`src/lib/session.ts`](src/lib/session.ts:1)

## Changes Made

### Modified Files:

1. **[`src/auth.ts`](src/auth.ts)**:

   - Removed `issuer: "https://www.linkedin.com"` from LinkedIn provider
   - Changed session strategy to JWT
   - Updated session callback to use token-based authentication
   - Enhanced JWT callback to include user ID

2. **[`src/lib/session.ts`](src/lib/session.ts)** (removed):
   - Deleted custom session handling that conflicted with NextAuth

## Production Environment Checklist

### Environment Variables

Ensure these are properly set in your production `.env`:

```env
NEXTAUTH_URL=https://kursio.de
NEXTAUTH_URL_INTERNAL=https://kursio.de
NEXTAUTH_SECRET=""

# OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
```

### OAuth Provider Configuration

#### Google OAuth

- Ensure your production domain `https://kursio.de` is added to:
  - Authorized JavaScript origins
  - Authorized redirect URIs: `https://kursio.de/api/auth/callback/google`

#### LinkedIn OAuth

- Ensure your production domain `https://kursio.de` is added to:
  - Authorized redirect URLs: `https://kursio.de/api/auth/callback/linkedin`

### Security Recommendations

1. **NEXTAUTH_SECRET**: Use a strong, unique secret for production
2. **HTTPS**: Ensure your production site uses HTTPS (already configured)
3. **Domain Verification**: Verify OAuth providers are configured for your production domain
4. **Database**: Ensure your production database is properly configured and accessible

### Testing Steps

1. **LinkedIn Login**: Test LinkedIn authentication flow
2. **Google Login**: Verify Google login and session persistence
3. **Protected Routes**: Test access to `/intern`, `/profil`, etc.
4. **Session Persistence**: Verify sessions persist across page refreshes and navigation

## Expected Behavior After Fixes

1. **LinkedIn Login**: Should work without issuer errors
2. **Google Login**: Should maintain session across all protected pages
3. **Session Management**: JWT-based sessions should be more reliable in production
4. **Protected Routes**: Should properly redirect unauthenticated users to login

## Troubleshooting

If issues persist:

1. Check browser developer tools for authentication errors
2. Verify OAuth provider configurations match production domain
3. Check server logs for NextAuth debug information
4. Ensure database connectivity for user role management
