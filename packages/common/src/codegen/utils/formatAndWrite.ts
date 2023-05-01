import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { formatSolidity, formatTypescript } from "./format";

export async function formatAndWriteSolidity(output: string, fullOutputPath: string, logPrefix: string) {
  const formattedOutput = await formatSolidity(output);

  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}

export async function formatAndWriteTypescript(output: string, fullOutputPath: string, logPrefix: string) {
  const formattedOutput = await formatTypescript(output);

  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}
