import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Trophy, Download, Share2, ShieldCheck } from 'lucide-react';

const CertificateView = ({ courseName, studentName, date, certificateId, verificationUrl, pdfUrl }) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const absolutePdfUrl = pdfUrl?.startsWith('http') ? pdfUrl : `${apiBaseUrl}${pdfUrl || ''}`;
  const absoluteVerificationUrl = verificationUrl?.startsWith('http') ? verificationUrl : `${apiBaseUrl}${verificationUrl || ''}`;
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 8, 
          position: 'relative', 
          border: '20px solid #1e293b',
          background: '#fff',
          color: '#0f172a',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Accent */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -100, 
            right: -100, 
            width: 300, 
            height: 300, 
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            borderRadius: '50%',
            opacity: 0.1
          }} 
        />

        <Box sx={{ mb: 4 }}>
          <Trophy size={80} color="#6366f1" />
        </Box>

        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontFamily: "'Playfair Display', serif", mb: 2 }}>
          Certificate of Completion
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          This is to certify that
        </Typography>

        <Typography variant="h2" fontWeight={800} sx={{ my: 4, color: '#1e293b' }}>
          {studentName}
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          has successfully completed the course
        </Typography>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 6, color: '#6366f1' }}>
          {courseName}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 8 }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" fontWeight={700}>LMS Pro Learning</Typography>
            <Typography variant="body2" color="text.secondary">Issued on {date}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10b981', mb: 1 }}>
              <ShieldCheck size={20} />
              <Typography variant="caption" fontWeight={700}>VERIFIED CONTENT</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">ID: {certificateId}</Typography>
            {verificationUrl && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Verify: {absoluteVerificationUrl}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          className="premium-gradient"
          startIcon={<Download />}
          component="a"
          href={absolutePdfUrl}
        >
          Download PDF
        </Button>
        <Button variant="outlined" startIcon={<Share2 />} component="a" href={absoluteVerificationUrl} target="_blank" rel="noreferrer">
          Verify Certificate
        </Button>
      </Box>
    </Container>
  );
};

export default CertificateView;
