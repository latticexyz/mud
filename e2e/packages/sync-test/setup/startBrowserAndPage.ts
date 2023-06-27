import { Browser, Page, chromium } from "@playwright/test";
import chalk from "chalk";

export async function startBrowserAndPage(
  reportError: (error: string) => void
): Promise<{ browser: Browser; page: Page }> {
  // open browser page
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // log uncaught errors in the browser page (browser and test consoles are separate)
  page.on("pageerror", (err) => {
    console.log(chalk.yellow("[browser page error]:"), err.message);
  });

  // log browser's console logs
  page.on("console", (msg) => {
    if (msg.text().toLowerCase().includes("error")) {
      const errorMessage = chalk.yellowBright("[browser error]:") + chalk.red(msg.text());
      console.log(errorMessage);
      reportError(errorMessage);
    } else {
      console.log(chalk.yellowBright("[browser console]:"), msg.text());
    }
  });

  return { browser, page };
}
