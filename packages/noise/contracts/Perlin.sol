// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

// Commonly used numbers as 64.64 fixed point
int128 constant _1 = 2 ** 64;
int128 constant _2 = 2 * 2 ** 64;
int128 constant _6 = 6 * 2 ** 64;
int128 constant _10 = 10 * 2 ** 64;
int128 constant _15 = 15 * 2 ** 64;

struct H {
  int16 X;
  int16 Y;
  int16 Z;
  int16 A;
  int16 AA;
  int16 AB;
  int16 B;
  int16 BA;
  int16 BB;
  int16 pX;
  int16 pA;
  int16 pB;
  int16 pAA;
  int16 pAB;
  int16 pBA;
  int16 pBB;
  int128 x;
  int128 y;
  int128 z;
  int128 u;
  int128 v;
  int128 w;
  int128 r;
}

struct H2 {
  int16 X;
  int16 Y;
  int16 A;
  int16 AA;
  int16 AB;
  int16 B;
  int16 BA;
  int16 BB;
  int16 pX;
  int16 pA;
  int16 pB;
  int128 x;
  int128 y;
  int128 u;
  int128 r;
}

/// @title Perlin noise library
/// @author alvarius
/// @notice Ported from perlin reference implementation (https://cs.nyu.edu/~perlin/noise/)
library Perlin {
  function noise2d(int256 _x, int256 _y, int256 denom, uint8 precision) internal pure returns (int128) {
    H2 memory h = H2(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    // Convert fraction into 64.64 fixed point number
    h.x = Math.divi(_x, denom);
    h.y = Math.divi(_y, denom);

    // Find unit cube that contains point
    h.X = int16(Math.toInt(h.x)) & 0xff;
    h.Y = int16(Math.toInt(h.y)) & 0xff;

    // Find relative x,y,z of point in cube
    h.x = Math.sub(h.x, floor(h.x));
    h.y = Math.sub(h.y, floor(h.y));

    // Compute fade curves for each x,y,z
    h.u = fade(h.x);

    // Hash coordinates of the 4 square corners
    h.pX = p2(h.X);
    h.A = i0(h.pX) + h.Y;
    h.pA = p2(h.A);
    h.AA = i0(h.pA);
    h.AB = i1(h.pA);
    h.B = i1(h.pX) + h.Y;
    h.pB = p2(h.B);
    h.BA = i0(h.pB);
    h.BB = i1(h.pB);

    // Add blended results from 4 corners of square
    h.r = lerp(
      fade(h.y),
      lerp(h.u, grad2d(int16(p(h.AA)), h.x, h.y), grad2d(int16(p(h.BA)), dec(h.x), h.y)),
      lerp(h.u, grad2d(int16(p(h.AB)), h.x, dec(h.y)), grad2d(int16(p(h.BB)), dec(h.x), dec(h.y)))
    );

    // Shift to range from 0 to 1
    return Math.div(Math.add(h.r, _1), _2) >> (64 - precision);
  }

  function noise(int256 _x, int256 _y, int256 _z, int256 denom, uint8 precision) internal pure returns (int128) {
    H memory h = H(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    // Convert fraction into 64.64 fixed point number
    h.x = Math.divi(_x, denom);
    h.y = Math.divi(_y, denom);
    h.z = Math.divi(_z, denom);

    // Find unit cube that contains point
    h.X = int16(Math.toInt(h.x)) & 255;
    h.Y = int16(Math.toInt(h.y)) & 255;
    h.Z = int16(Math.toInt(h.z)) & 255;

    // Find relative x,y,z of point in cube
    h.x = Math.sub(h.x, floor(h.x));
    h.y = Math.sub(h.y, floor(h.y));
    h.z = Math.sub(h.z, floor(h.z));

    // Compute fade curves for each x,y,z
    h.u = fade(h.x);
    h.v = fade(h.y);
    h.w = fade(h.z);

    // Hash coordinates of the 8 cube corners
    h.pX = p2(h.X);
    h.A = i0(h.pX) + h.Y;
    h.pA = p2(h.A);
    h.AA = i0(h.pA) + h.Z;
    h.AB = i1(h.pA) + h.Z;
    h.B = i1(h.pX) + h.Y;
    h.pB = p2(h.B);
    h.BA = i0(h.pB) + h.Z;
    h.BB = i1(h.pB) + h.Z;
    h.pAA = p2(h.AA);
    h.pAB = p2(h.AB);
    h.pBA = p2(h.BA);
    h.pBB = p2(h.BB);

    // Add blended results from 8 corners of cube
    h.r = lerp(
      h.w,
      lerp(
        h.v,
        lerp(h.u, grad(i0(h.pAA), h.x, h.y, h.z), grad(i0(h.pBA), dec(h.x), h.y, h.z)),
        lerp(h.u, grad(i0(h.pAB), h.x, dec(h.y), h.z), grad(i0(h.pBB), dec(h.x), dec(h.y), h.z))
      ),
      lerp(
        h.v,
        lerp(h.u, grad(i1(h.pAA), h.x, h.y, dec(h.z)), grad(i1(h.pBA), dec(h.x), h.y, dec(h.z))),
        lerp(h.u, grad(i1(h.pAB), h.x, dec(h.y), dec(h.z)), grad(i1(h.pBB), dec(h.x), dec(h.y), dec(h.z)))
      )
    );

    // Shift to range from 0 to 1
    return Math.div(Math.add(h.r, _1), _2) >> (64 - precision);
  }

  function dec(int128 x) internal pure returns (int128) {
    return Math.sub(x, _1);
  }

  function floor(int128 x) internal pure returns (int128) {
    return Math.fromInt(int256(Math.toInt(x)));
  }

  /**
   * Computes t * t * t * (t * (t * 6 - 15) + 10)
   **/
  function fade(int128 t) internal pure returns (int128) {
    return Math.mul(t, Math.mul(t, Math.mul(t, (Math.add(Math.mul(t, (Math.sub(Math.mul(t, _6), _15))), _10)))));
  }

  /**
   * Computes a + t * (b - a)
   **/
  function lerp(int128 t, int128 a, int128 b) internal pure returns (int128) {
    return Math.add(a, Math.mul(t, (Math.sub(b, a))));
  }

  /**
   * Modified from original perlin paper based on http://riven8192.blogspot.com/2010/08/calculate-perlinnoise-twice-as-fast.html
   **/
  function grad(int16 _hash, int128 x, int128 y, int128 z) internal pure returns (int128) {
    // Convert lower 4 bits to hash code into 12 gradient directions
    int16 h = _hash & 0xF;

    if (h <= 0x7) {
      if (h <= 0x3) {
        if (h <= 0x1) {
          if (h == 0x0) return Math.add(x, y);
          return Math.sub(y, x);
        } else {
          if (h == 0x2) return Math.sub(x, y);
          return Math.sub(Math.neg(x), y);
        }
      } else {
        if (h <= 0x5) {
          if (h == 0x4) return Math.add(x, z);
          return Math.sub(z, x);
        } else {
          if (h == 0x6) return Math.sub(x, z);
          return Math.sub(Math.neg(x), z);
        }
      }
    } else {
      if (h <= 0xB) {
        if (h <= 0x9) {
          if (h == 0x8) return Math.add(y, z);
          return Math.sub(z, y);
        } else {
          if (h == 0xA) return Math.sub(y, z);
          return Math.sub(Math.neg(y), z);
        }
      } else {
        if (h <= 0xD) {
          if (h == 0xC) return Math.add(y, x);
          return Math.add(Math.neg(y), z);
        } else {
          if (h == 0xE) return Math.sub(y, x);
          return Math.sub(Math.neg(y), z);
        }
      }
    }
  }

  /**
   * Modified from original perlin paper based on http://riven8192.blogspot.com/2010/08/calculate-perlinnoise-twice-as-fast.html
   **/
  function grad2d(int16 _hash, int128 x, int128 y) internal pure returns (int128) {
    // Convert lower 4 bits to hash code into 12 gradient directions
    int16 h = _hash & 0xF;
    if (h <= 0x7) {
      if (h <= 0x3) {
        if (h <= 0x1) {
          if (h == 0x0) return Math.add(x, y);
          return Math.sub(y, x);
        } else {
          if (h == 0x2) return Math.sub(x, y);
          return Math.sub(Math.neg(x), y);
        }
      } else {
        if (h <= 0x5) {
          if (h == 0x4) return x;
          return Math.neg(x);
        } else {
          if (h == 0x6) return x;
          return Math.neg(x);
        }
      }
    } else {
      if (h <= 0xB) {
        if (h <= 0x9) {
          if (h == 0x8) return y;
          return Math.neg(y);
        } else {
          if (h == 0xA) return y;
          return Math.neg(y);
        }
      } else {
        if (h <= 0xD) {
          if (h == 0xC) return Math.add(y, x);
          return Math.neg(y);
        } else {
          if (h == 0xE) return Math.sub(y, x);
          return Math.neg(y);
        }
      }
    }
  }

  /**
   * Returns the value at the given index from the ptable
   */
  function p(int64 i) internal pure returns (int64) {
    return int64(ptable(int256(i)) >> 8);
  }

  /**
   * Returns an encoded tuple of the value at the given index and the subsequent value from the ptable.
   * Value of the requested index is at i0(result), subsequent value is at i1(result)
   */
  function p2(int16 i) internal pure returns (int16) {
    return int16(ptable(int256(i)));
  }

  /**
   * Helper function to access value at index 0 from the encoded tuple returned by p2
   */
  function i0(int16 tuple) internal pure returns (int16) {
    return tuple >> 8;
  }

  /**
   * Helper function to access value at index 1 from the encoded tuple returned by p2
   */
  function i1(int16 tuple) internal pure returns (int16) {
    return tuple & 0xff;
  }

  /**
   * From https://github.com/0x10f/solidity-perlin-noise/blob/master/contracts/PerlinNoise.sol
   *
   * @notice Gets a subsequent values in the permutation table at an index. The values are encoded
   *         into a single 16 bit integer with the  value at the specified index being the most
   *         significant 8 bits and the subsequent value being the least significant 8 bits.
   *
   * @param i the index in the permutation table.
   *
   * @dev The values from the table are mapped out into a binary tree for faster lookups.
   *      Looking up any value in the table in this implementation is is O(8), in
   *      the implementation of sequential if statements it is O(255).
   *
   * @dev The body of this function is autogenerated. Check out the 'gen-ptable' script.
   * (https://github.com/0x10f/solidity-perlin-noise/blob/master/scripts/gen-ptable.js)
   */
  function ptable(int256 i) internal pure returns (int256) {
    i &= 0xff;

    if (i <= 127) {
      if (i <= 63) {
        if (i <= 31) {
          if (i <= 15) {
            if (i <= 7) {
              if (i <= 3) {
                if (i <= 1) {
                  if (i == 0) {
                    return 38816;
                  } else {
                    return 41097;
                  }
                } else {
                  if (i == 2) {
                    return 35163;
                  } else {
                    return 23386;
                  }
                }
              } else {
                if (i <= 5) {
                  if (i == 4) {
                    return 23055;
                  } else {
                    return 3971;
                  }
                } else {
                  if (i == 6) {
                    return 33549;
                  } else {
                    return 3529;
                  }
                }
              }
            } else {
              if (i <= 11) {
                if (i <= 9) {
                  if (i == 8) {
                    return 51551;
                  } else {
                    return 24416;
                  }
                } else {
                  if (i == 10) {
                    return 24629;
                  } else {
                    return 13762;
                  }
                }
              } else {
                if (i <= 13) {
                  if (i == 12) {
                    return 49897;
                  } else {
                    return 59655;
                  }
                } else {
                  if (i == 14) {
                    return 2017;
                  } else {
                    return 57740;
                  }
                }
              }
            }
          } else {
            if (i <= 23) {
              if (i <= 19) {
                if (i <= 17) {
                  if (i == 16) {
                    return 35876;
                  } else {
                    return 9319;
                  }
                } else {
                  if (i == 18) {
                    return 26398;
                  } else {
                    return 7749;
                  }
                }
              } else {
                if (i <= 21) {
                  if (i == 20) {
                    return 17806;
                  } else {
                    return 36360;
                  }
                } else {
                  if (i == 22) {
                    return 2147;
                  } else {
                    return 25381;
                  }
                }
              }
            } else {
              if (i <= 27) {
                if (i <= 25) {
                  if (i == 24) {
                    return 9712;
                  } else {
                    return 61461;
                  }
                } else {
                  if (i == 26) {
                    return 5386;
                  } else {
                    return 2583;
                  }
                }
              } else {
                if (i <= 29) {
                  if (i == 28) {
                    return 6078;
                  } else {
                    return 48646;
                  }
                } else {
                  if (i == 30) {
                    return 1684;
                  } else {
                    return 38135;
                  }
                }
              }
            }
          }
        } else {
          if (i <= 47) {
            if (i <= 39) {
              if (i <= 35) {
                if (i <= 33) {
                  if (i == 32) {
                    return 63352;
                  } else {
                    return 30954;
                  }
                } else {
                  if (i == 34) {
                    return 59979;
                  } else {
                    return 19200;
                  }
                }
              } else {
                if (i <= 37) {
                  if (i == 36) {
                    return 26;
                  } else {
                    return 6853;
                  }
                } else {
                  if (i == 38) {
                    return 50494;
                  } else {
                    return 15966;
                  }
                }
              }
            } else {
              if (i <= 43) {
                if (i <= 41) {
                  if (i == 40) {
                    return 24316;
                  } else {
                    return 64731;
                  }
                } else {
                  if (i == 42) {
                    return 56267;
                  } else {
                    return 52085;
                  }
                }
              } else {
                if (i <= 45) {
                  if (i == 44) {
                    return 29987;
                  } else {
                    return 8971;
                  }
                } else {
                  if (i == 46) {
                    return 2848;
                  } else {
                    return 8249;
                  }
                }
              }
            }
          } else {
            if (i <= 55) {
              if (i <= 51) {
                if (i <= 49) {
                  if (i == 48) {
                    return 14769;
                  } else {
                    return 45345;
                  }
                } else {
                  if (i == 50) {
                    return 8536;
                  } else {
                    return 22765;
                  }
                }
              } else {
                if (i <= 53) {
                  if (i == 52) {
                    return 60821;
                  } else {
                    return 38200;
                  }
                } else {
                  if (i == 54) {
                    return 14423;
                  } else {
                    return 22446;
                  }
                }
              }
            } else {
              if (i <= 59) {
                if (i <= 57) {
                  if (i == 56) {
                    return 44564;
                  } else {
                    return 5245;
                  }
                } else {
                  if (i == 58) {
                    return 32136;
                  } else {
                    return 34987;
                  }
                }
              } else {
                if (i <= 61) {
                  if (i == 60) {
                    return 43944;
                  } else {
                    return 43076;
                  }
                } else {
                  if (i == 62) {
                    return 17583;
                  } else {
                    return 44874;
                  }
                }
              }
            }
          }
        }
      } else {
        if (i <= 95) {
          if (i <= 79) {
            if (i <= 71) {
              if (i <= 67) {
                if (i <= 65) {
                  if (i == 64) {
                    return 19109;
                  } else {
                    return 42311;
                  }
                } else {
                  if (i == 66) {
                    return 18310;
                  } else {
                    return 34443;
                  }
                }
              } else {
                if (i <= 69) {
                  if (i == 68) {
                    return 35632;
                  } else {
                    return 12315;
                  }
                } else {
                  if (i == 70) {
                    return 7078;
                  } else {
                    return 42573;
                  }
                }
              }
            } else {
              if (i <= 75) {
                if (i <= 73) {
                  if (i == 72) {
                    return 19858;
                  } else {
                    return 37534;
                  }
                } else {
                  if (i == 74) {
                    return 40679;
                  } else {
                    return 59219;
                  }
                }
              } else {
                if (i <= 77) {
                  if (i == 76) {
                    return 21359;
                  } else {
                    return 28645;
                  }
                } else {
                  if (i == 78) {
                    return 58746;
                  } else {
                    return 31292;
                  }
                }
              }
            }
          } else {
            if (i <= 87) {
              if (i <= 83) {
                if (i <= 81) {
                  if (i == 80) {
                    return 15571;
                  } else {
                    return 54149;
                  }
                } else {
                  if (i == 82) {
                    return 34278;
                  } else {
                    return 59100;
                  }
                }
              } else {
                if (i <= 85) {
                  if (i == 84) {
                    return 56425;
                  } else {
                    return 26972;
                  }
                } else {
                  if (i == 86) {
                    return 23593;
                  } else {
                    return 10551;
                  }
                }
              }
            } else {
              if (i <= 91) {
                if (i <= 89) {
                  if (i == 88) {
                    return 14126;
                  } else {
                    return 12021;
                  }
                } else {
                  if (i == 90) {
                    return 62760;
                  } else {
                    return 10484;
                  }
                }
              } else {
                if (i <= 93) {
                  if (i == 92) {
                    return 62566;
                  } else {
                    return 26255;
                  }
                } else {
                  if (i == 94) {
                    return 36662;
                  } else {
                    return 13889;
                  }
                }
              }
            }
          }
        } else {
          if (i <= 111) {
            if (i <= 103) {
              if (i <= 99) {
                if (i <= 97) {
                  if (i == 96) {
                    return 16665;
                  } else {
                    return 6463;
                  }
                } else {
                  if (i == 98) {
                    return 16289;
                  } else {
                    return 41217;
                  }
                }
              } else {
                if (i <= 101) {
                  if (i == 100) {
                    return 472;
                  } else {
                    return 55376;
                  }
                } else {
                  if (i == 102) {
                    return 20553;
                  } else {
                    return 18897;
                  }
                }
              }
            } else {
              if (i <= 107) {
                if (i <= 105) {
                  if (i == 104) {
                    return 53580;
                  } else {
                    return 19588;
                  }
                } else {
                  if (i == 106) {
                    return 33979;
                  } else {
                    return 48080;
                  }
                }
              } else {
                if (i <= 109) {
                  if (i == 108) {
                    return 53337;
                  } else {
                    return 22802;
                  }
                } else {
                  if (i == 110) {
                    return 4777;
                  } else {
                    return 43464;
                  }
                }
              }
            }
          } else {
            if (i <= 119) {
              if (i <= 115) {
                if (i <= 113) {
                  if (i == 112) {
                    return 51396;
                  } else {
                    return 50311;
                  }
                } else {
                  if (i == 114) {
                    return 34690;
                  } else {
                    return 33396;
                  }
                }
              } else {
                if (i <= 117) {
                  if (i == 116) {
                    return 29884;
                  } else {
                    return 48287;
                  }
                } else {
                  if (i == 118) {
                    return 40790;
                  } else {
                    return 22180;
                  }
                }
              }
            } else {
              if (i <= 123) {
                if (i <= 121) {
                  if (i == 120) {
                    return 42084;
                  } else {
                    return 25709;
                  }
                } else {
                  if (i == 122) {
                    return 28102;
                  } else {
                    return 50861;
                  }
                }
              } else {
                if (i <= 125) {
                  if (i == 124) {
                    return 44474;
                  } else {
                    return 47619;
                  }
                } else {
                  if (i == 126) {
                    return 832;
                  } else {
                    return 16436;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      if (i <= 191) {
        if (i <= 159) {
          if (i <= 143) {
            if (i <= 135) {
              if (i <= 131) {
                if (i <= 129) {
                  if (i == 128) {
                    return 13529;
                  } else {
                    return 55778;
                  }
                } else {
                  if (i == 130) {
                    return 58106;
                  } else {
                    return 64124;
                  }
                }
              } else {
                if (i <= 133) {
                  if (i == 132) {
                    return 31867;
                  } else {
                    return 31493;
                  }
                } else {
                  if (i == 134) {
                    return 1482;
                  } else {
                    return 51750;
                  }
                }
              }
            } else {
              if (i <= 139) {
                if (i <= 137) {
                  if (i == 136) {
                    return 9875;
                  } else {
                    return 37750;
                  }
                } else {
                  if (i == 138) {
                    return 30334;
                  } else {
                    return 32511;
                  }
                }
              } else {
                if (i <= 141) {
                  if (i == 140) {
                    return 65362;
                  } else {
                    return 21077;
                  }
                } else {
                  if (i == 142) {
                    return 21972;
                  } else {
                    return 54479;
                  }
                }
              }
            }
          } else {
            if (i <= 151) {
              if (i <= 147) {
                if (i <= 145) {
                  if (i == 144) {
                    return 53198;
                  } else {
                    return 52795;
                  }
                } else {
                  if (i == 146) {
                    return 15331;
                  } else {
                    return 58159;
                  }
                }
              } else {
                if (i <= 149) {
                  if (i == 148) {
                    return 12048;
                  } else {
                    return 4154;
                  }
                } else {
                  if (i == 150) {
                    return 14865;
                  } else {
                    return 4534;
                  }
                }
              }
            } else {
              if (i <= 155) {
                if (i <= 153) {
                  if (i == 152) {
                    return 46781;
                  } else {
                    return 48412;
                  }
                } else {
                  if (i == 154) {
                    return 7210;
                  } else {
                    return 10975;
                  }
                }
              } else {
                if (i <= 157) {
                  if (i == 156) {
                    return 57271;
                  } else {
                    return 47018;
                  }
                } else {
                  if (i == 158) {
                    return 43733;
                  } else {
                    return 54647;
                  }
                }
              }
            }
          }
        } else {
          if (i <= 175) {
            if (i <= 167) {
              if (i <= 163) {
                if (i <= 161) {
                  if (i == 160) {
                    return 30712;
                  } else {
                    return 63640;
                  }
                } else {
                  if (i == 162) {
                    return 38914;
                  } else {
                    return 556;
                  }
                }
              } else {
                if (i <= 165) {
                  if (i == 164) {
                    return 11418;
                  } else {
                    return 39587;
                  }
                } else {
                  if (i == 166) {
                    return 41798;
                  } else {
                    return 18141;
                  }
                }
              }
            } else {
              if (i <= 171) {
                if (i <= 169) {
                  if (i == 168) {
                    return 56729;
                  } else {
                    return 39269;
                  }
                } else {
                  if (i == 170) {
                    return 26011;
                  } else {
                    return 39847;
                  }
                }
              } else {
                if (i <= 173) {
                  if (i == 172) {
                    return 42795;
                  } else {
                    return 11180;
                  }
                } else {
                  if (i == 174) {
                    return 44041;
                  } else {
                    return 2433;
                  }
                }
              }
            }
          } else {
            if (i <= 183) {
              if (i <= 179) {
                if (i <= 177) {
                  if (i == 176) {
                    return 33046;
                  } else {
                    return 5671;
                  }
                } else {
                  if (i == 178) {
                    return 10237;
                  } else {
                    return 64787;
                  }
                }
              } else {
                if (i <= 181) {
                  if (i == 180) {
                    return 4962;
                  } else {
                    return 25196;
                  }
                } else {
                  if (i == 182) {
                    return 27758;
                  } else {
                    return 28239;
                  }
                }
              }
            } else {
              if (i <= 187) {
                if (i <= 185) {
                  if (i == 184) {
                    return 20337;
                  } else {
                    return 29152;
                  }
                } else {
                  if (i == 186) {
                    return 57576;
                  } else {
                    return 59570;
                  }
                }
              } else {
                if (i <= 189) {
                  if (i == 188) {
                    return 45753;
                  } else {
                    return 47472;
                  }
                } else {
                  if (i == 190) {
                    return 28776;
                  } else {
                    return 26842;
                  }
                }
              }
            }
          }
        }
      } else {
        if (i <= 223) {
          if (i <= 207) {
            if (i <= 199) {
              if (i <= 195) {
                if (i <= 193) {
                  if (i == 192) {
                    return 56054;
                  } else {
                    return 63073;
                  }
                } else {
                  if (i == 194) {
                    return 25060;
                  } else {
                    return 58619;
                  }
                }
              } else {
                if (i <= 197) {
                  if (i == 196) {
                    return 64290;
                  } else {
                    return 8946;
                  }
                } else {
                  if (i == 198) {
                    return 62145;
                  } else {
                    return 49646;
                  }
                }
              }
            } else {
              if (i <= 203) {
                if (i <= 201) {
                  if (i == 200) {
                    return 61138;
                  } else {
                    return 53904;
                  }
                } else {
                  if (i == 202) {
                    return 36876;
                  } else {
                    return 3263;
                  }
                }
              } else {
                if (i <= 205) {
                  if (i == 204) {
                    return 49075;
                  } else {
                    return 45986;
                  }
                } else {
                  if (i == 206) {
                    return 41713;
                  } else {
                    return 61777;
                  }
                }
              }
            }
          } else {
            if (i <= 215) {
              if (i <= 211) {
                if (i <= 209) {
                  if (i == 208) {
                    return 20787;
                  } else {
                    return 13201;
                  }
                } else {
                  if (i == 210) {
                    return 37355;
                  } else {
                    return 60409;
                  }
                }
              } else {
                if (i <= 213) {
                  if (i == 212) {
                    return 63758;
                  } else {
                    return 3823;
                  }
                } else {
                  if (i == 214) {
                    return 61291;
                  } else {
                    return 27441;
                  }
                }
              }
            } else {
              if (i <= 219) {
                if (i <= 217) {
                  if (i == 216) {
                    return 12736;
                  } else {
                    return 49366;
                  }
                } else {
                  if (i == 218) {
                    return 54815;
                  } else {
                    return 8117;
                  }
                }
              } else {
                if (i <= 221) {
                  if (i == 220) {
                    return 46535;
                  } else {
                    return 51050;
                  }
                } else {
                  if (i == 222) {
                    return 27293;
                  } else {
                    return 40376;
                  }
                }
              }
            }
          }
        } else {
          if (i <= 239) {
            if (i <= 231) {
              if (i <= 227) {
                if (i <= 225) {
                  if (i == 224) {
                    return 47188;
                  } else {
                    return 21708;
                  }
                } else {
                  if (i == 226) {
                    return 52400;
                  } else {
                    return 45171;
                  }
                }
              } else {
                if (i <= 229) {
                  if (i == 228) {
                    return 29561;
                  } else {
                    return 31026;
                  }
                } else {
                  if (i == 230) {
                    return 12845;
                  } else {
                    return 11647;
                  }
                }
              }
            } else {
              if (i <= 235) {
                if (i <= 233) {
                  if (i == 232) {
                    return 32516;
                  } else {
                    return 1174;
                  }
                } else {
                  if (i == 234) {
                    return 38654;
                  } else {
                    return 65162;
                  }
                }
              } else {
                if (i <= 237) {
                  if (i == 236) {
                    return 35564;
                  } else {
                    return 60621;
                  }
                } else {
                  if (i == 238) {
                    return 52573;
                  } else {
                    return 24030;
                  }
                }
              }
            }
          } else {
            if (i <= 247) {
              if (i <= 243) {
                if (i <= 241) {
                  if (i == 240) {
                    return 56946;
                  } else {
                    return 29251;
                  }
                } else {
                  if (i == 242) {
                    return 17181;
                  } else {
                    return 7448;
                  }
                }
              } else {
                if (i <= 245) {
                  if (i == 244) {
                    return 6216;
                  } else {
                    return 18675;
                  }
                } else {
                  if (i == 246) {
                    return 62349;
                  } else {
                    return 36224;
                  }
                }
              }
            } else {
              if (i <= 251) {
                if (i <= 249) {
                  if (i == 248) {
                    return 32963;
                  } else {
                    return 49998;
                  }
                } else {
                  if (i == 250) {
                    return 20034;
                  } else {
                    return 17111;
                  }
                }
              } else {
                if (i <= 253) {
                  if (i == 252) {
                    return 55101;
                  } else {
                    return 15772;
                  }
                } else {
                  if (i == 254) {
                    return 40116;
                  } else {
                    return 46231;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
