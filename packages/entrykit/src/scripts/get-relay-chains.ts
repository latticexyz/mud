import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [mainnet, testnet] = await Promise.all([
  fetch("https://api.relay.link/chains").then((res) => res.json()),
  fetch("https://api.testnets.relay.link/chains").then((res) => res.json()),
]);

// TODO: throw if there are any chain ID overlaps?
const chains = {
  ...Object.fromEntries(
    testnet.chains.map(({ id, name }) => [id, { bridgeUrl: `https://testnets.relay.link/bridge/${name}` }]),
  ),
  ...Object.fromEntries(mainnet.chains.map(({ id, name }) => [id, { bridgeUrl: `https://relay.link/bridge/${name}` }])),
};
console.log(chains);

const filename = path.join(__dirname, "..", "data", "relayChains.json");
await fs.writeFile(filename, JSON.stringify(chains, null, 2) + "\n");
console.log("wrote chains to", filename);
