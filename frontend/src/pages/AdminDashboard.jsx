import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Book, Trash2, Image, ImageOff } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      queryClient.invalidateQueries(['admin-stats']);
    }
  });

  const handleDeleteUser = (id) => {
    if (id === user?._id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (
      window.confirm(
        'Are you sure you want to delete this user? This will also delete their enrollments and progress.'
      )
    ) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleDeleteCourse = (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this course? This will also delete all modules, lessons, and student progress.'
      )
    ) {
      deleteCourseMutation.mutate(id);
    }
  };

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.users;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data;
    }
  });

  const { data: courses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data } = await api.get('/admin/courses');
      return data;
    }
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Admin Control Center
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Oversee platform health, manage users, and monitor content.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: <Users size={24} />,
            color: '#6366f1'
          },
          {
            label: 'Total Courses',
            value: stats?.totalCourses || 0,
            icon: <Book size={24} />,
            color: '#10b981'
          }
        ].map((stat, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card className="glass-card">
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: `${stat.color}15`,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </Box>

                <Box>
                  <Typography variant="h4" fontWeight={800}>
                    {stat.value}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{ mb: 3 }}
      >
        User Management
      </Typography>

      <TableContainer
        component={Paper}
        className="glass-card"
        sx={{ border: 'none' }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Joined Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users?.map((user) => (
              <TableRow
                key={user._id}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.01)'
                  }
                }}
              >
                <TableCell>{user.name}</TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={
                      user.role === 'admin'
                        ? 'secondary'
                        : user.role === 'instructor'
                        ? 'primary'
                        : 'default'
                    }
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={deleteUserMutation.isPending}
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{ mt: 6, mb: 3 }}
      >
        Course Management
      </Typography>

      <TableContainer
        component={Paper}
        className="glass-card"
        sx={{ border: 'none' }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Instructor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thumbnail</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {courses?.map((course) => (
              <TableRow
                key={course._id}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.01)'
                  }
                }}
              >
                <TableCell>{course.title}</TableCell>

                <TableCell>
                  {course.instructor?.name || 'Unknown'}
                </TableCell>

                <TableCell>
                  {course.thumbnailUrl ? (
                    <Chip
                      icon={<Image size={14} />}
                      label="Available"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      icon={<ImageOff size={14} />}
                      label="None"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={course.status}
                    size="small"
                    variant="filled"
                    color={
                      course.status === 'published'
                        ? 'success'
                        : 'default'
                    }
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteCourse(course._id)}
                    disabled={deleteCourseMutation.isPending}
                    title="Delete course"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminDashboard;