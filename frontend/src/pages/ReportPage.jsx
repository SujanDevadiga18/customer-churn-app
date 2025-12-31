import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { Card, CardContent, Typography, CircularProgress, Alert, Box, Button } from "@mui/material";

export default function ReportPage() {
  const { customer_id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/report/${customer_id}`)
      .then(res => setData(res.data))
      .catch(() => setError("Could not load report."))
      .finally(() => setLoading(false));
  }, [customer_id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box maxWidth={800} mx="auto">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Customer Report — {data.customer_id}
      </Typography>

      <Card>
        <CardContent>

          <Typography>
            <strong>Status:</strong> {data.label}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Probability:</strong> {data.probability}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Contract:</strong> {data.contract}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Tenure:</strong> {data.tenure} months
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Monthly Charges:</strong> {data.monthly_charges}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>
            Explanation
          </Typography>

          <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
  {data.explanation}
</Typography>

<Button
  sx={{ mt: 2 }}
  variant="outlined"
  onClick={() =>
    window.open(
      `${"http://127.0.0.1:8000"}/report/${data.customer_id}/pdf`,
      "_blank"
    )
  }
>
  Download PDF
</Button>


        </CardContent>
      </Card>
    </Box>
  );
}
