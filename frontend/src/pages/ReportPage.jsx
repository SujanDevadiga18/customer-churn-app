import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from "@mui/material";
import { ArrowBack, AutoAwesome, PictureAsPdf } from "@mui/icons-material";
import { motion } from "framer-motion";

const FormattedReport = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <Box sx={{ mt: 2, fontFamily: 'Inter, sans-serif' }}>
      {lines.map((line, index) => {
        const cleanLine = line.replace(/\*\*/g, "").replace(/\*/g, "").trim();
        if (!cleanLine) return <Box key={index} sx={{ h: 1 }} />;
        if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
          return (
            <Box key={index} sx={{ display: 'flex', mb: 1, ml: 1 }}>
              <Typography variant="body1" sx={{ mr: 1, color: 'primary.main' }}>•</Typography>
              <Typography variant="body1" color="text.secondary">
                {cleanLine.replace(/^[-•]\s*/, "")}
              </Typography>
            </Box>
          );
        }
        if (line.trim().endsWith(":")) {
          return (
            <Typography key={index} variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.dark', fontWeight: 600 }}>
              {cleanLine}
            </Typography>
          );
        }
        return (
          <Typography key={index} variant="body1" sx={{ mb: 1 }} color="text.primary">
            {cleanLine}
          </Typography>
        );
      })}
    </Box>
  );
};

export default function ReportPage() {
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/history/${customer_id}`)
      .then(res => setReport(res.data))
      .catch(err => setError("Report not found"))
      .finally(() => setLoading(false));
  }, [customer_id]);

  if (loading) return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error">{error}</Alert>
      <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
    </Box>
  );

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box maxWidth={900} mx="auto">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>

        <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <div>
                <Typography variant="h4" fontWeight="bold">Customer Report</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  ID: {report.customer_id}
                </Typography>
              </div>
              <Chip
                label={report.label}
                color={report.label === 'Likely to Churn' ? 'error' : 'success'}
                sx={{ fontSize: '1rem', px: 1, py: 0.5 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Win Probability</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {(report.probability * 100).toFixed(1)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Contract Type</Typography>
                  <Typography variant="h6">{report.contract}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Tenure</Typography>
                  <Typography variant="h6">{report.tenure} Months</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ bgcolor: 'primary.50', p: 3, borderRadius: 3 }}>
              <Typography variant="h6" color="primary.dark" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome /> AI Analysis
              </Typography>
              <FormattedReport text={report.explanation} />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error" // Red for PDF
                startIcon={<PictureAsPdf />}
                onClick={() => window.open(`http://127.0.0.1:8000/report/${report.customer_id}/pdf`, "_blank")}
              >
                Download Report PDF
              </Button>
            </Box>

          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
