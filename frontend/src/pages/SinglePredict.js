import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box
} from "@mui/material";
import api from "../services/api";

export default function SinglePredict() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      const res = await api.post("/predict/", form);
      setResult(res.data);
    } catch (err) {
      alert("Form incomplete — please fill all fields!");
      console.log(err.response?.data);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Single Customer Prediction
      </Typography>

      <Card sx={{ p: 2, mb: 3, boxShadow: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Customer ID" name="customer_id" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Gender" name="gender" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Senior Citizen (0/1)" name="senior_citizen" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Partner" name="partner" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Dependents" name="dependents" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Tenure" name="tenure" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Phone Service" name="phone_service" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Multiple Lines" name="multiple_lines" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Internet Service" name="internet_service" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Online Security" name="online_security" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Online Backup" name="online_backup" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Device Protection" name="device_protection" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Tech Support" name="tech_support" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Streaming TV" name="streaming_tv" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Streaming Movies" name="streaming_movies" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Contract" name="contract" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Paperless Billing" name="paperless_billing" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Payment Method" name="payment_method" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Monthly Charges" name="monthly_charges" onChange={update} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Total Charges" name="total_charges" onChange={update} />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={submit}
            >
              Predict
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Card sx={{ p: 2, boxShadow: 4 }}>
          <Typography variant="h6">
            Result: <b>{result.label}</b>
          </Typography>
          <Typography>
            Probability: <b>{result.probability}</b>
          </Typography>
        </Card>
      )}
    </Container>
  );
}
