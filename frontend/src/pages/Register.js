import React, { useState } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff, Bolt, Email, Person, VpnKey } from "@mui/icons-material";
import api from "../services/api";

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", otp: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setActiveStep(1);
      setSuccess("OTP sent to your email. Please verify.");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        code: formData.otp
      });
      setSuccess("Account verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP");
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
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Paper 
          className="glass-card"
          sx={{ 
            p: 4, 
            width: 400, 
            bgcolor: 'rgba(17, 24, 39, 0.8)',
            textAlign: 'center'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              width: 48, height: 48, 
              background: 'linear-gradient(45deg, #00F5FF, #7B61FF)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Bolt sx={{ color: '#0A0A0F', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>CREATE IDENTITY</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>Join the next-gen telecom analytics suite</Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step><StepLabel></StepLabel></Step>
            <Step><StepLabel></StepLabel></Step>
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

          {activeStep === 0 ? (
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Username"
                margin="normal"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person sx={{ color: '#00F5FF' }} /></InputAdornment>
                }}
              />
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email sx={{ color: '#00F5FF' }} /></InputAdornment>
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: '#00F5FF' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}><Visibility /></IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                sx={{ mt: 3, py: 1.5, fontWeight: 700, borderRadius: '12px' }}
              >
                {loading ? <CircularProgress size={24} /> : "GET ACCESS CODE"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <Typography variant="body2" sx={{ mb: 3, color: '#94A3B8' }}>
                We've emitted an access code to <b>{formData.email}</b>. Enter it below to verify your node.
              </Typography>
              <TextField
                fullWidth
                label="Access Code (OTP)"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                sx={{ mb: 3 }}
              />
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px' }}
              >
                {loading ? <CircularProgress size={24} /> : "VERIFY IDENTITY"}
              </Button>
              <Button 
                fullWidth 
                variant="text" 
                onClick={() => setActiveStep(0)}
                sx={{ mt: 1, color: '#94A3B8' }}
              >
                Wrong email? Go back
              </Button>
            </form>
          )}

          <Typography sx={{ mt: 3, fontSize: '14px', color: '#94A3B8' }}>
            Existing Node? <Link component={RouterLink} to="/login" sx={{ color: '#00F5FF', fontWeight: 700 }}>LOGIN</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
