import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
} from "@mui/material";

import Dashboard from "./pages/Dashboard";
import SinglePredict from "./pages/SinglePredict";
import BatchUpload from "./pages/BatchUpload";
import History from "./pages/History";

const drawerWidth = 260;

export default function App() {
  const [dark, setDark] = useState(false);

  const theme = createTheme({
    typography: { fontFamily: "Inter, Roboto, Arial" },
    palette: {
      mode: dark ? "dark" : "light",
      primary: { main: "#1e88e5" },
      secondary: { main: "#ef5350" },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <AppBar position="fixed" sx={{ zIndex: 2000 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Customer Churn Platform
            </Typography>

            <Typography sx={{ mr: 1 }}>Dark</Typography>
            <Switch checked={dark} onChange={() => setDark(!dark)} />
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <Toolbar />
          <List>
            <ListItemButton component={Link} to="/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            <ListItemButton component={Link} to="/predict">
              <ListItemText primary="Single Prediction" />
            </ListItemButton>

            <ListItemButton component={Link} to="/batch">
              <ListItemText primary="Batch Upload" />
            </ListItemButton>

            <ListItemButton component={Link} to="/history">
              <ListItemText primary="Prediction History" />
            </ListItemButton>
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{ ml: `${drawerWidth}px`, mt: 9, p: 3 }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<SinglePredict />} />
            <Route path="/batch" element={<BatchUpload />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
