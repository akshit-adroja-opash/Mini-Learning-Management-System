import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Award, Download, ExternalLink, Trophy } from 'lucide-react';
import api, { apiBaseUrl, fallbackCourseImage, mediaUrl } from '../services/api';

const formatDate = (value) => {
  if (!value) return 'Recently completed';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const absoluteUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
};

const CertificatePage = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const claimCourseId = searchParams.get('claim') || courseId;
  const queryClient = useQueryClient();
  const autoClaimedRef = useRef(null);

  const { data: completedCourses = [], isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const { data } = await api.get('/certificates/me');
      return data;
    },
  });

  const certificateMutation = useMutation({
    mutationFn: async (targetCourseId) => {
      const { data } = await api.post(`/certificates/${targetCourseId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-certificates'] });
    },
  });

  const claimTarget = useMemo(
    () => completedCourses.find((item) => item.course?._id === claimCourseId),
    [claimCourseId, completedCourses]
  );

  useEffect(() => {
    if (!claimCourseId || isLoading || claimTarget?.certificate) return;
    if (autoClaimedRef.current === claimCourseId) return;

    autoClaimedRef.current = claimCourseId;
    certificateMutation.mutate(claimCourseId);
  }, [certificateMutation, claimCourseId, claimTarget, isLoading]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {certificateMutation.error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {certificateMutation.error.response?.data?.msg || 'Unable to issue certificate right now.'}
        </Alert>
      )}

      {completedCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12 }} className="glass-card">
          <Award size={64} style={{ opacity: 0.25, marginBottom: 18 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Complete a course to unlock your first certificate.
          </Typography>
          <Button component={Link} to="/courses" variant="contained" className="premium-gradient" sx={{ mt: 2 }}>
            Browse Courses
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {completedCourses.map((item) => {
            const course = item.course;
            const certificate = item.certificate;
            const isClaiming = certificateMutation.isPending && certificateMutation.variables === course._id;
            const pdfUrl = absoluteUrl(certificate?.pdfUrl);
            const verifyUrl = absoluteUrl(certificate?.verificationUrl);

            return (
              <Grid xs={12} md={6} key={course._id}>
                <Card className="glass-card" sx={{ height: '100%', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={mediaUrl(course.thumbnailUrl) || fallbackCourseImage}
                    alt={course.title}
                    sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      <Chip label="Completed" color="success" size="small" />
                      {certificate ? (
                        <Chip label="Certificate issued" color="primary" size="small" />
                      ) : (
                        <Chip label="Ready to claim" variant="outlined" size="small" />
                      )}
                    </Stack>

                    <Typography variant="h6" fontWeight={800} gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Completed on {formatDate(item.completedAt)}
                    </Typography>

                    {certificate && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Certificate ID: {certificate.certificateId}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {certificate ? (
                        <>
                          <Button
                            variant="contained"
                            className="premium-gradient"
                            startIcon={<Download size={18} />}
                            component="a"
                            href={pdfUrl}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ExternalLink size={18} />}
                            component="a"
                            href={verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Verify
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<Award size={18} />}
                          onClick={() => certificateMutation.mutate(course._id)}
                          disabled={isClaiming}
                        >
                          {isClaiming ? 'Issuing...' : 'Claim Certificate'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default CertificatePage;
