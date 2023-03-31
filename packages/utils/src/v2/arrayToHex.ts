// TODO: migrate to viem's toHex()
export const arrayToHex = (array: Uint8Array | ArrayBuffer): `0x${string}` =>
  `0x${[...new Uint8Array(array)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
