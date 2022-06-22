import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blue } from "colorette";
import { CombinedFacets } from "../types/ethers-contracts";

export const deployAccessController = async function (
  hre: HardhatRuntimeEnvironment,
  diamond: CombinedFacets,
  name: string
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log(blue("Deploying Access Controller: " + name));
  const { address, newlyDeployed } = await deploy(name, {
    from: deployer,
    log: true,
    autoMine: true,
    args: [],
  });
  if (newlyDeployed) {
    console.log(blue("Registering access controller"));
    const tx = await diamond.registerAccessControllerExternally(address);
    await tx.wait();
  }
};
