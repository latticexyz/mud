import { Page } from "@playwright/test";
import IWorldAbi from "../../contracts/out/IWorld.sol/IWorld.abi.json";
import { GetContractReturnType, PublicClient, WalletClient } from "viem";

type WorldAbi = typeof IWorldAbi;

type WorldContract = GetContractReturnType<WorldAbi, PublicClient & WalletClient>;

export function getWorld(page: Page) {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worldContract = (window as any).worldContract as WorldContract;
    return worldContract;
  }, []);
}
