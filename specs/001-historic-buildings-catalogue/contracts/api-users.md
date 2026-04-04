# API Contract: User Management

## GET /api/users

List all admin users.

**Auth**: Required (role: SUPER_ADMIN)

**Response 200**:
```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "name": "string | null",
      "role": "SUPER_ADMIN | ADMIN",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

**Response 403**: Not a super-admin.

---

## POST /api/users

Invite a new admin user.

**Auth**: Required (role: SUPER_ADMIN)

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "role": "ADMIN | SUPER_ADMIN (required)"
}
```

**Response 201**:
```json
{
  "id": "string",
  "email": "string",
  "role": "string"
}
```

**Response 409**: Email already exists.
**Response 403**: Not a super-admin.

**Notes**: Creates a User record. The invited user can sign in via
Google OAuth on their next visit — no invitation email is sent. Their
Google account email must match the registered email.

---

## PUT /api/users/[id]

Update a user's role.

**Auth**: Required (role: SUPER_ADMIN)

**Request Body**:
```json
{
  "role": "ADMIN | SUPER_ADMIN (required)"
}
```

**Response 200**: Updated user object.
**Response 403**: Not a super-admin, or attempting to demote self.

**Notes**: A super-admin cannot change their own role to prevent
lockout.

---

## DELETE /api/users/[id]

Revoke a user's access.

**Auth**: Required (role: SUPER_ADMIN)

**Response 200**:
```json
{
  "id": "string",
  "deleted": true
}
```

**Response 403**: Not a super-admin, or attempting to delete self.

**Notes**: Hard-deletes the User record. The user can no longer sign
in. A super-admin cannot delete themselves.
