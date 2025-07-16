import { parse, visit } from "@solidity-parser/parser";

import { findContractNode } from "./findContractNode";
import { findSymbolImport } from "./findSymbolImport";

const baseSystemName = "System";
const baseSystemPath = "@latticexyz/world/src/System.sol";

export function parseSystem(
  source: string,
  contractName: string,
): undefined | { contractType: "contract" | "abstract" } {
  const ast = parse(source);
  const contractNode = findContractNode(ast, contractName);
  if (!contractNode) return;

  const contractType = contractNode.kind;
  // skip libraries and interfaces
  // we allow abstract systems here so that we can create system libraries from them but without deploying them
  if (contractType !== "contract" && contractType !== "abstract") return;

  const isSystem = ((): boolean => {
    // if using the System suffix, assume its a system
    if (contractName.endsWith("System") && contractName !== baseSystemName) return true;

    // otherwise check if we're inheriting from the base system
    let extendsBaseSystem = false;
    visit(contractNode, {
      InheritanceSpecifier(node) {
        if (node.baseName.namePath === baseSystemName) {
          extendsBaseSystem = true;
        }
      },
    });
    return extendsBaseSystem && findSymbolImport(ast, baseSystemName)?.path === baseSystemPath;
  })();

  if (isSystem) {
    return { contractType };
  }
}
