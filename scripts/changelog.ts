/**
 * This is a workaround until changesets natively supports publishing a
 * central changelog (https://github.com/changesets/changesets/issues/1059).
 */

import { execa } from "execa";
import { readFileSync, writeFileSync } from "node:fs";
import path from "path";
import { globSync } from "glob";

//--------- CONSTANTS

const REPO_URL = process.env.REPO_URL ?? "https://github.com/latticexyz/mud";
const CHANGELOG_PATH = process.env.CHANGELOG_PATH ?? "CHANGELOG.md";
const CHANGELOG_DOCS_PATH = process.env.CHANGELOG_DOCS_PATH ?? "docs/pages/changelog.mdx";
const CHANGELOG_JSON_PATH = process.env.CHANGELOG_JSON_PATH ?? "docs/data/changelog.json";
const VERSION_PATH = process.env.VERSION_PATH ?? path.join(process.cwd(), "packages/world/package.json");
const INCLUDE_CHANGESETS = (process.env.INCLUDE_CHANGESETS as "diff" | "all") ?? "diff"; // "diff" to only include new changesets, "all" to use all changesets

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

type ChangelogEntry = {
  version: string;
  date: Date;
  changes: {
    patch: (ChangelogItem & GitMetadata)[];
    minor: (ChangelogItem & GitMetadata)[];
    major: (ChangelogItem & GitMetadata)[];
  };
};

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

await execa("git", ["checkout", "main", "--", CHANGELOG_PATH]);
const changes = await getChanges(INCLUDE_CHANGESETS);
const version = await getVersion();
const date = new Date();

await appendChangelog();
await appendChangelogJSON();

//----------- UTILS

async function appendChangelog() {
  // Load the current changelog
  const currentChangelog = readFileSync(CHANGELOG_PATH).toString();

  // Append the new changelog at the up
  const newChangelog = `## Version ${version}
Release date: ${date.toDateString()}
${await renderChangelogItems("Major changes", changes.major)}
${await renderChangelogItems("Minor changes", changes.minor)}
${await renderChangelogItems("Patch changes", changes.patch)}
---

`;

  writeFileSync(CHANGELOG_PATH, `${newChangelog}\n${currentChangelog}`);
  writeFileSync(CHANGELOG_DOCS_PATH, `${newChangelog}\n${currentChangelog}`);
}

async function appendChangelogJSON() {
  // Read existing JSON file if it exists
  let existingData: ChangelogEntry[] = [];
  try {
    existingData = JSON.parse(readFileSync(CHANGELOG_JSON_PATH, "utf8"));
  } catch (error) {
    existingData = [];
  }

  const existingIndex = existingData.findIndex((entry) => entry.version === version);
  if (existingIndex !== -1) {
    existingData[existingIndex] = { version, date, changes };
  } else {
    existingData.unshift({ version, date, changes });
  }

  writeFileSync(CHANGELOG_JSON_PATH, JSON.stringify(existingData, null, 2));
}

async function renderChangelogItems(headline: string, changelogItems: (ChangelogItem & GitMetadata)[]) {
  if (changelogItems.length === 0) return "";

  let output = `### ${headline}\n`;

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
  let changesetContents: (ChangelogItem & GitMetadata)[] = [];

  if (include === "diff") {
    // Get the diff of the current branch to main
    // --diff-filter=D includes only deleted files from diff (changesets deletes these files after release)
    const changesetsToInclude = (
      await execa("git", ["diff", "--name-only", "--diff-filter=D", "main", ".changeset"])
    ).stdout
      .trim()
      .split(/\s+/)
      .map((filename) => filename.trim())
      .filter((filename) => /.md$/.test(filename));

    // Load the contents of each changeset and metadata from git
    changesetContents = await Promise.all(
      changesetsToInclude.map(async (changesetPath) => {
        const changeset = (await execa("git", ["show", `:${changesetPath}`])).stdout;

        const gitLog = (await execa("git", ["log", "--", changesetPath])).stdout;
        return { ...parseChangeset(changeset), ...parseGitLog(gitLog) };
      }),
    );
  } else if (include === "all") {
    // Load all current changesets from the .changeset dir
    const changesetsToInclude = globSync(".changeset/*.md").sort();

    // Load the contents of each changeset from file and metadata from git
    changesetContents = await Promise.all(
      changesetsToInclude.map(async (changesetPath) => {
        const changeset = readFileSync(changesetPath).toString();
        const gitLog = (await execa("git", ["log", changesetPath])).stdout;
        return { ...parseChangeset(changeset), ...parseGitLog(gitLog) };
      }),
    );
  }

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
