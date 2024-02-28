import { getSrcDirectory } from "@latticexyz/common/foundry";
import { contractToInterface, formatAndWriteSolidity, renderedSolidityHeader } from "@latticexyz/common/codegen";
import path from "path";
import { readFileSync } from "fs";

const srcDir = await getSrcDirectory();
const outputBaseDirectory = path.join(srcDir, "/modules/init");
const fullOutputPath = path.join(outputBaseDirectory, "functionSignatures.sol");

const contracts: { path: string; basename: string }[] = [
  {
    path: path.join(outputBaseDirectory, "implementations/AccessManagementSystem.sol"),
    basename: "AccessManagementSystem",
  },
  {
    path: path.join(outputBaseDirectory, "implementations/BalanceTransferSystem.sol"),
    basename: "BalanceTransferSystem",
  },
  {
    path: path.join(outputBaseDirectory, "implementations/BatchCallSystem.sol"),
    basename: "BatchCallSystem",
  },
  // TODO: Registration implements other contracts
  {
    path: path.join(outputBaseDirectory, "RegistrationSystem.sol"),
    basename: "RegistrationSystem",
  },
];

const output = `
${renderedSolidityHeader}

${contracts
  .map((contract) => {
    const data = readFileSync(contract.path, "utf8");
    const { functions } = contractToInterface(data, contract.basename);

    console.log(contract.path, contract.basename, functions);

    return `
  /**
   * @dev Function signatures for ${contract.basename}
   */
  function getFunctionSignatures${contract.basename}() pure returns (string[${functions.length}] memory) {
    return [
      ${functions.map((f) => `"${f.name}(${f.parameters})"`)}
    ];
  }`;
  })
  .join("")}
`;

await formatAndWriteSolidity(output, fullOutputPath, "Generated function signatures file");
