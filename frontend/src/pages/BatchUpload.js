import React, { useState } from "react";
import { 
  Box, Typography, Paper, Button, LinearProgress, Alert,
  Grid, Divider, List, ListItem, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from "@mui/material";
import { 
  CheckCircle, Bolt, CloudUpload, AutoGraph, Download
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const FormattedReport = ({ text }) => {
  if (!text) return <Typography sx={{ color: '#64748B' }}>No AI analysis available.</Typography>;
  const lines = text.split("\n");
  return (
    <Box sx={{ fontFamily: 'Inter, sans-serif' }}>
      {lines.map((line, i) => {
        const clean = line.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s/, "").trim();
        if (!clean) return <Box key={i} sx={{ mb: 1 }} />;
        const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
        const isHeading = line.trim().match(/^\d+\./) || line.trim().endsWith(":");
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.2, alignItems: 'flex-start' }}>
            {isBullet && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00F5FF', mt: 1, flexShrink: 0 }} />}
            <Typography
              variant={isHeading ? "subtitle1" : "body2"}
              sx={{
                color: isHeading ? '#FFFFFF' : '#94A3B8',
                fontWeight: isHeading ? 700 : 400,
                lineHeight: 1.8
              }}
            >
              {clean.replace(/^[-•]\s*/, "")}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a valid CSV file.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/batch/upload", formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Batch upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadCsvResult = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/batch/upload?download=true", formData, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "prediction_results.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch(err) {
      setError("Failed to download CSV.");
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ background: 'linear-gradient(90deg, #00F5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Batch Upload</Typography>
          <Typography variant="subtitle1" sx={{ color: '#94A3B8' }}>Upload a CSV file to run predictions on multiple customers at once</Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper className="glass-card" sx={{ p: 5, textAlign: 'center', border: '2px dashed rgba(0, 245, 255, 0.2)' }}>
            <CloudUpload sx={{ fontSize: 64, color: '#00F5FF', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Upload Customer Data</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4 }}>Select a CSV file containing customer records for batch churn prediction</Typography>
            
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" component="span" size="large" sx={{ py: 1.5, px: 4, borderRadius: '12px', border: '1px solid #334155', color: '#FFFFFF' }}>
                SELECT CSV FILE
              </Button>
            </label>

            {file && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid #334155' }}>
                <Typography variant="body2" sx={{ color: '#00F5FF', fontWeight: 700 }}>{file.name}</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>{(file.size / 1024).toFixed(1)} KB</Typography>
              </Box>
            )}

            <Button 
              fullWidth variant="contained" 
              size="large" sx={{ mt: 4, py: 2, borderRadius: '12px', fontWeight: 800 }}
              disabled={loading || !file}
              onClick={handleUpload}
              startIcon={loading ? <Box /> : <Bolt />}
            >
              {loading ? "Processing..." : "Start Batch Prediction"}
            </Button>

            {loading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
          </Paper>

          {error && <Alert severity="error" sx={{ mt: 3, borderRadius: '12px' }}>{error}</Alert>}
          
          {/* RESULTS PREVIEW TABLE BELOW THE UPLOAD BOX */}
          <AnimatePresence>
            {result && result.results_preview && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '32px' }}>
                <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#FFFFFF' }}>First 20 Customers Preview</Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#1e293b', color: '#94A3B8', fontWeight: 700, borderBottom: 'none' }}>ID</TableCell>
                          <TableCell sx={{ bgcolor: '#1e293b', color: '#94A3B8', fontWeight: 700, borderBottom: 'none' }}>Risk Score</TableCell>
                          <TableCell sx={{ bgcolor: '#1e293b', color: '#94A3B8', fontWeight: 700, borderBottom: 'none' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.results_preview.slice(0, 20).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell sx={{ borderBottom: '1px solid #1e293b', color: '#fff' }}>{row.customer_id}</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #1e293b', color: '#fff' }}>{(row.probability * 100).toFixed(1)}%</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #1e293b' }}>
                              <Chip 
                                label={row.label} 
                                size="small" 
                                sx={{ 
                                  bgcolor: row.probability > 0.7 ? 'rgba(255,77,109,0.1)' : row.probability > 0.4 ? 'rgba(245,158,11,0.1)' : 'rgba(0,245,255,0.1)',
                                  color: row.probability > 0.7 ? '#FF4D6D' : row.probability > 0.4 ? '#F59E0B' : '#00F5FF',
                                  fontSize: '10px',
                                  fontWeight: 700
                                }} 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        <Grid item xs={12} md={7}>
          <AnimatePresence>
            {result ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Paper className="glass-card" sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#00F5FF', fontWeight: 800 }}>Batch Results Summary</Typography>
                    <Button variant="contained" size="small" startIcon={<Download />} onClick={downloadCsvResult} sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}>
                      Download CSV Report
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Total Processed</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>{result.total_processed}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>High Risk</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#FF4D6D' }}>{result.high_risk_count}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Safe</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#00F5FF' }}>{result.safe_count}</Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1, mt: 1, fontWeight: 700 }}>Average Churn Rate</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={result.avg_churn * 100} 
                          sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#1e293b' }} 
                        />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{(result.avg_churn * 100).toFixed(1)}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 4, opacity: 0.1 }} />

                  {/* AI SUMMARY BOX */}
                  <Box sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '16px', border: '1px solid #1e293b' }}>
                    <Typography variant="subtitle2" sx={{ color: '#7B61FF', mb: 2, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      AI Strategic Analysis
                    </Typography>
                    <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
                      <FormattedReport text={result.summary} />
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ) : (
              <Box sx={{ border: '2px dashed #1e293b', borderRadius: '24px', height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 4 }}>
                <AutoGraph sx={{ fontSize: 64, color: '#1e293b', mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#475569', textAlign: 'center' }}>Upload a file to see the results here.</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
}
