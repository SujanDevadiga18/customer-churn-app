import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  ListItemIcon
} from "@mui/material";
import { 
  Dashboard as DashboardIcon, 
  Bolt, 
  History as HistoryIcon, 
  Analytics, 
  FileUpload,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

import Dashboard from "./pages/Dashboard";
import SinglePredict from "./pages/SinglePredict";
import BatchUpload from "./pages/BatchUpload";
import History from "./pages/History";
import ReportPage from "./pages/ReportPage.jsx";

const drawerWidth = 260;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00F5FF' },
    secondary: { main: '#7B61FF' },
    background: {
      default: '#0A0A0F',
      paper: '#111827',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
    }
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    subtitle1: { color: '#94A3B8' }
  },
  shape: { borderRadius: 16 }
});

function MainLayout() {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0A0A0F" }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 32, height: 32, 
              background: 'linear-gradient(45deg, #00F5FF, #7B61FF)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bolt sx={{ color: '#0A0A0F', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Churn<span style={{ color: '#00F5FF' }}>IQ</span>
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: "border-box",
            bgcolor: '#0A0A0F',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            pt: 10
          },
        }}
      >
        <List sx={{ px: 2 }}>
          {[
            { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
            { text: "Single Prediction", icon: <Analytics />, path: "/predict" },
            { text: "Batch Upload", icon: <FileUpload />, path: "/batch" },
            { text: "Prediction History", icon: <HistoryIcon />, path: "/history" },
          ].map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '12px',
                mb: 1,
                color: location.pathname === item.path ? '#00F5FF' : '#94A3B8',
                bgcolor: location.pathname === item.path ? 'rgba(0, 245, 255, 0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' },
                '&.Mui-selected': { 
                  bgcolor: 'rgba(0, 245, 255, 0.08)',
                  '&:hover': { bgcolor: 'rgba(0, 245, 255, 0.12)' }
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, pt: 12, minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/predict" element={<SinglePredict />} />
              <Route path="/batch" element={<BatchUpload />} />
              <Route path="/history" element={<History />} />
              <Route path="/report/:customer_id" element={<ReportPage />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
