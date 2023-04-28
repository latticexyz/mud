import path from "path";
import { ChangeEvent, Expression, watch } from "turbowatch";
import { ChokidarWatcher } from "./chokidarWatcher";
import { getPackageInfos, createPackageGraph, getWorkspaceRoot, PackageGraph } from "workspace-tools";

const cwd = process.cwd();
// console.log(cwd);

const workspaceRoot = getWorkspaceRoot(cwd);

/*
const packageInfos = getPackageInfos(workspaceRoot!);
// const targetWorkspace = process.argv[2];
const targetWorkspace = "@latticexyz/cli";

if (!targetWorkspace || !(targetWorkspace in packageInfos)) {
  throw new Error(
    `${targetWorkspace}" is not a valid workspace. Must pass a valid workspace name as it appears in package.json.`
  );
}

// Gets all direct and transitive dependencies for a workspace
const getAllDependencies = (target: string, graph: PackageGraph) => {
  return Array.from(
    graph.dependencies.reduce((acc, dep) => {
      if (dep.name === target) {
        acc.add(dep.dependency);
        getAllDependencies(dep.dependency, graph).forEach((val) => acc.add(val));
      }
      return acc;
    }, new Set<string>())
  );
};

const graph = createPackageGraph(packageInfos);
console.log(graph);

const dependencies = getAllDependencies("@latticexyz/cli", graph);
console.log(dependencies);

// path names will be in the format "packages/foo", "apps/bar" - for use in turbowatch expressions
const depPaths = dependencies.map((dep) => {
  const pkgInfo = packageInfos[dep];
  return path.dirname(pkgInfo.packageJsonPath).replace(`${workspaceRoot}/`, "");
});

console.log(depPaths);
*/

let previousPackage = "";
const start = Date.now();
const previousTimeMap = new Map<string, number>();
previousTimeMap.set("world", start);
previousTimeMap.set("common", start);
previousTimeMap.set("config", start);
previousTimeMap.set("schema-type", start);
previousTimeMap.set("store", start);
previousTimeMap.set("cli", start);
previousTimeMap.set("std-client", start);
previousTimeMap.set("network", start);
previousTimeMap.set("recs", start);
previousTimeMap.set("solecs", start);
previousTimeMap.set("utils", start);
previousTimeMap.set("ecs-browser", start);
previousTimeMap.set("phaserx", start);
previousTimeMap.set("react", start);
previousTimeMap.set("services", start);
previousTimeMap.set("std-contracts", start);
previousTimeMap.set("noise", start);
previousTimeMap.set("create-mud", start);

const WATCH_DELAY_SECONDS = 10;

watch({
  project: workspaceRoot!,
  Watcher: ChokidarWatcher,
  triggers: [
    {
      expression: [
        "allof",
        [
          "allof",
          ["not", ["dirname", "node_modules"]],
          ["not", ["dirname", ".turbo"]],
          ["not", ["dirname", "dist"]],
          ["not", ["dirname", "out"]],
          ["not", ["dirname", "abi"]],
          ["not", ["dirname", "types"]],
          ["not", ["dirname", "build"]],
          ["not", ["dirname", "bin"]],
          ["not", ["dirname", "protoc"]],
          ["not", ["dirname", "protobuf"]],
          ["not", ["dirname", "src/mud-definitions"]],
          ["not", ["dirname", ".parcel-cache"]],
        ],
        // ["anyof", ...depPaths.map((dir) => ["dirname", dir] satisfies Expression)],
        // ["anyof", ["dirname", "packages/store"]],
        ["anyof", ["match", "*.sol", "basename"]],
      ],
      name: `turbowatch_sol`,
      interruptible: true,
      initialRun: true,
      persistent: true,
      onChange: async ({ spawn, files, first, abortSignal }: ChangeEvent) => {
        if (first) {
          console.log("Turbowatch started in", Date.now() - start, "ms");
        } else {
          console.log("File change detected", files);
        }
        console.log("Building workspace dependencies");

        const filenameTokens = files[0].name.split("/");
        const index = filenameTokens.lastIndexOf("packages");
        const changedWorkspace = filenameTokens[index + 1];

        const onChangeTime = new Date();
        const timeDiff = (onChangeTime - previousTimeMap.get(changedWorkspace)) / 1000; //in ms
        const seconds = Math.round(timeDiff);

        // console.log(previousPackage, changedWorkspace, seconds);
        if (previousPackage != changedWorkspace || seconds > WATCH_DELAY_SECONDS) {
          previousTimeMap.set(changedWorkspace, Date.now());
          previousPackage = changedWorkspace;

          // await spawn`turbo build --filter=${changedWorkspace}^...`;
          await spawn`turbo build --filter=${changedWorkspace}`;
        }

        // await spawn`turbo build --filter=store`;
        if (abortSignal?.aborted) return;

        // start the workspace watch script
        // console.log("Starting watch task");
        // await spawn`turbo run dev --only --filter ${targetWorkspace}`;
      },
    },
  ],
});
