import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent
} from "@mui/material";
import api from "../services/api";

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <Box maxWidth={900} mx="auto">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Batch CSV Prediction
      </Typography>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Upload */}
      <Button
        variant="contained"
        sx={{ ml: 2 }}
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? "Processing..." : "Upload & Predict"}
      </Button>

      {/* Download */}
      <Button
        variant="outlined"
        sx={{ ml: 2 }}
        disabled={!file}
        onClick={handleDownload}
      >
        Download CSV
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography>
              Processed: <strong>{result.processed}</strong>
            </Typography>

            <Typography sx={{ mt: 2, mb: 1 }}>
              Preview (first 10 predictions)
            </Typography>

            <Table>
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
                    <TableCell>{row.probability}</TableCell>
                    <TableCell>{row.label}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {result.summary && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">
                  Churn Insights Summary
                </Typography>

                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {result.summary}
                </pre>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
