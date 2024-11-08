import fs from "node:fs";

function parseChangelog(content: string) {
  const versions = [];
  const versionRegex = /^## Version (\d+\.\d+\.\d+(?:-next\.\d+)?)\s*\n+Release date: ([^\n]+)/gm;
  const changeRegex = /^\*\*\[([^\]]+)\]\(([^\)]+)\)\*\* \(([^\)]+)\)\s*\n+([^-][^\n]+(?:\n(?![*#])[^\n]+)*)/gm;

  let versionMatch;
  while ((versionMatch = versionRegex.exec(content)) !== null) {
    const version = versionMatch[1];
    const dateStr = versionMatch[2].trim();

    console.log(dateStr);

    const date = new Date(dateStr + " UTC");

    console.log(date, date.toUTCString());

    if (isNaN(date.getTime())) {
      console.warn(`Warning: Invalid date found for version ${version}: ${dateStr}`);
      continue;
    }

    const versionContent = content.slice(versionMatch.index, content.indexOf("---", versionMatch.index));

    const changes = {
      patch: [],
      minor: [],
      major: [],
    };

    // Find all changes in this version
    let changeMatch;
    while ((changeMatch = changeRegex.exec(versionContent)) !== null) {
      const [, title, commitHash, packages, description] = changeMatch;

      const change = {
        packages: packages.split(", ").map((pkg) => ({
          package: pkg.trim(),
          type: "patch", // Default to patch, you might want to detect this from the commit message
        })),
        description: description.trim(),
        type: 0, // Default to patch (0), minor (1), major (2)
        commitHash: commitHash.split("/commit/")[1],
        authorName: "", // These would need to be fetched from git history
        authorEmail: "",
        title: title,
      };

      // Determine change type based on the section it's in
      // You might want to enhance this logic based on your needs
      if (versionContent.includes("### Major changes")) {
        changes.major.push(change);
      } else if (versionContent.includes("### Minor changes")) {
        changes.minor.push(change);
      } else {
        changes.patch.push(change);
      }
    }

    versions.push({
      version,
      date: date.toISOString(),
      changes,
    });
  }

  return versions;
}

// Read the changelog file
const changelogContent = fs.readFileSync("CHANGELOG.md", "utf8");

// Parse the content
const changelog = parseChangelog(changelogContent);

// Write the result to changelog.json
fs.writeFileSync("changelog.json", JSON.stringify(changelog, null, 2));
