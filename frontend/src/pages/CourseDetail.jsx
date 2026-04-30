import { Container, Grid, Typography, Button, Box, Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fallbackCourseImage, getData, mediaUrl, postData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Play, CheckCircle, BookOpen, Lock, ChevronRight, PlayCircle } from 'lucide-react';
import ReactPlayer from 'react-player';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getData(`/courses/${id}`),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      if (!user) return null;
      try {
        return getData(`/enrollments/course/${id}`);
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: () => postData(`/enrollments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', id]);
      navigate(`/learning/${id}/${course.modules[0].lessons[0]._id}`);
    },
  });

  if (isLoading) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        <Grid xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>{course.title}</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>{course.description}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label={course.category || 'Development'} color="primary" />
              <Typography variant="body2" color="text.secondary">By {course.instructor?.name || 'Expert Instructor'}</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BookOpen size={24} /> Course Syllabus
            </Typography>
            <Divider sx={{ mb: 3, opacity: 0.1 }} />

            {course.modules?.map((module, idx) => (
              <Card key={module._id} className="glass-card" sx={{ mb: 2, border: 'none' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight={700}>Module {idx + 1}: {module.title}</Typography>
                    <Chip label={`${module.lessons?.length || 0} Lessons`} size="small" variant="outlined" />
                  </Box>
                  <List sx={{ p: 0 }}>
                    {module.lessons?.map((lesson) => (
                      <ListItem key={lesson._id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <ListItemIcon>
                          <Play size={18} color="#94a3b8" />
                        </ListItemIcon>
                        <ListItemText primary={lesson.title} secondary={`${lesson.duration || 5} min`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={4}>
          <Card className="glass-card" sx={{ position: 'sticky', top: 100, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            {course.promoVideoUrl ? (
              <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000' }}>
                  <ReactPlayer
                    url={mediaUrl(course.promoVideoUrl)}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    controls
                    light={course.thumbnailUrl || true}
                    playIcon={<PlayCircle size={48} color="#fff" />}
                  />
              </Box>
            ) : (
              <Box
                component="img"
                src={course.thumbnailUrl || course.thumbnail || fallbackCourseImage}
                sx={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Free</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Full lifetime access • Certificate of completion</Typography>

              {(() => {
                const isInstructor = user && user.role === 'instructor' && course.instructor?._id === user._id;
                if (enrollment || isInstructor) {
                  return (
                    <Button
                      fullWidth
                      variant="contained"
                      className="premium-gradient"
                      onClick={() => {
                        const firstModule = course.modules?.find(m => m.lessons?.length > 0);
                        const firstLesson = firstModule?.lessons?.[0]?._id;
                        const targetLessonId = (enrollment && enrollment.lastAccessedLesson) || firstLesson || 'main';
                        navigate(`/learning/${id}/${targetLessonId}`);
                      }}
                      endIcon={<ChevronRight />}
                    >
                      {isInstructor ? 'Preview Learning' : 'Continue Learning'}
                    </Button>
                  );
                }
                return (
                  <Button
                    fullWidth
                    variant="contained"
                    className="premium-gradient"
                    onClick={() => user ? enrollMutation.mutate() : navigate('/login')}
                    disabled={enrollMutation.isPending}
                  >
                    {user ? 'Enroll Now' : 'Login to Enroll'}
                  </Button>
                );
              })()}

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>This course includes:</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                    <Play size={16} /> <Typography variant="body2">10 hours of video lessons</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                    <CheckCircle size={16} /> <Typography variant="body2">Hands-on quizzes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                    <Lock size={16} /> <Typography variant="body2">Sequential unlocking</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;
