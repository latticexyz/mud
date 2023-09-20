---
"@latticexyz/world": major
---

All `World` methods acting on namespaces as resources have been updated to use `ResourceId namespaceId` as parameter instead of `bytes14 namespace`.
The reason for this change is to make it clearer when a namespace is used as resource, as opposed to being part of another resource's ID.

```diff
+ import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

IBaseWorld {
- function registerNamespace(bytes14 namespace) external;
+ function registerNamespace(ResourceId namespaceId) external;

- function transferOwnership(bytes14 namespace, address newOwner) external;
+ function transferOwnership(ResourceId namespaceId, address newOwner) external;

- function transferBalanceToNamespace(bytes14 fromNamespace, bytes14 toNamespace, uint256 amount) external;
+ function transferBalanceToNamespace(ResourceId fromNamespaceId, ResourceId toNamespaceId, uint256 amount) external;

- function transferBalanceToAddress(bytes14 fromNamespace, address toAddress, uint256 amount) external;
+ function transferBalanceToAddress(ResourceId fromNamespaceId, address toAddress, uint256 amount) external;
}

```
