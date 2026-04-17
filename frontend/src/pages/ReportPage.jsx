import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Button, Typography, Box, Chip, Divider, Paper,
  Grid, CircularProgress, Alert, LinearProgress
} from "@mui/material";
import { ArrowBack, AutoAwesome, Person, Router, DataUsage, PhoneEnabled, Sms, Timer, HourglassEmpty, PictureAsPdf } from "@mui/icons-material";
import { motion } from "framer-motion";

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

const InfoTile = ({ icon, label, value }) => (
  <Paper sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#0d1117', border: '1px solid #1e293b', height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: '#00F5FF' }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{label}</Typography>
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>{value}</Typography>
  </Paper>
);

export default function ReportPage() {
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Report endpoints are updated to use numeric record_id (passed via route as customer_id param)
    api.get(`/report/${customer_id}`)
      .then(res => setReport(res.data))
      .catch(() => setError("Report not found. The record may have been deleted or the ID is invalid."))
      .finally(() => setLoading(false));
  }, [customer_id]);

  if (loading) return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress sx={{ color: '#00F5FF' }} />
      <Typography sx={{ color: '#94A3B8' }}>Loading report...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{error}</Alert>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: '#94A3B8', textTransform: 'none' }}>Go Back</Button>
    </Box>
  );

  if (!report) return null;

  const riskColor = report.probability > 0.7 ? '#FF4D6D' : report.probability > 0.4 ? '#F59E0B' : '#00F5FF';
  const riskLabel = report.probability > 0.7 ? 'HIGH RISK' : report.probability > 0.4 ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box>
        {/* HEADER */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}
            sx={{ color: '#94A3B8', textTransform: 'none', borderRadius: '10px',border: '1px solid #334155' }}>
            Back to History
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={() => window.open(`${api.defaults.baseURL}/report/${report.id}/pdf`, "_blank")}
            sx={{ bgcolor: '#FF4D6D', color: '#FFF', borderRadius: '10px', textTransform: 'none', '&:hover': { bgcolor: '#e43d5c' } }}
          >
            Download PDF Report
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* LEFT — RISK SUMMARY */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                <CircularProgress variant="determinate" value={100} size={140} thickness={4} sx={{ color: '#1e293b' }} />
                <CircularProgress variant="determinate" value={report.probability * 100} size={140} thickness={4}
                  sx={{ color: riskColor, position: 'absolute', top: 0, left: 0 }} />
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: riskColor, lineHeight: 1 }}>
                    {Math.round(report.probability * 100)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '9px' }}>CHURN RISK</Typography>
                </Box>
              </Box>
              <Chip label={riskLabel} sx={{ bgcolor: riskColor, color: '#0A0A0F', fontWeight: 900, mb: 2, px: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>{report.label}</Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>Customer ID: {report.customer_id}</Typography>
              <Divider sx={{ my: 3, opacity: 0.1 }} />
              <LinearProgress variant="determinate" value={report.probability * 100}
                sx={{ height: 8, borderRadius: 4, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: riskColor, borderRadius: 4 } }} />
              <Typography variant="caption" sx={{ color: '#64748B', mt: 1, display: 'block' }}>Churn Probability Score</Typography>
            </Paper>
          </Grid>

          {/* RIGHT — DETAILS + AI */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#FFFFFF' }}>Customer Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}><InfoTile icon={<Router fontSize="small" />} label="Provider" value={report.telecom_partner || '—'} /></Grid>
                <Grid item xs={6} md={4}><InfoTile icon={<DataUsage fontSize="small" />} label="Data Used" value={`${report.data_used} MB`} /></Grid>
                <Grid item xs={6} md={4}><InfoTile icon={<Timer fontSize="small" />} label="Tenure" value={`${report.tenure_months} months`} /></Grid>
                <Grid item xs={6} md={4}><InfoTile icon={<PhoneEnabled fontSize="small" />} label="Calls Made" value={report.calls_made ?? '—'} /></Grid>
                <Grid item xs={6} md={4}><InfoTile icon={<Sms fontSize="small" />} label="SMS Sent" value={report.sms_sent ?? '—'} /></Grid>
                <Grid item xs={6} md={4}><InfoTile icon={<HourglassEmpty fontSize="small" />} label="Inactive Days" value={report.inactive_days ?? '—'} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '20px', bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AutoAwesome sx={{ color: '#7B61FF' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>AI Analysis & Recommendations</Typography>
              </Box>
              <Box sx={{ bgcolor: '#0d1117', borderRadius: '14px', p: 3, border: '1px solid #1e293b', maxHeight: 400, overflowY: 'auto' }}>
                <FormattedReport text={report.explanation} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}
