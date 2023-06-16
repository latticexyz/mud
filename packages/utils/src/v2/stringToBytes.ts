export const stringToBytes16 = (str: string): Uint8Array => {
  if (str.length > 16) throw new Error("string too long");
  return new Uint8Array(16).map((v, i) => str.charCodeAt(i));
};

export const stringToBytes32 = (str: string): Uint8Array => {
  if (str.length > 32) throw new Error("string too long");
  return new Uint8Array(32).map((v, i) => str.charCodeAt(i));
};
