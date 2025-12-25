import React from "react";
import { Drawer, List, ListItem, ListItemText, Switch } from "@mui/material";
import { Link } from "react-router-dom";

export default function Layout({ children, darkMode, toggleDark }) {
  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: 200,
          "& .MuiDrawer-paper": {
            width: 200,
            boxSizing: "border-box",
            background: darkMode ? "#111" : "#1976d2",
            color: "#fff"
          }
        }}
      >
        <h3 style={{ textAlign: "center", marginTop: 15 }}>Churn App</h3>

        <List>
          <ListItem button component={Link} to="/dashboard">
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem button component={Link} to="/">
            <ListItemText primary="Predict" />
          </ListItem>

          <ListItem button component={Link} to="/batch">
            <ListItemText primary="Batch Upload" />
          </ListItem>

          <ListItem button component={Link} to="/history">
            <ListItemText primary="History" />
          </ListItem>

          <ListItem>
            Dark Mode
            <Switch checked={darkMode} onChange={toggleDark} />
          </ListItem>
        </List>
      </Drawer>

      <div style={{ marginLeft: 220 }}>{children}</div>
    </>
  );
}
