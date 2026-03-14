import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  completeStep,
  getLessonProgress,
  getLessonSteps,
  getStepById,
} from "../lib/api";
import type { Step } from "../lib/types";
import StepRenderer from "../components/steps/StepRenderer";

export default function StepPage() {
  const { id } = useParams<{ id: string }>();

  const [step, setStep] = useState<Step | null>(null);
  const [lessonSteps, setLessonSteps] = useState<Step[]>([]);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStepPage() {
      if (!id) {
        setError("Step id is missing");
        setLoading(false);
        return;
      }

      try {
        const currentStep = await getStepById(id);
        setStep(currentStep);

        const steps = await getLessonSteps(currentStep.lessonId);
        setLessonSteps(steps);

        const progress = await getLessonProgress(currentStep.lessonId);
        setCompletedStepIds(progress.completedStepIds);

        // Auto-complete theory steps (video or text)
        if (
          (currentStep.type === "video" || currentStep.type === "text") &&
          !progress.completedStepIds.includes(currentStep.id)
        ) {
          await completeStep(currentStep.id);
          // Refresh progress after completion
          const updatedProgress = await getLessonProgress(currentStep.lessonId);
          setCompletedStepIds(updatedProgress.completedStepIds);
        }
      } catch {
        setError("Failed to load step");
      } finally {
        setLoading(false);
      }
    }

    loadStepPage();
  }, [id]);

  const currentIndex = useMemo(() => {
    if (!step) return -1;
    return lessonSteps.findIndex((item) => item.id === step.id);
  }, [lessonSteps, step]);

  const prevStep = currentIndex > 0 ? lessonSteps[currentIndex - 1] : null;
  const nextStep =
    currentIndex >= 0 && currentIndex < lessonSteps.length - 1
      ? lessonSteps[currentIndex + 1]
      : null;

  if (loading) {
    return <div style={{ padding: 24 }}>Loading step...</div>;
  }

  if (error) {
    return <div style={{ padding: 24 }}>{error}</div>;
  }

  if (!step) {
    return <div style={{ padding: 24 }}>Step not found</div>;
  }

return (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gap: 24,
      padding: 24,
      alignItems: "start",
    }}
  >
    <aside
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        position: "sticky",
        top: 24,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Lesson steps</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lessonSteps.map((lessonStep, index) => {
          const isActive = lessonStep.id === step.id;
          const isCompleted = completedStepIds.includes(lessonStep.id);

          return (
            <Link
              key={lessonStep.id}
              to={`/steps/${lessonStep.id}`}
              style={{
                padding: 10,
                borderRadius: 8,
                textDecoration: "none",
                border: "1px solid #ddd",
                background: isActive ? "#f3f4f6" : isCompleted ? "#ecfdf5" : "#fff",
                fontWeight: isActive ? 700 : 400,
                color: "inherit",
              }}
            >
              {index + 1}. {lessonStep.title} {isCompleted ? "✅" : ""}
            </Link>
          );
        })}
      </div>
    </aside>

    <main>
      <p>
        Step {step.order} of {lessonSteps.length} • {step.type}
      </p>

      <h1>{step.title}</h1>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <StepRenderer step={step} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {prevStep ? (
          <Link to={`/steps/${prevStep.id}`}>← Previous step</Link>
        ) : (
          <span style={{ opacity: 0.5 }}>← Previous step</span>
        )}

        <Link to={`/lessons/${step.lessonId}`}>Back to lesson</Link>

        {nextStep ? (
          <Link to={`/steps/${nextStep.id}`}>Next step →</Link>
        ) : (
          <span style={{ opacity: 0.5 }}>Next step →</span>
        )}
      </div>
    </main>
  </div>
);
}