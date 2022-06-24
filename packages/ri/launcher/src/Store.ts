import { Wallet } from "ethers";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import React from "react";
import { Persona } from "@latticexyz/persona-js";
import { JsonRpcProvider } from "@ethersproject/providers";

const burnerWalletStorageKey = "burnerWallet";
const personaStorageKey = "personaId";
const defaultChainSpec = "https://launcher-config.pages.dev/chainSpec.json";
const defaultGameSpec = "https://launcher-config.pages.dev/gameSpec.json";

export class Store {
  public chainSpec?: { [key: string]: string };
  public gameSpec?: { [key: string]: string };
  public wallet?: Wallet;
  public persona?: ReturnType<typeof Persona>;
  public personaId?: number;
  public burnerWallet?: Wallet;
  public checkpointUrl?: string;

  constructor() {
    makeAutoObservable(this);

    // Connect persona to wallet
    reaction(
      () => ({ wallet: this.wallet, persona: this.persona }),
      ({ wallet, persona }) => {
        if (wallet && persona) persona.connectSigner(wallet);
      }
    );

    this.boot();
  }

  public async boot() {
    // Load config
    const params = new URLSearchParams(window.location.search);
    const gameSpecUrl = params.get("gameSpec") || defaultGameSpec;
    const chainSpecUrl = params.get("chainSpec") || defaultChainSpec;
    this.checkpointUrl = params.get("checkpoint") || undefined;

    const responses = await Promise.all([fetch(chainSpecUrl), fetch(gameSpecUrl)]);
    const [chainSpec, gameSpec] = await Promise.all(responses.map((r) => r.json()));
    console.info("Chain spec:", chainSpec);
    console.info("Game spec:", gameSpec);

    runInAction(() => {
      this.persona = Persona(chainSpec);
      this.gameSpec = gameSpec;
      this.chainSpec = chainSpec;
    });

    // Init provider
    const provider = new JsonRpcProvider(chainSpec.rpc, chainSpec.chainId);

    // Create wallet and impersonate
    const burnerWalletPK = localStorage.getItem(burnerWalletStorageKey);
    const personaString = localStorage.getItem(personaStorageKey);
    const personaId = personaString != null ? Number(personaString) : null;
    if (burnerWalletPK && personaId != null) {
      runInAction(() => {
        this.burnerWallet = new Wallet(burnerWalletPK).connect(provider);
        this.personaId = personaId;
      });
    } else {
      this.connectWallet(provider);
      await this.mintPersonaAndBurner();
    }
  }

  public connectWallet(provider: JsonRpcProvider) {
    // For now this just creates a burner wallet for you.
    // TODO: allow connecting with other actual wallets
    this.wallet = Wallet.createRandom();
    this.wallet = this.wallet.connect(provider);
  }

  public async mintPersonaAndBurner() {
    if (!this.wallet || !this.persona || !this.gameSpec) {
      console.log(this.wallet, this.persona, this.gameSpec);
      throw new Error("Mint failed: no wallet or persona or game spec");
    }
    const { personaId, burnerWallet } = await this.persona.mintAndBurner(this.gameSpec.address);
    localStorage.setItem(burnerWalletStorageKey, burnerWallet.privateKey);
    localStorage.setItem(personaStorageKey, String(personaId));
    runInAction(() => {
      this.personaId = personaId;
      this.burnerWallet = burnerWallet;
    });
  }

  public get instanceUrl(): string | undefined {
    if (this.burnerWallet && this.gameSpec && this.chainSpec && this.persona != null) {
      return `${this.gameSpec.client}?burnerWalletPrivateKey=${this.burnerWallet.privateKey}&personaId=${this.personaId}&chainId=${this.chainSpec.chainId}&contractAddress=${this.gameSpec.address}&rpc=${this.chainSpec.rpc}&checkpoint=${this.checkpointUrl}`;
    }
  }
}

export const StoreContext = React.createContext<Store>(new Store());
