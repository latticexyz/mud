import fs from "node:fs/promises";

export async function isReadable(filename: string) {
  try {
    await fs.access(filename, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
