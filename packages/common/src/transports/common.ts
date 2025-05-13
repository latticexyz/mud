import { RpcSchema, UnionToTuple } from "viem";

export type getRpcMethod<rpcSchema extends RpcSchema, method extends rpcSchema[number]["Method"]> = Extract<
  rpcSchema[number],
  { Method: method }
>;

export type getRpcSchema<rpcSchema extends RpcSchema, method extends rpcSchema[number]["Method"]> = UnionToTuple<
  getRpcMethod<rpcSchema, method>
>;

export type getRpcReturnType<rpcSchema extends RpcSchema, method extends rpcSchema[number]["Method"]> = {
  [k in keyof rpcSchema & number as rpcSchema[k]["Method"]]: rpcSchema[k]["ReturnType"];
}[method];
