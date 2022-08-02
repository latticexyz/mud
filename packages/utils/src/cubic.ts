export function randomize(seed: number, x: number, y: number) {
  const RND_A = 134775813;
  const RND_B = 1103515245;

  return (((((x ^ y) * RND_A) ^ (seed + x)) * (((RND_B * x) << 16) ^ (RND_B * y - RND_A))) >>> 0) / 4294967295;
}

export function tile(coordinate: number, period: number) {
  if (coordinate < 0) while (coordinate < 0) coordinate += period;
  return coordinate % period;
}

export function interpolate(a: number, b: number, c: number, d: number, x: number) {
  const p = d - c - (a - b);

  return x * (x * (x * p + (a - b - p)) + (c - a)) + b;
}

/**
 * Config a cubic noise.
 * @param {Number} seed A seed in the range [0, 1].
 * @param {Number} [periodX] The number of units after which the x coordinate repeats.
 * @param {Number} [periodY] The number of units after which the y coordinate repeats.
 * @returns {Object} A configuration object used by noise functions.
 */
export function cubicNoiseConfig(
  seed: number,
  octave: number,
  periodX = Number.MAX_SAFE_INTEGER,
  periodY = Number.MAX_SAFE_INTEGER
) {
  return {
    seed: Math.floor(seed * Number.MAX_SAFE_INTEGER),
    periodX: periodX,
    periodY: periodY,
    octave,
  };
}

/**
 * Sample 1D cubic noise.
 * @param {Object} config A valid noise configuration.
 * @param {Number} x The X position to sample at.
 * @returns {Number} A noise value in the range [0, 1].
 */
export function cubicNoiseSample1(config: ReturnType<typeof cubicNoiseConfig>, x: number) {
  const xi = Math.floor(x);
  const lerp = x - xi;

  return (
    interpolate(
      randomize(config.seed, tile(xi - 1, config.periodX), 0),
      randomize(config.seed, tile(xi, config.periodX), 0),
      randomize(config.seed, tile(xi + 1, config.periodX), 0),
      randomize(config.seed, tile(xi + 2, config.periodX), 0),
      lerp
    ) *
      0.666666 +
    0.166666
  );
}

/**
 * Sample 2D cubic noise.
 * @param {Object} config A valid noise configuration.
 * @param {Number} x The X position to sample at.
 * @param {Number} y The Y position to sample at.
 * @returns {Number} A noise value in the range [0, 1].
 */
export function cubicNoiseSample2(
  { octave, periodX, periodY, seed }: ReturnType<typeof cubicNoiseConfig>,
  x: number,
  y: number
) {
  const xi = Math.floor(x / octave);
  const lerpX = x / octave - xi;
  const yi = Math.floor(y / octave);
  const lerpY = y / octave - yi;
  const x0 = tile(xi - 1, periodX);
  const x1 = tile(xi, periodX);
  const x2 = tile(xi + 1, periodX);
  const x3 = tile(xi + 2, periodX);

  const xSamples = new Array(4);

  for (let i = 0; i < 4; ++i) {
    const y = tile(yi - 1 + i, periodY);

    xSamples[i] = interpolate(
      randomize(seed, x0, y),
      randomize(seed, x1, y),
      randomize(seed, x2, y),
      randomize(seed, x3, y),
      lerpX
    );
  }

  return interpolate(xSamples[0], xSamples[1], xSamples[2], xSamples[3], lerpY) * 0.5 + 0.25;
}
