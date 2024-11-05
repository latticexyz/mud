import { show } from "@ark/util";
import { methods } from "./methods";

export type RequestData = show<
  { id: number } & {
    [method in keyof methods]: {
      method: method;
    } & (Parameters<methods[method]> extends []
      ? { params: Parameters<methods[method]> }
      : { params: Parameters<methods[method]> });
  }[keyof methods]
>;

export type ResponseData = show<
  { id: number } & {
    [method in keyof methods]: { method: method } & (
      | {
          result: Awaited<ReturnType<methods[method]>>;
        }
      | { error: { message: string } }
    );
  }[keyof methods]
>;
