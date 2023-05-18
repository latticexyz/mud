import { visit } from "@solidity-parser/parser";
import type { ContractDefinition, MemberAccess } from "@solidity-parser/parser/dist/src/ast-types";
import { SolhintRule } from "../solhintTypes";

export class NoMsgSender implements SolhintRule {
  ruleId = "no-msg-sender";
  reporter: any;
  config: any;

  constructor(reporter: any, config: any, inputSrc: string, fileName: string) {
    this.reporter = reporter;
    this.config = config;
  }

  ContractDefinition(node: ContractDefinition) {
    const { name, kind } = node;
    const reporter = this.reporter;
    const ruleId = this.ruleId;

    if (kind === "library" || (kind === "contract" && name.endsWith("System"))) {
      visit(node, {
        MemberAccess(node: MemberAccess) {
          const { expression, memberName } = node;
          if (expression.type === "Identifier" && memberName === "sender") {
            reporter.error(
              node,
              ruleId,
              `Systems and their libraries should use "_msgSender()" or "_world()" instead of "msg.sender".`
            );
          }
        },
      });
    }
  }
}
