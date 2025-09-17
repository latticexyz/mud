import { createGunzip } from "node:zlib";
import readline from "node:readline";
import { createReadStream } from "node:fs";
import { PlanStep } from "./common";

export async function* readPlan(filename: string): AsyncGenerator<PlanStep> {
  const lines = readline.createInterface({
    input: createReadStream(filename).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    if (line.trim().length === 0) continue;
    yield JSON.parse(line);
  }
}
