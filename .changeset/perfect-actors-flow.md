---
"@latticexyz/common": patch
---

Added `kmsKeyToAccount`, a [viem custom account](https://viem.sh/docs/accounts/custom#custom-account) that signs transactions using AWS KMS.

To use it, you must first install `@aws-sdk/client-kms@3.x` and `asn1.js@5.x` dependencies into your project. Then create a KMS account with:

```ts
import { kmsKeyToAccount } from "@latticexyz/common/kms";
const account = kmsKeyToAccount({ keyId: ... });
```

By default, a `KMSClient` will be created, but you can also pass one in via the `client` option. The default KMS client will use [your environment's AWS SDK configuration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/configuring-the-jssdk.html).
