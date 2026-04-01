import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Paper,
  Chip,
  LinearProgress
} from "@mui/material";
import { motion } from "framer-motion";
import { CloudUpload, Download, TableChart, AutoAwesome, Description } from "@mui/icons-material";
import api from "../services/api";

/* ---------------------- AI SUMMARY FORMATTER ---------------------- */

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

/* ---------------------- MAIN COMPONENT ---------------------- */

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(() => {
    const savedResult = localStorage.getItem("batch_result");
    return savedResult ? JSON.parse(savedResult) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync state to localStorage
  React.useEffect(() => {
    if (result) {
      localStorage.setItem("batch_result", JSON.stringify(result));
    }
  }, [result]);

  const handleNewPrediction = () => {
    setFile(null);
    setResult(null);
    setError(null);
    localStorage.removeItem("batch_result");
  };

  /* -------- File Selection -------- */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  /* -------- Upload CSV -------- */
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/predict/batch", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data);
    } catch (err) {
      console.log(err?.response?.data);
      setError("Batch prediction failed. Please check your CSV format.");
    } finally {
      setLoading(false);
    }
  };

  /* -------- Download Predictions -------- */
  const handleDownload = async () => {
    if (!file) {
      setError("Upload a CSV first to download results");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/predict/batch?download=true", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "churn_predictions.csv";
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box maxWidth={1000} mx="auto">

        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Batch Upload
          </Typography>
          {result && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNewPrediction}
              sx={{ borderRadius: 2 }}
            >
              New Prediction
            </Button>
          )}
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Upload a CSV dataset to run bulk churn predictions and analytics.
        </Typography>

        {/* FILE UPLOAD */}
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 4, borderStyle: 'dashed', borderColor: 'primary.main', borderWidth: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

            <input accept=".csv" style={{ display: 'none' }} id="file-upload" type="file" onChange={handleFileChange} />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span">Choose CSV File</Button>
            </label>

            {file && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">{file.name}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button variant="contained" onClick={handleUpload} disabled={loading || !file} fullWidth>
            {loading ? "Processing..." : "Run Predictions"}
          </Button>

          <Button variant="outlined" onClick={handleDownload} disabled={!file}>
            Download CSV
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 3 }} />}
        {error && <Alert severity="error">{error}</Alert>}

        {/* RESULTS */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* ---------- CHURN METRICS DASHBOARD ---------- */}
            <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Dataset Analytics
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-around", textAlign: "center", flexWrap: "wrap", gap: 4 }}>

                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {result.processed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Customers
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {result.churned_customers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Likely to Churn
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {result.churn_rate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Churn Rate
                    </Typography>
                  </Box>

                </Box>
              </CardContent>
            </Card>

            {/* ---------- RESULTS TABLE ---------- */}
            <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Results Preview
                </Typography>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell>Probability</TableCell>
                        <TableCell>Label</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {result.results_preview?.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.customer_id}</TableCell>
                          <TableCell>{(row.probability * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Chip
                              label={row.label}
                              color={row.label === "Likely to Churn" ? "error" : "success"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* ---------- AI SUMMARY ---------- */}
            {result.summary && (
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Strategic Insights
                  </Typography>
                  <FormattedReport text={result.summary} />
                </CardContent>
              </Card>
            )}

          </motion.div>
        )}
      </Box>
    </motion.div>
  );
}
