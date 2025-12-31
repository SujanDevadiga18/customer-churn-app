import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Box,
  Alert
} from "@mui/material";
import api from "../services/api";

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
    <Box maxWidth={600} mx="auto">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Single Customer Prediction
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Customer ID"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
          required
          fullWidth
          margin="normal"
        />

        <TextField
          label="Tenure (months)"
          type="number"
          value={form.tenure}
          onChange={(e) => setForm({ ...form, tenure: e.target.value })}
          required
          fullWidth
          margin="normal"
        />

        <TextField
          select
          label="Contract"
          value={form.contract}
          onChange={(e) => setForm({ ...form, contract: e.target.value })}
          required
          fullWidth
          margin="normal"
        >
          <MenuItem value="Month-to-month">Month-to-month</MenuItem>
          <MenuItem value="One year">One year</MenuItem>
          <MenuItem value="Two year">Two year</MenuItem>
        </TextField>

        <TextField
          type="number"
          label="Monthly Charges"
          value={form.monthly_charges}
          onChange={(e) =>
            setForm({ ...form, monthly_charges: e.target.value })
          }
          required
          fullWidth
          margin="normal"
        />

        <TextField
          select
          label="Payment Method"
          value={form.payment_method}
          onChange={(e) =>
            setForm({ ...form, payment_method: e.target.value })
          }
          required
          fullWidth
          margin="normal"
        >
          <MenuItem value="Electronic check">Electronic check</MenuItem>
          <MenuItem value="Mailed check">Mailed check</MenuItem>
          <MenuItem value="Bank transfer (automatic)">
            Bank transfer (automatic)
          </MenuItem>
          <MenuItem value="Credit card (automatic)">
            Credit card (automatic)
          </MenuItem>
        </TextField>

        <Button
          variant="contained"
          type="submit"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict"}
        </Button>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">
              Result: {result.label}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              Probability: <strong>{result.probability}</strong>
            </Typography>

            {result.explanation && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Explanation</Typography>

                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {result.explanation}
                </pre>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
