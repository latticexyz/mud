# @latticexyz/store-cache

## 2.0.0-next.5

## 2.0.0-next.4

### Major Changes

- [#1343](https://github.com/latticexyz/mud/pull/1343) [`e3de1a33`](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1) Thanks [@holic](https://github.com/holic)! - Removes `store-cache` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

  If you need reactivity, we recommend using `recs` package and `syncToRecs`. We'll be adding reactivity to `syncToSqlite` in a future release.
