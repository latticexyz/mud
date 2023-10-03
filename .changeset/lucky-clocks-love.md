---
"@latticexyz/cli": major
---

Removes `.mudbackup` file handling and `--backup`, `--restore`, and `--force` options from `mud set-version` command.

To revert to a previous MUD version, use `git diff` to find the version that you changed from and want to revert to and run `pnpm mud set-version <prior-version>` again.
