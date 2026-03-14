import { useEffect, useState } from "react";
import { getAdminCourses } from "../../lib/api";
import type { AdminCourseListItem } from "../../lib/types";
import { Link } from "react-router-dom";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getAdminCourses();
        setCourses(data);
      } catch {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Courses</h1>

      {courses.length === 0 ? (
        <p>No courses found.</p>
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
                  Title
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Slug
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Subject
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Published
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                  Modules
                </th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    <div>
                    <Link to={`/admin/courses/${course.id}`}>{course.title}</Link>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {course.description ?? "—"}
                    </div>
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {course.slug}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {course.subject.title}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {course.isPublished ? "Yes" : "No"}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    {course._count.modules}
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