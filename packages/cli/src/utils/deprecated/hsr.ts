import chokidar from "chokidar";
import { readFileSync } from "fs";

const ImportsRegex = new RegExp(/(?<=import ").*(?=";)|(?<=from ").*(?=";)/g);

/**
 * Extract file imports from a given file
 * @param path File to extracts imports from
 * @returns Array of imported filenames
 */
function extractImports(path: string): string[] {
  const content = readFileSync(path).toString();
  const regexResult = [...content.matchAll(ImportsRegex)]
    .map((match) => match[0])
    .map((path) => path.split("/").at(-1)!);
  return regexResult;
}

function findDependencies(
  file: string,
  dependencyGraph: { [file: string]: string[] },
  visited: string[] = []
): string[] {
  const dependencies = dependencyGraph[file] ?? [];
  const subDependencies = dependencies.flatMap((d) => {
    if (visited.includes(d)) {
      console.warn("Circular dependency detected: ", d, dependencyGraph[d]);
      return [];
    }
    return findDependencies(d, dependencyGraph, [...visited, d]);
  });
  return [...new Set([...dependencies, ...subDependencies])];
}

// Hot System Replacement
export function hsr(root: string, replaceSystems: (systems: string[]) => Promise<unknown>) {
  const dependencyGraph: { [file: string]: string[] } = {};
  const systems = new Set<string>();

  console.log("Watching system file changes...");

  chokidar.watch(root).on("all", async (event, path) => {
    console.log(`[${event}]: ${path}`);

    // Find changed file
    const changedFile = path.split("/").at(-1)!;

    if (["add", "change"].includes(event)) {
      // Construct dependency graph based in file imports
      const imports = extractImports(path);
      for (const importedFile of imports) {
        dependencyGraph[importedFile] ??= [];
        dependencyGraph[importedFile].push(changedFile);
      }

      // Track system files
      if (path.includes("systems") && path.includes(".sol")) systems.add(changedFile);
    }

    if (event === "change") {
      // Find all files depending on the changed file
      const dependencies = findDependencies(changedFile, dependencyGraph);
      const changedSystems = [
        ...new Set([changedFile, ...dependencies].filter((f) => systems.has(f)).map((f) => f.replace(".sol", ""))),
      ];
      console.log("Systems to replace", changedSystems);
      if (changedSystems.length > 0) await replaceSystems(changedSystems);
      console.log("Watching system file changes...");
    }
  });
}
