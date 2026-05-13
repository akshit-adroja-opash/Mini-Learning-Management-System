import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Card, CardContent, Stack, InputAdornment, IconButton } from '@mui/material';
import { User, Mail, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.msg) setStatus({ type: '', msg: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'error', msg: 'Passwords do not match' });
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) updateData.password = formData.password;

      await updateProfile(updateData);
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.msg || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card className="glass-card">
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>Profile Settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Update your personal information and security settings.
          </Typography>

          {status.msg && (
            <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
              {status.msg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color="gray" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="gray" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                  Change Password (optional)
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} color="gray" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} color="gray" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Box>

              <Button
                type="submit"
                variant="contained"
                className="premium-gradient"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<Save size={20} />}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mt: 2 }}
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileSettings;
