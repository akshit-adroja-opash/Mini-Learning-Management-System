import React, { useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import useVideoProgress from "../hooks/useVideoProgress";

export function VideoProgressPlayer({ lesson }) {
  const playerRef = useRef(null);

  const { positionSeconds, recordProgress } = useVideoProgress({
    lessonId: lesson?._id,
    initialPositionSeconds: lesson?.lastPositionSeconds || 0,
  });

  useEffect(() => {
    if (positionSeconds && playerRef.current) {
      playerRef.current.seekTo(positionSeconds, "seconds");
    }
  }, [positionSeconds]);

  if (!lesson?.videoUrl) {
    return <p className="error-message">Video is unavailable for this lesson.</p>;
  }

  return (
    <div className="video-frame">
      <ReactPlayer
        ref={playerRef}
        controls
        width="100%"
        height="100%"
        url={lesson.videoUrl}
        progressInterval={1000}
        onProgress={({ playedSeconds }) =>
          recordProgress(Math.floor(playedSeconds))
        }
      />
      <p>Resume position: {positionSeconds}s</p>
    </div>
  );
}