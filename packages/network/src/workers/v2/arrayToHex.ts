export const arrayToHex = (array: Uint8Array | ArrayBuffer): string =>
  `0x${[...new Uint8Array(array)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
