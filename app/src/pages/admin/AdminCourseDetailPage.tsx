import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminCourseById } from "../../lib/api";
import type { AdminCourseDetail } from "../../lib/types";

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;

      try {
        const data = await getAdminCourseById(id);
        setCourse(data);
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id]);

  if (loading) {
    return <div>Loading course...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/admin/courses">← Back to courses</Link>
      </div>

      <h1 style={{ marginTop: 0 }}>{course.title}</h1>

      <p style={{ marginTop: 8 }}>
        <strong>Slug:</strong> {course.slug}
      </p>

      <p>
        <strong>Subject:</strong> {course.subject.title}
      </p>

      <p>
        <strong>Published:</strong> {course.isPublished ? "Yes" : "No"}
      </p>

      <p>
        <strong>Description:</strong> {course.description ?? "—"}
      </p>

      <div style={{ marginTop: 32 }}>
        {course.modules.length === 0 ? (
          <p>No modules yet.</p>
        ) : (
          course.modules.map((module) => (
            <div
              key={module.id}
              style={{
                marginBottom: 24,
                padding: 16,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Module {module.order}: {module.title}
              </h2>

              {module.lessons.length === 0 ? (
                <p>No lessons in this module.</p>
              ) : (
                module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    style={{
                      marginTop: 16,
                      padding: 14,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      background: "#f9fafb",
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>
                      Lesson {lesson.order}: {lesson.title}{" "}
                      {!lesson.isPublished ? "(draft)" : ""}
                    </h3>

                    {lesson.steps.length === 0 ? (
                      <p>No steps in this lesson.</p>
                    ) : (
                      <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                        {lesson.steps.map((step) => (
                          <li key={step.id} style={{ marginBottom: 8 }}>
                            Step {step.order}: {step.title} — {step.type}{" "}
                            {!step.isPublished ? "(draft)" : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}