import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import { formatSolidity, formatTypescript } from "./format";
import { debug } from "../debug";

/**
 * Formats solidity code using prettier and write it to a file
 * @param output solidity code
 * @param fullOutputPath full path to the output file
 * @param logPrefix prefix for debug logs
 */
export async function formatAndWriteSolidity(output: string, fullOutputPath: string, logPrefix: string): Promise<void> {
  const formattedOutput = await formatSolidity(output);

  await mkdir(dirname(fullOutputPath), { recursive: true });

  await writeFile(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}

/**
 * Formats typescript code using prettier and write it to a file
 * @param output typescript code
 * @param fullOutputPath full path to the output file
 * @param logPrefix prefix for debug logs
 */
export async function formatAndWriteTypescript(
  output: string,
  fullOutputPath: string,
  logPrefix: string,
): Promise<void> {
  const formattedOutput = await formatTypescript(output);

  await mkdir(dirname(fullOutputPath), { recursive: true });

  await writeFile(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}
