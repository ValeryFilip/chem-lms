import { useEffect, useState } from "react";
import { getAdminEnrollments } from "../../lib/api";
import type { AdminEnrollmentListItem } from "../../lib/types";

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<AdminEnrollmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const data = await getAdminEnrollments();
        setEnrollments(data);
      } catch {
        setError("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  if (loading) {
    return <div>Loading enrollments...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Enrollments</h1>

      {enrollments.length === 0 ? (
        <p>No enrollments found.</p>
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
                  User
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Course
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Access Type
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Status
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Starts At
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Ends At
                </th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    <div>{item.user.name ?? "—"}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{item.user.email}</div>
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    <div>{item.course.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{item.course.slug}</div>
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {item.accessType}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {item.status}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {formatDate(item.startsAt)}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {formatDate(item.endsAt)}
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