import { EntityID } from "@latticexyz/recs";
import { Message } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay";
import { BigNumber } from "ethers";
import { keccak256 } from "ethers/lib/utils";

// Message payload to sign and use to recover signer
export function messagePayload(msg: Message) {
  return `(${msg.version},${msg.id},${keccak256(msg.data)},${msg.timestamp})`;
}

// Remove zero padding from all entity ids
export function formatEntityID(entityID: string | EntityID | BigNumber): EntityID {
  if (BigNumber.isBigNumber(entityID) || entityID.substring(0, 2) === "0x") {
    return BigNumber.from(entityID).toHexString() as EntityID;
  }
  return entityID as EntityID;
}

// Remove zero padding from all component ids
export function formatComponentID(componentID: string | BigNumber): string {
  return BigNumber.from(componentID).toHexString();
}
