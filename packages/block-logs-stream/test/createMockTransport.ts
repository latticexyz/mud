import { vi } from "vitest";
import { Transport, createTransport } from "viem";

// TODO: refine types based on RpcSchema for better autocomplete/inference

export function createMockTransport(
  request: (args: {
    method: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any;
  }) => Promise<unknown>,
): Transport {
  return () =>
    createTransport({
      key: "mock",
      name: "Mock Transport",
      request: vi.fn(request) as never,
      type: "mock",
    }) as never;
}
