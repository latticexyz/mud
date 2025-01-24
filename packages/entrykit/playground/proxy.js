import express from "express";
import cors from "cors";
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    console.log("generating proof");
    const response = await fetch("https://zkemail--jwt-auth-prover-v0-1-0-flask-app.modal.run/prove/jwt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
