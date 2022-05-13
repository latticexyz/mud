/**
 * UUID.core.js - UUID.js for Minimalists
 *
 * @file
 * @author  LiosK
 * @version v4.2.0
 * @license Apache License 2.0: Copyright (c) 2010-2018 LiosK
 * @url https://github.com/LiosK/UUID.js/blob/master/src/uuid.core.js
 */

/**
 * @class
 * @classdesc {@link UUID} object.
 * @hideconstructor
 */

// Core Component {{{

/**
 * Generates a version 4 UUID as a hexadecimal string.
 * @returns {string} Hexadecimal UUID string.
 */
export const uuid = function () {
  const rand = _getRandomInt,
    hex = _hexAligner;
  return (
    hex(rand(32), 8) + // time_low
    "-" +
    hex(rand(16), 4) + // time_mid
    "-" +
    hex(0x4000 | rand(12), 4) + // time_hi_and_version
    "-" +
    hex(0x8000 | rand(14), 4) + // clock_seq_hi_and_reserved clock_seq_low
    "-" +
    hex(rand(48), 12)
  ); // node
};

/**
 * Returns an unsigned x-bit random integer.
 * @private
 * @param {number} x Unsigned integer ranging from 0 to 53, inclusive.
 * @returns {number} Unsigned x-bit random integer (0 <= f(x) < 2^x).
 */
const _getRandomInt = function (x: number) {
  if (x < 0 || x > 53) {
    return NaN;
  }
  const n = 0 | (Math.random() * 0x40000000); // 1 << 30
  return x > 30 ? n + (0 | (Math.random() * (1 << (x - 30)))) * 0x40000000 : n >>> (30 - x);
};

/**
 * Converts an integer to a zero-filled hexadecimal string.
 * @private
 * @param {number} num
 * @param {number} length
 * @returns {string}
 */
const _hexAligner = function (num: number, length: number) {
  let str = num.toString(16),
    i = length - str.length,
    z = "0";
  for (; i > 0; i >>>= 1, z += z) {
    if (i & 1) {
      str = z + str;
    }
  }
  return str;
};
