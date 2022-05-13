import { createNetwork } from "../src";

describe("Network", () => {
  // let network: Network;
  beforeEach(() => {
    createNetwork({
      time: {
        period: 5000,
      },
      chainId: 100,
      rpcSupportsBatchQueries: true,
      rpcUrl: "https://rpc.gnosischain.com",
      rpcWsUrl: "wss://rpc.gnosischain.com/wss",
    });
  });

  it.todo("add tests");
});
