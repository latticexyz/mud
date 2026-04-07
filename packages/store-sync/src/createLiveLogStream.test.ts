import { describe, expect, it, vi } from "vitest";
import { createClient } from "viem";
import { anvil } from "viem/chains";
import { createMockTransport } from "../../block-logs-stream/test/createMockTransport";
import {
  createLiveLogStream,
  getEffectiveFollowBlockTag,
  getSyncBlockTag,
  resolvePreconfirmedLogs,
} from "./createLiveLogStream";

describe("createLiveLogStream", () => {
  it("maps pending sync to latest when no preconfirmed source is available", () => {
    expect(getSyncBlockTag("pending")).toBe("latest");
    expect(getEffectiveFollowBlockTag("pending", undefined)).toBe("latest");
    expect(
      getEffectiveFollowBlockTag("pending", {
        type: "flashblocks-http",
        pollingInterval: 150,
      }),
    ).toBe("pending");
  });

  it("resolves flashblocks from chain rpcUrls when following pending", () => {
    const publicClient = createClient({
      chain: {
        ...anvil,
        rpcUrls: {
          ...anvil.rpcUrls,
          flashblocks: {
            http: ["https://flashblocks.example"],
            webSocket: ["wss://flashblocks.example"],
          },
        },
      },
      transport: createMockTransport(async () => []),
    });

    expect(resolvePreconfirmedLogs({ publicClient, followBlockTag: "pending" })).toEqual({
      type: "flashblocks-ws",
      url: "wss://flashblocks.example",
    });
  });

  it("uses the provided public client for explicit flashblocks http config", () => {
    const publicClient = createClient({
      transport: createMockTransport(async () => []),
    });

    expect(
      resolvePreconfirmedLogs({
        publicClient,
        followBlockTag: "pending",
        preconfirmedLogs: { type: "flashblocks-http" },
      }),
    ).toEqual({
      type: "flashblocks-http",
      pollingInterval: 150,
      url: undefined,
    });
  });

  it("polls pending logs with eth_getLogs over HTTP", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    let streamError: unknown;

    const publicClient = createClient({
      transport: createMockTransport(async ({ method, params }) => {
        requests.push({ method, params });
        if (method === "eth_getLogs") {
          return [];
        }
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    const sub = createLiveLogStream({
      publicClient,
      address: "0x0000000000000000000000000000000000000000",
      fromBlock: 0n,
      preconfirmedLogs: {
        type: "flashblocks-http",
        pollingInterval: 1_000,
      },
    }).subscribe({
      error: (error) => {
        streamError = error;
      },
    });

    await vi.waitFor(() => {
      expect(streamError).toBeUndefined();
      expect(requests[0]).toMatchObject({
        method: "eth_getLogs",
        params: [
          expect.objectContaining({
            fromBlock: "pending",
            toBlock: "pending",
          }),
        ],
      });
    });

    sub.unsubscribe();
  });
});
