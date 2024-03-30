"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const constants_1 = require("../constants");
const account = (0, accounts_1.mnemonicToAccount)("test test test test test test test test test test test junk");
const walletClient = (0, viem_1.createWalletClient)({
    account,
    chain: chains_1.foundry,
    transport: (0, viem_1.http)("http://127.0.0.1:8545"),
});
(async () => {
    const entryPointHash = await walletClient.sendTransaction({
        to: constants_1.DETERMINISTIC_DEPLOYER,
        data: constants_1.ENTRY_POINT_CREATE_CALL,
    });
    console.log("EntryPoint deployed", entryPointHash);
    const simpleAccountFactoryHash = await walletClient.sendTransaction({
        to: constants_1.DETERMINISTIC_DEPLOYER,
        data: constants_1.SIMPLE_ACCOUNT_FACTORY_CREATE_CALL,
    });
    console.log("SimpleAccountFactory deployed", simpleAccountFactoryHash);
    const entryPointSimulationsHash = await walletClient.sendTransaction({
        to: constants_1.DETERMINISTIC_DEPLOYER,
        data: constants_1.ENTRY_POINT_SIMULATIONS_CREATE_CALL,
    });
    console.log("entryPointSimulations deployed", entryPointSimulationsHash);
})();
