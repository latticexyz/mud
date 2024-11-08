import { show } from "@ark/util";
import { methods } from "./methods";

export type RequestData<methodName extends keyof methods = keyof methods> = show<
  { id: number } & {
    [method in keyof methods]: {
      method: method;
    } & (Parameters<methods[method]> extends []
      ? { params: Parameters<methods[method]> }
      : { params: Parameters<methods[method]> });
  }[methodName]
>;

export type ResponseData<methodName extends keyof methods = keyof methods> = show<{
  [method in keyof methods]: { id: number; method: method } & (
    | {
        result: Awaited<ReturnType<methods[method]>>;
        error?: never;
      }
    | {
        result?: never;
        error: { message: string };
      }
  );
}>[methodName];
