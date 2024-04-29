---
"@latticexyz/common": patch
"@latticexyz/cli": patch
---

The key ID for deploying via KMS signer is now set in the AWS_KMS_KEY_ID environment variable, instead of with a CLI flag. Correspondingly, the flag to toggle using a KMS account is now a `boolean` `--kms` instead of `--awsKmsKeyId`.
