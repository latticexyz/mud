import { vi } from "vitest";
import { RpcRequest, RpcResponse } from "./types";

export type MockedRpcRequest = Pick<RpcRequest, "method" | "params">;
export type MockedRpcResponse = Pick<RpcResponse, "result" | "error">;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createRpcMock(opts: {
  url?: string;
  request: (request: MockedRpcRequest | MockedRpcRequest[]) => Promise<MockedRpcResponse | MockedRpcResponse[]>;
}) {
  const url = new URL(opts.url ?? "http://mock").toString();
  const calls: {
    request: MockedRpcRequest | MockedRpcRequest[];
    response: MockedRpcResponse | MockedRpcResponse[];
  }[] = [];

  const fetchMock = vi.fn<typeof fetch>(async (...fetchArgs) => {
    const req = new Request(...fetchArgs);
    if (req.url.startsWith("http://mock/")) {
      const request = (await req.json()) as MockedRpcRequest;
      const response = await opts.request(request);
      calls.push({ request, response });
      return new Response(JSON.stringify(response));
    }
    throw new Error(`Attempted to fetch an unmocked URL: ${req.url}`);
  });

  return { url, fetchMock, calls };
}
