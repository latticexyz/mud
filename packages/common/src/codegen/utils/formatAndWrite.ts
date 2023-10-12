import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { formatSolidity, formatTypescript } from "./format";
import { debug } from "../debug";

export async function formatAndWriteSolidity(output: string, fullOutputPath: string, logPrefix: string): Promise<void> {
  const formattedOutput = await formatSolidity(output);

  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}

export async function formatAndWriteTypescript(
  output: string,
  fullOutputPath: string,
  logPrefix: string
): Promise<void> {
  const formattedOutput = await formatTypescript(output);

  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}
