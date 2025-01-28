import { RpcSchema, PublicRpcSchema } from "viem";

export type rpcMethod = RpcSchema[number];
export type rpcMethods<method extends rpcMethod> = {
  [k in method as k["Method"]]: {
    method: k["Method"];
    params: k["Parameters"];
  };
};

export type publicRpcMethods = rpcMethods<PublicRpcSchema[number]>;

export function defineRpcRequest<
  method extends keyof publicRpcMethods,
  args extends publicRpcMethods[method] = publicRpcMethods[method],
>(args: args): args {
  return args;
}
