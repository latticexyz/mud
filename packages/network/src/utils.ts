import { EntityID } from "@latticexyz/recs";
import { Message } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay";
import { isHex } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { keccak256 } from "ethers/lib/utils";

// Message payload to sign and use to recover signer
export function messagePayload(msg: Message) {
  return `(${msg.version},${msg.id},${keccak256(msg.data)},${msg.timestamp})`;
}

// For v1 entities (BigNumber or hex strings) and single-key v2 entities (hex strings), strip zero padding
// For composite-key v2 entities (hex strings concatenated with `:`), leave the ID as is
// See `keyTupleToEntityID`
export function normalizeEntityID(entityID: string | EntityID | BigNumber): EntityID {
  if (entityID === "") {
    throw new Error("Can't normalize an empty entity ID");
  }
  if (BigNumber.isBigNumber(entityID)) {
    return entityID.toHexString() as EntityID;
  }
  if (isHex(entityID)) {
    return BigNumber.from(entityID).toHexString() as EntityID;
  }
  return entityID as EntityID;
}

// For v1 components (BigNumber or hex strings), strip zero padding
// For v2 components using TableId format, leave the ID as is
export function normalizeComponentID(componentID: string | BigNumber): string {
  if (componentID === "") {
    throw new Error("Can't normalize an empty component ID");
  }
  if (BigNumber.isBigNumber(componentID)) {
    return componentID.toHexString();
  }
  if (isHex(componentID)) {
    return BigNumber.from(componentID).toHexString();
  }
  return componentID;
}
