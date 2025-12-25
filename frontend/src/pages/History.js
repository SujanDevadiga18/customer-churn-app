import { useEffect, useState } from "react";
import api from "../services/api";

export default function History() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/history/").then(res => setData(res.data));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h2>Prediction History</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contract</th>
            <th>Probability</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td>{r.customer_id}</td>
              <td>{r.contract}</td>
              <td>{r.probability}</td>
              <td>{r.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
