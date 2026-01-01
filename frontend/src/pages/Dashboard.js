import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from "@mui/material";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_predictions: 0,
    churn_rate: 0,
    revenue_at_risk: 0
  });

  const [probDist, setProbDist] = useState([]);
  const [contractStats, setContractStats] = useState([]);
  const [topRisk, setTopRisk] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);

  useEffect(() => {
    api.get("/analytics/summary").then(res => setSummary(res.data));

    api.get("/analytics/probability_distribution")
      .then(res => setProbDist(res.data))
      .catch(() => setProbDist([]));

    api.get("/analytics/churn_by_contract")
      .then(res => setContractStats(res.data))
      .catch(() => setContractStats([]));

    api.get("/analytics/top_risk")
      .then(res => setTopRisk(res.data))
      .catch(() => setTopRisk([]));

    api.get("/analytics/trend_by_tenure")
      .then(res => setTrendData(res.data))
      .catch(() => setTrendData([]));

    api.get("/analytics/payment_stats")
      .then(res => setPaymentStats(res.data))
      .catch(() => setPaymentStats([]));
  }, []);

  const COLORS = ["#2979FF", "#E53935", "#FBC02D"];

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to delete ALL history? This cannot be undone.")) {
      try {
        await api.delete("/clear/all");
        alert("History cleared successfully!");
        window.location.reload(); // Refresh to show empty state
      } catch (err) {
        console.error(err);
        alert("Failed to clear history.");
      }
    }
  };

  // Helper for large numbers
  const formatCurrency = (num) => {
    if (!num) return "$0";
    if (num >= 1.0e+9) return "$" + (num / 1.0e+9).toFixed(1) + "B";
    if (num >= 1.0e+6) return "$" + (num / 1.0e+6).toFixed(1) + "M";
    if (num >= 1.0e+3) return "$" + (num / 1.0e+3).toFixed(1) + "K";
    return "$" + num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Customer Churn Dashboard
        </Typography>

        {user?.role === "admin" && (
          <Button variant="contained" color="error" onClick={handleClearHistory}>
            Clear History
          </Button>
        )}
      </Box>

      {/* KPI CARDS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2">Total Predictions</Typography>
              <Typography variant="h4">{summary.total_predictions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="error">Revenue at Risk</Typography>
              <Typography variant="h4">
                {formatCurrency(summary.revenue_at_risk)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2">Churn Rate</Typography>
              <Typography variant="h4">
                {(summary.churn_rate * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Churn Probability Distribution
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={probDist}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2979FF" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2979FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#2979FF" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Churn by Payment Method
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      label
                    >
                      {paymentStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LIFECYCLE TREND LINE CHART */}
      <Card elevation={3} sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            Retention Trend (Avg Charges vs Tenure)
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="tenure"
                  label={{ value: 'Tenure (Months)', position: 'insideBottom', offset: -15, fill: '#666' }}
                  tick={{ fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  label={{ value: 'Avg Bill ($)', angle: -90, position: 'insideLeft', offset: 0, fill: '#666' }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="avg_charges"
                  name="Avg Monthly Bill ($)"
                  stroke="#2979FF"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* TOP RISK TABLE */}
      <Card elevation={3} sx={{ mt: 2, mb: 4 }}>
        <CardContent>
          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            Top High-Risk Customers
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Customer ID</strong></TableCell>
                  <TableCell><strong>Contract</strong></TableCell>
                  <TableCell><strong>Tenure</strong></TableCell>
                  <TableCell><strong>Probability</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topRisk.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r.customer_id}</TableCell>
                    <TableCell>{r.contract}</TableCell>
                    <TableCell>{r.tenure} months</TableCell>
                    <TableCell>{(r.probability * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip
                        label={r.label}
                        color={r.label === "Likely to Churn" ? "error" : "success"}
                        size="small"
                        variant="soft" // Note: v5 usually supports 'filled' or 'outlined'. Let's use filled.
                      // actually just color is enough for standard MUI.
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
