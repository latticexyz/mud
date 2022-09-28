/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  JsonRpcBatchProvider,
  JsonRpcProvider,
  Network,
  Networkish,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers";
import { ConnectionInfo, Deferrable, defineReadOnly } from "ethers/lib/utils";

export class MUDProvider extends JsonRpcProvider implements JsonRpcProvider {
  constructor(url?: string | ConnectionInfo | undefined, network?: Networkish | undefined) {
    super(url, network);
  }
  async detectNetwork(): Promise<Network> {
    let network = this.network;
    if (network == null) {
      network = await super.detectNetwork();
      // If still not set, set it
      if (this._network == null) {
        // A static network does not support "any"
        defineReadOnly(this, "_network", network);

        this.emit("network", network, null);
      }
    }
    return network;
  }

  // @ts-ignore
  sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    console.log(this);
    console.log(super.sendUncheckedTransaction);
    // @ts-ignore
    return super.sendUncheckedTransaction(transaction).then((hash: string) => {
      // @ts-ignore
      return <TransactionResponse>{
        hash: hash,
        nonce: null,
        gasLimit: null,
        gasPrice: null,
        data: null,
        value: null,
        chainId: null,
        confirmations: 0,
        from: null,
        wait: (confirmations?: number) => {
          return this.waitForTransaction(hash, confirmations);
        },
      };
    });
  }
}

export class MUDBatchProvider extends JsonRpcBatchProvider implements JsonRpcProvider {
  constructor(url?: string | ConnectionInfo | undefined, network?: Networkish | undefined) {
    super(url, network);
  }
  async detectNetwork(): Promise<Network> {
    let network = this.network;
    if (network == null) {
      network = await super.detectNetwork();
      // If still not set, set it
      if (this._network == null) {
        // A static network does not support "any"
        defineReadOnly(this, "_network", network);

        this.emit("network", network, null);
      }
    }
    return network;
  }

  // @ts-ignore
  sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    // @ts-ignore
    return super.sendUncheckedTransaction(transaction).then((hash: string) => {
      // @ts-ignore
      return <TransactionResponse>{
        hash: hash,
        nonce: null,
        gasLimit: null,
        gasPrice: null,
        data: null,
        value: null,
        chainId: null,
        confirmations: 0,
        from: null,
        wait: (confirmations?: number) => {
          return this.waitForTransaction(hash, confirmations);
        },
      };
    });
  }
}
