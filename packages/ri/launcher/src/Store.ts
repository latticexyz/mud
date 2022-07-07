import { Wallet } from "ethers";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import React from "react";
import { Persona } from "@latticexyz/persona-js";
import { JsonRpcProvider } from "@ethersproject/providers";

const burnerWalletStorageKey = "burnerWallet";
const defaultChainSpec = "https://config.maps.lattice.xyz/chainSpec.json";
const defaultGameSpec = "https://config.maps.lattice.xyz/gameSpec.json";

interface ChainSpec {
  chainId: number;
  rpc: string;
  wsRpc: string;
  personaAddress: string;
  personaMirrorAddress: string;
  personaAllMinterAddress: string;
}

interface GameSpec {
  worldAddress: string;
  client: string;
  checkpoint: string;
}

export class Store {
  public chainSpec?: ChainSpec;
  public gameSpec?: GameSpec;
  public wallet?: Wallet;
  public persona?: ReturnType<typeof Persona>;
  public personaId?: number;
  public burnerWallet?: Wallet;
  public devMode?: boolean;

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

    const responses = await Promise.all([fetch(chainSpecUrl), fetch(gameSpecUrl)]);
    const [chainSpec, gameSpec] = (await Promise.all(responses.map((r) => r.json()))) as [ChainSpec, GameSpec];
    console.info("Chain spec:", chainSpec);
    console.info("Game spec:", gameSpec);

    // Override via get params
    chainSpec.chainId = Number(params.get("chainId")) || chainSpec.chainId;
    chainSpec.personaAddress = params.get("personaAddress") || chainSpec.personaAddress;
    chainSpec.rpc = params.get("rpc") || chainSpec.rpc;
    chainSpec.wsRpc = params.get("wsRpc") || chainSpec.wsRpc;
    chainSpec.personaMirrorAddress = params.get("personaMirrorAddress") || chainSpec.personaMirrorAddress;
    chainSpec.personaAllMinterAddress = params.get("personaAllMinterAddress") || chainSpec.personaAllMinterAddress;
    gameSpec.worldAddress = params.get("worldAddress") || gameSpec.worldAddress;
    gameSpec.checkpoint = params.get("checkpoint") || gameSpec.checkpoint;
    gameSpec.client = params.get("client") || gameSpec.client;
    this.devMode = params.get("dev") === "true";

    runInAction(() => {
      this.persona = Persona(chainSpec);
      this.gameSpec = gameSpec;
      this.chainSpec = chainSpec;
    });

    // Init provider
    const provider = new JsonRpcProvider(chainSpec.rpc, chainSpec.chainId);

    // Init burner wallet
    const burnerWalletPK = localStorage.getItem(burnerWalletStorageKey);
    const burnerWallet = burnerWalletPK
      ? new Wallet(burnerWalletPK).connect(provider)
      : Wallet.createRandom().connect(provider);
    localStorage.setItem(burnerWalletStorageKey, burnerWallet.privateKey);

    runInAction(() => {
      this.burnerWallet = burnerWallet;
    });

    // Check if buner wallet has Persona
    //   if (burnerWalletPK) {
    //     const bunerWallet = new Wallet(burnerWalletPK).connect(provider);
    //     this.persona?.connectSigner(bunerWallet);
    //     const personaId = await this.persona?.getActivePersona(bunerWallet.address, gameSpec.address);

    //     if (personaId != null) {
    //       runInAction(() => {
    //         this.burnerWallet = bunerWallet;
    //         this.personaId = personaId;
    //       });
    //       return;
    //     }
    //   }

    //   // If burner wallet doesn't have persona
    //   this.connectWallet(provider);
    //   await this.mintPersonaAndBurner();
  }

  public connectWallet(provider: JsonRpcProvider) {
    // For now this just creates a burner wallet for you.
    // TODO: allow connecting with other actual wallets
    this.wallet = Wallet.createRandom();
    this.wallet = this.wallet.connect(provider);
  }

  // public async mintPersonaAndBurner() {
  //   if (!this.wallet || !this.persona || !this.gameSpec) {
  //     console.log(this.wallet, this.persona, this.gameSpec);
  //     throw new Error("Mint failed: no wallet or persona or game spec");
  //   }
  //   const { personaId, burnerWallet } = await this.persona.mintAndBurner(this.gameSpec.address, {
  //     maxPriorityFeePerGas: 0,
  //     maxFeePerGas: 0,
  //     gasLimit: 200000,
  //   });
  //   localStorage.setItem(burnerWalletStorageKey, burnerWallet.privateKey);
  //   runInAction(() => {
  //     this.personaId = personaId;
  //     this.burnerWallet = burnerWallet;
  //   });
  // }

  public get instanceUrl(): string | undefined {
    if (this.burnerWallet && this.gameSpec && this.chainSpec) {
      return `${this.gameSpec.client ?? ""}?burnerWalletPrivateKey=${this.burnerWallet.privateKey ?? ""}&personaId=${
        this.personaId ?? ""
      }&chainId=${this.chainSpec.chainId ?? ""}&worldAddress=${this.gameSpec.worldAddress ?? ""}&rpc=${
        this.chainSpec.rpc ?? ""
      }&wsRpc=${this.chainSpec.wsRpc ?? ""}&checkpoint=${this.gameSpec.checkpoint ?? ""}&dev=${this.devMode}`;
    }
  }
}

export const StoreContext = React.createContext<Store>(new Store());
