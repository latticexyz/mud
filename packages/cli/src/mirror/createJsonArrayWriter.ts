import { createWriteStream } from "fs";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";

export function createJsonArrayWriter(filename: string) {
  const gzip = createGzip();
  const fileStream = createWriteStream(`${filename}.json.gz`);
  const output = pipeline(gzip, fileStream);
  gzip.write("[\n");
  return {
    push(data: any) {
      gzip.write(`  ${JSON.stringify(data)},\n`);
      return this;
    },
    async end() {
      gzip.end("]\n");
      await output;
    },
  };
}
