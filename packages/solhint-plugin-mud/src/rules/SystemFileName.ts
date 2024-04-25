import path from "path";
import { visit } from "@solidity-parser/parser";
import type { ContractDefinition, SourceUnit } from "@solidity-parser/parser/dist/src/ast-types";
import { SolhintRule } from "../solhintTypes";

export class SystemFileName implements SolhintRule {
  ruleId = "system-file-name";
  reporter: any;
  config: any;

  expectedContractName: string;
  isSystemFile = false;

  constructor(reporter: any, config: any, inputSrc: string, fileName: string) {
    this.reporter = reporter;
    this.config = config;

    this.expectedContractName = path.basename(fileName, ".sol");
    if (
      this.expectedContractName.endsWith("System") &&
      this.expectedContractName !== "System" &&
      !this.expectedContractName.match(/^I[A-Z]/)
    ) {
      this.isSystemFile = true;
    }
  }

  SourceUnit(node: SourceUnit) {
    // only systems need a matching contract
    if (!this.isSystemFile) return;
    const expectedContractName = this.expectedContractName;

    // search the source file for a matching contract name
    let withMatchingContract = false;
    visit(node, {
      ContractDefinition(node: ContractDefinition) {
        const { name, kind } = node;

        if (kind === "contract" && name === expectedContractName) {
          withMatchingContract = true;
        }
      },
    });

    if (!withMatchingContract) {
      this.reporter.error(
        node,
        this.ruleId,
        `System file must contain a contract with a matching name "${expectedContractName}"`
      );
    }
  }
}
