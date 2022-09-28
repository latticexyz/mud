import { sleep } from "@latticexyz/utils";
import { reaction, runInAction } from "mobx";
import { createNetwork, Network } from "./createNetwork";

const config = {
  clock: {
    period: 1000,
    initialTime: 0,
    syncInterval: 1000,
  },
  provider: {
    jsonRpcUrl: "https://rpc.gnosischain.com",
    wsRpcUrl: "wss://rpc.gnosischain.com/wss",
    options: {
      batch: true,
      pollingInterval: 1000,
      skipNetworkCheck: true,
    },
    chainId: 4242,
  },
  chainId: 100,
};

describe("Network", () => {
  let network: Network;
  beforeEach(async () => {
    network = await createNetwork(config);
  });

  afterEach(() => {
    network.dispose();
  });

  it("updates the provider if the provider config changes", async () => {
    const mock = jest.fn();
    // Call mock every time providers change
    reaction(() => network.providers.get(), mock);

    expect(mock).toHaveBeenCalledTimes(0);

    runInAction(() => {
      if (network.config?.provider?.options) network.config.provider.options.batch = false;
    });

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("updates the signer if the signer config changes", () => {
    const mock = jest.fn();
    reaction(() => network.signer.get(), mock);

    expect(mock).toHaveBeenCalledTimes(0);
    expect(network.signer.get()).toBeUndefined();

    runInAction(() => {
      network.config.privateKey = "0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF";
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(network.signer.get()).toBeDefined();

    runInAction(() => {
      network.config.privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    });

    expect(mock).toHaveBeenCalledTimes(2);
    expect(network.signer.get()).toBeDefined();

    runInAction(() => {
      network.config.privateKey = undefined;
    });

    expect(mock).toHaveBeenCalledTimes(3);
    expect(network.signer.get()).toBeUndefined();
  });

  it("updates the singner if the provider changes", () => {
    const mock = jest.fn();
    // Call mock every time providers change
    reaction(() => network.signer.get(), mock);

    runInAction(() => {
      network.config.privateKey = "0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF";
    });

    expect(mock).toHaveBeenCalledTimes(1);

    runInAction(() => {
      if (network.config?.provider?.options) network.config.provider.options.batch = false;
    });

    expect(mock).toHaveBeenCalledTimes(2);
  });

  it.skip("listens to new block numbers", async () => {
    const mock = jest.fn();
    network.blockNumber$.subscribe(mock);
    await sleep(5000);
    expect(mock).toHaveBeenCalledTimes(1);
  }, 10000);
});
