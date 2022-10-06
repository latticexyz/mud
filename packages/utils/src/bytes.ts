import { toEthAddress } from "./eth";

export function formatHex(hex: string): string {
  if (hex.substring(0, 2) == "0x") hex = hex.substring(2);
  const prefix = hex.length % 2 !== 0 ? "0x0" : "0x";
  return prefix + hex;
}

export function hexStringToUint8Array(hexString: string): Uint8Array {
  let matches = hexString.match(/.{1,2}/g);
  if (!matches || hexString.length % 2 !== 0) throw new Error("invalid hex string: " + hexString);
  if (matches[0] == "0x") matches = matches.slice(1);
  return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
}

export function Uint8ArrayToHexString(data: Uint8Array): string {
  return formatHex(data.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""));
}

export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  return Uint8Array.from(
    arrays.reduce<number[]>((acc, curr) => {
      return [...acc, ...curr];
    }, [])
  );
}

export function splitUint8Arrays(data: Uint8Array, byteLengths: number[]): Uint8Array[] {
  const arrays: Uint8Array[] = [];
  let i = 0;
  for (const length of byteLengths) {
    const array = new Uint8Array(length);
    arrays.push(array);
    for (let j = 0; j < length; j++) {
      array[j] = data[i];
      i++;
    }
  }
  return arrays;
}

export function Int32ArrayToUint8Array(input: number[]): Uint8Array {
  const buffer = new ArrayBuffer(input.length * 4);
  const int32arr = new Int32Array(buffer);
  for (let i = 0; i < input.length; i++) {
    int32arr[i] = input[i];
  }
  return new Uint8Array(buffer);
}

export function Uint8ArrayToInt32Array(input: Uint8Array): number[] {
  return [...new Int32Array(input.buffer)];
}

export function ethAddressToUint8Array(address: string): Uint8Array {
  return hexStringToUint8Array(toEthAddress(address));
}

// https://stackoverflow.com/a/55330424
export function createToInt(size: number) {
  if (size < 2) {
    throw new Error("Minimum size is 2");
  } else if (size > 64) {
    throw new Error("Maximum size is 64");
  }

  // Determine value range
  const maxValue = 2 ** (size - 1) - 1;
  const minValue = -maxValue - 1;

  return (value: number) => {
    value = value << 0;
    if (value > maxValue || value < minValue) {
      console.log("value", value, maxValue, minValue, value > maxValue, value < minValue);
      throw new Error(`Int${size} overflow`);
    }

    if (value < 0) {
      return 2 ** size + value;
    } else {
      return value;
    }
  };
}

export const toInt32 = createToInt(32);
