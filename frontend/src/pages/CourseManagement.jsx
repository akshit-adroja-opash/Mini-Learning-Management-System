import { useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Dialog, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Trash2, Edit2, Play, FileText, GripVertical, Upload } from 'lucide-react';

const CourseManagement = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);

  const [moduleData, setModuleData] = useState({ title: '', order: 1 });
  const [lessonData, setLessonData] = useState({ title: '', content: '', videoUrl: '', durationSeconds: 5, order: 1 });
  const [lessonVideoUploading, setLessonVideoUploading] = useState(false);
  const [lessonVideoUploaded, setLessonVideoUploaded] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-manage', id],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${id}`);
      return data;
    }
  });

  const addModuleMutation = useMutation({
    mutationFn: (data) => api.post(`/modules`, { ...data, course: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-manage', id]);
      setOpenModuleDialog(false);
      setModuleData({ title: '', order: (course.modules?.length || 0) + 1 });
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/modules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-manage', id]);
      setOpenModuleDialog(false);
      setEditingModuleId(null);
      setModuleData({ title: '', order: 1 });
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId) => api.delete(`/modules/${moduleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-manage', id]);
    }
  });

  const handleLessonVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLessonVideoUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLessonData({ ...lessonData, videoUrl: data.url });
      setLessonVideoUploaded(true);
    } catch {
      alert('Video upload failed');
    } finally {
      setLessonVideoUploading(false);
    }
  };

  const addLessonMutation = useMutation({
    mutationFn: (data) => api.post(`/lessons`, { ...data, module: currentModuleId, course: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-manage', id]);
      setOpenLessonDialog(false);
      setLessonData({ title: '', content: '', videoUrl: '', durationSeconds: 5, order: 1 });
      setLessonVideoUploaded(false);
    }
  });

  if (isLoading) return null;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" fontWeight={800} gutterBottom>{course.title}</Typography>
          <Typography variant="body1" color="text.secondary">Manage modules and lessons for this course.</Typography>
        </Box>
        <Button variant="contained" className="premium-gradient" startIcon={<Plus />} onClick={() => {
          setEditingModuleId(null);
          setModuleData({ title: '', order: (course.modules?.length || 0) + 1 });
          setOpenModuleDialog(true);
        }}>
          Add Module
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12}>
          {course.modules?.map((module, idx) => (
            <Card key={module._id} className="glass-card" sx={{ mb: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GripVertical size={18} style={{ opacity: 0.3 }} />
                  <Typography variant="h6" fontWeight={700}>Module {idx + 1}: {module.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<Plus />} onClick={() => {
                    setCurrentModuleId(module._id);
                    setOpenLessonDialog(true);
                  }}>
                    Add Lesson
                  </Button>
                  <IconButton size="small" onClick={() => {
                    setEditingModuleId(module._id);
                    setModuleData({ title: module.title, order: module.order || 1 });
                    setOpenModuleDialog(true);
                  }}>
                    <Edit2 size={18} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => {
                    if (window.confirm('Are you sure you want to delete this module and all its lessons?')) {
                      deleteModuleMutation.mutate(module._id);
                    }
                  }}>
                    <Trash2 size={18} />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ opacity: 0.1 }} />
              <CardContent sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {module.lessons?.map((lesson) => (
                    <ListItem key={lesson._id} sx={{ px: 4, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {lesson.videoUrl ? <Play size={16} color="#6366f1" /> : <FileText size={16} color="#94a3b8" />}
                            <Typography fontWeight={500}>{lesson.title}</Typography>
                          </Box>
                        }
                        secondary={`${lesson.durationSeconds || 5} min`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small"><Edit2 size={16} /></IconButton>
                        <IconButton size="small" color="error"><Trash2 size={16} /></IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {(!module.lessons || module.lessons.length === 0) && (
                    <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                      <Typography variant="body2">No lessons in this module yet.</Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          ))}
          {(!course.modules || course.modules.length === 0) && (
            <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4, border: '2px dashed rgba(255,255,255,0.1)' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No modules created yet.</Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenModuleDialog(true)}>Create Your First Module</Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Module Dialog */}
      <Dialog open={openModuleDialog} onClose={() => setOpenModuleDialog(false)} maxWidth="xs" fullWidth slotProps={{ paper: { className: 'glass-card', sx: { bgcolor: '#1e293b' } } }}>
        <DialogTitle fontWeight={800}>{editingModuleId ? 'Edit Module' : 'Create New Module'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField fullWidth label="Module Title" value={moduleData.title} onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })} />
            <TextField fullWidth type="number" label="Display Order" value={moduleData.order} onChange={(e) => setModuleData({ ...moduleData, order: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => {
                setOpenModuleDialog(false);
                setEditingModuleId(null);
              }}>Cancel</Button>
              <Button variant="contained" className="premium-gradient" onClick={() => {
                if (editingModuleId) {
                  updateModuleMutation.mutate({ id: editingModuleId, data: moduleData });
                } else {
                  addModuleMutation.mutate(moduleData);
                }
              }}>
                {editingModuleId ? 'Save Changes' : 'Create Module'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={openLessonDialog} onClose={() => setOpenLessonDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { className: 'glass-card', sx: { bgcolor: '#1e293b' } } }}>
        <DialogTitle fontWeight={800}>Add New Lesson</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField fullWidth label="Lesson Title" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} />
            <TextField fullWidth multiline rows={3} label="Content / Reading Material" value={lessonData.content} onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })} />
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Lesson Video</Typography>
            <Box sx={{ p: 2, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 2, textAlign: 'center' }}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="lesson-video-upload"
                type="file"
                onChange={handleLessonVideoUpload}
              />
              <label htmlFor="lesson-video-upload">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                  startIcon={lessonVideoUploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                  disabled={lessonVideoUploading}
                >
                  {lessonVideoUploading ? 'Uploading...' : lessonVideoUploaded ? 'Change Video' : 'Upload Video to Cloudinary'}
                </Button>
              </label>
              {lessonVideoUploaded && (
                <Typography variant="caption" display="block" color="success.main" sx={{ mt: 1 }}>
                  Video uploaded successfully
                </Typography>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid xs={6}><TextField fullWidth type="number" label="Duration (min)" value={lessonData.durationSeconds} onChange={(e) => setLessonData({ ...lessonData, durationSeconds: e.target.value })} /></Grid>
              <Grid xs={6}><TextField fullWidth type="number" label="Display Order" value={lessonData.order} onChange={(e) => setLessonData({ ...lessonData, order: e.target.value })} /></Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setOpenLessonDialog(false)}>Cancel</Button>
              <Button variant="contained" className="premium-gradient" onClick={() => addLessonMutation.mutate(lessonData)}>Add Lesson</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CourseManagement;
