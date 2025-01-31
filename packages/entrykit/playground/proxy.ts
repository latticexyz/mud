import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

const proverUrl = "https://prover.zk.email/api/prove";
const blueprintId = "2c212de6-07fa-4906-8676-bc907d86e3b2";

const apiKey = process.env.PROVER_API_KEY;
if (!apiKey) {
  throw new Error("PROVER_API_KEY environment variable is not set");
}

interface ProverRequestBody {
  // Add your specific request body fields here
  [key: string]: unknown;
}

interface ProverResponse {
  // Add your specific response fields here
  [key: string]: unknown;
}

app.use(cors());
app.use(express.json());

app.post("/", async (req: Request<{}, {}, ProverRequestBody>, res: Response) => {
  try {
    console.log("submitting to generic prover");
    const response = await fetch(proverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        blueprintId,
        proofId: uuidv4(),
        zkeyDownloadUrl: "https://pub-701958c97df7428ab5aad0ee45f4027a.r2.dev/zkey.zip",
        circuitCppDownloadUrl: "https://pub-701958c97df7428ab5aad0ee45f4027a.r2.dev/circuit.zip",
        ...req.body,
      }),
    });

    if (!response.ok) {
      // console.error(await response.text());
      const errorData = await response.json().catch(() => null);
      console.error("Prover API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      res.status(response.status).json({
        error: "Prover API error",
        details: errorData || response.statusText,
        statusCode: response.status,
      });
    } else {
      const data: ProverResponse = await response.json();
      console.log("Prover response:", data);
      res.json(data);
    }
  } catch (error) {
    console.error("Error in prover request:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
