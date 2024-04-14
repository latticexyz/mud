import { deployEIP4337Contracts } from "./utils/deployEIP4337Contracts";
import { deployGasTank } from "./utils/deployGasTank";
import { alto } from "./utils/alto";

// Usage: `pnpm local-bundler`

await deployEIP4337Contracts();
await deployGasTank();
await alto();
