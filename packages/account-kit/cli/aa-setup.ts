import { deployContracts } from "./utils/deployContracts";
import { alto } from "./utils/alto";

// Usage: `pnpm aa-setup`

await deployContracts();
await alto();
