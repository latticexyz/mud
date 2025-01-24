import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [mainnetChains, testnetChains] = await Promise.all([
  fetch("https://api.relay.link/chains").then((res) => res.json()),
  fetch("https://api.testnets.relay.link/chains").then((res) => res.json()),
]);

const chains = Object.fromEntries([...mainnetChains.chains, ...testnetChains.chains].map(({ id, name }) => [id, name]));
console.log(chains);

const filename = path.join(__dirname, "..", "data", "relayChains.json");
await fs.writeFile(filename, JSON.stringify(chains) + "\n");
console.log("wrote chains to", filename);
