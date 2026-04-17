import React, { useState } from "react";
import { 
  Box, Typography, Grid, Paper, TextField, MenuItem, 
  Button, CircularProgress, Chip, Divider, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Psychology, Bolt, AutoGraph, CheckCircle, Warning, 
  TrendingDown, MonetizationOn, SupportAgent, Refresh
} from "@mui/icons-material";
import api from "../services/api";

const providers = ["Reliance Jio", "Airtel", "Vodafone Idea (VI)", "BSNL"];

const DEFAULT_FORM = {
  customer_id: "",
  telecom_partner: "",
  data_used: "",
  tenure_months: "",
  inactive_days: "",
  sms_sent: "",
  calls_made: ""
};

export default function SinglePredict() {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.telecom_partner) { setError("Please select a service provider."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/predict", {
        ...formData,
        data_used: Number(formData.data_used) || 5000,
        tenure_months: Number(formData.tenure_months) || 12,
        inactive_days: Number(formData.inactive_days) || 5,
        sms_sent: Number(formData.sms_sent) || 50,
        calls_made: Number(formData.calls_made) || 50,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_FORM });
    setResult(null);
    setError("");
  };

  const getRiskColor = (prob) => {
    if (prob > 0.7) return "#FF4D6D";
    if (prob > 0.4) return "#F59E0B";
    return "#00F5FF";
  };

  const getRiskLabel = (prob) => {
    if (prob > 0.7) return "HIGH RISK";
    if (prob > 0.4) return "MEDIUM RISK";
    return "LOW RISK";
  };

  const getRiskBg = (prob) => {
    if (prob > 0.7) return "rgba(255,77,109,0.08)";
    if (prob > 0.4) return "rgba(245,158,11,0.08)";
    return "rgba(0,245,255,0.08)";
  };

  // Parse AI explanation into bullet points
  const parseExplanation = (text) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().length > 0);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ background: 'linear-gradient(90deg, #00F5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Single Prediction
          </Typography>
          <Typography variant="subtitle1">Analyze churn risk for an individual customer</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleReset}
          sx={{ borderColor: '#334155', color: '#94A3B8', borderRadius: '10px', textTransform: 'none' }}>
          New Prediction
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* INPUT FORM */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Psychology sx={{ color: '#00F5FF', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Customer Details</Typography>
            </Box>
            
            {error && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,77,109,0.08)', borderRadius: '10px', border: '1px solid rgba(255,77,109,0.2)' }}>
                <Typography variant="caption" sx={{ color: '#FF4D6D' }}>{error}</Typography>
              </Box>
            )}
            
            <form onSubmit={handlePredict}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Customer ID" placeholder="e.g. CUST-00123"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField select fullWidth label="Service Provider" value={formData.telecom_partner}
                    onChange={(e) => setFormData({ ...formData, telecom_partner: e.target.value })}
                    SelectProps={{ displayEmpty: true }}
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="" disabled><em>Select a provider</em></MenuItem>
                    {providers.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Data Usage (MB)" type="number" placeholder="e.g. 5000"
                    value={formData.data_used}
                    onChange={(e) => setFormData({ ...formData, data_used: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Tenure (Months)" type="number" placeholder="e.g. 12"
                    value={formData.tenure_months}
                    onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Inactive Days" type="number" placeholder="e.g. 5"
                    value={formData.inactive_days}
                    onChange={(e) => setFormData({ ...formData, inactive_days: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Calls Made" type="number" placeholder="e.g. 50"
                    value={formData.calls_made}
                    onChange={(e) => setFormData({ ...formData, calls_made: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="SMS Sent" type="number" placeholder="e.g. 50"
                    value={formData.sms_sent}
                    onChange={(e) => setFormData({ ...formData, sms_sent: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Button 
                fullWidth variant="contained" size="large" type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Bolt />}
                sx={{ mt: 3, py: 1.8, fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '15px' }}
              >
                {loading ? 'Analyzing...' : 'Run Prediction'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* RESULT PANEL */}
        <Grid item xs={12} md={8}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Paper sx={{ borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  
                  {/* RISK HEADER */}
                  <Box sx={{ p: 4, background: getRiskBg(result.probability), borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={result.probability * 100} 
                        size={120} thickness={4}
                        sx={{ color: getRiskColor(result.probability) }}
                      />
                      <CircularProgress 
                        variant="determinate" 
                        value={100} size={120} thickness={4}
                        sx={{ color: '#1e293b', position: 'absolute', top: 0, left: 0 }}
                      />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: getRiskColor(result.probability), lineHeight: 1 }}>
                          {Math.round(result.probability * 100)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '9px', mt: 0.3 }}>CHURN RISK</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip 
                        label={getRiskLabel(result.probability)} 
                        sx={{ bgcolor: getRiskColor(result.probability), color: '#0A0A0F', fontWeight: 900, mb: 1, fontSize: '13px', px: 1 }} 
                      />
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>{result.label}</Typography>
                      {formData.customer_id && <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>Customer: {formData.customer_id}</Typography>}
                      {formData.telecom_partner && <Typography variant="body2" sx={{ color: '#64748B' }}>Provider: {formData.telecom_partner}</Typography>}
                    </Box>
                  </Box>

                  {/* ANALYSIS BODY */}
                  <Box sx={{ p: 4 }}>

                    {/* AI EXPLANATION */}
                    {result.reasons && result.reasons.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ color: '#00F5FF', mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Detailed Analysis & Insights
                        </Typography>
                        <Box sx={{ bgcolor: '#0d1117', borderRadius: '14px', p: 3, border: '1px solid #1e293b', maxHeight: 340, overflowY: 'auto' }}>
                          {parseExplanation(result.reasons[0]).map((line, i) => {
                            const isBold = line.startsWith('**') || line.startsWith('#');
                            const isBullet = line.startsWith('-') || line.startsWith('•');
                            const cleanLine = line.replace(/^\*\*|^\#\#+\s|^-\s|^•\s/g, '').replace(/\*\*/g, '');
                            if (!cleanLine.trim()) return <Box key={i} sx={{ my: 0.5 }} />;
                            return (
                              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                                {isBullet && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00F5FF', mt: 0.8, flexShrink: 0 }} />}
                                <Typography 
                                  variant={isBold ? 'subtitle2' : 'body2'} 
                                  sx={{ 
                                    color: isBold ? '#FFFFFF' : '#94A3B8', 
                                    fontWeight: isBold ? 700 : 400,
                                    lineHeight: 1.7
                                  }}
                                >
                                  {cleanLine}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ opacity: 0.1, mb: 3 }} />

                    {/* RECOMMENDED ACTIONS */}
                    <Typography variant="subtitle2" sx={{ color: '#7B61FF', mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Recommended Actions
                    </Typography>
                    <Grid container spacing={2}>
                      {result.probability > 0.7 ? (
                        <>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #1e293b', height: '100%' }}>
                              <SupportAgent sx={{ color: '#FF4D6D', mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Immediate Outreach</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>Assign a dedicated retention agent and contact this customer within 24 hours.</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #1e293b', height: '100%' }}>
                              <MonetizationOn sx={{ color: '#F59E0B', mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Special Offer</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>Offer a loyalty discount (15–25% off) or a free plan upgrade for 3 months.</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #1e293b', height: '100%' }}>
                              <TrendingDown sx={{ color: '#00F5FF', mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Usage Review</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>Investigate low data/call activity and offer a plan better suited to this customer's usage.</Typography>
                            </Box>
                          </Grid>
                        </>
                      ) : result.probability > 0.4 ? (
                        <>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #1e293b', height: '100%' }}>
                              <Warning sx={{ color: '#F59E0B', mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Monitor Closely</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>This customer shows early warning signs. Schedule a proactive check-in within 2 weeks.</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #1e293b', height: '100%' }}>
                              <MonetizationOn sx={{ color: '#00F5FF', mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Engagement Offer</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>Send a targeted data bonus or loyalty reward to improve customer satisfaction.</Typography>
                            </Box>
                          </Grid>
                        </>
                      ) : (
                        <Grid item xs={12}>
                          <Box sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #00F5FF22', display: 'flex', gap: 2, alignItems: 'center' }}>
                            <CheckCircle sx={{ color: '#00F5FF', fontSize: 32 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>Customer is Healthy</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>No immediate action needed. Continue regular service quality monitoring and standard engagement. Consider this customer for a referral or loyalty program.</Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              </motion.div>
            ) : (
              <Box sx={{ border: '2px dashed #1e293b', borderRadius: '24px', height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 4 }}>
                <AutoGraph sx={{ fontSize: 64, color: '#1e293b', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#475569', textAlign: 'center' }}>No prediction yet.</Typography>
                <Typography variant="body2" sx={{ color: '#334155', textAlign: 'center', mt: 1 }}>Fill in the customer details on the left and click "Run Prediction" to see results.</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
}
