// https://github.com/nalinbhardwaj/devconnect-procgen-workshop/blob/master/packages/procgen-utils/src/perlin.ts
import BigInt, { BigInteger } from "big-integer";
import { Fraction } from "./fraction";
import { soliditySha3, toBN } from "web3-utils";

const TRACK_LCM = false;

/**
 * A object containing a pair of x,y coordinates.
 */
export interface IntegerVector {
  x: number;
  y: number;
}

interface Vector {
  x: Fraction;
  y: Fraction;
}

interface GradientAtPoint {
  coords: Vector;
  gradient: Vector;
}

/**
 * Various configuration used for calculating perlin.
 * Always make sure these values match the contracts you are working with
 * or else your transactions **will** be reverted.
 */
export interface PerlinConfig {
  /**
   * The seed being used for the perlin calculation.
   */
  seed: number;
  /**
   * The `PERLIN_LENGTH_SCALE` being used to calculate perlin.
   */
  scale: number;
  /**
   * Whether the X coordinate is being mirrored in the perlin calculation.
   *
   * @default false
   */
  mirrorX: boolean;
  /**
   * Whether the Y coordinate is being mirrored in the perlin calculation.
   *
   * @default false
   */
  mirrorY: boolean;
  /**
   * If the resulting perlin should be "floored".
   *
   * @default false
   */
  floor: boolean;
}

type HashFn = (...inputs: number[]) => number;

export const rand = (seed: number) => (x: number, y: number, scale: number) => {
  return toBN(
    soliditySha3({ t: "uint32", v: x }, { t: "uint32", v: y }, { t: "uint32", v: scale }, { t: "uint32", v: seed })!
  )
    .mod(toBN(16))
    .toNumber();
};

/*
const generateVecs = () => {
  const vecs = 16;
  const precision = 3;
  let range: number[] = [];
  for (let i = 0; i < vecs; i++) range.push(i);
  const out = range
    .map((x) => (x * Math.PI * 2) / vecs)
    .map((x) => [
      Math.floor(Math.cos(x) * 10 ** precision),
      Math.floor(Math.sin(x) * 10 ** precision),
    ]);
  return out.map(([x, y]) => ({
    x: new Fraction(x, 10 ** precision),
    y: new Fraction(y, 10 ** precision),
  }));
};
const vecs = generateVecs();
*/
let vecs: Array<Vector>;
try {
  vecs = [
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
  ].map(([x, y]) => ({ x: new Fraction(x, 1000), y: new Fraction(y, 1000) }));
} catch (err) {
  console.error("Browser does not support BigInt.", err);
}

export const getRandomGradientAt = (point: Vector, scale: Fraction, randFn: HashFn): Vector => {
  const val = vecs[randFn(point.x.valueOf(), point.y.valueOf(), scale.valueOf())];
  return val;
};

const minus: (a: Vector, b: Vector) => Vector = (a, b) => {
  return {
    x: a.x.sub(b.x),
    y: a.y.sub(b.y),
  };
};

const dot: (a: Vector, b: Vector) => Fraction = (a, b) => {
  return a.x.mul(b.x).add(a.y.mul(b.y));
};

// 6 t^5 - 15 t^4 + 10 t^3
const smoothStep: (x: Fraction) => Fraction = (x) => {
  return x.pow(5).mul(6).sub(x.pow(4).mul(15)).add(x.pow(3).mul(10));
};

const scalarMultiply: (s: Fraction, v: Vector) => Vector = (s, v) => ({
  x: v.x.mul(s),
  y: v.y.mul(s),
});

const getWeight: (corner: Vector, p: Vector) => Fraction = (corner, p) => {
  return smoothStep(new Fraction(1).sub(p.x.sub(corner.x).abs())).mul(
    smoothStep(new Fraction(1).sub(p.y.sub(corner.y).abs()))
  );
};

// p is in a scale x scale square. we scale down to a 1x1 square
const perlinValue: (
  corners: [GradientAtPoint, GradientAtPoint, GradientAtPoint, GradientAtPoint],
  scale: Fraction,
  p: Vector
) => Fraction = (corners, scale, p) => {
  let ret = new Fraction(0);
  for (const corner of corners) {
    const distVec = minus(p, corner.coords);
    ret = ret.add(
      getWeight(scalarMultiply(scale.inverse(), corner.coords), scalarMultiply(scale.inverse(), p)).mul(
        dot(scalarMultiply(scale.inverse(), distVec), corner.gradient)
      )
    );
  }
  return ret;
};

let runningLCM = BigInt(1);

const updateLCM = (oldLCM: BigInteger, newValue: BigInteger): BigInteger => {
  if (!TRACK_LCM) {
    return oldLCM;
  }

  const newLCM = BigInt.lcm(oldLCM, newValue);
  if (newLCM !== oldLCM) {
    console.log("LCM updated to ", newLCM);
  }

  return newLCM;
};

// fractional mod
const realMod = (dividend: Fraction, divisor: Fraction): Fraction => {
  const temp = dividend.mod(divisor);
  // temp.s is sign
  if (temp.s.toString() === "-1") {
    return temp.add(divisor);
  }
  return temp;
};

const valueAt = (p: Vector, scale: Fraction, randFn: (...inputs: number[]) => number) => {
  const bottomLeftCoords = {
    x: p.x.sub(realMod(p.x, scale)),
    y: p.y.sub(realMod(p.y, scale)),
  };
  const bottomRightCoords = {
    x: bottomLeftCoords.x.add(scale),
    y: bottomLeftCoords.y,
  };
  const topLeftCoords = {
    x: bottomLeftCoords.x,
    y: bottomLeftCoords.y.add(scale),
  };
  const topRightCoords = {
    x: bottomLeftCoords.x.add(scale),
    y: bottomLeftCoords.y.add(scale),
  };

  const bottomLeftGrad = {
    coords: bottomLeftCoords,
    gradient: getRandomGradientAt(bottomLeftCoords, scale, randFn),
  };
  const bottomRightGrad = {
    coords: bottomRightCoords,
    gradient: getRandomGradientAt(bottomRightCoords, scale, randFn),
  };
  const topLeftGrad = {
    coords: topLeftCoords,
    gradient: getRandomGradientAt(topLeftCoords, scale, randFn),
  };
  const topRightGrad = {
    coords: topRightCoords,
    gradient: getRandomGradientAt(topRightCoords, scale, randFn),
  };

  const out = perlinValue([bottomLeftGrad, bottomRightGrad, topLeftGrad, topRightGrad], scale, p);

  return out;
};

export const MAX_PERLIN_VALUE = 64;

/**
 * Calculates the perlin for a location, given the x,y pair and the PerlinConfig for the game.
 *
 * @param coords An object of the x,y coordinates for which perlin is being calculated.
 * @param options An object containing the configuration for the perlin algorithm.
 */
export function perlin(coords: IntegerVector, options: PerlinConfig) {
  let { x, y } = coords;
  if (options.mirrorY) x = Math.abs(x); // mirror across the vertical y-axis
  if (options.mirrorX) y = Math.abs(y); // mirror across the horizontal x-axis
  const fractionalP = { x: new Fraction(x), y: new Fraction(y) };
  let ret = new Fraction(0);
  const pValues: Fraction[] = [];
  for (let i = 0; i < 3; i += 1) {
    // scale must be a power of two, up to 8192
    pValues.push(valueAt(fractionalP, new Fraction(options.scale * 2 ** i), rand(options.seed)));
  }
  ret = ret.add(pValues[0]);
  ret = ret.add(pValues[0]);
  ret = ret.add(pValues[1]);
  ret = ret.add(pValues[2]);

  ret = ret.div(4);
  runningLCM = updateLCM(runningLCM, BigInt(ret.d));

  ret = ret.mul(MAX_PERLIN_VALUE / 2);
  if (options.floor) ret = ret.floor();
  ret = ret.add(MAX_PERLIN_VALUE / 2);

  const out = ret.valueOf();
  return Math.floor(out * 100) / 100;
}
