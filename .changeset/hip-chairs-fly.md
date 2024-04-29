---
"@latticexyz/cli": patch
---

Fixed `mud deploy` to use the `forge script --aws` flag when executing `PostDeploy` with a KMS signer.

Note that you may need to update your `PostDeploy.s.sol` script, with `vm.startBroadcast` receiving no arguments instead of reading a private key from the environment:

```diff
-uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
-vm.startBroadcast(deployerPrivateKey);

+vm.startBroadcast();
```
