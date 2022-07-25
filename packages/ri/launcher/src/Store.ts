import { Wallet } from "ethers";
import { makeAutoObservable, runInAction } from "mobx";
import React from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

const burnerWalletStorageKey = "burnerWallet";
const defaultChainSpec = "https://config.maps.lattice.xyz/chainSpec.json";
const defaultGameSpec = "https://config.maps.lattice.xyz/gameSpec.json";

interface ChainSpec {
  chainId: number;
  rpc: string;
  wsRpc: string;
}

interface GameSpec {
  worldAddress: string;
  client: string;
  checkpoint: string;
  initialBlockNumber: number;
}

export class Store {
  public chainSpec?: ChainSpec;
  public gameSpec?: GameSpec;
  public wallet?: Wallet;
  public personaId?: number;
  public burnerWallet?: Wallet;
  public devMode?: boolean;

  constructor() {
    makeAutoObservable(this);
    this.boot();
  }

  public async boot() {
    // Load config
    const params = new URLSearchParams(window.location.search);
    const gameSpecUrl = params.get("gameSpec") || defaultGameSpec;
    const chainSpecUrl = params.get("chainSpec") || defaultChainSpec;

    const responses = await Promise.all([fetch(chainSpecUrl), fetch(gameSpecUrl)]);
    const [chainSpec, gameSpec] = (await Promise.all(responses.map((r) => r.json()))) as [ChainSpec, GameSpec];

    // Override via get params
    chainSpec.chainId = Number(params.get("chainId")) || chainSpec.chainId;
    chainSpec.rpc = params.get("rpc") || chainSpec.rpc;
    chainSpec.wsRpc = params.get("wsRpc") || chainSpec.wsRpc;
    gameSpec.worldAddress = params.get("worldAddress") || gameSpec.worldAddress;
    gameSpec.checkpoint = params.get("checkpoint") || gameSpec.checkpoint;
    gameSpec.client = params.get("client") || gameSpec.client;
    const initialBlockNumberString = params.get("initialBlockNumber");
    gameSpec.initialBlockNumber = initialBlockNumberString
      ? Number(initialBlockNumberString)
      : gameSpec.initialBlockNumber;
    this.devMode = params.get("dev") === "true";

    console.info("Chain spec:", chainSpec);
    console.info("Game spec:", gameSpec);

    runInAction(() => {
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
  }

  public connectWallet(provider: JsonRpcProvider) {
    // For now this just creates a burner wallet for you.
    // TODO: allow connecting with other actual wallets
    this.wallet = Wallet.createRandom();
    this.wallet = this.wallet.connect(provider);
  }

  public get instanceUrl(): string | undefined {
    if (this.burnerWallet && this.gameSpec && this.chainSpec) {
      return `${this.gameSpec.client ?? ""}?burnerWalletPrivateKey=${this.burnerWallet.privateKey ?? ""}&chainId=${
        this.chainSpec.chainId ?? ""
      }&worldAddress=${this.gameSpec.worldAddress ?? ""}&rpc=${this.chainSpec.rpc ?? ""}&wsRpc=${
        this.chainSpec.wsRpc ?? ""
      }&checkpoint=${this.gameSpec.checkpoint ?? ""}&dev=${this.devMode}&initialBlockNumber=${
        this.gameSpec.initialBlockNumber ?? ""
      }`;
    }
  }
}

export const StoreContext = React.createContext<Store>(new Store());
