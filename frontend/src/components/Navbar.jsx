import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, BookOpen, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 70 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 800,
              fontSize: '1.4rem'
            }}
          >
            <Box className="premium-gradient" sx={{ p: 1, borderRadius: 2, display: 'flex' }}>
              <GraduationCap color="white" size={24} />
            </Box>
            LMS <span style={{ color: '#6366f1' }}>Pro</span>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button component={Link} to="/courses" color="inherit" startIcon={<BookOpen size={18} />}>
              Catalog
            </Button>

            {!user ? (
              <>
                <Button component={Link} to="/login" variant="text" color="inherit">Login</Button>
                <Button component={Link} to="/register" variant="contained" className="premium-gradient">Get Started</Button>
              </>
            ) : (
              <>
                {user.role === 'admin' && (
                  <Button component={Link} to="/admin" color="inherit" startIcon={<ShieldCheck size={18} />}>
                    Admin
                  </Button>
                )}
                <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 35, height: 35, bgcolor: 'primary.main' }}>
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  slotProps={{
                    paper: {
                      sx: { mt: 1, minWidth: 150, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  }}
                >
                  <MenuItem disabled sx={{ opacity: 0.7 }}>
                    <Typography variant="body2">{user?.email}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                    <User size={16} style={{ marginRight: 10 }} /> Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogOut size={16} style={{ marginRight: 10 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
