import { useCallback, useEffect, useRef, useState } from "react";
import { saveProgress as saveProgressApi } from "../api/progressApi";

function useVideoProgress({ lessonId, initialPositionSeconds = 0 }) {
  const saveTimerRef = useRef(null);
  const [positionSeconds, setPositionSeconds] = useState(initialPositionSeconds);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const debouncedSave = useCallback(
    (nextPositionSeconds, nextWatchedSeconds) => {
      if (!lessonId) return;

      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        saveProgressApi({
          lessonId,
          watchedSeconds: nextWatchedSeconds,
          duration: null,
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
        debouncedSave(nextPositionSeconds, nextWatchedSeconds);
        return nextWatchedSeconds;
      });
    },
    [debouncedSave]
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

export default useVideoProgress;
