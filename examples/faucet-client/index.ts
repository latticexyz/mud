import { createClient as createFaucetClient } from "@latticexyz/faucet";

const faucetClient = createFaucetClient({
  url: "http://127.0.0.1:3002/trpc",
});

const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const tx = await faucetClient.drip.mutate({
  address: address,
});

console.log(`Transaction hash: ${tx}`);
