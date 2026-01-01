import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Container
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    PersonAdd,
    Email as EmailIcon,
    Lock as LockIcon
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isRegister) {
                await register(username, email, password);
                alert("Registration successful! Please login.");
                setIsRegister(false);
                setEmail("");
            } else {
                await login(username, password);
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Action failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError("");
        setUsername("");
        setEmail("");
        setPassword("");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(rgba(240, 244, 248, 0.8), rgba(240, 244, 248, 0.8)), url("/login_bg.png")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                p: 2
            }}
        >
            <Container maxWidth="xs">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* CHURN HEADERING */}
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Typography
                            variant="h2"
                            fontWeight="900"
                            sx={{
                                letterSpacing: "-2px",
                                color: "primary.main",
                                textTransform: "uppercase",
                                display: "inline-block",
                                borderBottom: "4px solid",
                                borderColor: "error.main",
                                lineHeight: 1
                            }}
                        >
                            CHURN
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight="500"
                            color="text.secondary"
                            sx={{ letterSpacing: "4px", mt: 1, textTransform: "uppercase" }}
                        >
                            Intelligence Hub
                        </Typography>
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                            textAlign: "center"
                        }}
                    >
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" fontWeight="700" color="text.primary">
                                {isRegister ? "Create Account" : "Welcome Back"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {isRegister ? "Start monitoring your customer health" : "Sign in to your dashboard"}
                            </Typography>
                        </Box>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isRegister ? "register" : "login"}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {error && (
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {isRegister && (
                                        <TextField
                                            label="Email Address"
                                            type="email"
                                            fullWidth
                                            variant="outlined"
                                            margin="normal"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <EmailIcon fontSize="small" color="action" />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: 3, bgcolor: "rgba(255,255,255,0.5)" }
                                                }
                                            }}
                                        />
                                    )}
                                    <TextField
                                        label="Username or Email"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                                sx: { borderRadius: 3, bgcolor: "rgba(255,255,255,0.5)" }
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                sx: { borderRadius: 3, bgcolor: "rgba(255,255,255,0.5)" }
                                            }
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            mt: 4,
                                            py: 1.8,
                                            borderRadius: 3,
                                            fontWeight: "800",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            boxShadow: "0 10px 20px rgba(41, 121, 255, 0.2)"
                                        }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : isRegister ? (
                                            "Sign Up Now"
                                        ) : (
                                            "Login to Hub"
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </AnimatePresence>

                        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                            <Typography variant="body2" color="text.secondary">
                                {isRegister ? "Already part of the network?" : "New to the platform?"}
                                <Button
                                    onClick={toggleMode}
                                    sx={{
                                        ml: 1,
                                        fontWeight: "700",
                                        textTransform: "none",
                                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                                    }}
                                >
                                    {isRegister ? "Sign In" : "Register Here"}
                                </Button>
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
}
