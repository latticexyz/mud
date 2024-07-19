"use client";
export function bufferToBigInt(bufferData: number[]) {
  const hexString = bufferData.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const bigIntValue = BigInt("0x" + hexString);
  return bigIntValue;
}
