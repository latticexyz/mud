```
┌─app────────────────────────┐ ┌─explorer───────────────────┐
│                            │ │                            │
│                            │ │                            │
│                            │ │                            │
│                            │ │                            │
│                            │ │                            │
│                            │ │                            │
│                            │ │                            │
│                 ┌─bridge─┐ │ │                            │
│                 │        │ │ │                            │
│                 │     ───┼relay──►                        │
│                 │        │ │ │                            │
│                 └────────┘ │ │                            │
└────────────────────────────┘ └────────────────────────────┘
```

<!-- diagram via https://asciiflow.com/ -->

## TODO

- [ ] figure out why 127.0.0.1 wasn't relaying messages on BroadcastChannel but localhost does
- [ ] Explorer/Next.js app seems to be clearing localStorage.debug on reload?
