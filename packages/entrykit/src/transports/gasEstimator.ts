import { BundlerRpcSchema, Transport } from "viem";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";
import { TransportRequestFn, RpcMethods } from "./common";

export function gasEstimator<const transport extends Transport>(getTransport: transport): transport {
  return ((opts) => {
    const { request: originalRequest, ...rest } = getTransport(opts);

    const request: TransportRequestFn<RpcMethods<BundlerRpcSchema, "eth_estimateUserOperationGas">> = async (
      { method, params },
      options,
    ) => {
      if (method === "eth_estimateUserOperationGas") {
        return estimateUserOperationGas(params);
      }
      return originalRequest({ method, params }, options);
    };

    return { request, ...rest };
  }) as transport;
}
