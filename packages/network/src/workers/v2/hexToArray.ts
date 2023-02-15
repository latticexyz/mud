export const hexToArray = (hex: string): Uint8Array => {
  const bytes = hex.match(/[\da-f]{2}/gi);
  if (!bytes) throw new Error("Invalid hex string");
  return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
};
