import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createAdminLesson,
  createAdminModule,
  createAdminStep,
  getAdminCourseById,
  publishAdminCourse,
  reorderAdminCourseModules,
  reorderAdminLessonSteps,
  reorderAdminModuleLessons,
  unpublishAdminCourse,
} from "../../lib/api";
import type { AdminCourseDetail } from "../../lib/types";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  async function refreshCourse() {
    if (!id) return;

    const updated = await getAdminCourseById(id);
    setCourse(updated);
  }

  async function handlePublish() {
    if (!id) return;

    setActionLoading(true);
    setError(null);

    try {
      await publishAdminCourse(id);
      await refreshCourse();
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.details?.join(", ") ||
        "Failed to publish course";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnpublish() {
    if (!id) return;

    setActionLoading(true);
    setError(null);

    try {
      await unpublishAdminCourse(id);
      await refreshCourse();
    } catch {
      setError("Failed to unpublish course");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateModule() {
    if (!id) return;

    const title = window.prompt("Module title");

    if (!title?.trim()) return;

    setActionLoading(true);
    setError(null);

    try {
      await createAdminModule(id, title.trim());
      await refreshCourse();
    } catch {
      setError("Failed to create module");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateLesson(moduleId: string) {
    const title = window.prompt("Lesson title");

    if (!title?.trim()) return;

    setActionLoading(true);
    setError(null);

    try {
      await createAdminLesson(moduleId, title.trim());
      await refreshCourse();
    } catch {
      setError("Failed to create lesson");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateStep(lessonId: string) {
    const title = window.prompt("Step title");

    if (!title?.trim()) return;

    const rawType = window.prompt("Step type: video | text | task");
    const type = rawType?.trim();

    if (!type) return;

    if (!["video", "text", "task"].includes(type)) {
      setError('Step type must be one of: "video", "text", "task"');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await createAdminStep(lessonId, title.trim(), type);
      await refreshCourse();
    } catch {
      setError("Failed to create step");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMoveModule(moduleIndex: number, direction: "up" | "down") {
    if (!course || !id) return;

    const targetIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1;

    if (targetIndex < 0 || targetIndex >= course.modules.length) return;

    const reordered = moveItem(course.modules, moduleIndex, targetIndex);
    const moduleIds = reordered.map((module) => module.id);

    setActionLoading(true);
    setError(null);

    try {
      await reorderAdminCourseModules(id, moduleIds);
      await refreshCourse();
    } catch {
      setError("Failed to reorder modules");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMoveLesson(
    moduleId: string,
    lessonIndex: number,
    direction: "up" | "down"
  ) {
    if (!course) return;

    const module = course.modules.find((item) => item.id === moduleId);
    if (!module) return;

    const targetIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;

    if (targetIndex < 0 || targetIndex >= module.lessons.length) return;

    const reordered = moveItem(module.lessons, lessonIndex, targetIndex);
    const lessonIds = reordered.map((lesson) => lesson.id);

    setActionLoading(true);
    setError(null);

    try {
      await reorderAdminModuleLessons(moduleId, lessonIds);
      await refreshCourse();
    } catch {
      setError("Failed to reorder lessons");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMoveStep(
    lessonId: string,
    stepIndex: number,
    direction: "up" | "down"
  ) {
    if (!course) return;

    const lesson = course.modules
      .flatMap((module) => module.lessons)
      .find((item) => item.id === lessonId);

    if (!lesson) return;

    const targetIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex < 0 || targetIndex >= lesson.steps.length) return;

    const reordered = moveItem(lesson.steps, stepIndex, targetIndex);
    const stepIds = reordered.map((step) => step.id);

    setActionLoading(true);
    setError(null);

    try {
      await reorderAdminLessonSteps(lessonId, stepIds);
      await refreshCourse();
    } catch {
      setError("Failed to reorder steps");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div>Loading course...</div>;
  }

  if (error && !course) {
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

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>{course.title}</h1>
          <p style={{ margin: 0 }}>
            <strong>Slug:</strong> {course.slug}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleCreateModule} disabled={actionLoading}>
            Add module
          </button>

          {course.isPublished ? (
            <button onClick={handleUnpublish} disabled={actionLoading}>
              {actionLoading ? "Working..." : "Unpublish"}
            </button>
          ) : (
            <button onClick={handlePublish} disabled={actionLoading}>
              {actionLoading ? "Working..." : "Publish"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

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
          course.modules.map((module, moduleIndex) => (
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: 0 }}>
                  Module {module.order}: {module.title}
                </h2>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleMoveModule(moduleIndex, "up")}
                    disabled={actionLoading || moduleIndex === 0}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveModule(moduleIndex, "down")}
                    disabled={actionLoading || moduleIndex === course.modules.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleCreateLesson(module.id)}
                    disabled={actionLoading}
                  >
                    Add lesson
                  </button>
                </div>
              </div>

              {module.lessons.length === 0 ? (
                <p style={{ marginTop: 16 }}>No lessons in this module.</p>
              ) : (
                module.lessons.map((lesson, lessonIndex) => (
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                        Lesson {lesson.order}: {lesson.title}{" "}
                        {!lesson.isPublished ? "(draft)" : ""}
                      </h3>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleMoveLesson(module.id, lessonIndex, "up")}
                          disabled={actionLoading || lessonIndex === 0}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveLesson(module.id, lessonIndex, "down")}
                          disabled={
                            actionLoading || lessonIndex === module.lessons.length - 1
                          }
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleCreateStep(lesson.id)}
                          disabled={actionLoading}
                        >
                          Add step
                        </button>
                      </div>
                    </div>

                    {lesson.steps.length === 0 ? (
                      <p style={{ marginTop: 16 }}>No steps in this lesson.</p>
                    ) : (
                      <ul style={{ paddingLeft: 20, marginTop: 16, marginBottom: 0 }}>
                        {lesson.steps.map((step, stepIndex) => (
                          <li key={step.id} style={{ marginBottom: 8 }}>
                            <span>
                              Step {step.order}: {step.title} — {step.type}{" "}
                              {!step.isPublished ? "(draft)" : ""}
                            </span>{" "}
                            <button
                              onClick={() => handleMoveStep(lesson.id, stepIndex, "up")}
                              disabled={actionLoading || stepIndex === 0}
                              style={{ marginLeft: 8 }}
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveStep(lesson.id, stepIndex, "down")}
                              disabled={
                                actionLoading || stepIndex === lesson.steps.length - 1
                              }
                              style={{ marginLeft: 6 }}
                            >
                              ↓
                            </button>
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