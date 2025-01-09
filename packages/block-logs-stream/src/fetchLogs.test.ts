import { describe, it, expect, vi } from "vitest";
import { LimitExceededRpcError, RpcRequestError, createClient, http } from "viem";
import { fetchLogs } from "./fetchLogs";

describe("fetchLogs", () => {
  it("yields chunks of logs for the block range", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    const publicClient = createClient({
      transport: http("http://mock"),
    }).extend(() => ({
      getLogs: vi.fn(async (params) => {
        requests.push(params);
        return [];
      }),
    }));

    const results = [];
    for await (const result of fetchLogs({
      publicClient,
      address: "0x",
      events: [],
      fromBlock: 0n,
      toBlock: 500n,
      maxBlockRange: 100n,
    })) {
      results.push(result);
    }

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 99n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 100n,
          "strict": true,
          "toBlock": 199n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 200n,
          "strict": true,
          "toBlock": 299n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 300n,
          "strict": true,
          "toBlock": 399n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 400n,
          "strict": true,
          "toBlock": 499n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 500n,
          "strict": true,
          "toBlock": 500n,
        },
      ]
    `);

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "fromBlock": 0n,
          "logs": [],
          "toBlock": 99n,
        },
        {
          "fromBlock": 100n,
          "logs": [],
          "toBlock": 199n,
        },
        {
          "fromBlock": 200n,
          "logs": [],
          "toBlock": 299n,
        },
        {
          "fromBlock": 300n,
          "logs": [],
          "toBlock": 399n,
        },
        {
          "fromBlock": 400n,
          "logs": [],
          "toBlock": 499n,
        },
        {
          "fromBlock": 500n,
          "logs": [],
          "toBlock": 500n,
        },
      ]
    `);
  });

  it("reduces block range if block range is exceeded", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    const publicClient = createClient({
      transport: http("http://mock"),
    }).extend(() => ({
      getLogs: vi.fn(async (params) => {
        requests.push(params);
        if (
          typeof params?.fromBlock === "bigint" &&
          typeof params?.toBlock === "bigint" &&
          params.toBlock - params.fromBlock + 1n > 500n
        ) {
          throw new LimitExceededRpcError(
            new RpcRequestError({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              body: (params as any)[0],
              url: "https://mud.dev",
              error: {
                code: -32005,
                message: "block range exceeded",
              },
            }),
          );
        }
        return [];
      }),
    }));

    const results = [];
    for await (const result of fetchLogs({
      publicClient,
      address: "0x",
      events: [],
      fromBlock: 0n,
      toBlock: 2000n,
    })) {
      results.push(result);
    }

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 999n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 499n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 500n,
          "strict": true,
          "toBlock": 999n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1000n,
          "strict": true,
          "toBlock": 1499n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1500n,
          "strict": true,
          "toBlock": 1999n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 2000n,
          "strict": true,
          "toBlock": 2000n,
        },
      ]
    `);

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "fromBlock": 0n,
          "logs": [],
          "toBlock": 499n,
        },
        {
          "fromBlock": 500n,
          "logs": [],
          "toBlock": 999n,
        },
        {
          "fromBlock": 1000n,
          "logs": [],
          "toBlock": 1499n,
        },
        {
          "fromBlock": 1500n,
          "logs": [],
          "toBlock": 1999n,
        },
        {
          "fromBlock": 2000n,
          "logs": [],
          "toBlock": 2000n,
        },
      ]
    `);
  });

  it("retries if rate limit is exceeded", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    const publicClient = createClient({
      transport: http("http://mock"),
    }).extend(() => ({
      getLogs: vi.fn(async (params) => {
        requests.push(params);

        if (requests.length < 3) {
          throw new LimitExceededRpcError(
            new RpcRequestError({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              body: (params as any)[0],
              url: "https://viem.sh",
              error: {
                code: -32005,
                message: "rate limit exceeded",
              },
            }),
          );
        }

        return [];
      }),
    }));

    const results = [];
    for await (const result of fetchLogs({
      publicClient,
      address: "0x",
      events: [],
      fromBlock: 0n,
      toBlock: 500n,
    })) {
      results.push(result);
    }

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 499n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 499n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 499n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 500n,
          "strict": true,
          "toBlock": 500n,
        },
      ]
    `);

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "fromBlock": 0n,
          "logs": [],
          "toBlock": 499n,
        },
        {
          "fromBlock": 500n,
          "logs": [],
          "toBlock": 500n,
        },
      ]
    `);
  });
});
