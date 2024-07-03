import { World as WorldConfig } from "../config/v2/output";
import { getContracts } from "./getContracts";

export function getSystems({ config, configPath }: { config: WorldConfig; configPath: string }) {
  return getContracts({ config, configPath }).filter(
    (contract) =>
      contract.name.endsWith("System") &&
      // exclude the base System contract
      contract.name !== "System" &&
      // exclude interfaces
      !/^I[A-Z]/.test(contract.name),
  );
}
