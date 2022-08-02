import { Keccak } from "sha3";
import { Buffer } from "buffer";

const perlinMax = 64;
const LARGE_NUMBER = 2 ** 20 - 1;

interface IntegerVector {
  x: number;
  y: number;
}

export interface PerlinConfig {
  key: number;
  scale: number;
}

const vecs: [number, number][] = [
  [1024 / 1024, 0 / 1024],
  [946 / 1024, 391 / 1024],
  [724 / 1024, 724 / 1024],
  [391 / 1024, 946 / 1024],
  [0 / 1024, 1024 / 1024],
  [-392 / 1024, 946 / 1024],
  [-725 / 1024, 724 / 1024],
  [-947 / 1024, 391 / 1024],
  [-1024 / 1024, 0 / 1024],
  [-947 / 1024, -392 / 1024],
  [-725 / 1024, -725 / 1024],
  [-392 / 1024, -947 / 1024],
  [0 / 1024, -1024 / 1024],
  [391 / 1024, -947 / 1024],
  [724 / 1024, -725 / 1024],
  [946 / 1024, -392 / 1024],
];

function toFourByteBuffer(num: number): Buffer {
  return Buffer.from([(num >> 24) & 255, (num >> 16) & 255, (num >> 8) & 255, num & 255]);
}

function getGradientAt(x: number, y: number, key: number): [number, number] {
  const hash = new Keccak(256);
  hash.update(toFourByteBuffer(x));
  hash.update(toFourByteBuffer(y));
  hash.update(toFourByteBuffer(key));
  const idx = hash.digest().subarray(-1)[0] % 16;
  return vecs[idx];
}

function getWeight(cornerX: number, cornerY: number, x: number, y: number, scale: number): number {
  const res = ((scale - Math.abs(cornerX - x)) * (scale - Math.abs(cornerY - y))) / scale ** 2;
  return res;
}

function getCorners(x: number, y: number, scale: number): [number, number][] {
  const lowerX = Math.floor(x / scale) * scale;
  const lowerY = Math.floor(y / scale) * scale;
  return [
    [lowerX, lowerY],
    [lowerX + scale, lowerY],
    [lowerX + scale, lowerY + scale],
    [lowerX, lowerY + scale],
  ];
}

function getSingleScalePerlin(x: number, y: number, scale: number, key: number): number {
  const corners = getCorners(x, y, scale);
  let res = 0;

  for (const corner of corners) {
    const offset: [number, number] = [(corner[0] - x) / scale, (corner[1] - y) / scale];
    const gradient = getGradientAt(corner[0], corner[1], key);
    const dot = offset[0] * gradient[0] + offset[1] * gradient[1];
    const weight = getWeight(corner[0], corner[1], x, y, scale);
    res += weight * dot;
  }

  return res;
}

export function perlin({ x: _x, y: _y }: IntegerVector, { scale, key }: PerlinConfig): number {
  let perl = 0;
  let denom = 0;

  // handle negative coordinates by shifting
  const x = _x; // _x < 0 ? LARGE_NUMBER + _x : _x;
  const y = _y; // _y < 0 ? LARGE_NUMBER + _y : _y;

  for (let i = 0; i < 3; i++) {
    perl += getSingleScalePerlin(x, y, scale * 2 ** i, key) * 2 ** i;
    denom += 2 ** i;
  }

  perl /= denom;

  perl *= perlinMax / 2;
  perl = Math.floor(perl);
  perl += perlinMax / 2;

  return Math.floor(perl * 100) / 100;
}
