import { parse } from "@solidity-parser/parser";
import { findContractNodeSlang } from "./findContractNode";
import { findSymbolImport } from "./findSymbolImport";
import { Parser } from "@nomicfoundation/slang/parser";
import { LanguageFacts } from "@nomicfoundation/slang/utils";
import { Query } from "@nomicfoundation/slang/cst";

const baseSystemName = "System";
const baseSystemPath = "@latticexyz/world/src/System.sol";

export function parseSystem(source: string, contractName: string): boolean {
  const parser = Parser.create(LanguageFacts.latestVersion());
  const root = parser.parseFileContents(source).createTreeCursor();

  const contract = findContractNodeSlang(root, contractName);
  if (!contract) return false;

  // if using the System suffix, assume its a system
  if (contractName.endsWith("System") && contractName !== baseSystemName) return true;

  for (const _ of contract.query([
    Query.create(`
      [InheritanceType
        type_name: ["${baseSystemName}"]
      ]
    `),
  ])) {
    return findSymbolImport(parse(source), baseSystemName)?.path === baseSystemPath;
  }

  return false;
}
