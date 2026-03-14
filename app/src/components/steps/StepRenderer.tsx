import type { Step } from "../../lib/types";

import VideoStep from "./VideoStep";
import TextStep from "./TextStep";
import TaskStep from "./TaskStep";

interface Props {
  step: Step;
}

export default function StepRenderer({ step }: Props) {
  switch (step.type) {
    case "video":
      return <VideoStep step={step} />;

    case "text":
      return <TextStep step={step} />;

    case "task":
      return <TaskStep step={step} />;

    default:
      return <div>Unknown step type</div>;
  }
}