import clarinet from "clarinet";
import { StorageAdapterLog } from "../common";

export async function streamLogs(
  body: ReadableStream<Uint8Array>,
  onLog: (blockNumber: bigint, log: StorageAdapterLog) => void,
) {
  const parser = clarinet.parser();

  let nextKey: string | null = null;
  let stack: [string | null, any][] = [];
  let inLogsArray = false;
  let blockNumber: bigint | null = null;

  parser.onopenobject = function (key) {
    console.log("onopenobject");
    stack.push([nextKey, {}]);
    nextKey = null;

    if (key != null) {
      parser.onkey(key);
    }
  };

  parser.onkey = function (key) {
    console.log("onkey", key);
    nextKey = key;
  };

  parser.onvalue = function (value) {
    console.log("onvalue", value);
    const [key, obj] = stack[stack.length - 1];

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
    console.log("onopenarray");
    stack.push([nextKey, []]);
    nextKey = null;
  };

  parser.oncloseobject = parser.onclosearray = function () {
    const [key, obj] = stack.pop()!;
    const [parentKey, parentObj] = stack.at(-1)!;
    console.log("oncloseobject", `${parentKey}.${key}`);

    if (Array.isArray(parentObj)) {
      parentObj.push(obj);
    } else if (parentObj && key) {
      parentObj[key] = obj;
    }

    if (parentKey === "logs") {
      console.log("stack", parentObj, obj, stack);
      throw new Error("stop");
      // onLog(blockNumber!, obj);
    }

    // if (inLogsArray && stack.length === 2) {
    //   onLog(blockNumber!, obj);
    // }
  };

  // parser.onclosearray = function () {
  //   const arr = stack.pop();
  //   const parent = stack[stack.length - 1];
  //   if (Array.isArray(parent)) {
  //     parent.push(arr);
  //   } else if (parent && nextKey) {
  //     parent[nextKey] = arr;
  //   }

  //   if (inLogsArray && stack.length === 1) {
  //     inLogsArray = false;
  //   }
  // };

  const reader = body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.write(decoder.decode(value, { stream: true }));
  }

  parser.close();
}
