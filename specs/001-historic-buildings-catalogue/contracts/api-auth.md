# API Contract: Authentication

## GET/POST /api/auth/[...nextauth]

NextAuth.js handler — manages Google OAuth sign-in, sign-out,
session, and CSRF.

**Provider**: Google OAuth 2.0
**Callback**: On successful authentication, look up the user's email
in the `User` table:

- If found and role is set → allow sign-in, inject role into session
- If found but no role → deny sign-in (revoked user)
- If not found and email matches `INITIAL_ADMIN_EMAIL` → create User
  with `SUPER_ADMIN` role
- If not found and not initial admin → deny sign-in (uninvited user)

**Session Shape** (extended JWT):

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "image": "string | null",
    "role": "SUPER_ADMIN | ADMIN"
  },
  "expires": "string (ISO 8601)"
}
```

**Notes**: Session is JWT-based (no database session table). Role is
embedded in the token at sign-in time and refreshed on each session
callback to reflect real-time role changes.
