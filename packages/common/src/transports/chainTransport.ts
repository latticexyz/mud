import { Chain, fallback, http, Transport, webSocket } from "viem";

export function chainTransport(rpcUrls: Chain["rpcUrls"][string]): Transport | undefined {
  const webSocketUrl = rpcUrls?.webSocket?.[0];
  const httpUrl = rpcUrls?.http[0];

  if (webSocketUrl) {
    return httpUrl ? fallback([webSocket(webSocketUrl), http(httpUrl)]) : webSocket(webSocketUrl);
  }

  if (httpUrl) {
    return http(httpUrl);
  }
}
