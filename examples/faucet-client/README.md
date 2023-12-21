Drip some ETH from a [faucet](https://mud.dev/services/faucet).

If you can't use TypeScript, you can use

```
curl -X POST http://127.0.0.1:3002/trpc/drip \
   -H "Content-Type: application/json" \
   -d '{"address": "0x0000000000000000000000000000000000000000"}'
```

or the equivalent
