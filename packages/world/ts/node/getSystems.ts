import { World } from "../config/v2/output";
import { getContracts } from "./getContracts";

export async function getSystems({ configPath, config }: { configPath: string; config: World }) {
  const contracts = await getContracts({ configPath, config });
  return contracts.filter(
    (contract) =>
      contract.name.endsWith("System") &&
      // exclude the base System contract
      contract.name !== "System" &&
      // exclude interfaces
      !/^I[A-Z]/.test(contract.name),
  );
}
