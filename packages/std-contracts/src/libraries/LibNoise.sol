// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

int256 constant RND_A = 134775813;
int256 constant RND_B = 1103515245;
int256 constant ACCURACY = 10;
import { console } from "forge-std/console.sol";

struct CubicNoiseConfig {
  int32 seed;
  int32 octave;
  int32 scale;
  int64 periodX;
  int64 periodY;
}

library LibNoise {
  function abs(int256 number) internal pure returns (uint256) {
    return number < 0 ? uint256(-number) : uint256(number);
  }

  function randomize(
    int256 seed,
    int256 x,
    int256 y
  ) internal view returns (int256) {
    // TODO: make sure this bitshift is actually doign the correct thing (the js version uses >>>, which is an unsigned shift)
    return int256(abs((((((x ^ y) * RND_A) ^ (seed + x)) * (((RND_B * x) << 16) ^ (RND_B * y - RND_A)))) / 4294967295));
  }

  function tile(int256 coordinate, int64 period) internal pure returns (int256) {
    if (coordinate < 0) while (coordinate < 0) coordinate += period;
    return coordinate % period;
  }

  function interpolate(
    int256 a,
    int256 b,
    int256 c,
    int256 d,
    int256 x,
    int256 s,
    int256 scale
  ) internal view returns (int256) {
    int256 p = d - c - (a - b);
    int256 step1 = (c * (s**2) + a * s * (-s + x) + x * (-(b + p) * s + p * x));
    console.log(step1 > 0);
    console.log(uint256(step1));
    return (b * (s**3) + x * step1) * scale;
    // return x * (x * (x * p + (a - b - p)) + (c - a)) + b;
  }

  function cubicNoiseSample2(
    CubicNoiseConfig memory config,
    int256 x,
    int256 y
  ) internal view returns (int256) {
    int256 xi = x / config.octave;
    int256 yi = y / config.octave;

    int256[] memory xSamples = new int256[](4);

    for (int256 i; i < 4; i++) {
      y = tile(yi - 1 + i, config.periodY);

      xSamples[uint256(i)] = interpolate(
        randomize(config.seed, tile(xi - 1, config.periodX), y),
        randomize(config.seed, tile(xi, config.periodX), y),
        randomize(config.seed, tile(xi + 1, config.periodX), y),
        randomize(config.seed, tile(xi + 2, config.periodX), y),
        (x * ACCURACY) / config.octave - xi * ACCURACY,
        ACCURACY,
        1
      );
    }

    return
      interpolate(
        xSamples[0],
        xSamples[1],
        xSamples[2],
        xSamples[3],
        (y * ACCURACY) / config.octave - yi * ACCURACY,
        ACCURACY,
        config.scale
      ) / ACCURACY**6;
  }
}
