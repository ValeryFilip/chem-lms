import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getCourseBySlug } from "../lib/api";
import type { Course } from "../lib/types";

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!slug) return;

      try {
        const data = await getCourseBySlug(slug);
        setCourse(data);
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading course...</div>;
  }

  if (error) {
    return <div style={{ padding: 24 }}>{error}</div>;
  }

  if (!course) {
    return <div style={{ padding: 24 }}>Course not found</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>{course.title}</h1>

      {course.modules.map((module) => (
        <div
          key={module.id}
          style={{
            marginTop: 32,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          <h2>{module.title}</h2>

          {module.lessons.map((lesson) => (
            <div
              key={lesson.id}
              style={{
                marginTop: 12,
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 8,
              }}
            >
              <Link to={`/lessons/${lesson.id}`}>
                {lesson.title}
              </Link>

              <p style={{ fontSize: 12, opacity: 0.7 }}>
                {lesson.steps.length} steps
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}