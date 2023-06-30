import { BehaviorSubject, Observable, concatMap, from, pairwise } from "rxjs";
import { describe, test } from "vitest";

function createBlockRangeStream(from: number, to: number): Observable<{ blockNumber: number }> {
  return new Observable((subscriber) => {
    (async (): Promise<void> => {
      for (let blockNumber = from; blockNumber <= to; blockNumber++) {
        subscriber.next({ blockNumber });
      }
      subscriber.complete();
    })();
  });
}

async function* createBlockRangeGenerator(from: number, to: number): AsyncGenerator<{ blockNumber: number }> {
  for (let blockNumber = from; blockNumber <= to; blockNumber++) {
    yield { blockNumber };
  }
}

describe("stream test", () => {
  test.skip("block range with rxjs", () => {
    const blocks$ = createBlockRangeStream(0, 10);
    blocks$.subscribe((data) => console.log("observable", data));
  });

  test.skip("block range with generator", () => {
    const blocks$ = from(createBlockRangeGenerator(0, 10));
    blocks$.subscribe((data) => console.log("generator", data));
  });

  test("block stream with rxjs", async () => {
    const sparseBlockNumber$ = new BehaviorSubject<number>(-1);

    const denseBlockNumber$ = sparseBlockNumber$.pipe(
      pairwise(),
      concatMap(([lastBlock, currentBlock]) => createBlockRangeStream(lastBlock + 1, currentBlock))
    );

    denseBlockNumber$.subscribe((data) => console.log("observable", data));

    sparseBlockNumber$.next(1);
    sparseBlockNumber$.next(10);
    sparseBlockNumber$.next(11);

    await sleep(1000);
  });

  test("block stream with generator", async () => {
    const sparseBlockNumber$ = new BehaviorSubject<number>(-1);

    const denseBlockNumber$ = sparseBlockNumber$.pipe(
      pairwise(),
      concatMap(([lastBlock, currentBlock]) => from(createBlockRangeGenerator(lastBlock + 1, currentBlock)))
    );

    denseBlockNumber$.subscribe((data) => console.log("generator", data));

    sparseBlockNumber$.next(1);
    sparseBlockNumber$.next(10);
    sparseBlockNumber$.next(11);

    await sleep(1000);
  });
});

export function sleep<T>(timeout: number, returns?: T): Promise<T> {
  return new Promise<T>((resolve) => setTimeout(() => resolve(returns as T), timeout));
}
