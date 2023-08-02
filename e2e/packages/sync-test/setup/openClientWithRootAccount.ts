import { Page } from "@playwright/test";
import dotenv from "dotenv";

// Load private key into `process.env.PRIVATE_KEY`
dotenv.config({ path: "../contracts/.env" });

export async function openClientWithRootAccount(page: Page, options?: { indexerUrl?: string }) {
  await page.goto(
    `http://localhost:3000?${new URLSearchParams({
      cache: "false",
      privateKey: process.env.PRIVATE_KEY ?? "",
      indexerUrl: options?.indexerUrl ?? "",
    }).toString()}`,
    { waitUntil: "domcontentloaded" }
  );

  await page.evaluate(() => {
    localStorage.debug = "mud:*";
  });

  await page.reload();
}
