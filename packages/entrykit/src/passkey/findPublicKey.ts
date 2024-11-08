import { getCandidatePublicKeys } from "./getCandidatePublicKeys";
import { SignatureAndMessage } from "./common";
import { Hex } from "viem";

export function findPublicKey([input1, input2]: [SignatureAndMessage, SignatureAndMessage]): Hex | undefined {
  // Return the candidate public key that appears twice
  return firstDuplicate([...getCandidatePublicKeys(input1), ...getCandidatePublicKeys(input2)]);
}

function firstDuplicate<T>(arr: T[]): T | undefined {
  const seen = new Set<T>();
  for (const s of arr) {
    if (seen.has(s)) {
      return s;
    }
    seen.add(s);
  }
  return undefined;
}
