import { Page } from "@playwright/test";
import dotenv from "dotenv";
import { rpcHttpUrl } from "./constants";

// Load private key into `process.env.PRIVATE_KEY`
dotenv.config({ path: "../contracts/.env" });

export async function openClientWithRootAccount(page: Page, options?: { indexerUrl?: string }) {
  await page.goto(
    `http://localhost:3000?${new URLSearchParams({
      rpcHttpUrl,
      // I wish I could pass undefined values into URLSearchParams and have them be ignored during stringify
      ...(process.env.PRIVATE_KEY ? { privateKey: process.env.PRIVATE_KEY } : null),
      ...(options?.indexerUrl ? { indexerUrl: options?.indexerUrl } : null),
    }).toString()}`
  );
}
