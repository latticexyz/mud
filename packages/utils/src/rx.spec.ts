import { Subject } from "rxjs";
import { awaitStreamValue, streamToComputed } from "./rx";
import { sleep } from "./sleep";

describe("streamToComputed", () => {
  it("should return a computed value that corresponds to the last stream value", () => {
    const stream = new Subject<number>();
    const comp = streamToComputed(stream);
    expect(comp.get()).toBeUndefined();

    stream.next(1);
    expect(comp.get()).toBe(1);

    stream.next(2);
    expect(comp.get()).toBe(2);

    stream.next(3);
    stream.next(4);
    expect(comp.get()).toBe(4);
  });
});

describe("awaitStreamValue", () => {
  it("should return a promise that resolves once the requested stream value is emitted", async () => {
    const stream = new Subject<number>();
    const promise = awaitStreamValue(stream, (v) => v === 1);

    let isFulfilled = false;
    (async () => {
      await promise;
      isFulfilled = true;
    })();

    await sleep(100);
    expect(isFulfilled).toBe(false);

    stream.next(2);
    await sleep(100);
    expect(isFulfilled).toBe(false);

    stream.next(1);
    await sleep(100);
    expect(isFulfilled).toBe(true);
  });
});
