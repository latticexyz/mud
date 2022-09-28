/* eslint-disable @typescript-eslint/ban-ts-comment */
import { JsonRpcBatchProvider, JsonRpcProvider, Network, Networkish } from "@ethersproject/providers";
import { ConnectionInfo } from "ethers/lib/utils";

export class MUDProvider extends JsonRpcProvider {
  constructor(url: string | ConnectionInfo | undefined, network: Networkish) {
    super(url, network);
  }
  async detectNetwork(): Promise<Network> {
    const network = this.network;
    if (network == null) {
      throw new Error("No network");
    }
    return network;
  }
}

export class MUDBatchProvider extends JsonRpcBatchProvider {
  constructor(url?: string | ConnectionInfo | undefined, network?: Networkish | undefined) {
    super(url, network);
  }
  async detectNetwork(): Promise<Network> {
    const network = this.network;
    if (network == null) {
      throw new Error("No network");
    }
    return network;
  }
}
