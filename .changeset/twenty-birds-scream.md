---
"@latticexyz/react": minor
---

Adds a `usePromise` hook that returns a [native `PromiseSettledResult` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

```tsx
const promise = fetch(url);
const result = usePromise(promise);

if (result.status === 'idle' || result.status === 'pending') {
  return <>fetching</>;
}

if (result.status === 'rejected') {
  return <>error fetching: {String(result.reason)}</>
}

if (result.status === 'fulfilled') {
  return <>fetch status: {result.value.status}</>
}
```
