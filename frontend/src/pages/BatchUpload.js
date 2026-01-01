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

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box maxWidth={1000} mx="auto">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Batch Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Process huge datasets instantly. Upload your CSV to get bulk predictions and insights.
        </Typography>

        <Card variant="outlined" sx={{ borderRadius: 3, mb: 4, borderStyle: 'dashed', borderColor: 'primary.main', borderWidth: 2, bgcolor: 'background.paper' }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop your CSV here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              or click to browse from your computer
            </Typography>

            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="contained" component="span" size="medium" sx={{ borderRadius: 2, textTransform: 'none' }}>
                Choose File
              </Button>
            </label>

            {file && (
              <Box sx={{ mt: 3, display: 'inline-flex', alignItems: 'center', bgcolor: 'action.hover', px: 2, py: 1, borderRadius: 2 }}>
                <Description color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight="medium">
                  {file.name}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleUpload}
            disabled={loading || !file}
            startIcon={<AutoAwesome />}
            fullWidth
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {loading ? "Processing..." : "Run Predictions"}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleDownload}
            disabled={!file}
            startIcon={<Download />}
            sx={{ borderRadius: 2, minWidth: 200 }}
          >
            Download CSV
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 4, borderRadius: 1 }} />}

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* RESULTS TABLE */}
            <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    <TableChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Results Preview
                  </Typography>
                  <Chip label={`Processed: ${result.processed}`} color="primary" />
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300, bgcolor: 'background.default' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Customer</strong></TableCell>
                        <TableCell><strong>Probability</strong></TableCell>
                        <TableCell><strong>Label</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.results_preview?.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{row.customer_id}</TableCell>
                          <TableCell>{(row.probability * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Chip
                              label={row.label}
                              size="small"
                              color={row.label === 'Likely to Churn' ? 'error' : 'success'}
                              variant="soft"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* AI SUMMARY */}
            {result.summary && (
              <Card elevation={3} sx={{ borderRadius: 3, bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="h6" color="primary.dark" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome /> Strategic Insights
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


