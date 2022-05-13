import { BehaviorSubject, combineLatest, map, Observable, Subject } from "rxjs";
import * as ethers from "ethers";
import { ProviderPair } from "./createNetwork";

export interface SignerConfig {
  privateKey: string;
}

export type Signer = {
  config$: Subject<SignerConfig>;
  ethersSigner$: Observable<ethers.Signer>;
};

export function createSigner(initialConfig: SignerConfig, providers$: Observable<ProviderPair>): Signer {
  const config$ = new BehaviorSubject<SignerConfig>(initialConfig);
  const ethersSigner$ = combineLatest([providers$, config$]).pipe(
    map(([[jsonProvider, webSocketProvider], config]) => {
      const signer = new ethers.Wallet(config.privateKey);
      return signer.connect(webSocketProvider ? webSocketProvider : jsonProvider);
    })
  );
  return {
    config$,
    ethersSigner$,
  };
}
