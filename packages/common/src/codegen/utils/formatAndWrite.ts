import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import { formatSolidity, formatTypescript } from "./format";
import { debug } from "../debug";

export async function formatAndWriteSolidity(output: string, fullOutputPath: string, logPrefix: string): Promise<void> {
  const formattedOutput = await formatSolidity(output);

  await mkdir(dirname(fullOutputPath), { recursive: true });

  await writeFile(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}

export async function formatAndWriteTypescript(
  output: string,
  fullOutputPath: string,
  logPrefix: string
): Promise<void> {
  const formattedOutput = await formatTypescript(output);

  await mkdir(dirname(fullOutputPath), { recursive: true });

  await writeFile(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}
