export function bufferToBigInt(bufferData: number[]) {
  return BigInt(Buffer.from(bufferData).toString());
}
