import { Message } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay";
import { expose } from "threads";
import { verifyMessage } from "ethers/lib/utils";
import { messagePayload } from "../utils";

function recoverAddress(msg: Message) {
  return verifyMessage(messagePayload(msg), msg.signature).toLowerCase();
}

expose({ recoverAddress });
