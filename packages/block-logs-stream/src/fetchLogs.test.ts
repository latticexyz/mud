import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  EIP1193RequestFn,
  LimitExceededRpcError,
  RpcLog,
  RpcRequestError,
  Transport,
  createPublicClient,
  createTransport,
  hexToNumber,
} from "viem";
import { fetchLogs } from "./fetchLogs";

const mockedTransportRequest = vi.fn<Parameters<EIP1193RequestFn>, ReturnType<EIP1193RequestFn>>();
const mockTransport: Transport = () =>
  createTransport({
    key: "mock",
    name: "Mock Transport",
    request: mockedTransportRequest as any,
    type: "mock",
  });

const publicClient = createPublicClient({
  transport: mockTransport,
});

describe("fetchLogs", () => {
  beforeEach(() => {
    mockedTransportRequest.mockClear();
  });

  it("yields chunks of logs for the block range", async () => {
    const requests: any[] = [];
    mockedTransportRequest.mockImplementation(async ({ method, params }): Promise<RpcLog[]> => {
      requests.push(params);
      if (method !== "eth_getLogs") throw new Error("not implemented");
      return [];
    });

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
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x64",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x65",
            "toBlock": "0xc9",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0xca",
            "toBlock": "0x12e",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x12f",
            "toBlock": "0x193",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x194",
            "toBlock": "0x1f4",
            "topics": [
              [],
            ],
          },
        ],
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
    const requests: any[] = [];
    mockedTransportRequest.mockImplementation(async ({ method, params }): Promise<RpcLog[]> => {
      if (method !== "eth_getLogs") throw new Error("not implemented");
      requests.push(params);

      if (hexToNumber((params as any)[0].toBlock) - hexToNumber((params as any)[0].fromBlock) > 500) {
        throw new LimitExceededRpcError(
          new RpcRequestError({
            body: (params as any)[0],
            url: "https://mud.dev",
            error: {
              code: -32005,
              message: "block range exceeded",
            },
          })
        );
      }

      return [];
    });

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
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x3e8",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x3e8",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x3e8",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x3e8",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x1f4",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x1f5",
            "toBlock": "0x5dd",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x1f5",
            "toBlock": "0x5dd",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x1f5",
            "toBlock": "0x5dd",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x1f5",
            "toBlock": "0x5dd",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x1f5",
            "toBlock": "0x3e9",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3ea",
            "toBlock": "0x7d0",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3ea",
            "toBlock": "0x7d0",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3ea",
            "toBlock": "0x7d0",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3ea",
            "toBlock": "0x7d0",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3ea",
            "toBlock": "0x5dd",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x5de",
            "toBlock": "0x7d0",
            "topics": [
              [],
            ],
          },
        ],
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
          "toBlock": 1501n,
        },
        {
          "fromBlock": 1502n,
          "logs": [],
          "toBlock": 2000n,
        },
      ]
    `);
  });

  it("retries if rate limit is exceeded", async () => {
    const requests: any[] = [];
    mockedTransportRequest.mockImplementation(async ({ method, params }): Promise<RpcLog[]> => {
      if (method !== "eth_getLogs") throw new Error("not implemented");
      requests.push(params);

      if (requests.length < 3) {
        throw new LimitExceededRpcError(
          new RpcRequestError({
            body: (params as any)[0],
            url: "https://viem.sh",
            error: {
              code: -32005,
              message: "rate limit exceeded",
            },
          })
        );
      }

      return [];
    });

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
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x1f4",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x1f4",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x1f4",
            "topics": [
              [],
            ],
          },
        ],
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
