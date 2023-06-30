import { BehaviorSubject, Observable, concatMap, from, pairwise } from "rxjs";
import { describe, test } from "vitest";

// mock fetch logs
async function fetchLogs(from: number, to: number): Promise<any[]> {
  await sleep(2000);
  return [];
}

const maxBlockRange = 500;

async function* createBlockRangeGenerator(
  initialFrom: number,
  initialTo: number
): AsyncGenerator<{ from: number; to: number; logs: any[] }> {
  console.log("fetching logs", { initialFrom, initialTo });
  let from = initialFrom;
  let to = Math.min(initialTo, from + maxBlockRange);
  while (from <= initialTo) {
    const logs = await fetchLogs(from, to);
    yield { from, to, logs };
    from = to + 1;
    to = Math.min(initialTo, from + maxBlockRange);
  }
  console.log("done fetching logs", { initialFrom, initialTo });
}

describe("stream test", () => {
  test.skip("block range with generator", () => {
    const blocks$ = from(createBlockRangeGenerator(0, 10));
    blocks$.subscribe((data) => console.log("generator", data));
  });

  test("block stream with generator", async () => {
    const sparseBlockNumber$ = new BehaviorSubject<number>(-1);

    const logs$ = sparseBlockNumber$.pipe(
      pairwise(),
      concatMap(([lastBlock, currentBlock]) => from(createBlockRangeGenerator(lastBlock + 1, currentBlock)))
    );

    logs$.subscribe((data) => console.log("logs$", data));

    sparseBlockNumber$.next(1000);
    // await sleep(1000);
    sparseBlockNumber$.next(1001);
    // await sleep(1000);
    sparseBlockNumber$.next(1002);
    // await sleep(1000);
    sparseBlockNumber$.next(1003);

    await sleep(10000);
  }, 60_000);
});

export function sleep<T>(timeout: number, returns?: T): Promise<T> {
  return new Promise<T>((resolve) => setTimeout(() => resolve(returns as T), timeout));
}
