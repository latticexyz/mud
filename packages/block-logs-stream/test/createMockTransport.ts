import { vi } from "vitest";
import { Transport, createTransport } from "viem";

export function createMockTransport(
  // TODO: refine types for better autocomplete/inference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: (args: { method: string; params: any }) => Promise<unknown>,
): Transport {
  return () =>
    createTransport({
      key: "mock",
      name: "Mock Transport",
      request: vi.fn(request) as never,
      type: "mock",
    }) as never;
}
