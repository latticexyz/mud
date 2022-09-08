import fs from "fs";

export function encodePackedU32(inputs: number[]): Buffer {
  const buffer = Buffer.from(inputs.map((i) => i.toString(16).padStart(8, "0")).join(""), "hex");
  return buffer;
}

export async function fetchAndCompileWasmModule(url: URL) {
  try {
    return await WebAssembly.compileStreaming(fetch(url));
  } catch {
    return WebAssembly.compile(fs.readFileSync(url));
  }
}
