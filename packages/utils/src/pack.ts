function rightMask(input: number, keep: number): number {
  return input & (2 ** keep - 1);
}

/**
 * Packs two unsigned integers in one 32 bit unsigned integer
 * @param numbers Unsigned integers to be packed in 32 bit integer
 * @param bitsPerNumber Bits for each number
 * @returns Packed 32 bit unsigned integer
 */
export function pack(numbers: number[], bitsPerNumber: number[]): number {
  // Total number of bits must be 32
  if (bitsPerNumber.reduce((acc, curr) => acc + curr, 0) > 32) {
    throw new Error("JS pretends integers are 32 bit when bitshifts are involved");
  }

  // Array lengths must match
  if (numbers.length !== bitsPerNumber.length) throw new Error("Arrays' lengths must match");

  // Numbers must fit in number of bits and must be unsigned
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] < 0) {
      throw new Error("Underflow: can only pack unsigned integer");
    }
    if (numbers[i] > 2 ** bitsPerNumber[i] - 1) {
      const error = `Overflow: ${numbers[i]} does not fit in ${bitsPerNumber[i]} bits`;
      throw new Error(error);
    }
  }

  // Pack number
  let packed = 0;
  for (let i = 0; i < numbers.length; i++) {
    packed = (packed << bitsPerNumber[i]) | numbers[i];
  }
  return packed;
}

/**
 * Unpacks a packed 32 bit unsigned integer into the original unsigned integers
 * @param packed Packed 32 bit unsigned integer
 * @param bitsPerNumber Bits for each unsigned integer
 * @returns Array of unpacked unsignd integers
 */
export function unpack(packed: number, bitsPerNumber: number[]): number[] {
  const numbers: number[] = [];
  let shiftedPacked = packed;
  for (let i = bitsPerNumber.length - 1; i >= 0; i--) {
    numbers.unshift(rightMask(shiftedPacked, bitsPerNumber[i]));
    shiftedPacked = shiftedPacked >>> bitsPerNumber[i];
  }
  return numbers;
}

export function packTuple(numbers: [number, number]): number {
  return pack(numbers, [8, 24]);
}

export function unpackTuple(packed: number): [number, number] {
  return unpack(packed, [8, 24]) as [number, number];
}
