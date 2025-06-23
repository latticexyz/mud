import clarinet from "clarinet";
import { StorageAdapterLog } from "../common";

export async function streamLogs(
  body: ReadableStream<Uint8Array>,
  onLog: (args: { blockNumber: bigint; log: StorageAdapterLog }) => void,
) {
  const parser = clarinet.parser();

  let nextKey: string | null = null;
  // stack of open objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const open: [key: string | null, obj: any][] = [];

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
    const [_key, obj] = open[open.length - 1];

    // if we have an open array, push the value to the array
    if (Array.isArray(obj)) {
      obj.push(value);
    }
    // if we have an open object, add the value
    else if (obj && nextKey) {
      obj[nextKey] = value;
    }
  };

  parser.onopenarray = function () {
    open.push([nextKey, []]);
    nextKey = null;
  };

  parser.oncloseobject = parser.onclosearray = function () {
    // pop the last open object so we can close it
    const [key, obj] = open.pop()!;

    if (!open.length) return;
    const [_parentKey, parentObj] = open.at(-1)!;

    if (Array.isArray(parentObj)) {
      parentObj.push(obj);
    } else if (parentObj && key) {
      parentObj[key] = obj;
    }

    // check if we're closing a logs object and emit if so
    if (open.length === 2) {
      const [, top] = open.at(0)!;
      const [logsKey, logs] = open.at(1)!;
      if (logsKey === "logs" && logs === parentObj) {
        onLog({ blockNumber: BigInt(top.blockNumber), log: obj });
      }
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
}
