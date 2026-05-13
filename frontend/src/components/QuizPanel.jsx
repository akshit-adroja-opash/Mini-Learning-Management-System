import { useState } from 'react';
import { Card, CardContent, Typography, Box, Radio, RadioGroup, FormControlLabel, Button, Alert, LinearProgress, Chip, Stack } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

const QuizPanel = ({ moduleId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: async () => {
      const { data } = await api.get(`/quizzes/module/${moduleId}`);
      return data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.passed) {
        queryClient.invalidateQueries(['progress-all']);
        if (onComplete) onComplete();
      }
    }
  });

  if (isLoading) return <LinearProgress />;
  if (!quiz) return <Alert severity="info">No quiz available for this module.</Alert>;
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return <Alert severity="warning">This quiz is not ready yet. Please contact the instructor.</Alert>;
  }

  if (result) {
    return (
      <Card className="glass-card" sx={{ textAlign: 'center', p: 4, maxWidth: 560, mx: 'auto' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          {result.passed ? (
            <CheckCircle2 size={64} color="#10b981" />
          ) : (
            <XCircle size={64} color="#ef4444" />
          )}
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {result.passed ? 'Congratulations!' : 'Try Again'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          You scored {result.score}% on this quiz.
        </Typography>
        <Typography variant="body2" sx={{ mb: 4 }}>
          Passing threshold is {quiz.passThreshold}%. {result.passed ? 'You have unlocked the next module.' : 'Review the content and try again.'}
        </Typography>
        <Button 
          variant="contained" 
          className="premium-gradient"
          sx={{ minWidth: 180 }}
          onClick={() => { setResult(null); setCurrentStep(0); setAnswers({}); }}
        >
          {result.passed ? 'View Quiz Again' : 'Retake Quiz'}
        </Button>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentStep];
  if (!currentQuestion?.prompt || !Array.isArray(currentQuestion.options) || currentQuestion.options.length < 2) {
    return <Alert severity="warning">This quiz question is malformed and cannot be answered safely.</Alert>;
  }

  return (
    <Card className="glass-card" sx={{ maxWidth: 720, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
            {quiz.title || 'Module Quiz'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentStep + 1} of {quiz.questions.length}
            </Typography>
            <Chip label={`${quiz.passThreshold}% to pass`} size="small" variant="outlined" />
          </Box>
          <LinearProgress
            variant="determinate"
            value={((currentStep + 1) / quiz.questions.length) * 100}
            sx={{ mt: 2, height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.08)' }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
          {currentQuestion.prompt}
        </Typography>

        <RadioGroup
          value={answers[currentQuestion._id] || ''}
          onChange={(e) => setAnswers({ ...answers, [currentQuestion._id]: e.target.value })}
        >
          <Stack spacing={2}>
            {currentQuestion.options.map((opt, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: answers[currentQuestion._id] === opt._id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 150ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.04)'
                  },
                  cursor: 'pointer'
                }}
              >
                <FormControlLabel
                  value={opt._id}
                  control={<Radio />}
                  label={opt.text}
                  sx={{ width: '100%', m: 0, '& .MuiFormControlLabel-label': { fontWeight: 500, color: 'inherit' } }}
                />
              </Box>
            ))}
          </Stack>
        </RadioGroup>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            sx={{ minWidth: 140 }}
          >
            Previous
          </Button>
          {currentStep < quiz.questions.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!answers[currentQuestion._id]}
              sx={{ minWidth: 180 }}
            >
              Next Question
            </Button>
          ) : (
            <Button 
              variant="contained" 
              className="premium-gradient"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !answers[currentQuestion._id]}
              sx={{ minWidth: 180 }}
            >
              Submit Quiz
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizPanel;
