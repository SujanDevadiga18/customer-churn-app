import React, { useState } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Visibility, Bolt, Person, VpnKey } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Access Denied: Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #111827 0%, #0A0A0F 100%)'
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Paper 
          className="glass-card"
          sx={{ 
            p: 5, 
            width: 420, 
            bgcolor: 'rgba(17, 24, 39, 0.8)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Glow */}
          <Box sx={{ 
            position: 'absolute', top: -100, left: -100, 
            width: 200, height: 200, 
            background: 'radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)' 
          }} />

          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              width: 56, height: 56, 
              background: 'linear-gradient(45deg, #00F5FF, #7B61FF)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)'
            }}>
              <Bolt sx={{ color: '#0A0A0F', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1px' }}>INITIALIZE</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>Identify yourself to access ChurnOS Core</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(211, 47, 47, 0.1)' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username / Email"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person sx={{ color: '#00F5FF' }} /></InputAdornment>
              }}
            />
            <TextField
              fullWidth
              label="Access Secret"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: '#00F5FF' }} /></InputAdornment>,
              }}
            />
            <Button 
              fullWidth 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={loading}
              sx={{ 
                mt: 4, py: 2, 
                fontWeight: 800, 
                borderRadius: '14px',
                background: 'linear-gradient(90deg, #00F5FF, #7B61FF)',
                '&:hover': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)' }
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : "START SESSION"}
            </Button>
          </form>

          <Typography sx={{ mt: 4, fontSize: '14px', color: '#94A3B8' }}>
            New NODE? <Link component={RouterLink} to="/register" sx={{ color: '#00F5FF', fontWeight: 700, textDecoration: 'none' }}>REGISTER ACCOUNT</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
