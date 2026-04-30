import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const useProgress = (courseId, lessonId) => {
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const saveTimeoutRef = useRef(null);
  const watchedRef = useRef(0);
  const lastPositionRef = useRef(0);
  const durationRef = useRef(0);

  const persistProgress = useCallback(async (watched, position, duration) => {
    if (!courseId || !lessonId || lessonId === 'main' || !duration) return;

    await api.post('/progress', {
      course: courseId,
      lesson: lessonId,
      watchedSeconds: Math.floor(watched),
      lastPositionSeconds: Math.floor(position),
      totalDuration: Math.floor(duration),
    });
  }, [courseId, lessonId]);

  // Fetch initial progress
  useEffect(() => {
    watchedRef.current = 0;
    lastPositionRef.current = 0;

    const fetchProgress = async () => {
      try {
        const { data } = await api.get(`/progress/course/${courseId}/lesson/${lessonId}`);
        if (data) {
          const watched = data.watchedSeconds || 0;
          const position = data.lastPositionSeconds ?? watched;
          watchedRef.current = watched;
          lastPositionRef.current = position;
          setWatchedSeconds(watched);
          setResumeSeconds(position);
        }
      } catch (err) {
        console.error('Failed to fetch progress', err);
      }
    };
    if (courseId && lessonId && lessonId !== 'main') fetchProgress();
  }, [courseId, lessonId]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      persistProgress(watchedRef.current, lastPositionRef.current, durationRef.current).catch(() => {});
    };
  }, [persistProgress]);

  // Debounced save progress
  const saveProgress = (positionSeconds, duration) => {
    if (!duration) return;

    const previousPosition = lastPositionRef.current;
    const delta = positionSeconds - previousPosition;

    // Count normal playback time, but do not award progress for large seek jumps.
    if (delta > 0 && delta <= 15) {
      watchedRef.current = Math.min(watchedRef.current + delta, duration);
      setWatchedSeconds(watchedRef.current);
    }

    lastPositionRef.current = positionSeconds;
    durationRef.current = duration;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        persistProgress(watchedRef.current, lastPositionRef.current, duration);
      } catch (err) {
        console.error('Failed to save progress', err);
      }
    }, 10000); // Debounce 10 seconds
  };

  return { watchedSeconds, resumeSeconds, totalDuration, setTotalDuration, saveProgress };
};

export default useProgress;
