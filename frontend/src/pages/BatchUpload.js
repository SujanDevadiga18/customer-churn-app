import React, { useState } from "react";
import { Card, Button, Typography } from "@mui/material";
import api from "../services/api";

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleFile = e => setFile(e.target.files[0]);

  const submit = async () => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/predict/batch", form);
    setResponse(res.data);
  };

  return (
    <Card elevation={4} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Batch CSV Prediction
      </Typography>

      <Button variant="outlined" component="label" sx={{ mb: 2, borderRadius: 2 }}>
        Upload CSV
        <input hidden type="file" accept=".csv" onChange={handleFile} />
      </Button>

      <Button
        variant="contained"
        color="secondary"
        sx={{ ml: 2, px: 4, py: 1.2, borderRadius: 2 }}
        onClick={submit}
      >
        Run Prediction
      </Button>

      {response && (
        <Typography sx={{ mt: 2 }}>Processed: {response.processed}</Typography>
      )}
    </Card>
  );
}
