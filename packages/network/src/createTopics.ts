import { ethers, VoidSigner } from "ethers";
import { ContractTopics } from "./types";
import { Contracts } from "./types";

export type TopicsConfig<C extends Contracts> = {
  [ContractType in keyof C]: {
    abi: ethers.ContractInterface;
    topics: (keyof C[ContractType]["filters"])[];
  };
};

export function createTopics<C extends Contracts>(config: TopicsConfig<C>): ContractTopics[] {
  const contractTopics: ContractTopics[] = [];
  for (const key of Object.keys(config)) {
    const { abi, topics } = config[key];
    const dummyContract = new ethers.Contract(
      ethers.constants.AddressZero,
      abi,
      new VoidSigner(ethers.constants.AddressZero)
    ) as C[typeof key];
    const contractTopic = [
      topics
        .map((t) => dummyContract.filters[t as string]().topics)
        .map((topicsOrUndefined) => (topicsOrUndefined || [])[0]),
    ] as Array<Array<string>>;
    contractTopics.push({
      key,
      topics: contractTopic,
    });
  }
  return contractTopics;
}
