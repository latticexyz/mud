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

export function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function getSplinePoints(splines: [number, number][], x: number) {
  const index = splines.findIndex((s) => s[0] >= x);
  if (index > 0) return [splines[index - 1], splines[index]];
  console.warn("out of reach", x, splines);
  return undefined;
}

export function createSplines(splines: [number, number][]): (x: number) => number {
  return (x: number) => {
    const points = getSplinePoints(splines, x);
    if (!points) return x;

    const t = (x - points[0][0]) / (points[1][0] - points[0][0]);
    const height = lerp(t, points[0][1], points[1][1]);

    return height;
  };
}
