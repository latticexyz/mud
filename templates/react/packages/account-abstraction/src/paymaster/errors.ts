export class InternalBundlerError extends Error {
  constructor(msg?: string) {
    let message = msg;
    if (!msg) {
      message = "Internal error from bundler";
    }
    super(message);
  }
}

export class RpcError extends Error {
  // error codes from: https://eips.ethereum.org/EIPS/eip-1474
  constructor(
    msg: string,
    readonly code?: number,
    readonly data: unknown = undefined,
  ) {
    super(msg);
  }
}
