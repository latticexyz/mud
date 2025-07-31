import { findContractNodeSlang } from "./findContractNode";
import { findSymbolImportSlang } from "./findSymbolImport";
import { Parser } from "@nomicfoundation/slang/parser";
import { LanguageFacts } from "@nomicfoundation/slang/utils";
import { assertNonterminalNode, Query } from "@nomicfoundation/slang/cst";
import { ContractDefinition } from "@nomicfoundation/slang/ast";

const baseSystemName = "System";
const baseSystemPath = "@latticexyz/world/src/System.sol";

export function parseSystem(
  source: string,
  contractName: string,
): undefined | { contractType: "contract" | "abstract" } {
  const parser = Parser.create(LanguageFacts.latestVersion());
  const root = parser.parseFileContents(source).createTreeCursor();

  const contractCursor = findContractNodeSlang(root, contractName);
  if (!contractCursor) return;

  assertNonterminalNode(contractCursor.node);
  const contract = new ContractDefinition(contractCursor.node);
  const contractType = contract.abstractKeyword ? "abstract" : "contract";

  // if using the System suffix, assume its a system
  if (contractName.endsWith("System") && contractName !== baseSystemName) return { contractType };

  for (const _ of contractCursor.query([
    Query.create(`
      [InheritanceType
        type_name: [_ ["${baseSystemName}"]]
      ]
    `),
  ])) {
    if (findSymbolImportSlang(root, baseSystemName)?.path === baseSystemPath) {
      return { contractType };
    }
  }

  return;
}
