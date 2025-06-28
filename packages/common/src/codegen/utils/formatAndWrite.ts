import fs from "node:fs/promises";
import path from "node:path";
import { formatSolidity, formatTypescript } from "./format";
import { debug, error } from "../debug";

/**
 * Formats solidity code using prettier and write it to a file
 * @param content solidity code
 * @param fullOutputPath full path to the output file
 * @param logPrefix prefix for debug logs
 */
export async function formatAndWriteSolidity(
  content: string,
  fullOutputPath: string,
  logPrefix: string,
): Promise<void> {
  let output = content;
  try {
    output = await formatSolidity(output);
  } catch (e) {
    error(`Error while attempting to format ${fullOutputPath}`, e);
  }
  await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
  await fs.writeFile(fullOutputPath, output);
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

  await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });

  await fs.writeFile(fullOutputPath, formattedOutput);
  debug(`${logPrefix}: ${fullOutputPath}`);
}
