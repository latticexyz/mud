import { Message } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay";
import { expose } from "threads";
import { messagePayload } from "../utils";
import { utils } from "ethers";

function recoverAddress(msg: Message) {
  return utils.verifyMessage(messagePayload(msg), msg.signature);
}

expose({ recoverAddress });
