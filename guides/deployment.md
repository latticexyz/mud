---
order: 5
---

# Deployment

You can use the MUD CLI to deploy your MUD app to any EVM compatible chain. Just run the following command from your contracts' project directory:

```
npx @latticexyz/cli deploy-contracts --rpc <chain_rpc_url> --deployerPrivateKey <private_key_to_deploy_from>
```

## Deploy to Lattice testnet

To test your app in a production-like environment, you can deploy it to the Lattice testnet. Note, that this testnet should not be used for _actual production_ apps, as it might be restarted with short notice and is not guaranteed to keep its state forever.

If your app is deployed on the Lattice testnet, you can fund your users' accounts (so they can pay for transaction gas cost) by [integrating this snippet in your app](https://github.com/latticexyz/opcraft/blob/main/packages/client/src/layers/network/createNetworkLayer.ts#L120L124).

### Step by step

&nbsp;1. Optional first step: create a new account to use as the deployer. We can do this in the terminal using `cast`.

```
cast wallet new
```

&nbsp;2. Next, your deployer account needs some funds. You can request funds from the faucet using the MUD CLI.

```
npx @latticexyz/cli faucet --address <deployer_address>
```

&nbsp;3. Now we're ready to deploy your contracts to the testnet. Navigate to your contracts' project directory and use the MUD CLI to deploy them.

```
npx @latticexyz/cli deploy-contracts --rpc https://follower.testnet-chain.linfra.xyz --deployerPrivateKey <deployer_private_key>
```

Note: sometimes `forge` estimates a way too high gas price - you can check the current gas price in the testnet's block explorer, and set a manual value using the optional `--gasPrice` flag.

&nbsp;4. You can confirm the success of your deployment by checking the World contract's address in the block explorer: https://explorer.testnet-chain.linfra.xyz/address/<your_world_address>

### Lattice testnet URLs

- Json RPC: https://follower.testnet-chain.linfra.xyz
- Websocket RPC: wss://follower.testnet-chain.linfra.xyz
- Stream service: https://ecs-stream.testnet-mud-services.linfra.xyz
- Snapshot service: https://ecs-snapshot.testnet-mud-services.linfra.xyz
- Relay service: https://ecs-relay.testnet-mud-services.linfra.xyz
- Faucet: https://faucet.testnet-mud-services.linfra.xyz
- Block Explorer: https://explorer.testnet-chain.linfra.xyz
