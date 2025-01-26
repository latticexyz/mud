import { describe, it, expect } from "vitest";
import { createClient, hexToBigInt } from "viem";
import { fetchLogs } from "./fetchLogs";
import { createMockTransport } from "../test/createMockTransport";

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
});
