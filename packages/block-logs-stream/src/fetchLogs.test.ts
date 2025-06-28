import { describe, it, expect } from "vitest";
import { createClient, hexToBigInt } from "viem";
import { fetchLogs } from "./fetchLogs";
import { createMockTransport } from "../test/createMockTransport";
import { anvil } from "viem/chains";
import { MockedRpcResponse, createRpcMock } from "../test/createRpcMock";

describe("fetchLogs", () => {
  it("yields chunks of logs for the block range", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    const publicClient = createClient({
      transport: createMockTransport(async ({ method, params }) => {
        requests.push({ method, params });
        if (method === "eth_getLogs") {
          return [];
        }
        throw new Error("not implemented");
      }),
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
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x63",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x64",
              "toBlock": "0xc7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0xc8",
              "toBlock": "0x12b",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x12c",
              "toBlock": "0x18f",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x190",
              "toBlock": "0x1f3",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x1f4",
              "toBlock": "0x1f4",
              "topics": [
                [],
              ],
            },
          ],
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
      transport: createMockTransport(async ({ method, params }) => {
        requests.push({ method, params });
        if (method === "eth_getLogs") {
          const fromBlock = hexToBigInt(params[0].fromBlock);
          const toBlock = hexToBigInt(params[0].toBlock);
          if (toBlock - fromBlock + 1n > 500n) {
            throw new Error("block range exceeded");
          }
          return [];
        }
        throw new Error("not implemented");
      }),
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
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x3e7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x3e7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x3e7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x3e7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x1f3",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x1f4",
              "toBlock": "0x3e7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x3e8",
              "toBlock": "0x5db",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x5dc",
              "toBlock": "0x7cf",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x7d0",
              "toBlock": "0x7d0",
              "topics": [
                [],
              ],
            },
          ],
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
      transport: createMockTransport(async ({ method, params }) => {
        requests.push({ method, params });
        if (requests.length < 3) {
          throw new Error("rate limit exceeded");
        }
        if (method === "eth_getLogs") {
          return [];
        }
        throw new Error("not implemented");
      }),
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
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x1f3",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x1f3",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x1f3",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x1f4",
              "toBlock": "0x1f4",
              "topics": [
                [],
              ],
            },
          ],
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

  it("retries when load balanced RPC is out of sync", { timeout: 10_000 }, async () => {
    const blocks = [{ result: null }, { error: { message: "block not found" } }];
    const rpcMock = createRpcMock({
      async request(req) {
        const res = (Array.isArray(req) ? req : [req]).map(({ method, params }): MockedRpcResponse => {
          if (method === "eth_getLogs") {
            return { result: [] };
          }
          if (method === "eth_getBlockByNumber") {
            const block = blocks.shift();
            if (block) return block;
            return { result: { number: params[0] } };
          }
          throw new Error(`RPC method "${method}" not implemented.`);
        });
        return Array.isArray(req) ? res : res[0];
      },
    });

    const chain = { ...anvil, rpcUrls: { default: { http: [rpcMock.url] } } };
    global.fetch = rpcMock.fetchMock;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];
    for await (const result of fetchLogs({
      internal_clientOptions: {
        chain,
        validateBlockRange: true,
      },
      address: "0x",
      events: [],
      fromBlock: 0n,
      toBlock: 500n,
    })) {
      results.push(result);
    }

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

    expect(rpcMock.calls).toMatchInlineSnapshot(`
        [
          {
            "request": [
              {
                "id": 0,
                "jsonrpc": "2.0",
                "method": "eth_getBlockByNumber",
                "params": [
                  "0x1f3",
                  false,
                ],
              },
              {
                "id": 1,
                "jsonrpc": "2.0",
                "method": "eth_getLogs",
                "params": [
                  {
                    "address": "0x",
                    "fromBlock": "0x0",
                    "toBlock": "0x1f3",
                    "topics": [
                      [],
                    ],
                  },
                ],
              },
            ],
            "response": [
              {
                "result": null,
              },
              {
                "result": [],
              },
            ],
          },
          {
            "request": [
              {
                "id": 2,
                "jsonrpc": "2.0",
                "method": "eth_getBlockByNumber",
                "params": [
                  "0x1f3",
                  false,
                ],
              },
              {
                "id": 3,
                "jsonrpc": "2.0",
                "method": "eth_getLogs",
                "params": [
                  {
                    "address": "0x",
                    "fromBlock": "0x0",
                    "toBlock": "0x1f3",
                    "topics": [
                      [],
                    ],
                  },
                ],
              },
            ],
            "response": [
              {
                "error": {
                  "message": "block not found",
                },
              },
              {
                "result": [],
              },
            ],
          },
          {
            "request": [
              {
                "id": 4,
                "jsonrpc": "2.0",
                "method": "eth_getBlockByNumber",
                "params": [
                  "0x1f3",
                  false,
                ],
              },
              {
                "id": 5,
                "jsonrpc": "2.0",
                "method": "eth_getLogs",
                "params": [
                  {
                    "address": "0x",
                    "fromBlock": "0x0",
                    "toBlock": "0x1f3",
                    "topics": [
                      [],
                    ],
                  },
                ],
              },
            ],
            "response": [
              {
                "result": {
                  "number": "0x1f3",
                },
              },
              {
                "result": [],
              },
            ],
          },
          {
            "request": [
              {
                "id": 6,
                "jsonrpc": "2.0",
                "method": "eth_getBlockByNumber",
                "params": [
                  "0x1f4",
                  false,
                ],
              },
              {
                "id": 7,
                "jsonrpc": "2.0",
                "method": "eth_getLogs",
                "params": [
                  {
                    "address": "0x",
                    "fromBlock": "0x1f4",
                    "toBlock": "0x1f4",
                    "topics": [
                      [],
                    ],
                  },
                ],
              },
            ],
            "response": [
              {
                "result": {
                  "number": "0x1f4",
                },
              },
              {
                "result": [],
              },
            ],
          },
        ]
      `);
  });
});
