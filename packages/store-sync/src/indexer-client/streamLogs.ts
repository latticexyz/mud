import clarinet from "clarinet";
import { StorageAdapterLog } from "../common";

/**
 * @internal
 */
export async function streamLogs(
  body: ReadableStream<Uint8Array>,
  onLog: (log: StorageAdapterLog) => void,
): Promise<{
  blockNumber: string;
  logs: readonly StorageAdapterLog[];
}> {
  const parser = clarinet.parser();

  let nextKey: string | null = null;
  // stack of open objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const open: [key: string | null, obj: any][] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;

  parser.onopenobject = function (key) {
    open.push([nextKey, {}]);
    nextKey = null;

    // this is weird to have in two places, so we'll pass it to onkey
    if (key != null) {
      parser.onkey(key);
    }
  };

  parser.onkey = function (key) {
    nextKey = key;
  };

  parser.onvalue = function (value) {
    const [, parentObj] = open.at(-1)!;

    // if we have an open array, push the value to the array
    if (Array.isArray(parentObj)) {
      parentObj.push(value);
    }
    // if we have an open object, add the value
    else if (parentObj && nextKey) {
      parentObj[nextKey] = value;
    }

    nextKey = null;
  };

  parser.onopenarray = function () {
    open.push([nextKey, []]);
    nextKey = null;
  };

  parser.oncloseobject = parser.onclosearray = function () {
    const path = open.map(([key], i) => (key == null ? (i === 0 ? "" : "*") : key)).join(".");

    // pop the last open object so we can close it
    const [key, obj] = open.pop()!;

    if (!open.length) {
      result = obj;
      return;
    }

    const [, parentObj] = open.at(-1)!;

    // emit log and don't accumulate
    if (path === ".logs.*") {
      onLog(obj);
      return;
    }

    if (Array.isArray(parentObj)) {
      parentObj.push(obj);
    } else if (parentObj && key) {
      parentObj[key] = obj;
    }
  };

  const reader = body.getReader();
  const decoder = new TextDecoder();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.write(decoder.decode(value, { stream: true }));
  }

  parser.close();

  return result;
}
