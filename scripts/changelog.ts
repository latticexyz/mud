/**
 * This is a workaround until changesets natively supports publishing a
 * central changelog (https://github.com/changesets/changesets/issues/1059).
 */

import { execa } from "execa";
import { readFileSync, writeFileSync } from "node:fs";

//--------- CONSTANTS

const REPO_URL = process.env.REPO_URL ?? "https://github.com/latticexyz/mud";
const CHANGELOG_PATH = process.env.CHANGELOG_PATH ?? "CHANGELOG.md";

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
  const changes = await getChanges();
  const version = await getVersion();

  return `
# Version ${version}

## Major changes

${await renderChangelogItems(changes.major)}
## Minor changes

${await renderChangelogItems(changes.minor)}
## Patch changes

${await renderChangelogItems(changes.patch)}
`;
}

async function renderChangelogItems(changelogItems: (ChangelogItem & GitMetadata)[]) {
  let output = "";

  for (const changelogItem of changelogItems) {
    output += `1. **[${changelogItem.title}](${REPO_URL}/commit/${changelogItem.commitHash})** (${changelogItem.packages
      .map((e) => e.package)
      .join(", ")})

${changelogItem.description}
`;
  }

  return output;
}

async function getVersion() {
  return "2.0.0-next.1";
}

async function getChanges() {
  // Get the diff of the current branch to main
  const changesetDiff = (await execa("git", ["diff", "main", ".changeset/pre.json"])).stdout;

  // Get the list of changesets
  const addedLinesRegex = /\+\s+"([^"]+)"/g;
  const addedChangesets = [...changesetDiff.matchAll(addedLinesRegex)].map((match) => match[1]);

  // Load the contents of each changeset and metadata from git
  const changesets = await Promise.all(
    addedChangesets.map(async (addedChangeset) => {
      const changesetPath = `.changeset/${addedChangeset}.md`;
      const changeset = readFileSync(changesetPath).toString();
      const gitLog = (await execa("git", ["log", changesetPath])).stdout;
      return { ...parseChangeset(changeset), ...parseGitLog(gitLog) };
    })
  );

  // Sort the changesets into patch, minor and major updates
  const patch = changesets.filter((change) => change.type === ChangeType.PATCH);
  const minor = changesets.filter((change) => change.type === ChangeType.MINOR);
  const major = changesets.filter((change) => change.type === ChangeType.MAJOR);

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
  changeset = changeset.substring(separatorIndex + separatorString.length);

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
