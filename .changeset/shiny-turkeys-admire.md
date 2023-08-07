---
"@latticexyz/common": minor
---

Adds an onRequest option to mudTransportObserver, so we can hook into transport requests in a generic way.

```ts
createPublicClient({
  transport: mudTransportObserver(transport, {
    function onRequest({method, params) {
      console.log('got rpc request', method);
    }
  }),
  ...
});
```
