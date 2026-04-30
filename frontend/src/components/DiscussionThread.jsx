import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, IconButton } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Send, ThumbsUp, MessageSquare, Pin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DiscussionThread = ({ lessonId }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['discussions', lessonId],
    queryFn: async () => {
      const { data } = await api.get(`/discussions/${lessonId}`);
      return data;
    }
  });

  const postMutation = useMutation({
    mutationFn: async ({ text, parentId }) => {
      const { data } = await api.post(`/discussions/${lessonId}`, { text, parent: parentId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions', lessonId]);
      setNewComment('');
      setReplyTo(null);
      setReplyText('');
    }
  });

  const pinMutation = useMutation({
    mutationFn: async (commentId) => api.put(`/discussions/${commentId}/pin`),
    onSuccess: () => queryClient.invalidateQueries(['discussions', lessonId])
  });

  const handlePost = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postMutation.mutate({ text: newComment });
  };

  const handleReply = (parentId) => {
    if (!replyText.trim()) return;
    postMutation.mutate({ text: replyText, parentId });
  };

  // Organize comments into threads
  const rootComments = comments?.filter(c => !c.parent) || [];
  const replies = comments?.filter(c => c.parent) || [];

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
          {rootComments.map((comment, index) => (
            <React.Fragment key={comment._id}>
              <ListItem alignItems="flex-start" sx={{ px: 0, py: 3, position: 'relative' }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: comment.user?.role === 'instructor' ? 'secondary.main' : 'grey.700' }}>
                    {comment.author?.name?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{comment.author?.name}</Typography>
                      {comment.author?.role === 'instructor' && (
                        <Typography variant="caption" sx={{ bgcolor: 'secondary.main', color: 'white', px: 1, borderRadius: 1 }}>Instructor</Typography>
                      )}
                      {comment.isPinned && <Pin size={12} color="#fbbf24" fill="#fbbf24" />}
                      <Typography variant="caption" color="text.secondary">• {new Date(comment.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.primary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {comment.body}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button size="small" startIcon={<MessageSquare size={14} />} sx={{ color: 'text.secondary', textTransform: 'none' }} onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}>
                          Reply
                        </Button>
                        {(user.role === 'instructor' || user.role === 'admin') && (
                          <IconButton size="small" onClick={() => pinMutation.mutate(comment._id)} color={comment.isPinned ? "warning" : "default"}>
                            <Pin size={14} />
                          </IconButton>
                        )}
                      </Box>

                      {replyTo === comment._id && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <TextField 
                            fullWidth 
                            size="small" 
                            placeholder="Write a reply..." 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)} 
                          />
                          <Button variant="contained" size="small" onClick={() => handleReply(comment._id)} disabled={!replyText.trim()}>Reply</Button>
                        </Box>
                      )}

                      {/* Replies */}
                      <List sx={{ pl: 4, mt: 1 }}>
                        {replies.filter(r => r.parent === comment._id).map(reply => (
                          <ListItem key={reply._id} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: reply.author?.role === 'instructor' ? 'secondary.main' : 'grey.800' }}>
                                {reply.author?.name?.charAt(0) || '?'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" fontWeight={700}>{reply.author?.name}</Typography>
                                  {reply.author?.role === 'instructor' && (
                                    <Typography variant="caption" sx={{ fontSize: '0.6rem', bgcolor: 'secondary.main', color: 'white', px: 0.5, borderRadius: 0.5 }}>Instructor</Typography>
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.85rem' }}>{reply.body}</Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  }
                />
              </ListItem>
              {index < rootComments.length - 1 && <Divider variant="inset" component="li" sx={{ opacity: 0.1 }} />}
            </React.Fragment>
          ))}
          {rootComments.length === 0 && (
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
