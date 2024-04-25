---
"@latticexyz/faucet": minor
---

New package to run your own faucet service. We'll use this soon for our testnet in place of `@latticexyz/services`.

To run the faucet server:

- Add the package with `pnpm add @latticexyz/faucet`
- Add a `.env` file that has a `RPC_HTTP_URL` and `FAUCET_PRIVATE_KEY` (or pass the environment variables into the next command)
- Run `pnpm faucet-server` to start the server

You can also adjust the server's `HOST` (defaults to `0.0.0.0`) and `PORT` (defaults to `3002`). The tRPC routes are accessible under `/trpc`.

To connect a tRPC client, add the package with `pnpm add @latticexyz/faucet` and then use `createClient`:

```ts
import { createClient } from "@latticexyz/faucet";

const faucet = createClient({ url: "http://localhost:3002/trpc" });

await faucet.mutate.drip({ address: burnerAccount.address });
```
