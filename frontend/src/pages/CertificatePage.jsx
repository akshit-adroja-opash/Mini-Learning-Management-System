import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CertificateView from '../components/CertificateView';
import { Alert, Button, CircularProgress, Box, Typography } from '@mui/material';

const CertificatePage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();

  const { data: enrollment, isLoading: enrollLoading } = useQuery({
    queryKey: ['enrollment-cert', courseId],
    queryFn: async () => {
      const { data } = await api.get(`/enrollments/course/${courseId}`);
      return data;
    }
  });

  const certificateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/certificates/${courseId}`);
      return data;
    },
  });

  if (enrollLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
      <CircularProgress />
    </Box>
  );

  if (!enrollment || enrollment.progressPercent < 100) {
    return (
      <Box sx={{ textAlign: 'center', py: 20 }}>
        <Typography variant="h5" color="text.secondary">You must complete all lessons to earn your certificate.</Typography>
        <Button component={Link} to={`/learning/${courseId}/resume`} sx={{ mt: 3 }}>Continue Learning</Button>
      </Box>
    );
  }

  if (!certificateMutation.data) {
    return (
      <Box sx={{ textAlign: 'center', py: 20 }}>
        {certificateMutation.error && (
          <Alert severity="error" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
            {certificateMutation.error.response?.data?.msg || 'Unable to issue certificate right now.'}
          </Alert>
        )}
        <Typography variant="h5" sx={{ mb: 3 }}>Your course is complete. Claim your signed certificate.</Typography>
        <Button
          variant="contained"
          onClick={() => certificateMutation.mutate()}
          disabled={certificateMutation.isPending}
        >
          {certificateMutation.isPending ? 'Issuing Certificate...' : 'Claim Certificate'}
        </Button>
      </Box>
    );
  }

  return (
    <CertificateView 
      courseName={enrollment.course.title}
      studentName={user.name}
      date={new Date(certificateMutation.data.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      certificateId={certificateMutation.data.certificateId}
      verificationUrl={certificateMutation.data.verificationUrl}
      pdfUrl={certificateMutation.data.pdfUrl}
    />
  );
};

export default CertificatePage;
