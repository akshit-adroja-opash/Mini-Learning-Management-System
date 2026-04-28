import ReactPlayer from "react-player";
import { useVideoProgress } from "../hooks/useVideoProgress";

export function VideoProgressPlayer({ lesson }) {
  const { positionSeconds, recordProgress } = useVideoProgress({
    lessonId: lesson?.id,
    initialPositionSeconds: lesson?.lastPositionSeconds || 0,
  });

  if (!lesson?.videoUrl) {
    return <p className="error-message">Video is unavailable for this lesson.</p>;
  }

  return (
    <div className="video-frame">
      <ReactPlayer
        controls
        height="100%"
        progressInterval={1000}
        url={lesson.videoUrl}
        width="100%"
        onProgress={({ playedSeconds }) => recordProgress(Math.floor(playedSeconds))}
      />
      <p>Resume position: {positionSeconds}s</p>
    </div>
  );
}
