import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box className="premium-gradient" sx={{ p: 0.5, borderRadius: 1.5, display: 'flex' }}>
                <GraduationCap color="white" size={20} />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                LMS <span style={{ color: '#6366f1' }}>Pro</span>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              The ultimate platform for modern corporate training. Track progress, earn certificates, and master new skills.
            </Typography>
          </Grid>
          <Grid xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Platform</Typography>
            <Link href="/courses" underline="none" color="text.secondary" display="block" sx={{ mb: 1, '&:hover': { color: 'primary.main' } }}>Courses</Link>
            <Link href="#" underline="none" color="text.secondary" display="block" sx={{ mb: 1, '&:hover': { color: 'primary.main' } }}>Instructors</Link>
          </Grid>
          <Grid xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Support</Typography>
            <Link href="#" underline="none" color="text.secondary" display="block" sx={{ mb: 1, '&:hover': { color: 'primary.main' } }}>Help Center</Link>
            <Link href="#" underline="none" color="text.secondary" display="block" sx={{ mb: 1, '&:hover': { color: 'primary.main' } }}>Contact</Link>
          </Grid>
          <Grid xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Stay Updated</Typography>
            <Typography variant="body2" color="text.secondary">
              Subscribe to our newsletter for the latest course updates and educational insights.
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, opacity: 0.1 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} LMS Pro. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
