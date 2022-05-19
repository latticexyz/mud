import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blue } from "colorette";
import { CombinedFacets } from "../types/ethers-contracts";

export const deployContentCreator = async function (
  hre: HardhatRuntimeEnvironment,
  diamond: CombinedFacets,
  name: string
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log(blue("Deploying Content Creator: " + name));
  const { address } = await deploy(name, {
    from: deployer,
    log: true,
    autoMine: true,
    args: [],
  });

  console.log(blue("Registering content creator"));
  const tx = await diamond.registerContentCreatorExternally(address);
  await tx.wait();
};
