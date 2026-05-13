import { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, MenuItem, Alert, CircularProgress } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Save, X, CheckCircle, ImagePlus, Link as LinkIcon } from 'lucide-react';
import { fallbackCourseImage, mediaUrl } from '../services/api';

const CourseForm = ({ onCancel, onSuccess, course }) => {
  const isEdit = Boolean(course?._id);

  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    level: course?.level || 'beginner',
    thumbnailUrl: course?.thumbnailUrl || ''
  });
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState(course?.thumbnailUrl || '');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        const response = await api.put(`/courses/${course._id}`, data);
        return response.data;
      } else {
        const response = await api.post('/courses', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
      queryClient.invalidateQueries(['course-manage', course?._id]);
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} course`);
    }
  });

  const uploadMedia = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    const { data } = await api.post('/upload', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const data = await uploadMedia(file);
      setUploadedThumbnailUrl(data.url);
      setFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
    } catch {
      setError('Thumbnail upload failed');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
      <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        {isEdit ? 'Edit Course' : 'Create New Course'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TextField
            fullWidth
            label="Course Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Level"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </TextField>
        </Grid>
        <Grid xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, opacity: 0.8 }}>Course Thumbnail</Typography>
          <Box sx={{ p: 3, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 2, textAlign: 'center' }}>
            <TextField
              fullWidth
              label="Thumbnail URL"
              value={formData.thumbnailUrl}
              onChange={(e) => {
                setFormData({ ...formData, thumbnailUrl: e.target.value });
                setUploadedThumbnailUrl('');
              }}
              placeholder="Paste image URL or upload manually"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <LinkIcon size={18} style={{ marginRight: 8, opacity: 0.7 }} />,
              }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="thumbnail-upload"
              type="file"
              onChange={handleThumbnailUpload}
            />
            <label htmlFor="thumbnail-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={thumbnailUploading ? <CircularProgress size={20} /> : <ImagePlus size={20} />}
                disabled={thumbnailUploading}
                sx={{ px: 4, py: 1.5 }}
              >
                {thumbnailUploading ? 'Uploading...' : formData.thumbnailUrl ? 'Change Thumbnail Upload' : 'Upload Thumbnail Manually'}
              </Button>
            </label>
            {uploadedThumbnailUrl && (
              <Typography variant="caption" color="success.main" sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <CheckCircle size={14} /> Thumbnail uploaded successfully
              </Typography>
            )}
            {formData.thumbnailUrl && (
              <Box
                component="img"
                src={mediaUrl(formData.thumbnailUrl) || fallbackCourseImage}
                alt="Course thumbnail preview"
                sx={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 360,
                  aspectRatio: '16 / 9',
                  objectFit: 'cover',
                  borderRadius: 2,
                  mt: 2.5,
                  mx: 'auto',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} startIcon={<X size={18} />}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className="premium-gradient"
          startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Save size={18} />}
          disabled={mutation.isPending}
        >
          {isEdit ? 'Save Changes' : 'Create Course'}
        </Button>
      </Box>
    </Box>
  );
};

export default CourseForm;
