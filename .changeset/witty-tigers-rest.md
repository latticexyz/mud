---
"@latticexyz/cli": patch
---

The `mud test` cli now exits with code 1 on test failure. It used to exit with code 0, which meant that CIs didn't notice test failures.
