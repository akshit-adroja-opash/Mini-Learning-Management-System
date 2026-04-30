import { Container, Grid, Typography, Card, CardContent, CardMedia, Button, Box, Skeleton, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fallbackCourseImage, getData } from '../services/api';
import { Link } from 'react-router-dom';
import { PlayCircle, Star } from 'lucide-react';

const CourseCatalog = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getData('/courses'),
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
              <Skeleton width="60%" sx={{ mt: 2 }} />
              <Skeleton width="40%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>Course Catalog</Typography>
        <Typography variant="body1" color="text.secondary">Browse our library of expert-led courses and start your learning journey.</Typography>
      </Box>

      <Grid container spacing={4}>
        {courses?.map((course) => (
          <Grid xs={12} sm={6} md={4} key={course._id}>
            <Card 
              className="glass-card" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnailUrl || fallbackCourseImage}
                  alt={course.title}
                />
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                  <Chip label={course.level || 'Beginner'} size="small" sx={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white' }} />
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom className="line-clamp-2">
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} className="line-clamp-2">
                  {course.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}>
                    <PlayCircle size={16} /> {course.moduleCount || 0} Modules
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" /> 4.8
                  </Box>
                </Box>

                <Button 
                  component={Link} 
                  to={`/courses/${course._id}`} 
                  fullWidth 
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CourseCatalog;
