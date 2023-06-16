import { Message } from "@latticexyz/services/ecs-relay";
import { keccak256 } from "ethers/lib/utils.js";

// Message payload to sign and use to recover signer
export function messagePayload(msg: Message) {
  return `(${msg.version},${msg.id},${keccak256(msg.data)},${msg.timestamp})`;
}
