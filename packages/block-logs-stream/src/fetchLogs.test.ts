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
          "toBlock": 100n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 101n,
          "strict": true,
          "toBlock": 201n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 202n,
          "strict": true,
          "toBlock": 302n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 303n,
          "strict": true,
          "toBlock": 403n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 404n,
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
          "toBlock": 100n,
        },
        {
          "fromBlock": 101n,
          "logs": [],
          "toBlock": 201n,
        },
        {
          "fromBlock": 202n,
          "logs": [],
          "toBlock": 302n,
        },
        {
          "fromBlock": 303n,
          "logs": [],
          "toBlock": 403n,
        },
        {
          "fromBlock": 404n,
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
          params.toBlock - params.fromBlock > 500n
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
          "toBlock": 1000n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 500n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 501n,
          "strict": true,
          "toBlock": 1001n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1002n,
          "strict": true,
          "toBlock": 1502n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1503n,
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
          "toBlock": 500n,
        },
        {
          "fromBlock": 501n,
          "logs": [],
          "toBlock": 1001n,
        },
        {
          "fromBlock": 1002n,
          "logs": [],
          "toBlock": 1502n,
        },
        {
          "fromBlock": 1503n,
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
          "toBlock": 500n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 500n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
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
          "toBlock": 500n,
        },
      ]
    `);
  });
});
