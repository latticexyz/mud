import { rand } from "./env";

// https://github.com/nalinbhardwaj/devconnect-procgen-workshop/blob/master/eth/contracts/Perlin.sol
// Ported to AssemblyScript by @alvrs

const vecsDenom = 1000;
const perlinMax = 64;

// returns a random unit vector
// implicit denominator of vecsDenom
function getGradientAt(x: i32, y: i32, scale: i32, seed: i32): i16[] {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);

  view.setInt32(0, x);
  view.setInt32(4, y);
  view.setInt32(8, scale);
  view.setInt32(12, seed);

  const idx = rand(buffer) % 16;

  const vecs: i16[][] = [
    [1000, 0],
    [923, 382],
    [707, 707],
    [382, 923],
    [0, 1000],
    [-383, 923],
    [-708, 707],
    [-924, 382],
    [-1000, 0],
    [-924, -383],
    [-708, -708],
    [-383, -924],
    [-1, -1000],
    [382, -924],
    [707, -708],
    [923, -383],
  ];

  return vecs[idx];
}

// 6 t^5 - 15 t^4 + 10 t^3
export function smoothStep(x: i64, scale: i32): f64 {
  const t: f64 = f64(x) / f64(scale ** 2); // Remove the implicit denominator
  const f = t * t * t * (t * (t * 6 - 15) + 10);
  return f * scale ** 2; // Readd the implicit denominator
}

// the computed perlin value at a point is a weighted average of dot products with
// gradient vectors at the four corners of a grid square.
// this isn't scaled; there's an implicit denominator of scale ** 2
function getWeight(cornerX: i32, cornerY: i32, x: i32, y: i32, scale: i32): f64 {
  let res: i64 = 1;

  if (cornerX > x) res *= scale - (cornerX - x);
  else res *= scale - (x - cornerX);

  if (cornerY > y) res *= scale - (cornerY - y);
  else res *= scale - (y - cornerY);

  return smoothStep(res, scale);
}

function getCorners(x: i32, y: i32, scale: i32): i32[][] {
  const lowerX: i32 = (x / scale) * scale;
  const lowerY: i32 = (y / scale) * scale;

  return [
    [lowerX, lowerY],
    [lowerX + scale, lowerY],
    [lowerX + scale, lowerY + scale],
    [lowerX, lowerY + scale],
  ];
}

function getSingleScalePerlin(x: i32, y: i32, scale: i32, seed: i32): f64 {
  const corners: i32[][] = getCorners(x, y, scale);

  let resNumerator: f64 = 0; // f64 instead of int128

  for (let i = 0; i < 4; i++) {
    const corner: i32[] = corners[i];

    // this has an implicit denominator of scale
    const offset: i32[] = [x - corner[0], y - corner[1]];

    // this has an implicit denominator of vecsDenom
    const gradient: i16[] = getGradientAt(corner[0], corner[1], scale, seed);

    // this has an implicit denominator of vecsDenom * scale
    const dot: i64 = offset[0] * gradient[0] + offset[1] * gradient[1];

    // this has an implicit denominator of scale ** 2
    const weight: f64 = getWeight(corner[0], corner[1], x, y, scale);

    // this has an implicit denominator of vecsDenom * scale ** 3
    resNumerator += weight * f64(dot);
  }

  return f64(resNumerator) / f64(vecsDenom * scale ** 3);
}

export function perlinSingle(x: i32, y: i32, seed: i32, scale: i32, floor: boolean): f64 {
  let perlin: f64 = 0;

  for (let i = 0; i < 3; i++) {
    const v: f64 = getSingleScalePerlin(x, y, scale * 2 ** i, seed);
    perlin += v;
  }

  perlin += getSingleScalePerlin(x, y, scale, seed);

  perlin /= 4;

  let perlinScaledShifted = (perlin * perlinMax) / 2 + perlinMax / 2;

  if (floor) perlinScaledShifted = Math.floor(perlinScaledShifted);

  return perlinScaledShifted;
}

export function perlinRect(x0: i32, y0: i32, w: i32, h: i32, seed: i32, scale: i32, floor: boolean): StaticArray<f64> {
  const values: StaticArray<f64> = new StaticArray<f64>(w * h);

  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      let perlin: f64 = 0;

      for (let i = 0; i < 3; i++) {
        const v: f64 = getSingleScalePerlin(x, y, scale * 2 ** i, seed);
        perlin += v;
      }

      perlin += getSingleScalePerlin(x, y, scale, seed);

      perlin /= 4;

      let perlinScaledShifted = (perlin * perlinMax) / 2 + perlinMax / 2;

      if (floor) perlinScaledShifted = Math.floor(perlinScaledShifted);

      values[y * w + x] = perlinScaledShifted;
    }
  }

  return values;
}
