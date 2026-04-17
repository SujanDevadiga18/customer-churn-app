import React, { useEffect, useState } from "react";
import { 
  Grid, Typography, Box, Paper, LinearProgress, Alert,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { TrendingUp, TrendingDown, DeleteOutline, RefreshOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import api from "../services/api";

const COLORS = ['#00F5FF', '#7B61FF', '#FF4D6D', '#F59E0B'];

const KPICard = ({ title, value, sub, color, up }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Paper sx={{
      p: 3, borderRadius: '20px',
      bgcolor: '#111827',
      border: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s',
      '&:hover': { borderColor: color, boxShadow: `0 0 20px ${color}22`, transform: 'translateY(-2px)' }
    }}>
      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` }} />
      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</Typography>
      <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#FFFFFF', fontFamily: 'Poppins' }}>{value}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
        {up ? <TrendingUp sx={{ fontSize: 14, color }} /> : <TrendingDown sx={{ fontSize: 14, color: '#FF4D6D' }} />}
        <Typography variant="caption" sx={{ color: up ? color : '#FF4D6D', fontWeight: 700 }}>{sub}</Typography>
      </Box>
    </Paper>
  </motion.div>
);

const ChartCard = ({ title, children, height = 300 }) => (
  <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#FFFFFF' }}>{title}</Typography>
    <Box sx={{ height }}>{children}</Box>
  </Paper>
);

export default function Dashboard() {
  const [summary, setSummary] = useState({ total_predictions: 0, churn_rate: 0, revenue_at_risk: 0 });
  const [probDist, setProbDist] = useState([]);
  const [marketStats, setMarketStats] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [providerStats, setProviderStats] = useState([]);
  const [topRisk, setTopRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetDialog, setResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const get = (url) => api.get(url).then(r => r.data).catch(() => []);
    try {
      const [summ, prob, market, trend, prov, top] = await Promise.all([
        api.get("/analytics/summary").then(r => r.data),
        get("/analytics/probability_distribution"),
        get("/analytics/payment_stats"),
        get("/analytics/trend_by_tenure"),
        get("/analytics/provider_stats"),
        get("/analytics/top_risk")
      ]);
      setSummary(summ);
      setProbDist(prob);
      setMarketStats(market);
      setTrendData(trend);
      setProviderStats(prov);
      setTopRisk(top);
    } catch (e) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await api.delete("/history/all");
      setResetDialog(false);
      setSummary({ total_predictions: 0, churn_rate: 0, revenue_at_risk: 0 });
      setProbDist([]);
      setMarketStats([]);
      setTrendData([]);
      setProviderStats([]);
      setTopRisk([]);
    } catch (e) {
      setError("Failed to reset data.");
    } finally {
      setResetting(false);
    }
  };

  const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`;

  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ background: 'linear-gradient(90deg, #00F5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Monitor churn risk, customer health, and retention insights</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshOutlined />}
            onClick={fetchAll}
            sx={{ borderColor: '#334155', color: '#94A3B8', borderRadius: '10px', textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button 
            variant="outlined"
            startIcon={<DeleteOutline />}
            onClick={() => setResetDialog(true)}
            sx={{ borderColor: '#FF4D6D44', color: '#FF4D6D', borderRadius: '10px', textTransform: 'none',
              '&:hover': { borderColor: '#FF4D6D', bgcolor: 'rgba(255,77,109,0.05)' }
            }}
          >
            Reset Data
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPI CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <KPICard title="Total Predictions" value={summary.total_predictions.toLocaleString()} sub="All time records" color="#00F5FF" up={true} />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard title="Churn Rate" value={`${summary.churn_rate}%`} sub="Customers at risk" color={summary.churn_rate > 20 ? '#FF4D6D' : '#F59E0B'} up={false} />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard title="Revenue at Risk" value={fmt(summary.revenue_at_risk)} sub="Estimated monthly loss" color="#FF4D6D" up={false} />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard title="Safe Customers" value={`${Math.max(0, 100 - summary.churn_rate).toFixed(1)}%`} sub="Low churn probability" color="#00F5FF" up={true} />
        </Grid>
      </Grid>

      {/* CHARTS ROW 1 — full 12 col, no gap */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <ChartCard title="Churn Probability Distribution" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={probDist}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="bucket" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="count" name="Customers" stroke="#00F5FF" fillOpacity={1} fill="url(#blueGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard title="Subscribers by Provider" height={230}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={marketStats} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {marketStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
              {marketStats.map((e, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>{e.name}</Typography>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* CHARTS ROW 2 — both stretch to full width */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Churn Rate by Provider" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerStats} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="churn_rate" name="Churn Rate" radius={[6, 6, 0, 0]}>
                  {providerStats.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Avg Monthly Charges vs. Customer Tenure" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="tenure" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => `$${v}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="avg_charges" name="Avg Monthly Bill" stroke="#00F5FF" strokeWidth={3} dot={{ r: 4, fill: '#00F5FF', stroke: '#0A0A0F', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* HIGH RISK CUSTOMERS TABLE */}
      {topRisk.length > 0 && (
        <Paper sx={{ borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>High Risk Customers</Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Top 10 by churn probability</Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Customer ID', 'Provider', 'Churn Risk', 'Status', 'Reason'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #1e293b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topRisk.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '14px 16px', color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>{row.customer_id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Chip label={row.telecom_partner} size="small" sx={{ bgcolor: '#1e293b', color: '#94A3B8', border: '1px solid #334155', fontSize: '11px' }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 80, height: 6, bgcolor: '#1e293b', borderRadius: 3, position: 'relative' }}>
                          <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${row.probability * 100}%`, bgcolor: row.probability > 0.7 ? '#FF4D6D' : '#F59E0B', borderRadius: 3 }} />
                        </Box>
                        <Typography sx={{ color: row.probability > 0.7 ? '#FF4D6D' : '#F59E0B', fontWeight: 800, fontSize: '13px' }}>{Math.round(row.probability * 100)}%</Typography>
                      </Box>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Chip label={row.label} size="small" sx={{ bgcolor: row.probability > 0.7 ? 'rgba(255,77,109,0.1)' : 'rgba(245,158,11,0.1)', color: row.probability > 0.7 ? '#FF4D6D' : '#F59E0B', fontWeight: 700, fontSize: '11px' }} />
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.explanation || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* RESET CONFIRMATION DIALOG */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)} PaperProps={{ sx: { bgcolor: '#111827', borderRadius: '20px', border: '1px solid #334155', p: 1 } }}>
        <DialogTitle sx={{ color: '#FFF', fontWeight: 700 }}>Reset All Prediction Data?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            This will permanently delete all prediction history and analytics data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setResetDialog(false)} sx={{ color: '#94A3B8', borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
          <Button 
            onClick={handleReset} 
            disabled={resetting}
            variant="contained" 
            sx={{ bgcolor: '#FF4D6D', '&:hover': { bgcolor: '#e43d5c' }, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {resetting ? 'Deleting...' : 'Yes, Reset Everything'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
