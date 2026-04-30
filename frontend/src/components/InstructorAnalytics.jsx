import { Box, Typography, Grid, Card, CardContent, LinearProgress, Paper, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InstructorAnalytics = () => {
  const theme = useTheme();
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
 
      <Paper className="glass-card" sx={{ p: 4, mb: 6, bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 4 }}>Enrollment Trends (Last 30 Days)</Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.trends || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                minTickGap={30}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

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
