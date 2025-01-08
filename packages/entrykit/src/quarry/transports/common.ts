import { type EIP1193Parameters, type EIP1193RequestFn, type RpcSchema, UnionToTuple } from "viem";

// TODO: move to common package?

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

// TODO: figure out how to dedupe these
//       one gives nice results for narrowing inside the request function body, but has a big union return type
//       the other has nice return types, but has a big union inside the function body that doesn't narrow

export type TransportRequestFnMapped<rpcSchema extends RpcSchema> = <
  args extends EIP1193Parameters<rpcSchema> = EIP1193Parameters<rpcSchema>,
>(
  args: args,
  options?: Parameters<EIP1193RequestFn>[1],
) => Promise<getRpcReturnType<rpcSchema, args["method"]>>;

export type TransportRequestFn<rpcSchema extends RpcSchema> = <
  args extends EIP1193Parameters<rpcSchema> = EIP1193Parameters<rpcSchema>,
  method extends Extract<rpcSchema[number], { Method: args["method"] }> = Extract<
    rpcSchema[number],
    { Method: args["method"] }
  >,
>(
  args: args,
  options?: Parameters<EIP1193RequestFn>[1],
) => Promise<method["ReturnType"]>;
