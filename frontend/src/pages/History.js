import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  LinearProgress
} from "@mui/material";
import { 
  History as HistoryIcon, 
  FilterAlt, 
  Search, 
  Bolt, 
  Visibility 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    filter === "all" || item.telecom_partner === filter
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ background: 'linear-gradient(90deg, #00F5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prediction History</Typography>
          <Typography variant="subtitle1">View and manage all past churn predictions</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
           <TextField
            select size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: 200, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}
            label="Filter by Provider"
           >
             <MenuItem value="all">All Providers</MenuItem>
             <MenuItem value="Reliance Jio">RELIANCE JIO</MenuItem>
             <MenuItem value="Airtel">AIRTEL</MenuItem>
             <MenuItem value="Vodafone Idea (VI)">VODAFONE</MenuItem>
             <MenuItem value="BSNL">BSNL</MenuItem>
           </TextField>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      <Paper className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 800, fontSize: '12px', borderBottom: '1px solid #334155' }}>TIMESTAMP</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 800, fontSize: '12px', borderBottom: '1px solid #334155' }}>NODE ID</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 800, fontSize: '12px', borderBottom: '1px solid #334155' }}>CARRIER</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 800, fontSize: '12px', borderBottom: '1px solid #334155' }}>CHURN RISK</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontWeight: 800, fontSize: '12px', borderBottom: '1px solid #334155' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ color: '#94A3B8', fontWeight: 800, fontSize: '12px', borderBottom: '1px solid #334155' }}>OPERATIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'all 0.2s' }}>
                  <TableCell sx={{ borderBottom: '1px solid #334155', color: '#94A3B8', fontSize: '13px' }}>
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #334155', fontWeight: 700 }}>
                    {row.customer_id}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #334155' }}>
                    <Chip label={row.telecom_partner} size="small" variant="outlined" sx={{ borderColor: '#334155' }} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #334155' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Box sx={{ width: 40, height: 6, bgcolor: '#1e293b', borderRadius: 3, flex: 1, position: 'relative' }}>
                          <Box sx={{ position: 'absolute', height: '100%', borderRadius: 3, width: `${row.probability * 100}%`, bgcolor: row.probability > 0.7 ? '#FF4D6D' : '#00F5FF' }} />
                       </Box>
                       <Typography sx={{ fontWeight: 800, fontSize: '13px', minWidth: 40 }}>{Math.round(row.probability * 100)}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #334155' }}>
                    <Chip 
                      label={row.label.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: row.label === 'high' ? 'rgba(255, 77, 109, 0.1)' : 'rgba(0, 245, 255, 0.1)',
                        color: row.label === 'high' ? '#FF4D6D' : '#00F5FF',
                        fontWeight: 800,
                        fontSize: '10px'
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #334155' }}>
                    <IconButton size="small" onClick={() => navigate(`/report/${row.id}`)} sx={{ color: '#7B61FF' }}>
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#00F5FF' }}>
                      <Bolt />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
