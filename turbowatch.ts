import path from "path";
import { ChangeEvent, Expression, watch } from "turbowatch";
import { getPackageInfos, createPackageGraph, getWorkspaceRoot, PackageGraph } from "workspace-tools";

const cwd = process.cwd();

console.log(cwd);
const workspaceRoot = getWorkspaceRoot(cwd);
console.log(workspaceRoot);
const packageInfos = getPackageInfos(workspaceRoot!);
// const targetWorkspace = process.argv[2];
const targetWorkspace = "@latticexyz/cli";

if (!targetWorkspace || !(targetWorkspace in packageInfos)) {
  throw new Error(
    `${targetWorkspace}" is not a valid workspace. Must pass a valid workspace name as it appears in package.json.`
  );
}

/** Gets all direct and transitive dependencies for a workspace */
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

let previousPackage = "";
const previousTime = new Date();

const start = Date.now();
watch({
  project: workspaceRoot!,
  triggers: [
    {
      expression: [
        "allof",
        [
          "not",
          [
            "anyof",
            ["dirname", "node_modules"],
            ["dirname", ".turbo"],
            ["dirname", "dist"],
            ["dirname", "out"],
            ["dirname", "abi"],
            ["dirname", "types"],
            ["dirname", "build"],
            ["dirname", "bin"],
            ["dirname", "protoc"],
            ["dirname", "protobuf"],
            ["dirname", "src/mud-definitions"],
            ["dirname", ".parcel-cache"],
          ],
        ],
        // ["anyof", ...depPaths.map((dir) => ["dirname", dir] satisfies Expression)],
        // ["anyof", ["dirname", "packages/store"]],
        ["anyof", ["match", "*.sol", "basename"]],
      ],
      name: `${targetWorkspace}_deps`,
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

        const endTime = new Date();
        console.log(changedWorkspace);

        // build all of the dependencies, relying on turbo's cache to do the minimum necessary
        let timeDiff = endTime - previousTime; //in ms
        timeDiff /= 1000;

        const seconds = Math.round(timeDiff);

        if (previousPackage != changedWorkspace || seconds > 5) {
          await spawn`turbo build --filter=${changedWorkspace}^...`;
          previousPackage = changedWorkspace;
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
