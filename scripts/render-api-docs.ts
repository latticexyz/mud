/**
 * Parse raw `forge doc` output from contract packages, clean it up, and render as markdown in docs.
 */

import { execa } from "execa";
import prettier from "prettier";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import prettierOptions from "../.prettierrc.js";

const DOCS_ROOT = "docs/pages";

// Config for API docs input/output and filter/processing
const PUBLIC_APIS: PublicApis = {
  "store/reference/store-core.mdx": {
    inputFiles: [
      {
        source: "store/src/StoreCore.sol",
        filterFiles: (fileName) => !fileName.includes("StoreCoreInternal"),
      },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      return content;
    },
  },
  "store/reference/store.mdx": {
    inputFiles: [
      { source: "store/src/IStore.sol" },
      { source: "store/src/IStoreEvents.sol" },
      { source: "store/src/IStoreErrors.sol" },
      { source: "store/src/IStoreData.sol" },
      { source: "store/src/IStoreRead.sol" },
      { source: "store/src/IStoreWrite.sol" },
      { source: "store/src/IStoreRegistration.sol" },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      return content
        .replace("/src/IStoreData.sol/interface.IStoreData.md", "#istoredata")
        .replace("/src/IStoreRegistration.sol/interface.IStoreRegistration.md", "#istoreregistration")
        .replace("/src/IStoreRead.sol/interface.IStoreRead.md", "#istoreread")
        .replace("/src/IStoreWrite.sol/interface.IStoreWrite.md", "#istorewrite")
        .replace("/src/IStoreEvents.sol/interface.IStoreEvents.md", "#istoreevents")
        .replace("/src/IStoreErrors.sol/interface.IStoreErrors.md", "#istoreerrors");
    },
  },
  "store/reference/store-hook.mdx": {
    inputFiles: [
      {
        source: "store/src/IStoreHook.sol",
      },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "store");
      return content.replace(`**Inherits:**\n[IERC165](/src/IERC165.sol/interface.IERC165.md)`, "");
    },
  },
  "world/reference/access-control.mdx": {
    inputFiles: [
      {
        source: "world/src/AccessControl.sol",
      },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/create.mdx": {
    inputFiles: [{ source: "world/src/Create2.sol" }, { source: "world/src/Create2Factory.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/delegation.mdx": {
    inputFiles: [{ source: "world/src/Delegation.sol" }, { source: "world/src/DelegationControl.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/delegation-external.mdx": {
    inputFiles: [{ source: "world/src/IDelegationControl.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/erc165.mdx": {
    inputFiles: [{ source: "world/src/ERC165Checker.sol" }, { source: "world/src/requireInterface.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content
        .replaceAll("{IERC165}", "[IERC165](./erc165-external#ierc165)")
        .replaceAll("{IERC165-supportsInterface}", "[IERC165.supportsInterface](./erc165-external#supportsinterface)");
    },
  },
  "world/reference/erc165-external.mdx": {
    inputFiles: [{ source: "world/src/IERC165.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/module.mdx": {
    inputFiles: [{ source: "world/src/Module.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/module-external.mdx": {
    inputFiles: [{ source: "world/src/IModule.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/system.mdx": {
    inputFiles: [
      { source: "world/src/System.sol" },
      { source: "world/src/SystemCall.sol" },
      { source: "world/src/SystemHook.sol" },
      { source: "world/src/systemHookTypes.sol" },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content.replace("Constants", "systemHookTypes.sol constants");
    },
  },
  "world/reference/system-external.mdx": {
    inputFiles: [{ source: "world/src/ISystemHook.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/world.mdx": {
    inputFiles: [{ source: "world/src/World.sol" }, { source: "world/src/WorldFactory.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content; // .replace("StoreData", "[StoreData]()")
      // Should be added once we have StoreData in Store > Reference
    },
  },
  "world/reference/world-external.mdx": {
    inputFiles: [
      { source: "world/src/IWorldErrors.sol" },
      { source: "world/src/IWorldFactory.sol" },
      { source: "world/src/IWorldKernel.sol" },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/world-context.mdx": {
    inputFiles: [{ source: "world/src/WorldContext.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content.replace("Constants", "WorldContext.sol constants");
    },
  },
  "world/reference/world-context-external.mdx": {
    inputFiles: [{ source: "world/src/IWorldContextConsumer.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content;
    },
  },
  "world/reference/resource-ids.mdx": {
    inputFiles: [{ source: "world/src/WorldResourceId.sol" }, { source: "world/src/worldResourceTypes.sol" }],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
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
      { source: "world/src/validateNamespace.sol" },
      { source: "world/src/version.sol" },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content.replace("Constants", "constants.sol").replace("Constants", "version.sol constants");
    },
  },
  "world/reference/core-module.mdx": {
    inputFiles: [
      { source: "world/src/modules/core/CoreModule.sol" },
      { source: "world/src/modules/core/constants.sol" },
      { source: "world/src/modules/core/CoreRegistrationSystem.sol" },
      { source: "world/src/modules/core/LimitedCallContext.sol" },
      { source: "world/src/modules/core/types.sol" },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
      return content.replace("Constants", "constants.sol");
    },
  },
  "world/reference/core-module-implementation.mdx": {
    inputFiles: [
      { source: "world/src/modules/core/implementations/AccessManagementSystem.sol" },
      { source: "world/src/modules/core/implementations/ModuleInstallationSystem.sol" },
      { source: "world/src/modules/core/implementations/BalanceTransferSystem.sol" },
      { source: "world/src/modules/core/implementations/StoreRegistrationSystem.sol" },
      { source: "world/src/modules/core/implementations/BatchCallSystem.sol" },
      { source: "world/src/modules/core/implementations/WorldRegistrationSystem.sol" },
    ],
    processContent: (content) => {
      content = formatHeadings(content);
      content = fixGithubLinks(content, "world");
      content = fixWorldInheritence(content);
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

/* Fix inheritence links in the `World` reference.
 * Creating the pattern a new for every call is inefficient, but I'm optimizing for programmer time
 */
function fixWorldInheritence(content: string) {
  let newContent = content;
  for (let i = 0; i < worldInheritence.length; i++) {
    const item = worldInheritence[i];
    const pattern = `\\[${item.contract}\\]\\([/a-zA-Z0-9.]+\\)`;
    newContent = newContent.replaceAll(new RegExp(pattern, "g"), `[${item.contract}](${item.link})`);
  }

  return newContent;
}

// The inheritence links that need to be fixed
const worldInheritence = [
  { contract: "Module", link: "./module#module" },
  { contract: "System", link: "./system#system" },
  { contract: "IDelegationControl", link: "./delegation-external#idelegationcontrol" },
  { contract: "IWorldContextConsumer", link: "./world-context-external#iworldcontextconsumer" },
  { contract: "IModule", link: "./module-external#imodule" },
  { contract: "WorldContextConsumer", link: "./world-context#worldcontextconsumer" },
  { contract: "IERC165", link: "./erc165-external#ierc165" },
  { contract: "ISystemHook", link: "./system-external#isystemhook" },
  { contract: "IWorldKernel", link: "./world-external#iworldkernel" },
  { contract: "IWorldFactory", link: "./world-external#iworldfactory" },
  { contract: "IWorldCall", link: "./world-external#iworldcall" },
  { contract: "IWorldErrors", link: "./world-external#iworlderrors" },
  { contract: "IWorldModuleInstallation", link: "./world-external#iworldmoduleinstallation" },
  { contract: "IWorldContextConsumer", link: "./world-context-external#iworldcontextconsumer" },
  { contract: "ModuleInstallationSystem", link: "./core-module-implementation#moduleinstallationsystem" },
  { contract: "StoreRegistrationSystem", link: "./core-module-implementation#storeregistrationsystem" },
  { contract: "WorldRegistrationSystem", link: "./core-module-implementation#worldregistrationsystem" },
  { contract: "LimitedCallContext", link: "./core-module#limitedcallcontext" },
];

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
        .map((input) => input.source.split("/")[0])
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
          .join("\n")
      );

    // Write the output file
    writeFileSync(path.join(DOCS_ROOT, outputFile), formatMarkdown(content));
  }
}

async function run() {
  await generateDocs();
  await renderDocs();
}

await run();
