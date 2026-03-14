import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getLessonById, getLessonProgress } from "../lib/api";
import type { Lesson } from "../lib/types";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      if (!id) return;

      try {
        const data = await getLessonById(id);
        setLesson(data);

        const progress = await getLessonProgress(id);
        setCompletedStepIds(progress.completedStepIds);
      } catch {
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading lesson...</div>;
  }

  if (error) {
    return <div style={{ padding: 24 }}>{error}</div>;
  }

  if (!lesson) {
    return <div style={{ padding: 24 }}>Lesson not found</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>{lesson.title}</h1>

      {lesson.steps.length === 0 ? (
        <p>No steps in this lesson yet.</p>
      ) : (
        lesson.steps.map((step, index) => {
          const isCompleted = completedStepIds.includes(step.id);
          return (
            <div
              key={step.id}
              style={{
                marginTop: 16,
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 12,
                background: isCompleted ? "#ecfdf5" : "#fff",
              }}
            >
              <p>
                Step {index + 1} • {step.type}
              </p>

              <Link to={`/steps/${step.id}`}>
                {step.title} {isCompleted ? "✅" : ""}
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
}