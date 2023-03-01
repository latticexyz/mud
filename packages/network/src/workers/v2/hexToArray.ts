export const hexToArray = (hex: string): Uint8Array => {
  const bytes = hex.match(/[\da-f]{2}/gi);
  if (!bytes) {
    console.warn("Potentially invalid hex string:", hex);
    return new Uint8Array([]);
  }
  return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
};
