import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { formatSolidity } from "./format.js";

export async function formatAndWrite(output: string, fullOutputPath: string, logPrefix: string) {
  const formattedOutput = await formatSolidity(output);

  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}
