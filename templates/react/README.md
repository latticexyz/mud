# Using external wallets in development environments

- After restarting your development chain, it may be necessary to reset the nonce in your external wallet. For MetaMask, follow this guide: https://support.metamask.io/hc/en-us/articles/360015488891-How-to-clear-your-account-activity-reset-account
- To send a balance to your external wallet account from a default Anvil account, use this command: `cast send '0xYourAddress' --value 1ether --private-key '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'`
