---
"@latticexyz/cli": patch
"@latticexyz/common": patch
---

The `mud deploy` command now includes the addresses of all deployed contracts and libraries in the deployment file. Previously, it only included the world address.

The `mud test` command now includes an optional 'saveDeployment' flag to enable the deployment info from the test run to be saved to a file.
