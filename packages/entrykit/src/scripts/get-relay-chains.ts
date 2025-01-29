import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RelayChain, RelayChains } from "../onboarding/common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type RelayChainsApiResponse = { chains: { id: number; name: string }[] };
const [mainnet, testnet] = await Promise.all([
  fetch("https://api.relay.link/chains").then((res) => res.json() as Promise<RelayChainsApiResponse>),
  fetch("https://api.testnets.relay.link/chains").then((res) => res.json() as Promise<RelayChainsApiResponse>),
]);

// TODO: throw if there are any chain ID overlaps?
const chains = Object.fromEntries<RelayChain>([
  ...testnet.chains.map(({ id, name }) => [id, { bridgeUrl: `https://testnets.relay.link/bridge/${name}` }] as const),
  ...mainnet.chains.map(({ id, name }) => [id, { bridgeUrl: `https://relay.link/bridge/${name}` }] as const),
]) satisfies RelayChains;

console.log(chains);

const filename = path.join(__dirname, "..", "data", "relayChains.json");
await fs.writeFile(filename, JSON.stringify(chains, null, 2) + "\n");

console.log("wrote chains to", filename);
