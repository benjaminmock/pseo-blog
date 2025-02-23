# Social Login Implementation Plan

## Current State

- The project already has most of the NextAuth.js setup in place
- Prisma schema is correctly configured for auth
- Basic Google provider configuration exists
- Database adapter is properly configured

## Required Changes

### 1. Dependencies

dependencies are installed already

### 2. Environment Variables

The .env.local file is already correctly structured, but needs:

- Generate a proper NEXTAUTH_SECRET (if current one is placeholder)
- Set up Google OAuth credentials and add them to:
  ```
  GOOGLE_CLIENT_ID=[from Google Cloud Console]
  GOOGLE_CLIENT_SECRET=[from Google Cloud Console]
  ```

### 3. Google OAuth Setup

1. Go to Google Cloud Console
2. Create a new project or use existing one
3. Enable Google OAuth API
4. Configure OAuth consent screen
5. Create OAuth 2.0 Client ID
6. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google

### 4. Type Definitions

Update src/types/auth.d.ts to use next-auth instead of @auth/core:

```typescript
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}
```

### 5. Auth Configuration Updates

Update src/auth.ts:

1. Update imports to use next-auth instead of @auth/core
2. Keep existing configuration structure but update any @auth/core specific imports
3. Ensure proper typing with the new type definitions

### 6. Testing Plan

1. Start the development server
2. Test login flow:
   - Click login button
   - Select Google provider
   - Authorize application
   - Verify redirect back to application
   - Verify session contains user data including:
     - id
     - role
     - email
     - name (if provided by Google)
     - image (if provided by Google)
3. Test session persistence
4. Test logout functionality

## Implementation Steps

1. Install dependencies:

   ```bash
   npm install next-auth @auth/prisma-adapter
   ```

2. Set up environment variables:

   - Generate NEXTAUTH_SECRET if needed: `openssl rand -base64 32`
   - Configure Google OAuth and add credentials to .env.local

3. Update type definitions and auth configuration

   - Switch imports from @auth/core to next-auth
   - Update type declarations
   - Verify all auth-related files use correct imports

4. Test the implementation:

   - Start dev server: `npm run dev`
   - Go through complete login flow
   - Verify session data
   - Test persistence
   - Test logout

5. Document setup in README.md:
   - Environment variable requirements
   - Google OAuth setup instructions
   - Local development setup steps

## Migration Notes

- The current auth.ts configuration can remain largely unchanged
- The existing Prisma schema already supports the required tables
- No database migrations needed as the schema is already correct
- The main changes are around package dependencies and type definitions

## Next Steps

1. Switch to Code mode to implement the changes
2. Start with updating dependencies
3. Update type definitions
4. Modify auth configuration
5. Test the implementation
6. Update documentation
