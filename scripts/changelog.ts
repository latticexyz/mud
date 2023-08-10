/**
 * This is a workaround until changesets natively supports publishing a
 * central changelog (https://github.com/changesets/changesets/issues/1059).
 */

import { execa } from "execa";
import { readFileSync, writeFileSync } from "node:fs";
import path from "path";

//--------- CONSTANTS

const REPO_URL = process.env.REPO_URL ?? "https://github.com/latticexyz/mud";
const CHANGELOG_PATH = process.env.CHANGELOG_PATH ?? "CHANGELOG.md";
const VERSION_PATH = process.env.VERSION_PATH ?? path.join(process.cwd(), "packages/world/package.json");
const INCLUDE_CHANGESETS = (process.env.INCLUDE_CHANGESETS as "diff" | "all") ?? "diff"; // "diff" to only include new changesets, "all" to use all changesets in pre.json

enum ChangeType {
  PATCH,
  MINOR,
  MAJOR,
}

const changeTypes = {
  patch: ChangeType.PATCH,
  minor: ChangeType.MINOR,
  major: ChangeType.MAJOR,
} as const;

type ChangelogItem = {
  packages: {
    package: string;
    type: string;
  }[];
  type: ChangeType;
  description: string;
};

type GitMetadata = {
  commitHash: string;
  authorName: string;
  authorEmail: string;
  title: string;
};

await appendChangelog();

//----------- UTILS

async function appendChangelog() {
  // Reset current changelog to version on main
  await execa("git", ["checkout", "main", "--", CHANGELOG_PATH]);

  // Load the current changelog
  const currentChangelog = readFileSync(CHANGELOG_PATH).toString();

  // Append the new changelog at the up
  const newChangelog = await renderChangelog();
  writeFileSync(CHANGELOG_PATH, `${newChangelog}\n${currentChangelog}`);
}

async function renderChangelog() {
  const changes = await getChanges(INCLUDE_CHANGESETS);
  const version = await getVersion();

  return `# Version ${version}

${await renderChangelogItems("Major changes", changes.major)}
${await renderChangelogItems("Minor changes", changes.minor)}
${await renderChangelogItems("Patch changes", changes.patch)}
---

`;
}

async function renderChangelogItems(headline: string, changelogItems: (ChangelogItem & GitMetadata)[]) {
  if (changelogItems.length === 0) return "";

  let output = `## ${headline}\n`;

  for (const changelogItem of changelogItems) {
    output += `**[${changelogItem.title}](${REPO_URL}/commit/${changelogItem.commitHash})** (${changelogItem.packages
      .map((e) => e.package)
      .join(", ")})`;
    output += `\n\n${changelogItem.description}\n\n`;
  }

  return output;
}

async function getVersion() {
  return (await import(VERSION_PATH)).default.version;
}

async function getChanges(include: "diff" | "all") {
  const changesetsToInclude: string[] = [];

  if (include === "diff") {
    // Get the diff of the current branch to main
    const changesetDiff = (await execa("git", ["diff", "main", ".changeset/pre.json"])).stdout;

    // Get the list of changesets
    const addedLinesRegex = /\+\s+"([^"]+)"/g;
    changesetsToInclude.push(...[...changesetDiff.matchAll(addedLinesRegex)].map((match) => match[1]));
  } else if (include === "all") {
    // Load all current changesets from the .changeset/pre.json file
    changesetsToInclude.push(...(await import(path.join(process.cwd(), ".changeset/pre.json"))).default.changesets);
  }

  // Load the contents of each changeset and metadata from git
  const changesetContents = await Promise.all(
    changesetsToInclude.map(async (addedChangeset) => {
      const changesetPath = `.changeset/${addedChangeset}.md`;
      const changeset = readFileSync(changesetPath).toString();
      const gitLog = (await execa("git", ["log", changesetPath])).stdout;
      return { ...parseChangeset(changeset), ...parseGitLog(gitLog) };
    })
  );

  // Sort the changesets into patch, minor and major updates
  const patch = changesetContents.filter((change) => change.type === ChangeType.PATCH);
  const minor = changesetContents.filter((change) => change.type === ChangeType.MINOR);
  const major = changesetContents.filter((change) => change.type === ChangeType.MAJOR);

  return { patch, minor, major };
}

function notNull<T>(element: T | undefined | null | ""): element is T {
  return Boolean(element);
}

/**
 * Parse a changeset string into a more usable format (list of updated packages, change type, description)
 */
function parseChangeset(changeset: string): ChangelogItem {
  // Remove first separator
  const separatorString = "---\n";
  let separatorIndex = changeset.indexOf(separatorString);
  changeset = changeset.substring(separatorIndex + separatorString.length - 1);

  // Parse list of changed packages and description
  separatorIndex = changeset.indexOf(separatorString);
  const packages = changeset
    .substring(0, separatorIndex)
    .split("\n")
    .map((line) => {
      const match = line.match(/"([^"]+)":\s*(\w+)/);
      if (match) return { package: match[1], type: match[2] as "patch" | "minor" | "major" };
    })
    .filter(notNull);
  const description = changeset.substring(separatorIndex + separatorString.length);

  // Find the strongest update type
  const type = Math.max(...packages.map((change) => changeTypes[change.type]));

  return { packages, description, type };
}

function parseGitLog(log: string): GitMetadata {
  // Thanks ChatGPT
  const [, commitHash, authorName, authorEmail, title] =
    log.match(/commit (\w+)[\s\S]*?Author: ([^<]+) <([^>]+)>[\s\S]*?\n\n\s{4}([^\n]+)/) ?? [];

  return { commitHash, authorName, authorEmail, title };
}
