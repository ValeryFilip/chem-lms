import { useEffect, useState } from "react";
import { getAdminUsers } from "../../lib/api";
import type { AdminUserListItem } from "../../lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Users</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Name
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Email
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Role
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Enrollments
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Submissions
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Completed Steps
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {user.name ?? "—"}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {user.role}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {user._count.enrollments}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {user._count.submissions}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {user._count.stepProgresses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}