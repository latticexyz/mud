import { Message } from "@latticexyz/services/ecs-relay";
import { expose } from "threads/worker";
import { verifyMessage } from "ethers/lib/utils";
import { messagePayload } from "../utils";

function recoverAddress(msg: Message) {
  return verifyMessage(messagePayload(msg), msg.signature);
}

expose({ recoverAddress });
