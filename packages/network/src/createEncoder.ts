import { ContractSchemaValue, ContractSchemaValueId } from "./types";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

export function createEncoder<D extends { [key: string]: unknown }>(
  keys: (keyof D)[],
  valueTypes: ContractSchemaValue[]
): (value: D) => string {
  return (value) => {
    const contractArgTypes = [] as string[];
    const contractArgs = Object.values(value);

    for (const componentValueProp of Object.keys(value)) {
      const index = keys.findIndex((key) => key === componentValueProp);
      contractArgTypes.push(ContractSchemaValueId[valueTypes[index] as ContractSchemaValue]);
    }

    return abi.encode(contractArgTypes, contractArgs);
  };
}
