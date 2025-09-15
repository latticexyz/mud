import { Chain, EIP1193RequestFn, Hex, http, Transport } from "viem";
import { chainTransport } from "./chainTransport";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";

type AltoSendUserOperationResultuest = {
  txHash: Hex;
  userOpHash: Hex;
};

type AltoOptions<transport extends Transport> = {
  /** alto-compatible transport */
  altoTransport: transport;
  /** fallback transport for all other RPC methods */
  fallbackDefaultTransport?: Transport;
};

export function alto<const altoTransport extends Transport>(transports?: AltoOptions<altoTransport>): altoTransport {
  return ((opts) => {
    const { altoTransport } = transports ?? getDefaultTransports(opts.chain);

    const { request: altoRequest, ...rest } = altoTransport(opts);

    return {
      ...rest,
      // TODO: type `request` so we don't have to cast
      async request(req): ReturnType<EIP1193RequestFn> {
        if (req.method === "eth_estimateUserOperationGas") {
          console.log("estimating user operation gas via alto", req);
          return await estimateUserOperationGas({
            request: altoRequest,
            params: req.params as never,
          });
        }

        if (req.method === "eth_sendUserOperation") {
          console.log("sending user operation via pimlico_sendUserOperationNow", req);
          const result = (await altoRequest({
            ...req,
            method: "pimlico_sendUserOperationNow",
          })) as AltoSendUserOperationResultuest;
          console.log("pimlico_sendUserOperationNow", result);
          return result.userOpHash;
        }

        return await altoRequest(req);
      },
    };
  }) as altoTransport;
}

function getDefaultTransports(chain?: Chain): AltoOptions<Transport> {
  if (!chain) {
    throw new Error("No chain or transports provided");
  }

  const altoTransport = chainTransport(chain.rpcUrls.alto);
  if (!altoTransport) {
    throw new Error("Provided chain does not support alto");
  }

  return {
    altoTransport,
    fallbackDefaultTransport: http(),
  };
}
