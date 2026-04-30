import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, IconButton } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Send, ThumbsUp, MessageSquare, Pin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DiscussionThread = ({ lessonId }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['discussions', lessonId],
    queryFn: async () => {
      const { data } = await api.get(`/discussions/${lessonId}`);
      return data;
    }
  });

  const postMutation = useMutation({
    mutationFn: async (text) => {
      const { data } = await api.post(`/discussions/${lessonId}`, { text });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions', lessonId]);
      setNewComment('');
    }
  });

  const handlePost = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postMutation.mutate(newComment);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MessageSquare size={20} /> Discussions
      </Typography>

      <Paper className="glass-card" sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{user.name.charAt(0)}</Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="What's on your mind? Ask a question or share an insight..."
              variant="outlined"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                className="premium-gradient" 
                endIcon={<Send size={16} />}
                onClick={handlePost}
                disabled={postMutation.isPending || !newComment.trim()}
              >
                Post Comment
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <Typography variant="body2" color="text.secondary">Loading comments...</Typography>
      ) : (
        <List sx={{ width: '100%' }}>
          {comments?.map((comment, index) => (
            <React.Fragment key={comment._id}>
              <ListItem alignItems="flex-start" sx={{ px: 0, py: 3 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: comment.user?.role === 'instructor' ? 'secondary.main' : 'grey.700' }}>
                    {comment.user?.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{comment.user?.name}</Typography>
                      {comment.user?.role === 'instructor' && (
                        <Typography variant="caption" sx={{ bgcolor: 'secondary.main', color: 'white', px: 1, borderRadius: 1 }}>Instructor</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">• {new Date(comment.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                        {comment.text}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <IconButton size="small" sx={{ gap: 0.5 }}>
                          <ThumbsUp size={14} /> <Typography variant="caption">Helpful</Typography>
                        </IconButton>
                        {comment.user?.role === 'instructor' && (
                          <IconButton size="small" sx={{ gap: 0.5 }}>
                            <Pin size={14} /> <Typography variant="caption">Pin</Typography>
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < comments.length - 1 && <Divider variant="inset" component="li" sx={{ opacity: 0.1 }} />}
            </React.Fragment>
          ))}
          {comments?.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body2" color="text.secondary">No comments yet. Be the first to start the discussion!</Typography>
            </Box>
          )}
        </List>
      )}
    </Box>
  );
};

export default DiscussionThread;
