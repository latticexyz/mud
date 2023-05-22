import type { ContractDefinition, MemberAccess } from "@solidity-parser/parser/dist/src/ast-types";
import { SolhintRule } from "../solhintTypes";

export class NoMsgSender implements SolhintRule {
  ruleId = "no-msg-sender";
  reporter: any;
  config: any;

  isSystemOrLibrary = false;

  constructor(reporter: any, config: any, inputSrc: string, fileName: string) {
    this.reporter = reporter;
    this.config = config;
  }

  ContractDefinition(node: ContractDefinition) {
    const { name, kind } = node;

    this.isSystemOrLibrary = kind === "library" || (kind === "contract" && name.endsWith("System"));
  }

  "ContractDefinition:exit"() {
    this.isSystemOrLibrary = false;
  }

  MemberAccess(node: MemberAccess) {
    const { expression, memberName } = node;
    if (expression.type === "Identifier" && memberName === "sender") {
      this.reporter.error(
        node,
        this.ruleId,
        `Systems and their libraries should use "_msgSender()" or "_world()" instead of "msg.sender".`
      );
    }
  }
}
