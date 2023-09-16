---
"@latticexyz/common": minor
---

`spliceHex` was added, which has a similar API as JavaScript's [`Array.prototype.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice), but for `Hex` strings.

```ts
spliceHex("0x123456", 1, 1, "0x0000"); // "0x12000056"
```
