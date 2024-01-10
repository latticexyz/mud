import { useMUD } from "./MUDContext";
import { getBurnerPrivateKey, createBurnerAccount, transportObserver, getContract } from "@latticexyz/common";
import { createPublicClient, createWalletClient, fallback, webSocket, http, ClientConfig, Hex } from "viem";
import { getNetworkConfig } from "./mud/getNetworkConfig";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

// A lot of code that would normally go in mud/getNetworkConfig.ts is part of the application here,
// because `getNetworkConfig.ts` assumes you use one wallet, and here we need several.
const networkConfig = await getNetworkConfig()

const clientOptions = {
  chain: networkConfig.chain,
  transport: transportObserver(fallback([webSocket(), http()])),
  pollingInterval: 1000,
} as const satisfies ClientConfig;


const publicClient = createPublicClient({
  ...clientOptions
})

// Create a structure with two fields:
//   client - a wallet client that uses a random account
//   world - a world contract object that lets us issue newCall
const makeWorldContract = () => {
  const client = createWalletClient({
    ...clientOptions,
    account: createBurnerAccount(getBurnerPrivateKey(Math.random().toString())),
  })

  return {
    world: getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorldAbi,
      publicClient: publicClient,
      walletClient: client,
    }), 
    client
  };
}

// Create five world contracts
const worldContracts = [1,2,3,4,5].map(x => makeWorldContract())

export const App = () => {
  const {
    network: { tables, useStore },
  } = useMUD();

  // Get all the calls from the records cache.
  const calls = useStore((state) => {
    const records = Object.values(state.getRecords(tables.LastCall));
    records.sort((a, b) => Number(a.value.callTime - b.value.callTime));
    return records;
  });
  

  // Convert timestamps to readable format
  const twoDigit = str => str.toString().padStart(2, "0")
  const timestamp2Str = (timestamp: number) => {
    const date = new Date(timestamp*1000);
    return `${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}:${twoDigit(date.getSeconds())}`
  }


  // Call newCall() on LastCall:LastCallSystem.
  const newCall = async worldContract => {
    const tx = await worldContract.write.LastCall_LastCallSystem_newCall();
  };


  return (
    <>
      <h2>Last calls</h2>
      <table>
        <tbody>
          <tr>
            <th>Caller</th>
            <th>Time</th>
          </tr>  
          {// Show all the calls
            calls.map((call) => (
            <tr key={call.id}>
              <td>
                {call.key.caller}
              </td>
              <td>
                {timestamp2Str(Number(call.value.callTime))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>My clients</h2>
      {// For every world contract, have a button to call newCall as that address.
        worldContracts.map(worldContract => (
        <> 
          <button
            type="button"
            title="Call"
            key={worldContract.client.account.address}
            onClick={async (event) => {
              event.preventDefault()
              await newCall(worldContract.world)
            }}
          >
          Call as {worldContract.client.account.address}
          </button>
          <br />
        </>             
      ))}      
    </>
  );
};
