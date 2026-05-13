import { useState } from 'react';
import { Box, Typography, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, Card, CardContent, Chip, Radio, Alert, Collapse } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Trash2, Edit2, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const emptyQuestion = () => ({ prompt: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }], points: 1 });

const QuizManager = ({ moduleId, courseId, moduleTitle }) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', passThreshold: 70 });
  const [questionForm, setQuestionForm] = useState(emptyQuestion());
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [error, setError] = useState('');

  const { data: quizData } = useQuery({
    queryKey: ['quiz-manage', moduleId],
    queryFn: async () => {
      const { data } = await api.get(`/quizzes/module/${moduleId}`);
      if (data && data._id) {
        const { data: qs } = await api.get(`/quizzes/${data._id}/questions`);
        return { ...data, questions: qs };
      }
      return data; 
    }
  });

  const createQuiz = useMutation({
    mutationFn: (d) => api.post('/quizzes', { ...d, module: moduleId, course: courseId }),
    onSuccess: () => { queryClient.invalidateQueries(['quiz-manage', moduleId]); setOpenQuizDialog(false); }
  });

  const updateQuiz = useMutation({
    mutationFn: (d) => api.put(`/quizzes/${quizData._id}`, d),
    onSuccess: () => { queryClient.invalidateQueries(['quiz-manage', moduleId]); setOpenQuizDialog(false); }
  });

  const deleteQuiz = useMutation({
    mutationFn: () => api.delete(`/quizzes/${quizData._id}`),
    onSuccess: () => queryClient.invalidateQueries(['quiz-manage', moduleId])
  });

  const addQuestion = useMutation({
    mutationFn: (d) => api.post(`/quizzes/${quizData._id}/questions`, d),
    onSuccess: () => { queryClient.invalidateQueries(['quiz-manage', moduleId]); closeQuestionDialog(); }
  });

  const updateQuestion = useMutation({
    mutationFn: ({ qid, data }) => api.put(`/quizzes/questions/${qid}`, data),
    onSuccess: () => { queryClient.invalidateQueries(['quiz-manage', moduleId]); closeQuestionDialog(); }
  });

  const deleteQuestion = useMutation({
    mutationFn: (qid) => api.delete(`/quizzes/questions/${qid}`),
    onSuccess: () => queryClient.invalidateQueries(['quiz-manage', moduleId])
  });

  const closeQuestionDialog = () => { setOpenQuestionDialog(false); setEditingQuestionId(null); setQuestionForm(emptyQuestion()); setError(''); };

  const handleOptionChange = (idx, field, value) => {
    const opts = [...questionForm.options];
    if (field === 'isCorrect') {
      opts.forEach((o, i) => { o.isCorrect = i === idx; });
    } else {
      opts[idx] = { ...opts[idx], [field]: value };
    }
    setQuestionForm({ ...questionForm, options: opts });
  };

  const addOption = () => setQuestionForm({ ...questionForm, options: [...questionForm.options, { text: '', isCorrect: false }] });
  const removeOption = (idx) => {
    if (questionForm.options.length <= 2) return;
    const opts = questionForm.options.filter((_, i) => i !== idx);
    if (!opts.some(o => o.isCorrect)) opts[0].isCorrect = true;
    setQuestionForm({ ...questionForm, options: opts });
  };

  const saveQuestion = () => {
    if (!questionForm.prompt.trim()) { setError('Question prompt is required'); return; }
    if (questionForm.options.some(o => !o.text.trim())) { setError('All options must have text'); return; }
    if (!questionForm.options.some(o => o.isCorrect)) { setError('Select a correct answer'); return; }
    setError('');
    if (editingQuestionId) {
      updateQuestion.mutate({ qid: editingQuestionId, data: questionForm });
    } else {
      addQuestion.mutate(questionForm);
    }
  };

  const hasQuiz = quizData && quizData._id;
  const questions = hasQuiz ? (quizData.questions || []) : [];

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }} onClick={() => setExpanded(!expanded)}>
        <HelpCircle size={16} color="#a78bfa" />
        <Typography variant="body2" fontWeight={600} color="primary.light" sx={{ flex: 1 }}>
          Quiz {hasQuiz ? `· ${questions.length} question${questions.length !== 1 ? 's' : ''}` : '· Not created'}
        </Typography>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pl: 2, pt: 1 }}>
          {!hasQuiz ? (
            <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={() => {
              setQuizForm({ title: `${moduleTitle} Quiz`, passThreshold: 70 });
              setOpenQuizDialog(true);
            }}>Create Quiz</Button>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{quizData.title}</Typography>
                <Chip label={`Pass: ${quizData.passThreshold}%`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                <IconButton size="small" onClick={() => { setQuizForm({ title: quizData.title, passThreshold: quizData.passThreshold }); setOpenQuizDialog(true); }}><Edit2 size={14} /></IconButton>
                <IconButton size="small" color="error" onClick={() => { if (window.confirm('Delete this quiz and all its questions?')) deleteQuiz.mutate(); }}><Trash2 size={14} /></IconButton>
              </Box>

              {questions.map((q, i) => (
                <Card key={q._id} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Q{i + 1}. {q.prompt}</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {q.options?.map((opt, oi) => (
                            <Box key={oi} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {opt.isCorrect && <CheckCircle size={12} color="#10b981" />}
                              <Typography variant="caption" color={opt.isCorrect ? 'success.main' : 'text.secondary'}>{opt.text}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => {
                          setEditingQuestionId(q._id);
                          setQuestionForm({ prompt: q.prompt, options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })), points: q.points || 1 });
                          setOpenQuestionDialog(true);
                        }}><Edit2 size={14} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => { if (window.confirm('Delete this question?')) deleteQuestion.mutate(q._id); }}><Trash2 size={14} /></IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              <Button size="small" startIcon={<Plus size={14} />} onClick={() => { setEditingQuestionId(null); setQuestionForm(emptyQuestion()); setOpenQuestionDialog(true); }} sx={{ mt: 0.5 }}>
                Add Question
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Quiz Settings Dialog */}
      <Dialog open={openQuizDialog} onClose={() => setOpenQuizDialog(false)} maxWidth="xs" fullWidth slotProps={{ paper: { className: 'glass-card', sx: { bgcolor: '#1e293b' } } }}>
        <DialogTitle fontWeight={800}>{hasQuiz ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Quiz Title" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} />
            <TextField fullWidth type="number" label="Pass Threshold (%)" value={quizForm.passThreshold} onChange={e => setQuizForm({ ...quizForm, passThreshold: Number(e.target.value) })} inputProps={{ min: 0, max: 100 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpenQuizDialog(false)}>Cancel</Button>
              <Button variant="contained" className="premium-gradient" onClick={() => {
                if (hasQuiz) updateQuiz.mutate(quizForm);
                else createQuiz.mutate(quizForm);
              }}>{hasQuiz ? 'Save' : 'Create'}</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={openQuestionDialog} onClose={closeQuestionDialog} maxWidth="sm" fullWidth slotProps={{ paper: { className: 'glass-card', sx: { bgcolor: '#1e293b' } } }}>
        <DialogTitle fontWeight={800}>{editingQuestionId ? 'Edit Question' : 'Add Question'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
            <TextField fullWidth label="Question Prompt" multiline rows={2} value={questionForm.prompt} onChange={e => setQuestionForm({ ...questionForm, prompt: e.target.value })} />
            <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Options (select the correct answer)</Typography>
            {questionForm.options.map((opt, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Radio checked={opt.isCorrect} onChange={() => handleOptionChange(idx, 'isCorrect', true)} size="small" />
                <TextField fullWidth size="small" label={`Option ${idx + 1}`} value={opt.text} onChange={e => handleOptionChange(idx, 'text', e.target.value)} />
                {questionForm.options.length > 2 && (
                  <IconButton size="small" color="error" onClick={() => removeOption(idx)}><Trash2 size={14} /></IconButton>
                )}
              </Box>
            ))}
            <Button size="small" startIcon={<Plus size={14} />} onClick={addOption}>Add Option</Button>
            <TextField type="number" label="Points" value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} inputProps={{ min: 1 }} sx={{ width: 120 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={closeQuestionDialog}>Cancel</Button>
              <Button variant="contained" className="premium-gradient" onClick={saveQuestion}>{editingQuestionId ? 'Save' : 'Add'}</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default QuizManager;
