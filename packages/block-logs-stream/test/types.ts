/* eslint-disable @typescript-eslint/no-explicit-any */

// copied from https://github.com/wevm/viem/blob/fe558fdef7e2e9cd5f3f57d8bdeae0c7ff67a1b0/src/types/rpc.ts
// TODO: ask if viem can export, or import these from ox instead

export type RpcRequest = {
  jsonrpc?: "2.0" | undefined;
  method: string;
  params?: any | undefined;
  id?: number | undefined;
};

export type RpcResponse<result = any, error = any> = {
  jsonrpc: `${number}`;
  id: number;
} & (SuccessResult<result> | ErrorResult<error> | Subscription<result, error>);

type SuccessResult<result> = {
  method?: undefined;
  result: result;
  error?: undefined;
};
type ErrorResult<error> = {
  method?: undefined;
  result?: undefined;
  error: error;
};
type Subscription<result, error> = {
  method: "eth_subscription";
  error?: undefined;
  result?: undefined;
  params:
    | {
        subscription: string;
        result: result;
        error?: undefined;
      }
    | {
        subscription: string;
        result?: undefined;
        error: error;
      };
};
