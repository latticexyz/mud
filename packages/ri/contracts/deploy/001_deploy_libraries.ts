import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("LibQuery", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  await deploy("LibStamina", {
    from: deployer,
    log: true,
    autoMine: true,
  });
};
export default func;
func.tags = ["Libraries"];
