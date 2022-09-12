import fs from "fs";
import IntervalTree from "@flatten-js/interval-tree";

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

function linearInterpolation(points: [number, number][]) {
  const functions: { a: number; b: number; range: [number, number] }[] = [];
  for (let i = 1; i < points.length; i++) {
    const xn = points[i][0];
    const xm = points[i - 1][0];
    const yn = points[i][1];
    const ym = points[i - 1][1];

    // add coefficients
    functions.push({
      a: ym / (xm - xn) - yn / (xm - xn),
      b: (xm * yn) / (xm - xn) - (xn * ym) / (xm - xn),
      range: [xm, xn],
    });
  }
  return functions;
}

export function createSplinesOld(points: [number, number][]) {
  console.log("Interval tree", IntervalTree);
  const splines = new IntervalTree<[number, number]>();

  const functions = linearInterpolation(points);

  for (const { a, b, range } of functions) {
    splines.insert(range, [a, b]);
  }

  return function applySpline(x: number): number {
    const spline = splines.search([x, x]);
    if (spline.length === 0) {
      console.warn("no spline found for ", x);
      return x;
    }

    const [a, b] = spline[0];

    return a * x + b;
  };
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
