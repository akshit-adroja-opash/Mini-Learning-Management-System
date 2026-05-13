import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Award, Download } from 'lucide-react';
import api, { apiBaseUrl, fallbackCourseImage, mediaUrl } from '../services/api';
import { useMemo, useRef, useEffect } from 'react';

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

const CertificateList = ({ claimCourseId }) => {
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
  }, [claimCourseId, claimTarget, isLoading, certificateMutation]);

  if (isLoading) return <Typography color="text.secondary">Loading certificates...</Typography>;

  if (completedCourses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Award size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
        <Typography color="text.secondary">Complete courses to earn certificates!</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {completedCourses.map((item) => {
        const course = item.course;
        const certificate = item.certificate;
        const isClaiming = certificateMutation.isPending && certificateMutation.variables === course._id;
        const pdfUrl = absoluteUrl(certificate?.pdfUrl);

        return (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card className="glass-card" sx={{ height: '100%', overflow: 'hidden' }}>
              <Box
                component="img"
                src={mediaUrl(course.thumbnailUrl) || fallbackCourseImage}
                alt={course.title}
                sx={{ width: '100%', height: 160, objectFit: 'cover' }}
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

                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Completed on {formatDate(item.completedAt)}
                </Typography>

                {/* {certificate && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontSize: '0.65rem' }}>
                    ID: {certificate.certificateId}
                  </Typography>
                )} */}

                <Box sx={{ mt: 2 }}>
                  {certificate ? (
                    <Button
                      fullWidth
                      variant="contained"
                      className="premium-gradient"
                      size="small"
                      startIcon={<Download size={14} />}
                      component="a"
                      href={pdfUrl}
                    >
                      Download
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<Award size={14} />}
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
  );
};

export default CertificateList;
