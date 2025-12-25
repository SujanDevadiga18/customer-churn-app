import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box
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
  ResponsiveContainer
} from "recharts";

import api from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_predictions: 0,
    churn_rate: 0,
    avg_probability: 0
  });

  const [probDist, setProbDist] = useState([]);
  const [contractStats, setContractStats] = useState([]);
  const [topRisk, setTopRisk] = useState([]);

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
  }, []);

  const COLORS = ["#2979FF", "#E53935", "#FBC02D"];

  return (
    <motion.div
      style={{ padding: 5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Customer Churn Dashboard
      </Typography>

      {/* KPI CARDS */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2">Total Predictions</Typography>
              <Typography variant="h4">{summary.total_predictions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2">Average Probability</Typography>
              <Typography variant="h4">
                {((summary.avg_probability || 0) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Churn Probability Distribution
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={probDist}>
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2979FF" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Churn by Contract Type
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={contractStats}
                      dataKey="count"
                      nameKey="contract"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {contractStats.map((_, i) => (
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

      {/* TOP RISK TABLE */}
      <Card elevation={3} sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            Top High-Risk Customers
          </Typography>
          <Divider sx={{ mb: 1 }} />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Customer</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Contract</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Tenure</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Probability</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {topRisk.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{r.customer_id || "—"}</td>
                  <td style={{ padding: 8 }}>{r.contract}</td>
                  <td style={{ padding: 8 }}>{r.tenure}</td>
                  <td style={{ padding: 8 }}>{r.probability}</td>
                  <td style={{ padding: 8, color: r.label === "Likely to Churn" ? "red" : "green" }}>
                    {r.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
