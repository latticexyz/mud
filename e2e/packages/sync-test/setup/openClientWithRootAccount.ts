import { Page } from "@playwright/test";
import dotenv from "dotenv";

// Load private key into `process.env.PRIVATE_KEY`
dotenv.config({ path: "../contracts/.env" });

export async function openClientWithRootAccount(page: Page, options?: { modeUrl?: string }) {
  const modeFragment = options?.modeUrl ? `&mode=${options.modeUrl}` : "";
  const privateKeyFragment = `&privateKey=${process.env.PRIVATE_KEY}`;
  await page.goto(`http://127.0.0.1:3000?cache=false${modeFragment}${privateKeyFragment}`);
}
