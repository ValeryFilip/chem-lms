import { useEffect, useState } from "react";
import { api } from "./lib/api";

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.ok ? "API works" : "API error"))
      .catch(() => setStatus("API unavailable"));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>MyOwnLMS</h1>
      <p>{status}</p>
    </main>
  );
}

export default App;