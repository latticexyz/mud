import { deployEIP4337Contracts } from "./utils/deployEIP4337Contracts";
import { alto } from "./utils/alto";

// Usage: `pnpm aa-setup`

await deployEIP4337Contracts();
await alto();
