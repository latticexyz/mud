import { deployContracts } from "./utils/deployContracts";
import { alto } from "./utils/alto";

await deployContracts();
await alto();
