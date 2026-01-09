import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material"; // You might need to install icons if not present, but let's try standard Avatar first or text.

import Dashboard from "./pages/Dashboard";
import SinglePredict from "./pages/SinglePredict";
import BatchUpload from "./pages/BatchUpload";
import History from "./pages/History";
import ReportPage from "./pages/ReportPage";
// import Login from "./pages/Login";
import ProfileDialog from "./components/ProfileDialog";
import { AuthProvider, useAuth } from "./context/AuthContext";

const drawerWidth = 260;

// function ProtectedRoute({ children }) {
//   const { token, loading } = useAuth();
//   const location = useLocation();

//   if (loading) return <div>Loading...</div>;
//   if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

//   return children;
// }

function ProtectedRoute({ children }) {
  // Authentication bypassed as requested
  return children;
}

function MainLayout() {
  const [dark, setDark] = useState(false);
  const { logout, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleOpenProfile = () => setProfileOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);

  const handleLogout = () => {
    handleCloseProfile();
    logout();
  };

  const theme = createTheme({
    typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
    palette: {
      mode: dark ? "dark" : "light",
      primary: { main: "#2979FF" },
      secondary: { main: "#ef5350" },
      background: {
        default: dark ? "#121212" : "#f5f7fa"
      }
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: 2000 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              Customer Churn Platform
            </Typography>

            {/* Dark Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="caption" sx={{ mr: 1 }}>{dark ? "Dark" : "Light"}</Typography>
              <Switch checked={dark} onChange={() => setDark(!dark)} color="default" />
            </Box>

            {/* Profile Menu */}
            <div>
              <IconButton
                size="large"
                onClick={handleOpenProfile}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>

              <ProfileDialog
                open={profileOpen}
                onClose={handleCloseProfile}
                user={user}
                onLogout={handleLogout}
              />
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 1 }}>
            <List>
              <ListItemButton component={Link} to="/dashboard">
                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 'medium' }} />
              </ListItemButton>

              <ListItemButton component={Link} to="/predict">
                <ListItemText primary="Single Prediction" primaryTypographyProps={{ fontWeight: 'medium' }} />
              </ListItemButton>

              <ListItemButton component={Link} to="/batch">
                <ListItemText primary="Batch Upload" primaryTypographyProps={{ fontWeight: 'medium' }} />
              </ListItemButton>

              <ListItemButton component={Link} to="/history">
                <ListItemText primary="Prediction History" primaryTypographyProps={{ fontWeight: 'medium' }} />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8, maxWidth: "1600px", marginX: "auto" }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<SinglePredict />} />
            <Route path="/batch" element={<BatchUpload />} />
            <Route path="/history" element={<History />} />
            <Route path="/report/:customer_id" element={<ReportPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
