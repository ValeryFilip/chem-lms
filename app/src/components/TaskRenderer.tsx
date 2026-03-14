import TextTask from "./TextTask";

type Task = {
  id: string;
  type: string;
  prompt: string;
};

export default function TaskRenderer({ task }: { task: Task }) {
  switch (task.type) {
    case "text":
      return <TextTask task={task} />;

    default:
      return <div>Unknown task type</div>;
  }
}