/**
 * Parse raw `forge doc` output from contract packages, clean it up, and render as markdown in docs.
 */

import { execa } from "execa";
import prettier from "prettier";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "node:path/posix";
import prettierOptions from "../.prettierrc.cjs";

const DOCS_ROOT = "docs/pages";

// Config for API docs input/output and filter/processing
const PUBLIC_APIS: PublicApis = {
  "store/reference/store-core.mdx": {
    inputFiles: [
      { source: "store/src/StoreCore.sol" },
      { source: "store/src/StoreKernel.sol" },
      { source: "store/src/Store.sol" },
      { source: "store/src/StoreRead.sol" },
      { source: "store/src/StoreSwitch.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "registerTable", "/store/tables#manually-register-a-table");
      content = addSampleCodeFunction(content, "registerStoreHook", "/store/store-hooks");
      content = addSampleCodeFunction(content, "setStoreAddress", "/store/table-libraries#storeswitch");
      content = addSampleCodeContract(content, "StoreSwitch", "/store/table-libraries#storeswitch");

      return content.replaceAll("SET DATA\n", "").replaceAll("GET DATA\n", "").replaceAll("HELPER FUNCTIONS\n", "");
    },
  },
  "store/reference/store.mdx": {
    inputFiles: [
      { source: "store/src/IStore.sol" },
      { source: "store/src/IStoreEvents.sol" },
      { source: "store/src/IStoreErrors.sol" },
      { source: "store/src/IStoreRead.sol" },
      { source: "store/src/IStoreWrite.sol" },
      { source: "store/src/IStoreRegistration.sol" },
      { source: "store/src/IStoreKernel.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "registerTable", "/store/tables#manually-register-a-table");
      content = addSampleCodeFunction(content, "registerStoreHook", "/store/store-hooks");

      return content;
    },
  },
  "store/reference/store-hook.mdx": {
    inputFiles: [
      {
        source: "store/src/IStoreHook.sol",
      },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      content = fixInheritence(content);
      content = addSampleCodeContract(content, "IStoreHook", "/store/store-hooks#store-hook-contract");

      return content;
    },
  },
  "store/reference/misc.mdx": {
    inputFiles: [
      { source: "store/src/Bytes.sol" },
      { source: "store/src/FieldLayout.sol" },
      { source: "store/src/Hook.sol" },
      { source: "store/src/Memory.sol" },
      /*
      { source: "store/src/EncodedLengths.sol" },
      */
      { source: "store/src/ResourceId.sol" },
      { source: "store/src/Schema.sol" },
      { source: "store/src/Slice.sol" },
      { source: "store/src/Storage.sol" },
      { source: "store/src/constants.sol" },
      { source: "store/src/rightMask.sol" },
      { source: "store/src/storeHookTypes.sol" },
      { source: "store/src/storeResourceTypes.sol" },
      { source: "store/src/version.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "encode", "/world/namespaces-access-control#modifying-access-control");

      return content
        .replace("## Constants", "## ResourceId.sol constants")
        .replace("## Constants", "## constants.sol")
        .replace("## Constants", "## storeHookTypes.sol constants")
        .replace("## Constants", "## storeResourceTypes.sol constants")
        .replace("## Constants", "## version.sol constants");
    },
  },
  "world/reference/internal/access-control.mdx": {
    inputFiles: [
      {
        source: "world/src/AccessControl.sol",
      },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);

      return content;
    },
  },
  "world/reference/internal/create.mdx": {
    inputFiles: [{ source: "world/src/Create2.sol" }, { source: "world/src/Create2Factory.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content;
    },
  },
  "world/reference/internal/delegation.mdx": {
    inputFiles: [{ source: "world/src/Delegation.sol" }, { source: "world/src/DelegationControl.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content;
    },
  },
  "world/reference/delegation-external.mdx": {
    inputFiles: [{ source: "world/src/IDelegationControl.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      content = addSampleCodeContract(content, "IDelegationControl", "/world/account-delegation");

      return content;
    },
  },
  "world/reference/internal/erc165.mdx": {
    inputFiles: [{ source: "world/src/ERC165Checker.sol" }, { source: "world/src/requireInterface.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return (
        content
          // fix bad placeholder
          .replaceAll(/\[IERC165-supportsInterface\]\(.+?\)/g, "{IERC165-supportsInterface}")
          // replace placeholders
          .replaceAll("{IERC165}", "[IERC165](./erc165-external#ierc165)")
          .replaceAll("{IERC165-supportsInterface}", "[IERC165.supportsInterface](./erc165-external#supportsinterface)")
      );
    },
  },
  "world/reference/internal/erc165-external.mdx": {
    inputFiles: [{ source: "world/src/IERC165.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content;
    },
  },
  "world/reference/module.mdx": {
    inputFiles: [{ source: "world/src/Module.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);

      return content;
    },
  },
  "world/reference/module-external.mdx": {
    inputFiles: [{ source: "world/src/IModule.sol" }, { source: "world/src/IModuleErrors.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content;
    },
  },
  "world/reference/system.mdx": {
    inputFiles: [
      { source: "world/src/System.sol" },
      { source: "world/src/SystemHook.sol" },
      { source: "world/src/systemHookTypes.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content.replace("Constants", "systemHookTypes.sol constants");
    },
  },
  "world/reference/internal/systemcall.mdx": {
    inputFiles: [{ source: "world/src/SystemCall.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "call", "/world/systems#using-call");

      return content;
    },
  },
  "world/reference/system-external.mdx": {
    inputFiles: [{ source: "world/src/ISystemHook.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content;
    },
  },
  "world/reference/world.mdx": {
    inputFiles: [{ source: "world/src/World.sol" }, { source: "world/src/WorldFactory.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "call", "/world/systems#using-call");

      return content
        .replace("StoreData", "[StoreData](/store/reference/store-core#storedata)")
        .replace(/#### _installRootModule((.|\n)*?)#### setRecord/m, "#### setRecord");
    },
  },
  "world/reference/world-external.mdx": {
    inputFiles: [
      // After IBaseWorld we have all the things it inherits from.
      // We delete their headings, and leave the functions, errors, etc.
      { source: "world/src/codegen/interfaces/IBaseWorld.sol" },
      { source: "store/src/Store.sol" },
      { source: "store/src/IStoreRegistration.sol" },
      { source: "world/src/modules/init/implementations/AccessManagementSystem.sol" },
      { source: "world/src/modules/init/implementations/BalanceTransferSystem.sol" },
      { source: "world/src/modules/init/implementations/BatchCallSystem.sol" },
      { source: "world/src/modules/init/implementations/ModuleInstallationSystem.sol" },
      { source: "world/src/modules/init/RegistrationSystem.sol" },
      { source: "world/src/modules/init/implementations/WorldRegistrationSystem.sol" },
      { source: "store/src/IStoreErrors.sol" },

      // Back to adding contracts and interfaces to the docs.
      { source: "world/src/IWorldKernel.sol" },
      { source: "world/src/IWorldErrors.sol" },
      { source: "world/src/IWorldEvents.sol" },
      { source: "world/src/IWorldFactory.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      content = addSampleCodeFunction(
        content,
        "grantAccess",
        "/world/namespaces-access-control#modifying-access-control",
      );
      content = addSampleCodeFunction(
        content,
        "revokeAccess",
        "/world/namespaces-access-control#modifying-access-control",
      );
      content = addSampleCodeFunction(content, "registerTable", "/store/tables#manually-register-a-table");
      content = addSampleCodeFunction(content, "call", "/world/systems#using-call");
      content = addSampleCodeFunction(content, "registerNamespace", "/world/systems#registering-systems");
      content = addSampleCodeFunction(content, "registerSystem", "/world/systems#registering-systems");
      content = addSampleCodeFunction(
        content,
        "registerRootFunctionSelector",
        "/world/function-selectors#root-function-selectors",
      );
      content = addSampleCodeFunction(content, "transferBalanceToAddress", "/world/balance");

      return content
        .replace("IStore", "[IStore](/store/reference/store#istore)")
        .replaceAll("This is an autogenerated file; do not edit manually", "")
        .replaceAll(
          "*This interface is automatically generated from the corresponding system contract. Do not edit manually.*",
          "",
        )
        .replace(/## StoreData((.|\n)*?)### Functions/m, "### Functions")
        .replace(/#### constructor((.|\n)*?)#### storeVersion/m, "#### storeVersion")
        .replace(/## IStoreRegistration((.|\n)*?)#### registerTable/m, "#### registerTable")
        .replace(/## AccessManagementSystem((.|\n)*?)### Functions/m, "")
        .replace(/## BalanceTransferSystem((.|\n)*?)### Functions/m, "")
        .replace(/## BatchCallSystem((.|\n)*?)### Functions/m, "")
        .replace(/## ModuleInstallationSystem((.|\n)*?)### Functions/m, "")
        .replace(/## RegistrationSystem((.|\n)*?)### Functions/m, "")
        .replace(/## WorldRegistrationSystem((.|\n)*?)### Functions/m, "")
        .replace(/## IStoreErrors((.|\n)*?)### Errors/m, "### Errors");
    },
  },
  "world/reference/world-context.mdx": {
    inputFiles: [{ source: "world/src/WorldContext.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content.replace("Constants", "WorldContext.sol constants");
    },
  },
  "world/reference/world-context-external.mdx": {
    inputFiles: [{ source: "world/src/IWorldContextConsumer.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content;
    },
  },
  "world/reference/resource-ids.mdx": {
    inputFiles: [{ source: "world/src/WorldResourceId.sol" }, { source: "world/src/worldResourceTypes.sol" }],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "encodeNamespace", "/world/systems#registering-systems");

      return content
        .replace("Constants", "WorldResourceId.sol constants")
        .replace("Constants", "worldResourceTypes.sol constants");
    },
  },
  "world/reference/misc.mdx": {
    inputFiles: [
      { source: "world/src/Utils.sol" },
      { source: "world/src/constants.sol" },
      { source: "world/src/revertWithBytes.sol" },
      { source: "world/src/version.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content.replace("Constants", "constants.sol").replace("Constants", "version.sol constants");
    },
  },
  "world/reference/internal/init-module.mdx": {
    inputFiles: [
      { source: "world/src/modules/init/InitModule.sol" },
      { source: "world/src/modules/init/constants.sol" },
      { source: "world/src/modules/init/RegistrationSystem.sol" },
      { source: "world/src/modules/init/LimitedCallContext.sol" },
      { source: "world/src/modules/init/types.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      return content.replace("Constants", "constants.sol");
    },
  },
  "world/reference/internal/init-module-implementation.mdx": {
    inputFiles: [
      { source: "world/src/modules/init/implementations/AccessManagementSystem.sol" },
      { source: "world/src/modules/init/implementations/ModuleInstallationSystem.sol" },
      { source: "world/src/modules/init/implementations/BalanceTransferSystem.sol" },
      { source: "world/src/modules/init/implementations/StoreRegistrationSystem.sol" },
      { source: "world/src/modules/init/implementations/BatchCallSystem.sol" },
      { source: "world/src/modules/init/implementations/WorldRegistrationSystem.sol" },
    ],
    processContent: (content) => {
      content = removeAuthor(content);
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixInheritence(content);
      content = addSampleCodeFunction(content, "registerNamespace", "/world/systems#registering-systems");
      content = addSampleCodeFunction(content, "registerSystem", "/world/systems#registering-systems");
      content = addSampleCodeFunction(content, "registerFunctionSelector", "/world/function-selectors");
      content = addSampleCodeFunction(
        content,
        "registerRootFunctionSelector",
        "/world/function-selectors#root-function-selectors",
      );
      content = addSampleCodeFunction(content, "transferBalanceToAddress", "/world/balance");

      return content.replace("Constants", "constants.sol");
    },
  },
};

// Go one heading level down
function formatHeadings(content: string) {
  return content.replace(/# (?=.+)/gm, "## ");
}

function fixGithubLinks(content: string, packageName: string) {
  const pattern = /https:\/\/github.com\/latticexyz\/mud\/blob\/[^/]+\/(.*)/g;
  const replacement = `https://github.com/latticexyz/mud/blob/main/packages/${packageName}/$1`;
  return content.replace(pattern, replacement);
}

/* Fix inheritence links.
 * Creating the pattern a new for every call is inefficient, but I'm optimizing for programmer time
 */
function fixInheritence(content: string) {
  let newContent = content;
  for (let i = 0; i < inheritence.length; i++) {
    const item = inheritence[i];
    const pattern = `\\[${item.contract}\\]\\([/a-zA-Z0-9.#]+\\)`;
    newContent = newContent.replaceAll(new RegExp(pattern, "g"), `[${item.contract}](${item.link})`);
  }

  return newContent;
}

function removeAuthor(content: string) {
  return content.replace(/\*\*Author:\*\*\n[^\n]+\n/g, "");
}

// The inheritence links that need to be fixed
const inheritence = [
  { contract: "StoreRead", link: "/store/reference/store-core#storeread" },
  { contract: "StoreData", link: "/store/reference/store-core#storedata" },
  { contract: "StoreKernel", link: "/store/reference/store-core#storekernel" },
  { contract: "IStore", link: "/store/reference/store#istore" },
  { contract: "IStoreKernel", link: "/store/reference/store#istorekernel" },
  { contract: "IStoreData", link: "/store/reference/store#istoredata" },
  { contract: "IStoreRead", link: "/store/reference/store#istoreread" },
  { contract: "IStoreWrite", link: "/store/reference/store#istorewrite" },
  { contract: "IStoreErrors", link: "/store/reference/store#istoreerrors" },
  { contract: "IStoreEvents", link: "/store/reference/store#istoreevents" },
  { contract: "IStoreRegistration", link: "/store/reference/store#istoreregistration" },
  { contract: "Module", link: "/world/reference/module#module" },
  { contract: "System", link: "/world/reference/system#system" },
  { contract: "IDelegationControl", link: "/world/reference/delegation-external#idelegationcontrol" },
  { contract: "IWorldContextConsumer", link: "/world/reference/world-context-external#iworldcontextconsumer" },
  { contract: "IModule", link: "/world/reference/module-external#imodule" },
  { contract: "IModuleErrors", link: "/world/reference/module-external#imoduleerrors" },
  { contract: "WorldContextConsumer", link: "/world/reference/world-context#worldcontextconsumer" },
  { contract: "IERC165", link: "/world/reference/internal/erc165-external#ierc165" },
  { contract: "supportsERC165", link: "/world/reference/internal/erc165#supportserc165" },
  { contract: "ISystemHook", link: "/world/reference/system-external#isystemhook" },
  { contract: "IWorldKernel", link: "/world/reference/world-external#iworldkernel" },
  { contract: "IWorldFactory", link: "/world/reference/world-external#iworldfactory" },
  { contract: "IWorldCall", link: "/world/reference/world-external#iworldcall" },
  { contract: "IWorldErrors", link: "/world/reference/world-external#iworlderrors" },
  { contract: "IWorldEvents", link: "/world/reference/world-external#iworldevents" },
  { contract: "IWorldModuleInstallation", link: "/world/reference/world-external#iworldmoduleinstallation" },
  { contract: "IWorldContextConsumer", link: "/world/reference/world-context-external#iworldcontextconsumer" },
  { contract: "IAccessManagementSystem", link: "/world/reference/world-external#iaccessmanagementsystem" },
  { contract: "IBalanceTransferSystem", link: "/world/reference/world-external#ibalancetransfersystem" },
  { contract: "IBatchCallSystem", link: "/world/reference/world-external#ibatchcallsystem" },
  { contract: "IModuleInstallationSystem", link: "/world/reference/world-external#imoduleinstallationsystem" },
  { contract: "IWorldRegistrationSystem", link: "/world/reference/world-external#iworldregistrationsystem" },
  { contract: "IRegistrationSystem", link: "/world/reference/world-external#iregistrationsystem" },
  {
    contract: "ModuleInstallationSystem",
    link: "/world/reference/internal/init-module-implementation#moduleinstallationsystem",
  },
  {
    contract: "StoreRegistrationSystem",
    link: "/world/reference/internal/init-module-implementation#storeregistrationsystem",
  },
  {
    contract: "WorldRegistrationSystem",
    link: "/world/reference/internal/init-module-implementation#worldregistrationsystem",
  },
  { contract: "LimitedCallContext", link: "/world/reference/internal/init-module#limitedcallcontext" },
  { contract: "IERC165-supportsInterface", link: "/world/reference/internal/erc165-external#supportsinterface" },
];

function addSampleCodeContract(content: string, contract: string, url: string): string {
  const regexp = RegExp(`#+ ${contract}[\n ]+\\[Git Source\\]\\(.*\\)`);
  return content.replace(regexp, (str) =>
    str
      .replace(
        ")",
        `) |
                     | - | - |`,
      )
      .replace("[Git Source](", `| [Usage Sample](${url}) | [Git Source](`),
  );
}

function addSampleCodeFunction(content: string, heading: string, url: string): string {
  const regexp = RegExp(`#+ ${heading}\n`);
  return content.replace(regexp, (str) =>
    str.replace(
      "\n",
      `
   [Usage Sample](${url})
   `,
    ),
  );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// SHOULDN'T HAVE TO TOUCH CODE BELOW THIS
///////////////////////////////////////////////////////////////////////////////////////////////////////

type Input = {
  source: string;
  filterFiles?: (fileName: string) => boolean;
};

type PublicApis = {
  [outputFile: string]: { inputFiles: Input[]; processContent?: (content: string) => string };
};

function identity<T>(input: T): T {
  return input;
}

function getPackages() {
  return [
    ...new Set(
      Object.values(PUBLIC_APIS)
        .map(({ inputFiles }) => inputFiles)
        .flat()
        .map((input) => input.source.split("/")[0]),
    ),
  ];
}

/**
 * Generate raw docs using `forge doc` in all relevant contract packages
 */
async function generateDocs() {
  const packages = getPackages();
  for (const pkg of packages) {
    const { stdout, stderr } = await execa("forge", ["doc", "--build"], {
      stdio: "pipe",
      cwd: path.join(process.cwd(), "packages", pkg),
    });
    if (stderr || stdout) {
      console.log(stderr || stdout);
    }
  }
}

function getDocsPath(sourceFilePath: string) {
  const pkg = sourceFilePath.split("/")[0];
  const relativeFilePath = sourceFilePath.replace(pkg, "");
  return path.join("packages", pkg, "docs", "src", relativeFilePath);
}

function formatMarkdown(content: string) {
  return prettier.format(content, { parser: "markdown", ...prettierOptions });
}

/**
 * Write output files from array of input files
 */
async function renderDocs() {
  for (const [outputFile, { inputFiles, processContent = identity }] of Object.entries(PUBLIC_APIS)) {
    // Concat all input files for this output file
    const content =
      `[//]: # (This file is autogenerated, do not change manually)\n\n` +
      processContent(
        inputFiles
          .map((input) => {
            const docsPath = getDocsPath(input.source);
            const docsFiles = readdirSync(docsPath);
            docsFiles.sort();
            return docsFiles
              .filter(input.filterFiles ?? identity)
              .map((fileName) => readFileSync(path.join(docsPath, fileName), { encoding: "utf8" }));
          })
          .flat()
          .join("\n"),
      );

    // Write the output file
    writeFileSync(path.join(DOCS_ROOT, outputFile), await formatMarkdown(content));
  }
}

async function run() {
  await generateDocs();
  await renderDocs();
}

await run();
