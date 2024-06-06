import { Hex, SignableMessage } from "viem";

// TODO: clean up these types, make them bidirectional

export type RequestData = {
  id: number;
  method: "signMessage";
  args: {
    message: SignableMessage;
  };
};

export type ResponseData = {
  id: number;
  type: "reply";
  result: Hex;
};
