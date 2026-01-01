import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Box,
  Alert,
  Grid,
  Divider,
  Chip,
  Paper
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Person,
  Timeline,
  Description,
  AttachMoney,
  CreditCard,
  AutoAwesome
} from "@mui/icons-material";
import api from "../services/api";

// Helper to format AI text cleanly
const FormattedReport = ({ text }) => {
  if (!text) return null;

  // Split by newlines
  const lines = text.split("\n");

  return (
    <Box sx={{ mt: 2, fontFamily: 'Inter, sans-serif' }}>
      {lines.map((line, index) => {
        // Remove known artifacts like "**" or "*"
        const cleanLine = line.replace(/\*\*/g, "").replace(/\*/g, "").trim();

        if (!cleanLine) return <Box key={index} sx={{ h: 1 }} />;

        // Detect Bullet points
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

        // Detect Headers (originally likely # or similar, or just distinct lines)
        if (line.trim().endsWith(":")) {
          return (
            <Typography key={index} variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.dark', fontWeight: 600 }}>
              {cleanLine}
            </Typography>
          );
        }

        // Standard Text
        return (
          <Typography key={index} variant="body1" sx={{ mb: 1 }} color="text.primary">
            {cleanLine}
          </Typography>
        );
      })}
    </Box>
  );
};

export default function SinglePredict() {
  const [form, setForm] = useState({
    customer_id: "",
    tenure: "",
    contract: "",
    monthly_charges: "",
    payment_method: ""
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        customer_id: form.customer_id.trim(),
        tenure: Number(form.tenure || 0),
        contract: form.contract,
        monthly_charges: Number(form.monthly_charges || 0),
        payment_method: form.payment_method,
      };

      const res = await api.post("/predict/simple", payload);
      setResult(res.data);

    } catch (err) {
      console.log(err?.response?.data);
      setError(
        err?.response?.data?.detail ||
        "Prediction failed — please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box maxWidth={900} mx="auto">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Single Prediction
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Enter customer metrics to generate a real-time churn risk analysis.
        </Typography>

        <Grid container spacing={4}>
          {/* LEFT: FORM */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="primary" /> Customer Details
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Customer ID"
                        value={form.customer_id}
                        onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        InputProps={{ startAdornment: <Person sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Tenure (months)"
                        type="number"
                        value={form.tenure}
                        onChange={(e) => setForm({ ...form, tenure: e.target.value })}
                        required
                        fullWidth
                        InputProps={{ startAdornment: <Timeline sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="number"
                        label="Monthly Charges ($)"
                        value={form.monthly_charges}
                        onChange={(e) => setForm({ ...form, monthly_charges: e.target.value })}
                        required
                        fullWidth
                        InputProps={{ startAdornment: <AttachMoney sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Contract Type"
                        value={form.contract}
                        onChange={(e) => setForm({ ...form, contract: e.target.value })}
                        required
                        fullWidth
                        InputProps={{ startAdornment: <Description sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }}
                      >
                        <MenuItem value="Month-to-month">Month-to-month</MenuItem>
                        <MenuItem value="One year">One year</MenuItem>
                        <MenuItem value="Two year">Two year</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Payment Method"
                        value={form.payment_method}
                        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                        required
                        fullWidth
                        InputProps={{ startAdornment: <CreditCard sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }}
                      >
                        <MenuItem value="Electronic check">Electronic check</MenuItem>
                        <MenuItem value="Mailed check">Mailed check</MenuItem>
                        <MenuItem value="Bank transfer (automatic)">Bank transfer (automatic)</MenuItem>
                        <MenuItem value="Credit card (automatic)">Credit card (automatic)</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    size="large"
                    sx={{ mt: 3, borderRadius: 2, height: 48, textTransform: 'none', fontSize: '1rem' }}
                    disabled={loading}
                    startIcon={!loading && <AutoAwesome />}
                  >
                    {loading ? "Analyzing..." : "Analyze Churn Risk"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: RESULT */}
          <Grid item xs={12} md={6}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
                <Typography color="text.secondary">AI is processing the data...</Typography>
              </Box>
            )}

            {!loading && !result && !error && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400, border: '1px dashed #ccc', borderRadius: 3 }}>
                <Typography color="text.secondary">Prediction results will appear here</Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card elevation={4} sx={{ borderRadius: 3, overflow: 'visible', position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" uppercase>Risk Assessment</Typography>
                      <Typography variant="h3" fontWeight="800" color={result.label === 'Likely to Churn' ? 'error.main' : 'success.main'} sx={{ mt: 1 }}>
                        {(result.probability * 100).toFixed(1)}%
                      </Typography>
                      <Chip
                        label={result.label}
                        color={result.label === 'Likely to Churn' ? "error" : "success"}
                        sx={{ mt: 1, fontWeight: 'bold' }}
                      />
                    </Box>

                    <Divider />

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome color="warning" /> AI Insights
                      </Typography>
                      {/* CUSTOM FORMATTER */}
                      <FormattedReport text={result.explanation} />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}
