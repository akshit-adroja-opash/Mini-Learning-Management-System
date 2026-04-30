import { Box, Typography, Grid, Card, CardContent, LinearProgress, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';

const InstructorAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data;
    }
  });

  if (isLoading) return <LinearProgress />;

  const stats = [
    { label: 'Total Enrollments', value: analytics?.totalEnrollments || 0, icon: <Users size={24} />, color: '#6366f1' },
    { label: 'Avg. Quiz Score', value: `${analytics?.averageQuizScore || 0}%`, icon: <Award size={24} />, color: '#10b981' },
    { label: 'Active Learners', value: analytics?.activeLearners || 0, icon: <TrendingUp size={24} />, color: '#ec4899' },
    { label: 'Completion Rate', value: `${analytics?.completionRate || 0}%`, icon: <Clock size={24} />, color: '#fbbf24' },
  ];

  return (
    <Box>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card className="glass-card" sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${stat.color}15`, color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, bgcolor: stat.color, opacity: 0.3 }} />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} gutterBottom>Course Performance</Typography>
      <Grid container spacing={4}>
        {analytics?.courseStats?.map((course, i) => (
          <Grid item xs={12} key={i}>
            <Paper className="glass-card" sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Grid container alignItems="center">
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight={700}>{course.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{course.enrollments} Enrollments</Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Avg. Progress</Typography>
                        <Typography variant="caption" fontWeight={700}>{course.avgProgress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={course.avgProgress} sx={{ borderRadius: 5, height: 8 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Quiz Pass Rate</Typography>
                        <Typography variant="caption" fontWeight={700}>{course.passRate}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={course.passRate} color="secondary" sx={{ borderRadius: 5, height: 8 }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InstructorAnalytics;
