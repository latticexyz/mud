export const bytesToString = (bytes: Uint8Array): string => [...bytes].map((x) => String.fromCharCode(x)).join("");
