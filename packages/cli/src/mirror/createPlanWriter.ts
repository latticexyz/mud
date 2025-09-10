import { createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { PlanStep } from "./common";

export function createPlanWriter(filename: string) {
  const gzip = createGzip();
  const fileStream = createWriteStream(filename);
  const output = pipeline(gzip, fileStream);
  return {
    write(data: PlanStep) {
      gzip.write(JSON.stringify(data) + "\n");
      return this;
    },
    async end() {
      gzip.end();
      await output;
    },
  };
}
