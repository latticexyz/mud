// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
// https://github.com/nalinbhardwaj/devconnect-procgen-workshop/blob/master/eth/contracts/Perlin.sol

import "abdk-libraries-solidity/ABDKMath64x64.sol";

library Perlin {
  int16 constant vecsDenom = 1000;
  uint16 constant perlinMax = 64;

  // Perlin Noise
  // interpolation function [0,1] -> [0,1]
  function smoothStep(int128 x) public pure returns (int128) {
    return x;
  }

  // returns a random unit vector
  // implicit denominator of vecsDenom
  function getGradientAt(
    uint32 x,
    uint32 y,
    uint32 scale,
    uint32 seed
  ) public view returns (int16[2] memory) {
    uint256 idx = uint256(keccak256(abi.encodePacked(x, y, scale, seed))) % 16;
    int16[2][16] memory vecs = [
      [int16(1000), int16(0)],
      [int16(923), int16(382)],
      [int16(707), int16(707)],
      [int16(382), int16(923)],
      [int16(0), int16(1000)],
      [int16(-383), int16(923)],
      [int16(-708), int16(707)],
      [int16(-924), int16(382)],
      [int16(-1000), int16(0)],
      [int16(-924), int16(-383)],
      [int16(-708), int16(-708)],
      [int16(-383), int16(-924)],
      [int16(-1), int16(-1000)],
      [int16(382), int16(-924)],
      [int16(707), int16(-708)],
      [int16(923), int16(-383)]
    ];
    return vecs[idx];
  }

  // the computed perlin value at a point is a weighted average of dot products with
  // gradient vectors at the four corners of a grid square.
  // this isn't scaled; there's an implicit denominator of scale ** 2
  function getWeight(
    uint32 cornerX,
    uint32 cornerY,
    uint32 x,
    uint32 y,
    uint32 scale
  ) public pure returns (uint64) {
    uint64 res = 1;

    if (cornerX > x) res *= (scale - (cornerX - x));
    else res *= (scale - (x - cornerX));

    if (cornerY > y) res *= (scale - (cornerY - y));
    else res *= (scale - (y - cornerY));

    return res;
  }

  function getCorners(
    uint32 x,
    uint32 y,
    uint32 scale
  ) public pure returns (uint32[2][4] memory) {
    uint32 lowerX = (x / scale) * scale;
    uint32 lowerY = (y / scale) * scale;

    return [[lowerX, lowerY], [lowerX + scale, lowerY], [lowerX + scale, lowerY + scale], [lowerX, lowerY + scale]];
  }

  function getSingleScalePerlin(
    uint32 x,
    uint32 y,
    uint32 scale,
    uint32 seed
  ) public view returns (int128) {
    uint32[2][4] memory corners = getCorners(x, y, scale);

    int128 resNumerator = 0;

    for (uint8 i = 0; i < 4; i++) {
      uint32[2] memory corner = corners[i];

      // this has an implicit denominator of scale
      int32[2] memory offset = [int32(x) - int32(corner[0]), int32(y) - int32(corner[1])];

      // this has an implicit denominator of vecsDenom
      int16[2] memory gradient = getGradientAt(corner[0], corner[1], scale, seed);

      // this has an implicit denominator of vecsDenom * scale
      int64 dot = offset[0] * int64(gradient[0]) + offset[1] * int64(gradient[1]);

      // this has an implicit denominator of scale ** 2
      uint64 weight = getWeight(corner[0], corner[1], x, y, scale);

      // this has an implicit denominator of vecsDenom * scale ** 3
      resNumerator += int128(int64(weight)) * int128(dot);
    }

    return ABDKMath64x64.divi(int256(resNumerator), int256(vecsDenom) * int256(int32(scale))**3);
  }

  function computePerlin(
    uint32 x,
    uint32 y,
    uint32 seed,
    uint32 scale
  ) public view returns (uint256) {
    int128 perlin = ABDKMath64x64.fromUInt(0);

    for (uint8 i = 0; i < 3; i++) {
      int128 v = getSingleScalePerlin(x, y, scale * uint32(2**i), seed);
      perlin = ABDKMath64x64.add(perlin, v);
    }
    perlin = ABDKMath64x64.add(perlin, getSingleScalePerlin(x, y, scale * uint32(2**0), seed));

    perlin = ABDKMath64x64.div(perlin, ABDKMath64x64.fromUInt(4));
    int128 perlinScaledShifted = ABDKMath64x64.add(
      ABDKMath64x64.mul(perlin, ABDKMath64x64.fromUInt(uint256(perlinMax / 2))),
      ABDKMath64x64.fromUInt((uint256(perlinMax / 2)))
    );

    return ABDKMath64x64.toUInt(perlinScaledShifted);
  }
}
