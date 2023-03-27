export const bytesToString = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((x) => String.fromCharCode(x))
    .join("");
