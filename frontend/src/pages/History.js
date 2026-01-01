import { useEffect, useState } from "react";
import api from "../services/api";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Search, Visibility, History as HistoryIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function History() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/history/?page=1&limit=25")
      .then(res => {
        setData(res.data.records || []);
      })
      .catch(() => setData([]));
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    window.location.href = `/report/${search.trim()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box maxWidth={1000} mx="auto">
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon fontSize="large" color="primary" /> Prediction History
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View past predictions and access detailed analysis reports.
        </Typography>

        {/* 🔍 SEARCH BAR */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 4, display: "flex", gap: 2, borderRadius: 3 }}>
          <TextField
            label="Search by Customer ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            sx={{ borderRadius: 2, px: 4 }}
          >
            View Report
          </Button>
        </Paper>

        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Contract</strong></TableCell>
                <TableCell><strong>Probability</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No history found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (data.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.customer_id}</TableCell>
                  <TableCell>{r.contract}</TableCell>
                  <TableCell><strong>{(r.probability * 100).toFixed(1)}%</strong></TableCell>
                  <TableCell>
                    <Chip
                      label={r.label}
                      size="small"
                      color={r.label === 'Likely to Churn' ? 'error' : 'success'}
                      variant="soft" // using standard filled if soft not avail in this version
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => (window.location.href = `/report/${r.customer_id}`)}
                    >
                      Report
                    </Button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </motion.div>
  );
}
