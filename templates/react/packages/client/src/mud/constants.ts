import { encodePacked, toHex } from "viem";

const ROOT_NAMESPACE = 0;

const encodedRootSpace = toHex(ROOT_NAMESPACE, { size: 16 });
const encodedDelegationId = toHex("unlimited.d", { size: 16 });
export const UNLIMITED_DELEGATION = encodePacked(["bytes16", "bytes16"], [encodedRootSpace, encodedDelegationId]);
