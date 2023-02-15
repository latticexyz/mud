import {
  JsonRpcProvider,
  WebSocketProvider,
  Block,
  Log,
  Formatter,
  BaseProvider,
  TransactionRequest,
} from "@ethersproject/providers";
import { callWithRetry, extractEncodedArguments, range, sleep } from "@latticexyz/utils";
import { BigNumber, Contract } from "ethers";
import { resolveProperties, defaultAbiCoder as abi } from "ethers/lib/utils";
import { Contracts, ContractTopics, ContractEvent, ContractsConfig } from "./types";

/**
 * Await network to be reachable.
 *
 * @param provider ethers JsonRpcProvider
 * @param wssProvider ethers WebSocketProvider
 * @returns Promise resolving once the network is reachable
 */
export async function ensureNetworkIsUp(provider: JsonRpcProvider, wssProvider?: WebSocketProvider): Promise<void> {
  const networkInfoPromise = () => {
    return Promise.all([provider.getBlockNumber(), wssProvider ? wssProvider.getBlockNumber() : Promise.resolve()]);
  };
  await callWithRetry(networkInfoPromise, [], 10, 1000);
  return;
}

/**
 * Fetch the latest Ethereum block
 *
 * @param provider ethers JsonRpcProvider
 * @param requireMinimumBlockNumber Minimal required block number.
 * If the latest block number is below this number, the method waits for 1300ms and tries again, for at most 10 times.
 * @returns Promise resolving with the latest Ethereum block
 */
export async function fetchBlock(provider: JsonRpcProvider, requireMinimumBlockNumber?: number): Promise<Block> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of range(10)) {
    const blockPromise = async () => {
      const rawBlock = await provider.perform("getBlock", {
        includeTransactions: false,
        blockTag: provider.formatter.blockTag(await provider._getBlockTag("latest")),
      });
      return provider.formatter.block(rawBlock);
    };
    const block = await callWithRetry<Block>(blockPromise, [], 10, 1000);
    if (requireMinimumBlockNumber && block.number < requireMinimumBlockNumber) {
      await sleep(300);
      continue;
    } else {
      return block;
    }
  }
  throw new Error("Could not fetch a block with blockNumber " + requireMinimumBlockNumber);
}

/**
 * Fetch logs with the given topics from a given block range.
 *
 * @param provider ethers JsonRpcProvider
 * @param topics Topics to fetch logs for
 * @param startBlockNumber Start of block range to fetch logs from (inclusive)
 * @param endBlockNumber End of block range to fetch logs from (inclusive)
 * @param contracts Contracts to fetch logs from
 * @param requireMinimumBlockNumber Minimal block number required to fetch blocks
 * @returns Promise resolving with an array of logs from the specified block range and topics
 */
export async function fetchLogs<C extends Contracts>(
  provider: JsonRpcProvider,
  topics: ContractTopics[],
  startBlockNumber: number,
  endBlockNumber: number,
  contracts: ContractsConfig<C>,
  requireMinimumBlockNumber?: number
): Promise<Array<Log>> {
  const getLogPromise = async (contractAddress: string, topics: string[][]): Promise<Array<Log>> => {
    const params = await resolveProperties({
      filter: provider._getFilter({
        fromBlock: startBlockNumber, // inclusive
        toBlock: endBlockNumber, // inclusive
        address: contractAddress,
        topics: topics,
      }),
    });
    const logs: Array<Log> = await provider.perform("getLogs", params);
    logs.forEach((log) => {
      if (log.removed == null) {
        log.removed = false;
      }
    });
    return Formatter.arrayOf(provider.formatter.filterLog.bind(provider.formatter))(logs);
  };

  const blockPromise = async () => {
    const _blockNumber = await provider.perform("getBlockNumber", {});
    const blockNumber = BigNumber.from(_blockNumber).toNumber();
    return blockNumber;
  };

  const getLogPromises = () => {
    const logPromises: Array<Promise<Array<Log>>> = [];
    for (const [k, c] of Object.entries(contracts)) {
      const topicsForContract = topics.find((t) => t.key === k)?.topics;
      if (topicsForContract) {
        logPromises.push(getLogPromise(c.address, topicsForContract));
      }
    }
    return logPromises;
  };

  if (requireMinimumBlockNumber) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ in range(10)) {
      const call = () => Promise.all([blockPromise(), ...getLogPromises()]);
      const [blockNumber, logs] = await callWithRetry<[number, ...Array<Array<Log>>]>(call, [], 10, 1000);
      if (blockNumber < requireMinimumBlockNumber) {
        await sleep(500);
      } else {
        return logs.flat();
      }
    }
    throw new Error("Could not fetch logs with a required minimum block number");
  } else {
    const call = () => Promise.all([...getLogPromises()]);
    const logs = await callWithRetry<Array<Array<Log>>>(call, [], 10, 1000);
    return logs.flat();
  }
}

/**
 * Fetch events from block range, ordered by block, transaction index and log index
 *
 * @param provider ethers JsonRpcProvider
 * @param topics Topics to fetch events for
 * @param startBlockNumber Start of block range to fetch events from (inclusive)
 * @param endBlockNumber End of block range to fetch events from (inclusive)
 * @param contracts Contracts to fetch events from
 * @param supportsBatchQueries Set to true if the provider supports batch queries (recommended)
 * @returns Promise resolving with an array of ContractEvents
 */
export async function fetchEventsInBlockRange<C extends Contracts>(
  provider: JsonRpcProvider,
  topics: ContractTopics[],
  startBlockNumber: number,
  endBlockNumber: number,
  contracts: ContractsConfig<C>,
  supportsBatchQueries?: boolean
): Promise<Array<ContractEvent<C>>> {
  const logs: Array<Log> = await fetchLogs(
    provider,
    topics,
    startBlockNumber,
    endBlockNumber,
    contracts,
    supportsBatchQueries ? endBlockNumber : undefined
  );

  // console.log(`[Network] fetched ${logs.length} events from ${startBlockNumber} -> ${endBlockNumber}`);
  // console.log(`got ${logs.length} logs from range ${startBlockNumber} -> ${endBlockNumber}`);
  // we need to sort per block, transaction index, and log index
  logs.sort((a: Log, b: Log) => {
    if (a.blockNumber < b.blockNumber) {
      return -1;
    } else if (a.blockNumber > b.blockNumber) {
      return 1;
    } else {
      if (a.transactionIndex < b.transactionIndex) {
        return -1;
      } else if (a.transactionIndex > b.transactionIndex) {
        return 1;
      } else {
        return a.logIndex < b.logIndex ? -1 : 1;
      }
    }
  });

  // construct an object: address => keyof C
  const addressToContractKey: { [key in string]: keyof C } = {};
  for (const contractKey of Object.keys(contracts)) {
    addressToContractKey[contracts[contractKey].address.toLowerCase()] = contractKey;
  }

  // parse the logs to get the logs description, then turn them into contract events
  const contractEvents: Array<ContractEvent<C>> = [];

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const contractKey = addressToContractKey[log.address.toLowerCase()];
    if (!contractKey) {
      throw new Error(
        "This should not happen. An event's address is not part of the contracts dictionnary: " + log.address
      );
    }

    const { address, abi } = contracts[contractKey];
    const contract = new Contract(address, abi);
    try {
      const logDescription = contract.interface.parseLog(log);

      // Set a flag if this is the last event in this transaction
      const lastEventInTx = logs[i + 1]?.transactionHash !== log.transactionHash;

      contractEvents.push({
        contractKey,
        eventKey: logDescription.name,
        args: logDescription.args,
        txHash: log.transactionHash,
        lastEventInTx,
        blockNumber: log.blockNumber,
      });
    } catch (e) {
      console.warn("Error", e);
      console.warn("A log couldn't be parsed with the corresponding contract interface!");
    }
  }

  return contractEvents;
}

/**
 * Get the revert reason from a given transaction hash
 *
 * @param txHash Transaction hash to get the revert reason from
 * @param provider ethers Provider
 * @returns Promise resolving with revert reason string
 */
export async function getRevertReason(txHash: string, provider: BaseProvider): Promise<string> {
  // Decoding the revert reason: https://docs.soliditylang.org/en/latest/control-structures.html#revert
  const tx = await provider.getTransaction(txHash);
  tx.gasPrice = undefined; // tx object contains both gasPrice and maxFeePerGas
  const encodedRevertReason = await provider.call(tx as TransactionRequest);
  const decodedRevertReason = abi.decode(["string"], extractEncodedArguments(encodedRevertReason));
  return decodedRevertReason[0];
}
