import type { Step } from "../../lib/types";

interface Props {
  step: Step;
}

function getEmbedUrl(videoUrl: string) {
  if (videoUrl.includes("youtube.com/watch?v=")) {
    return videoUrl.replace("watch?v=", "embed/");
  }

  if (videoUrl.includes("youtu.be/")) {
    return videoUrl.replace("youtu.be/", "www.youtube.com/embed/");
  }

  return videoUrl;
}

export default function VideoStep({ step }: Props) {
  const content = step.content as { videoUrl: string };
  const embedUrl = getEmbedUrl(content.videoUrl);

  return (
    <div style={{ marginBottom: 40 }}>
      <h3>{step.title}</h3>

      <iframe
        width="100%"
        height="400"
        src={embedUrl}
        title={step.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}