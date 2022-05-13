/* eslint-disable @typescript-eslint/no-explicit-any */
import { Func } from "./types";

export function isObject(c: unknown): c is Record<string, any> {
  return typeof c === "object" && !Array.isArray(c) && c !== null;
}

export function isFunction(c: unknown): c is Func<any, any> {
  return c instanceof Function;
}
