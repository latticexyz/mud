import clarinet from "clarinet";

/**
 * @internal
 */
export const dropValue = Symbol();

/**
 * @internal
 */
export async function parseJson(
  body: ReadableStream<Uint8Array>,
  onValue?: (path: string, value: unknown) => unknown,
): Promise<unknown> {
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
    const keyPath = [...open.map(([key]) => key), nextKey];
    const path = keyPath.map((key, i) => (key == null ? (i === 0 ? "" : "*") : key)).join(".");

    const [, parentObj] = open.at(-1)!;

    if (onValue?.(path, value) === dropValue) {
      // drop value
      return;
    }

    // if we have an open array, push the value to the array
    if (Array.isArray(parentObj)) {
      parentObj.push(value);
    }
    // if we have an open object, add the value
    else if (parentObj) {
      if (!nextKey) throw new Error("no key for value");
      parentObj[nextKey] = value;
    }

    nextKey = null;
  };

  parser.onopenarray = function () {
    open.push([nextKey, []]);
    nextKey = null;
  };

  parser.oncloseobject = parser.onclosearray = function () {
    // pop the last open object so we can close it
    const [key, value] = open.pop()!;

    if (!open.length) {
      result = value;
      return;
    }

    nextKey = key;
    this.onvalue(value);
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
