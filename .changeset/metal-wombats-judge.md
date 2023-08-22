---
"@latticexyz/store-cache": major
---

Removes `store-cache` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

If you need reactivity, we recommend using `recs` package and `syncToRecs`. We'll be adding reactivity to `syncToSqlite` in a future release.
