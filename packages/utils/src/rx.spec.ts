import { Subject } from "rxjs";
import { awaitStreamValue, streamToBehaviorSubject } from "./rx";
import { sleep } from "./sleep";

describe("streamToBehaviorSubject", () => {
  it("should return a BehaviorSubject that corresponds to the last stream value", async () => {
    const stream = new Subject<number>();
    const behaviorSubject = streamToBehaviorSubject(stream);

    stream.next(1);
    expect(behaviorSubject.getValue()).toBe(1);

    stream.next(2);
    expect(behaviorSubject.getValue()).toBe(2);

    stream.next(3);
    stream.next(4);
    expect(behaviorSubject.getValue()).toBe(4);
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
