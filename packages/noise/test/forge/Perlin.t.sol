// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "ds-test/test.sol";
import {Perlin} from "../../contracts/Perlin.sol";

contract PerlinTest is DSTest {
  function testGaslimitNoise3D(
    int64 x,
    int64 y,
    int64 z
  ) public {
    Perlin.noise(x, y, z, 7, 64);
  }

  function testGasLimitNoise2D(int64 x, int64 y) public {
    Perlin.noise2d(x, y, 7, 64);
  }

  function testEquality(int64 x, int64 y) public {
    assertEq(Perlin.noise(x, y, 0, 7, 64), Perlin.noise2d(x, y, 7, 64));
  }
}
