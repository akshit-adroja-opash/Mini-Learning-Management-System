import React from 'react';
import { Container, Grid, Typography, Box, Card, CardContent, Button, Tabs, Tab, Avatar, LinearProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Book, Trophy, Clock, Settings, Plus, BarChart2, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import InstructorAnalytics from '../components/InstructorAnalytics';
import CourseForm from '../components/CourseForm';
import { Dialog, DialogContent, DialogTitle, DialogActions, IconButton } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = React.useState(0);
  const [openForm, setOpenForm] = React.useState(false);
  const [editCourse, setEditCourse] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const showSettings = user.role !== 'admin';
  const settingsTab = user.role === 'instructor' ? 3 : 2;

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const { data } = await api.get('/enrollments/me');
      return data;
    },
    enabled: user?.role === 'learner',
  });

  const { data: myCourses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const { data } = await api.get('/courses/instructor');
      return data;
    },
    enabled: user?.role === 'instructor' || user?.role === 'admin',
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId) => api.delete(`/courses/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
      setDeleteTarget(null);
    },
    onError: () => {
      alert('Failed to delete course. Please try again.');
      setDeleteTarget(null);
    }
  });

  const handleOpenEdit = (course) => {
    setEditCourse(course);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditCourse(null);
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800}>Hello, {user?.name}!</Typography>
          <Typography variant="body1" color="text.secondary">
            {user.role === 'instructor' ? 'Manage your courses and view analytics' : 'Track your progress and continue learning'}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          {user.role === 'instructor' && (
            <Button
              variant="contained"
              className="premium-gradient"
              startIcon={<Plus />}
              sx={{ borderRadius: 3 }}
              onClick={() => { setEditCourse(null); setOpenForm(true); }}
            >
              Create New Course
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: 'Courses', value: user.role === 'learner' ? enrollments?.length || 0 : myCourses?.length || 0, icon: <Book size={20} /> },
          { label: 'Completed', value: '0', icon: <Trophy size={20} /> },
          { label: 'Hours Spent', value: '12h', icon: <Clock size={20} /> },
        ].map((stat, i) => (
          <Grid xs={12} sm={4} key={i}>
            <Card className="glass-card">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
          <Tab label={user.role === 'instructor' ? 'My Courses' : 'Enrolled Courses'} icon={<Book size={18} />} iconPosition="start" />
          <Tab label="Achievements" icon={<Trophy size={18} />} iconPosition="start" />
          {user.role === 'instructor' && <Tab label="Analytics" icon={<BarChart2 size={18} />} iconPosition="start" />}
          {showSettings && <Tab label="Settings" icon={<Settings size={18} />} iconPosition="start" />}
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          {(user.role === 'learner' ? enrollments : myCourses)?.map((item) => {
            const course = user.role === 'learner' ? item.course : item;
            return (
              <Grid xs={12} sm={6} md={4} key={course._id}>
                <Card className="glass-card" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box
                    component="img"
                    src={course.thumbnail || course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                    sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom className="line-clamp-1">{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} className="line-clamp-2">{course.description}</Typography>

                    {user.role === 'learner' && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">Progress</Typography>
                          <Typography variant="caption" fontWeight={700}>{item.progressPercent || 0}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={item.progressPercent || 0} sx={{ borderRadius: 5, height: 6 }} />
                      </Box>
                    )}

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(
                          user.role === 'learner'
                            ? `/learning/${course._id}/${item.lastAccessedLesson || (course.modules?.[0]?.lessons?.[0]?._id || '')}`
                            : `/course-management/${course._id}`
                        )}
                      >
                        {user.role === 'learner' ? 'Continue' : 'Manage Content'}
                      </Button>

                      {user.role === 'instructor' && (
                        <>
                          <IconButton
                            size="small"
                            title="Edit course details"
                            onClick={() => handleOpenEdit(course)}
                            sx={{
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 2,
                              color: 'primary.light',
                              '&:hover': { bgcolor: 'rgba(99,102,241,0.15)' }
                            }}
                          >
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Delete course"
                            onClick={() => setDeleteTarget(course)}
                            sx={{
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 2,
                              color: 'error.light',
                              '&:hover': { bgcolor: 'rgba(239,68,68,0.15)' }
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}

          {((user.role === 'learner' ? enrollments : myCourses)?.length === 0) && (
            <Grid xs={12}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {user.role === 'instructor' ? "You haven't created any courses yet." : "You haven't enrolled in any courses yet."}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {user.role === 'instructor' ? 'Click "Create New Course" to get started.' : 'Browse our catalog to find your next learning adventure!'}
                </Typography>
                {user.role !== 'instructor' && (
                  <Button component={Link} to="/courses" variant="contained" className="premium-gradient">Explore Catalog</Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 1 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Trophy size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
          <Typography variant="h6" color="text.secondary">Complete courses to earn certificates!</Typography>
        </Box>
      )}

      {tabValue === 2 && user.role === 'instructor' && <InstructorAnalytics />}

      {showSettings && tabValue === settingsTab && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Settings size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
          <Typography variant="h6" color="text.secondary">Profile settings coming soon.</Typography>
        </Box>
      )}

      {/* Create / Edit Course Dialog */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { className: 'glass-card', sx: { bgcolor: '#1e293b' } } }}
      >
        <DialogContent>
          <CourseForm course={editCourse} onCancel={handleCloseForm} onSuccess={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { className: 'glass-card', sx: { bgcolor: '#1e293b' } } }}
      >
        <DialogTitle fontWeight={800} sx={{ color: 'error.light' }}>Delete Course?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove all modules, lessons, and enrollments. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Trash2 size={16} />}
            disabled={deleteCourseMutation.isPending}
            onClick={() => deleteCourseMutation.mutate(deleteTarget._id)}
          >
            {deleteCourseMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
