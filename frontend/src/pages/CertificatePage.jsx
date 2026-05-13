// Updated Certificate Page
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { Trophy } from 'lucide-react';
import CertificateList from '../components/CertificateList';

const CertificatePage = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const claimCourseId = searchParams.get('claim') || courseId;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
        <Box className="premium-gradient" sx={{ p: 1.5, borderRadius: 2, display: 'flex' }}>
          <Trophy color="white" size={28} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>My Certificates</Typography>
          <Typography variant="body1" color="text.secondary">
            Completed courses appear here with downloadable certificates.
          </Typography>
        </Box>
      </Box>

      <CertificateList claimCourseId={claimCourseId} />
    </Container>
  );
};

export default CertificatePage;
