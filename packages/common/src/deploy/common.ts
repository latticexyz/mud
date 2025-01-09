import { stringToHex } from "viem";

// salt for deterministic deploys of singleton contracts
export const singletonSalt = stringToHex("", { size: 32 });

// https://eips.ethereum.org/EIPS/eip-170
export const contractSizeLimit = parseInt("6000", 16);
