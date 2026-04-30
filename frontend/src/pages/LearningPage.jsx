import { useState, useRef } from 'react';
import { Container, Grid, Box, Typography, Button, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, LinearProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useProgress from '../hooks/useProgress';
import QuizPanel from '../components/QuizPanel';
import DiscussionThread from '../components/DiscussionThread';
import { PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Trophy, MessageCircle, Info, Lock } from 'lucide-react';
import { Tabs, Tab } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const LearningPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course-learning', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}`);
      return data;
    }
  });

  const { data: progressData } = useQuery({
    queryKey: ['progress-all', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/progress/course/${courseId}`);
      return data;
    }
  });

  const { resumeSeconds, setTotalDuration, saveProgress } = useProgress(courseId, lessonId);
  const [videoError, setVideoError] = useState({ lessonId: null, message: '' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [contentTab, setContentTab] = useState(0);

  const currentLesson = (() => {
    if (!course) return null;

    for (const module of course.modules || []) {
      const lesson = module.lessons?.find((item) => item._id.toString() === lessonId.toString());
      if (lesson) return { ...lesson, moduleLocked: module.isLocked };
    }

    if (course.promoVideoUrl) {
      return {
        _id: 'main',
        title: 'Main Course Video',
        videoUrl: course.promoVideoUrl,
        description: course.description
      };
    }

    return null;
  })();

  const handleProgress = (state) => {
    if (lessonId !== 'main') {
      const duration = playerRef.current?.getDuration?.() || currentLesson?.durationSeconds || 0;
      saveProgress(state.playedSeconds, duration);
    }
  };

  const handleDuration = (duration) => {
    setTotalDuration(duration);
  };

  const isLessonCompleted = (id) => progressData?.some(p => p.lesson === id && p.isCompleted);

  const isNativeVideoUrl = (url) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.mp4') ||
      cleanUrl.endsWith('.webm') ||
      cleanUrl.endsWith('.ogg') ||
      /res\.cloudinary\.com\/.+\/video\/upload\//.test(url)
    );
  };

  if (courseLoading || !currentLesson) return null;
  if (currentLesson.moduleLocked) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="warning">This module is locked until you pass the previous module quiz.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#020617', minHeight: '100vh', mt: -4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Main Content (Video) */}
          <Grid xs={12} lg={9}>
            {showQuiz ? (
              <QuizPanel
                moduleId={activeModule}
                onComplete={() => {
                  setShowQuiz(false);
                  queryClient.invalidateQueries(['course-learning', courseId]);
                }}
              />
            ) : (
              <>
                <Box sx={{ position: 'relative', pt: '56.25%', background: '#000', borderRadius: 4, overflow: 'hidden', mb: 3 }}>
                  {(() => {
                    const videoUrl = currentLesson?.videoUrl;
                    const resolvedUrl = videoUrl
                      ? (videoUrl.startsWith('http')
                        ? videoUrl
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`)
                      : null;

                    console.log('DEBUG: Resolved Video URL:', resolvedUrl);

                    if (!resolvedUrl) return (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <PlayCircle size={64} color="rgba(255,255,255,0.2)" />
                        <Typography color="text.secondary">No video content found for this lesson.</Typography>
                        {user.role === 'instructor' && (
                          <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => navigate(`/course-management/${courseId}`)}>
                            Upload Video
                          </Button>
                        )}
                      </Box>
                    );

                    const useNativeVideo = isNativeVideoUrl(resolvedUrl);

                    const currentVideoError = videoError.lessonId === lessonId ? videoError.message : '';

                    return currentVideoError ? (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                        <Alert severity="error">{currentVideoError}</Alert>
                      </Box>
                    ) : useNativeVideo ? (
                      <Box
                        component="video"
                        ref={playerRef}
                        src={resolvedUrl}
                        controls
                        controlsList="nodownload"
                        preload="metadata"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          bgcolor: '#000'
                        }}
                        onLoadedMetadata={(event) => {
                          const video = event.currentTarget;
                          if (video.duration) handleDuration(video.duration);
                          if (resumeSeconds > 0 && Number.isFinite(video.duration)) {
                            video.currentTime = Math.min(resumeSeconds, Math.max(video.duration - 1, 0));
                          }
                        }}
                        onTimeUpdate={(event) => {
                          const video = event.currentTarget;
                          if (lessonId !== 'main' && video.duration) {
                            saveProgress(video.currentTime, video.duration);
                          }
                        }}
                        onError={() => setVideoError({
                          lessonId,
                          message: 'This uploaded video could not be played by the browser. Please re-upload it as MP4/H.264 or try another lesson.'
                        })}
                      />
                    ) : (
                      <ReactPlayer
                        ref={playerRef}
                        url={resolvedUrl}
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        controls
                        onProgress={handleProgress}
                        config={{
                          file: {
                            attributes: {
                              controlsList: 'nodownload',
                              style: { objectFit: 'contain' }
                            }
                          }
                        }}
                        onError={() => setVideoError({
                          lessonId,
                          message: 'This video could not be loaded. Please try another lesson or contact the instructor.'
                        })}
                        onReady={() => {
                          if (playerRef.current) {
                            const dur = playerRef.current.getDuration();
                            if (dur) handleDuration(dur);
                            if (resumeSeconds > 0) {
                              playerRef.current.seekTo(resumeSeconds, 'seconds');
                            }
                          }
                        }}
                      />
                    );
                  })()}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom>{currentLesson.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{course.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<ChevronLeft />}>Prev</Button>
                    <Button variant="contained" className="premium-gradient" endIcon={<ChevronRight />}>Next Lesson</Button>
                  </Box>
                </Box>

                <Box sx={{ mb: 4, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Tabs value={contentTab} onChange={(e, v) => setContentTab(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Overview" icon={<Info size={18} />} iconPosition="start" />
                    <Tab label="Discussions" icon={<MessageCircle size={18} />} iconPosition="start" />
                  </Tabs>
                </Box>

                {contentTab === 0 ? (
                  <Paper className="glass-card" sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>About this lesson</Typography>
                    <Typography variant="body1" color="text.secondary">
                      {currentLesson.description || 'In this lesson, we will cover the core concepts of the topic and demonstrate practical applications.'}
                    </Typography>
                  </Paper>
                ) : (
                  <DiscussionThread lessonId={lessonId} />
                )}
              </>
            )}
          </Grid>

          {/* Sidebar (Curriculum) */}
          <Grid xs={12} lg={3}>
            <Paper className="glass-card" sx={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', border: 'none' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Course Content</Typography>
                <Box sx={{ mt: 2 }}>
                  {(() => {
                    const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
                    const completedLessons = progressData?.filter(p => p.isCompleted)?.length || 0;
                    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                    return (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">Overall Progress</Typography>
                          <Typography variant="caption" fontWeight={700}>{pct}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{ borderRadius: 5, height: 6 }} />
                      </>
                    );
                  })()}
                </Box>
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {course.modules?.map((module, mIdx) => (
                  <Box key={module._id}>
                    <Box sx={{ px: 3, py: 2, bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                        Module {mIdx + 1}: {module.title}
                      </Typography>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {module.lessons?.map((lesson) => {
                        const isCurrent = lesson._id === lessonId;
                        const isCompleted = isLessonCompleted(lesson._id);
                        const isLocked = module.isLocked;
                        return (
                          <ListItem key={lesson._id} disablePadding>
                            <ListItemButton
                              onClick={() => navigate(`/learning/${courseId}/${lesson._id}`)}
                              disabled={isLocked}
                              selected={isCurrent}
                              sx={{
                                px: 3,
                                py: 1.5,
                                borderLeft: isCurrent ? '4px solid #6366f1' : '4px solid transparent',
                                bgcolor: isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle2 size={20} color="#10b981" /> : <PlayCircle size={20} />}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight={isCurrent ? 700 : 400}>
                                    {lesson.title}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                      {/* Module Quiz */}
                      <ListItem disablePadding>
                        <ListItemButton
                          sx={{ px: 3, py: 1.5, color: 'secondary.main' }}
                          disabled={module.isLocked}
                          onClick={() => { setShowQuiz(true); setActiveModule(module._id); }}
                          selected={showQuiz && activeModule === module._id}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <HelpCircle size={20} color="#ec4899" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={700}>
                                Module Quiz
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Box>
                ))}
              </Box>

              <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Trophy size={18} />}
                  sx={{ borderRadius: 2 }}
                  onClick={() => navigate(`/certificate/${courseId}`)}
                >
                  Claim Certificate
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LearningPage;
