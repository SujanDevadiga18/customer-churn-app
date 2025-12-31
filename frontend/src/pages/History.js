import { useEffect, useState } from "react";
import api from "../services/api";
import { TextField, Button } from "@mui/material";

export default function History() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

 useEffect(() => {
  api.get("/history/?page=1&limit=25")
    .then(res => {
      console.log("HISTORY RESPONSE >>>", res.data);
      setData(res.data.records || []);
    })
    .catch(() => setData([]));
}, []);


  const handleSearch = () => {
    if (!search.trim()) return;
    window.location.href = `/report/${search.trim()}`;
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h2>Prediction History</h2>

      {/* 🔍 SEARCH BAR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <TextField
          label="Enter Customer ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleSearch}>
          View Report
        </Button>
      </div>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contract</th>
            <th>Probability</th>
            <th>Result</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td>{r.customer_id}</td>
              <td>{r.contract}</td>
              <td>{r.probability}</td>
              <td>{r.label}</td>

              {/* 👇 Old feature — still there */}
              <td>
                <Button
                  variant="outlined"
                  onClick={() =>
                    (window.location.href = `/report/${r.customer_id}`)
                  }
                >
                  View Report
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
