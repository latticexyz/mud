import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blue } from "colorette";

export const deployComponent = async function (
  hre: HardhatRuntimeEnvironment,
  world: string,
  diamondAddress: string,
  name: string
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log(blue("Deploying Component: " + name));
  const { newlyDeployed } = await deploy(name, {
    from: deployer,
    log: true,
    autoMine: true,
    args: [world],
  });

  if (newlyDeployed) {
    console.log(blue("Transferring ownership"));
    const component = await hre.ethers.getContract(name, deployer);
    const owner = await component.owner();

    console.log("Current owner: ", owner);
    console.log("Deployer: ", deployer);
    if (deployer !== owner) {
      console.log("Deployer is not owner, abort transferring ownership");
      return;
    }

    const tx = await component.transferOwnership(diamondAddress);
    await tx.wait();
  }
};
