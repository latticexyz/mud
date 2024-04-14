import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { ANVIL_WALLET_CLIENT, DETERMINISTIC_DEPLOYER, ENTRY_POINT_CREATE_CALL, ENTRY_POINT_SIMULATIONS_CREATE_CALL, MOCK_PAYMASTER_ADDRESS, MOCK_PAYMASTER_CREATE_CALL, SIMPLE_ACCOUNT_FACTORY_CREATE_CALL, } from "./constants.js";
import { getContract, parseAbi, parseEther } from "viem";
const walletClient = ANVIL_WALLET_CLIENT();
(async () => {
    const entryPointHash = await walletClient.sendTransaction({
        to: DETERMINISTIC_DEPLOYER,
        data: ENTRY_POINT_CREATE_CALL,
    });
    console.log("EntryPoint deployed", entryPointHash);
    const simpleAccountFactoryHash = await walletClient.sendTransaction({
        to: DETERMINISTIC_DEPLOYER,
        data: SIMPLE_ACCOUNT_FACTORY_CREATE_CALL,
    });
    console.log("SimpleAccountFactory deployed", simpleAccountFactoryHash);
    const entryPointSimulationsHash = await walletClient.sendTransaction({
        to: DETERMINISTIC_DEPLOYER,
        data: ENTRY_POINT_SIMULATIONS_CREATE_CALL,
    });
    console.log("EntryPointSimulations deployed", entryPointSimulationsHash);
    const mockPaymasterHash = await walletClient.sendTransaction({
        to: DETERMINISTIC_DEPLOYER,
        data: MOCK_PAYMASTER_CREATE_CALL(ENTRYPOINT_ADDRESS_V07),
    });
    console.log("MockPaymaster deployed", mockPaymasterHash);
    const mockPaymasterContract = getContract({
        address: MOCK_PAYMASTER_ADDRESS,
        abi: parseAbi(["function deposit() payable"]),
        client: walletClient,
    });
    const depositHash = await mockPaymasterContract.write.deposit({
        value: parseEther("50"),
    });
    console.log("MockPaymaster deposited", depositHash);
})();
