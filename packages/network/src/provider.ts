import { providers, utils } from "ethers";

export class MUDJsonRpcProvider extends providers.JsonRpcProvider {
  constructor(url: string | utils.ConnectionInfo | undefined, network: providers.Networkish) {
    super(url, network);
  }
  async detectNetwork(): Promise<providers.Network> {
    const network = this.network;
    if (network == null) {
      throw new Error("No network");
    }
    return network;
  }
}

export class MUDJsonRpcBatchProvider extends providers.JsonRpcBatchProvider {
  constructor(url?: string | utils.ConnectionInfo | undefined, network?: providers.Networkish | undefined) {
    super(url, network);
  }
  async detectNetwork(): Promise<providers.Network> {
    const network = this.network;
    if (network == null) {
      throw new Error("No network");
    }
    return network;
  }
}
