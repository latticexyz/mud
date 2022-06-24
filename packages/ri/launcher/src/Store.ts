import { Wallet } from "ethers";
import { makeAutoObservable, runInAction } from "mobx";
import React from "react";
import { Persona } from "@latticexyz/persona-js";
import { chainSpec, game } from "./constants";
import { JsonRpcProvider } from "@ethersproject/providers";

const burnerWalletStorageKey = "burnerWallet";
const personaStorageKey = "personaId";

export class Store {
  public wallet?: Wallet;
  public persona = Persona(chainSpec);
  public personaId?: number;
  public burnerWallet?: Wallet;
  public provider = new JsonRpcProvider(chainSpec.rpc, chainSpec.chainId);

  constructor() {
    makeAutoObservable(this);
    this.boot();
  }

  public async boot() {
    const burnerWallet = localStorage.getItem(burnerWalletStorageKey);
    const personaString = localStorage.getItem(personaStorageKey);
    const personaId = personaString != null ? Number(personaString) : null;
    if (burnerWallet && personaId != null) {
      this.burnerWallet = new Wallet(burnerWallet).connect(this.provider);
      this.personaId = personaId;
    } else {
      this.connectWallet();
      await this.mintPersonaAndBurner();
    }
  }

  public connectWallet() {
    // For now this just creates a burner wallet for you.
    // TODO: allow connecting with other actual wallets
    this.wallet = Wallet.createRandom();
    this.wallet = this.wallet.connect(this.provider);
    this.persona.connectSigner(this.wallet);
  }

  public async mintPersonaAndBurner() {
    if (!this.wallet) throw new Error("No wallet connected");
    const { personaId, burnerWallet } = await this.persona.mintAndBurner(game.address);
    localStorage.setItem(burnerWalletStorageKey, burnerWallet.privateKey);
    localStorage.setItem(personaStorageKey, String(personaId));
    runInAction(() => {
      this.personaId = personaId;
      this.burnerWallet = burnerWallet;
    });
  }

  public get instanceUrl(): string | undefined {
    return this.burnerWallet && this.personaId != null
      ? `${game.client}?burnerWalletPrivateKey=${this.burnerWallet.privateKey}&personaId=${this.personaId}&chainId=${chainSpec.chainId}&contractAddress=${game.address}`
      : undefined;
  }
}

export const StoreContext = React.createContext<Store>(new Store());
