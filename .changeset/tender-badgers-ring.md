---
"@latticexyz/common": patch
---

`resourceToHex` will now throw if provided namespace is >14 characters. Since namespaces are used to determine access control, it's not safe to automatically truncate to fit into `bytes14` as that may change the indended namespace for resource access.
