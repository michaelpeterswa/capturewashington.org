"use client";

import { useEffect, useState } from "react";
import type { UserItem } from "@/types";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }

    const newUser = await res.json();
    setUsers((prev) => [
      { ...newUser, name: null, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setEmail("");
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this user's access?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const fieldStyle = {
    padding: "var(--space-2) var(--space-3)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-sm)",
  };

  return (
    <main
      style={{
        maxWidth: "var(--max-width-prose)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          marginBottom: "var(--space-6)",
        }}
      >
        User Management
      </h1>

      <form
        onSubmit={handleInvite}
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          style={{ ...fieldStyle, flex: 1 }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={fieldStyle}
        >
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <button
          type="submit"
          style={{
            ...fieldStyle,
            backgroundColor: "var(--color-primary)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "var(--font-medium)",
          }}
        >
          Invite
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "var(--color-error)",
            marginBottom: "var(--space-4)",
            fontSize: "var(--text-sm)",
          }}
        >
          {error}
        </p>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-sm)",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "2px solid var(--color-border)",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "var(--space-2) var(--space-3)" }}>Email</th>
            <th style={{ padding: "var(--space-2) var(--space-3)" }}>Role</th>
            <th style={{ padding: "var(--space-2) var(--space-3)" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <td style={{ padding: "var(--space-3)" }}>
                {user.email}
                {user.name && (
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      marginLeft: "var(--space-2)",
                    }}
                  >
                    ({user.name})
                  </span>
                )}
              </td>
              <td style={{ padding: "var(--space-3)" }}>{user.role}</td>
              <td style={{ padding: "var(--space-3)" }}>
                <button
                  onClick={() => handleRevoke(user.id)}
                  style={{
                    color: "var(--color-error)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
