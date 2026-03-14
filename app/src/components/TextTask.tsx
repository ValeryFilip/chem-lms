import { useState } from "react";
import { api } from "../lib/api";
import axios from "axios";

type Task = {
  id: string;
  prompt: string;
};

export default function TextTask({ task }: { task: Task }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const res = await api.post("/submissions", {
        taskId: task.id,
        answer,
      });

      setResult(res.data.isCorrect ? "Correct ✅" : "Incorrect ❌");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setResult(error.response?.data?.error ?? "Request failed");
      } else {
        setResult("Unknown error");
      }
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <p>{task.prompt}</p>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer"
      />

      <button onClick={handleSubmit}>Check</button>

      {result && <p>{result}</p>}
    </div>
  );
}