import { startProxy } from "@viem/anvil";

await startProxy({
  host: "127.0.0.1",
  options: {
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
  },
});
