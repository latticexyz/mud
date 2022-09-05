// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
// https://github.com/nalinbhardwaj/devconnect-procgen-workshop/blob/master/eth/contracts/Perlin.sol

import "abdk-libraries-solidity/ABDKMath64x64.sol";
import {console} from "hardhat/console.sol";

library Perlin {
  int16 constant vecsDenom = 1000;
  uint16 constant perlinMax = 64;

  // Perlin Noise

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

  /*
   * Minimum value signed 64.64-bit fixed point number may have.
   */
  int128 private constant MIN_64x64 = -0x80000000000000000000000000000000;

  /*
   * Maximum value signed 64.64-bit fixed point number may have.
   */
  int128 private constant MAX_64x64 = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

  function div(int128 x, int128 y) internal pure returns (int128) {
    unchecked {
      require(y != 0);
      int256 result = (int256(x) << 64) / y;
      require(result >= MIN_64x64 && result <= MAX_64x64);
      return int128(result);
    }
  }

  // 6 t^5 - 15 t^4 + 10 t^3
  function smoothStep(uint64 x, uint32 scale) public view returns (int128) {
    int128 t = ABDKMath64x64.divu(x, scale**2); // Remove the implicit denominator
    int128 f = ABDKMath64x64.add(
      ABDKMath64x64.sub(
        ABDKMath64x64.mul(ABDKMath64x64.pow(t, 5), ABDKMath64x64.fromUInt(6)),
        ABDKMath64x64.mul(ABDKMath64x64.pow(t, 4), ABDKMath64x64.fromUInt(15))
      ),
      ABDKMath64x64.mul(ABDKMath64x64.pow(t, 3), ABDKMath64x64.fromUInt(10))
    );
    // int128 f = t * t * t * (t * (t * 6 - 15) + 10);
    return ABDKMath64x64.mul(f, ABDKMath64x64.fromUInt(scale**2)); // Readd the implicit denominator
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
  ) public view returns (int128) {
    uint64 res = 1;

    if (cornerX > x) res *= (scale - (cornerX - x));
    else res *= (scale - (x - cornerX));

    if (cornerY > y) res *= (scale - (cornerY - y));
    else res *= (scale - (y - cornerY));

    return smoothStep(res, scale);
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
      int128 weight = getWeight(corner[0], corner[1], x, y, scale);

      // this has an implicit denominator of vecsDenom * scale ** 3
      resNumerator += ABDKMath64x64.mul(weight, dot);
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
