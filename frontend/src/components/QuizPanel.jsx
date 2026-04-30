import { useState } from 'react';
import { Card, CardContent, Typography, Box, Radio, RadioGroup, FormControlLabel, Button, Alert, LinearProgress, Chip } from '@mui/material';
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
      <Card className="glass-card" sx={{ textAlign: 'center', p: 4 }}>
        <Box sx={{ mb: 3 }}>
          {result.passed ? (
            <CheckCircle2 size={64} color="#10b981" />
          ) : (
            <XCircle size={64} color="#ef4444" />
          )}
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {result.passed ? 'Congratulations!' : 'Try Again'}
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Your Score: {result.score}% (Pass threshold: {quiz.passThreshold}%)
        </Typography>
        <Button 
          variant="contained" 
          className="premium-gradient"
          onClick={() => { setResult(null); setCurrentStep(0); setAnswers({}); }}
        >
          {result.passed ? 'Review Results' : 'Retake Quiz'}
        </Button>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentStep];
  if (!currentQuestion?.prompt || !Array.isArray(currentQuestion.options) || currentQuestion.options.length < 2) {
    return <Alert severity="warning">This quiz question is malformed and cannot be answered safely.</Alert>;
  }

  return (
    <Card className="glass-card">
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
            Question {currentStep + 1} of {quiz.questions.length}
          </Typography>
          <Chip label={`${quiz.passThreshold}% to pass`} size="small" variant="outlined" />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
          {currentQuestion.prompt}
        </Typography>

        <RadioGroup
          value={answers[currentQuestion._id] || ''}
          onChange={(e) => setAnswers({ ...answers, [currentQuestion._id]: e.target.value })}
        >
          {currentQuestion.options.map((opt, idx) => (
            <FormControlLabel
              key={idx}
              value={opt._id}
              control={<Radio />}
              label={opt.text}
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                border: '1px solid rgba(255,255,255,0.05)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
              }}
            />
          ))}
        </RadioGroup>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            Previous
          </Button>
          {currentStep < quiz.questions.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!answers[currentQuestion._id]}
            >
              Next Question
            </Button>
          ) : (
            <Button 
              variant="contained" 
              className="premium-gradient"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !answers[currentQuestion._id]}
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
