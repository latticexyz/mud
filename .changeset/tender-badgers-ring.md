---
"@latticexyz/common": patch
---

`resourceToHex` will now throw if provided namespace is >14 characters. Since namespaces are used in access control, it's not safe to automatically truncate to fit into `bytes14` as that may change which namespace gets access to the particular resource.
