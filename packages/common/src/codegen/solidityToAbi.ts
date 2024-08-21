import { parse, visit } from "@solidity-parser/parser";
// TODO: add ast types export (https://github.com/solidity-parser/parser/issues/71)
import {
  SourceUnit,
  ContractDefinition,
  VariableDeclaration,
  TypeName,
} from "@solidity-parser/parser/dist/src/ast-types";
import { Abi, AbiFunction, AbiError, AbiParameter, AbiType } from "abitype";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("solidityToAbi");

export function solidityToAbi(opts: { sourcePath: string; source: string; contractName: string }): Abi {
  // TODO: enable `tolerant` and print nicer message for `ast.errors`
  const ast = parse(opts.source);

  const prefix = `[${opts.sourcePath}:${opts.contractName}]`;
  const contract = findContractDef(ast, opts.contractName);
  if (!contract) {
    debug(`${prefix} Could not find contract definition.`);
    return [];
  }

  // TODO: extract more types
  const abi: (AbiFunction | AbiError)[] = [];

  visit(contract, {
    FunctionDefinition({
      name,
      visibility,
      parameters,
      stateMutability,
      returnParameters,
      isConstructor,
      isFallback,
      isReceiveEther,
    }) {
      // TODO: fill these in
      if (isConstructor || isFallback || isReceiveEther) return;

      // skip invalid function definitions
      if (!name) return debug(`${prefix} Skipping unnamed function.`);
      if (visibility === "default") return debug(`${prefix} Skipping function "${name}" with \`default\` visibility.`);
      if (stateMutability === "constant")
        return debug(`${prefix} Skipping function "${name}" with \`constant\` mutability modifier.`);

      if (visibility === "external" || visibility === "public") {
        abi.push({
          type: "function",
          name,
          stateMutability: stateMutability ?? "nonpayable",
          inputs: variablesToParameters(parameters),
          outputs: variablesToParameters(returnParameters ?? []),
        });
      }
    },
    CustomErrorDefinition({ name, parameters }) {
      abi.push({
        type: "error",
        name,
        inputs: variablesToParameters(parameters),
      });
    },
  });

  return abi;
}

function findContractDef(ast: SourceUnit, contractName: string): ContractDefinition | undefined {
  let contract: ContractDefinition | undefined = undefined;

  visit(ast, {
    ContractDefinition(node) {
      if (node.name === contractName) {
        contract = node;
      }
    },
  });

  return contract;
}

function variablesToParameters(variables: readonly VariableDeclaration[]): readonly AbiParameter[] {
  return variables.map(({ name, typeName }, i): AbiParameter => {
    if (!typeName) throw new Error(`No type definition for variable${name ? ` "${name}"` : ""} at position ${i}.`);

    const type = typeNameToAbiType(typeName);

    return {
      name: name ?? "",
      type,
    };
  });
}

function typeNameToAbiType(typeName: TypeName): AbiType {
  if (typeName.type === "ElementaryTypeName") {
    return typeName.name as AbiType;
  }
  if (typeName.type === "UserDefinedTypeName") {
    // TODO: resolve this to underlying abi type
    return typeName.namePath as AbiType;
  }
  if (typeName.type === "ArrayTypeName") {
    const length = ((): string => {
      if (!typeName.length) return "";
      if (typeName.length.type === "NumberLiteral") return typeName.length.number;
      if (typeName.length.type === "Identifier") return typeName.length.name;
      throw new Error(`Unsupported array length AST type "${typeName.length.type}".`);
    })();
    return `${typeNameToAbiType(typeName.baseTypeName)}[${length}]`;
  }

  throw new Error(`Unsupported AST parameter type "${typeName.type}".`);
}
