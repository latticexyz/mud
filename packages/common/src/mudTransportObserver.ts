import { EIP1193RequestFn, Transport } from "viem";

type TransportObserverOptions<TEIP1193RequestFn extends EIP1193RequestFn = EIP1193RequestFn> = {
  onRequest?: (...args: Parameters<TEIP1193RequestFn>) => void;
};

export function mudTransportObserver<TTransport extends Transport>(
  transport: TTransport,
  { onRequest }: TransportObserverOptions = {}
): TTransport {
  return ((transportOptions) => {
    const result = transport(transportOptions);
    const request: typeof result.request = async (req) => {
      // TODO: decide if we want to allow request to be mutated
      onRequest?.(req);
      return result.request(req);
    };
    return {
      ...result,
      request,
    };
  }) as TTransport;
}
