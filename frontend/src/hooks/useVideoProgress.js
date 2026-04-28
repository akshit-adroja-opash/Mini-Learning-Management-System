import { useCallback, useEffect, useRef, useState } from "react";
import { progressApi } from "../api/progressApi";

export function useVideoProgress({ lessonId, initialPositionSeconds = 0 }) {
  const saveTimerRef = useRef(null);
  const [positionSeconds, setPositionSeconds] = useState(initialPositionSeconds);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const saveProgress = useCallback(
    (nextPositionSeconds, nextWatchedSeconds) => {
      if (!lessonId) return;

      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        progressApi.saveLessonProgress(lessonId, {
          lastPositionSeconds: nextPositionSeconds,
          watchedSeconds: nextWatchedSeconds,
        });
      }, 10000);
    },
    [lessonId]
  );

  const recordProgress = useCallback(
    (nextPositionSeconds) => {
      setPositionSeconds(nextPositionSeconds);
      setWatchedSeconds((current) => {
        const nextWatchedSeconds = Math.max(current, nextPositionSeconds);
        saveProgress(nextPositionSeconds, nextWatchedSeconds);
        return nextWatchedSeconds;
      });
    },
    [saveProgress]
  );

  useEffect(() => {
    return () => window.clearTimeout(saveTimerRef.current);
  }, []);

  return {
    positionSeconds,
    watchedSeconds,
    recordProgress,
  };
}
