import type { Step } from "../../lib/types";

interface Props {
  step: Step;
}

export default function TextStep({ step }: Props) {
  const content = step.content as { html: string };

  return (
    <div style={{ marginBottom: 40 }}>
      <h3>{step.title}</h3>

      <div
        dangerouslySetInnerHTML={{
          __html: content.html,
        }}
      />
    </div>
  );
}