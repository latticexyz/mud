---
"@latticexyz/cli": patch
---

The key ID for deploying via KMS signer is now set via an `AWS_KMS_KEY_ID` environment variable to better align with Foundry tooling. To enable KMS signing with this environment variable, use the `--kms` flag.

```diff
-mud deploy --awsKmsKeyId [key ID]
+AWS_KMS_KEY_ID=[key ID] mud deploy --kms
```
