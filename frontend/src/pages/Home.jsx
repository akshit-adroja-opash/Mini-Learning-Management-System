import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowRight, Video, FileText, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ pt: 10, pb: 15, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '3rem', md: '5rem' }, 
              lineHeight: 1.1, 
              mb: 3, 
              background: 'linear-gradient(to right, #fff, #94a3b8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}
          >
            Empower Your Team with <br />
            <span style={{ color: '#6366f1' }}>Modern Learning</span>
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
            A lightweight, powerful LMS designed for corporate training. Track video progress, 
            complete quizzes, and earn certified skills.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button 
              component={Link} 
              to="/courses" 
              variant="contained" 
              size="large" 
              className="premium-gradient"
              sx={{ px: 6, py: 2, borderRadius: 3 }}
              endIcon={<ArrowRight />}
            >
              Explore Courses
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="outlined" 
              size="large" 
              sx={{ px: 6, py: 2, borderRadius: 3, borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Be an Instructor
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 15 }}>
        {[
          { title: 'Video Tracking', desc: 'Resumes exactly where you left off. Smart progress bars.', icon: <Video size={32} /> },
          { title: 'Interactive Quizzes', desc: 'MCQs with instant grading and module unlocking.', icon: <FileText size={32} /> },
          { title: 'Certification', desc: 'Earn signed, verifiable certificates upon completion.', icon: <Trophy size={32} /> },
          { title: 'Analytics', desc: 'Instructors get deep insights into learner performance.', icon: <Users size={32} /> },
        ].map((feature, i) => (
          <Grid key={i} xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card" sx={{ height: '100%', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom fontWeight={700}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
