import { useState } from "react";
import type { Step } from "../../lib/types";
import { submitStepAnswer } from "../../lib/api";

interface Props {
  step: Step;
}

export default function TaskStep({ step }: Props) {
  const content = step.content as {
    prompt: string;
    taskType: string;
  };

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);

    try {
      const res = await submitStepAnswer(step.id, answer);
      setResult(res.isCorrect ? "Correct ✅" : "Incorrect ❌");
    } catch {
      setResult("Error submitting answer");
    } finally {
      setLoading(false);
    }
  }

  function renderInput() {
    switch (content.taskType) {
      case "text":
        return (
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
          />
        );

      default:
        return <p>Task type "{content.taskType}" is not supported yet.</p>;
    }
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <h3>{step.title}</h3>

      <p>{content.prompt}</p>

      {renderInput()}

      <button onClick={handleSubmit} disabled={loading || content.taskType !== "text"}>
        Submit
      </button>

      {result && <p>{result}</p>}
    </div>
  );
}