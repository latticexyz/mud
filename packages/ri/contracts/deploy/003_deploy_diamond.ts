import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { blue, green } from "colorette";
import { CombinedFacets, LocalLatticeGameLocator } from "../types/ethers-contracts";
import { deployComponent } from "../deploy-utils/components";
import { deployAccessController } from "../deploy-utils/accessControllers";
// import { deployContentCreator } from "../deploy-utils/contentCreators";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { diamond, deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const personaMiror = await hre.ethers.getContract("PersonaMirror", deployer);
  const LibQuery = await hre.deployments.get("LibQuery");
  const LibStamina = await hre.deployments.get("LibStamina");

  console.log(blue("Deploying Diamond"));
  const facets = ["EmberFacet", "InitializeFacet", "CastSpellFacet", "MoveFacet", "PlayerJoinFacet"];
  const chainId = await hre.getChainId();
  if (chainId === "31337") facets.push("DebugFacet");

  const { newlyDeployed } = await diamond.deploy("Diamond", {
    from: deployer,
    owner: deployer,
    facets,
    log: true,
    execute: {
      methodName: "initializeExternally",
      args: [[true, personaMiror.address]],
    },
    libraries: {
      LibQuery: LibQuery.address,
      LibStamina: LibStamina.address,
    },
    autoMine: true,
  });

  const ember = (await hre.ethers.getContract("Diamond", deployer)) as CombinedFacets;
  const world = await ember.world();
  // Deploy components
  await deployComponent(hre, world, ember.address, "PositionComponent");
  await deployComponent(hre, world, ember.address, "EntityTypeComponent");
  await deployComponent(hre, world, ember.address, "MovableComponent");
  await deployComponent(hre, world, ember.address, "UntraversableComponent");
  await deployComponent(hre, world, ember.address, "OwnedByComponent");
  await deployComponent(hre, world, ember.address, "PersonaComponent");
  await deployComponent(hre, world, ember.address, "StaminaComponent");
  await deployComponent(hre, world, ember.address, "LastActionTurnComponent");
  await deployComponent(hre, world, ember.address, "GameConfigComponent");
  // await deployComponent(hre, world, ember.address, "SpawnPointComponent");
  await deployComponent(hre, world, ember.address, "MineableComponent");

  // Deploy access controllers
  await deployAccessController(hre, ember, "PersonaAccessController");
  // Deploy content creators
  // await deployContentCreator(hre, ember, "MapContentCreator")
  // Deploy embodied systems

  console.log(blue("Deploying LocalLatticeGameLocator"));
  await deploy("LocalLatticeGameLocator", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [],
    deterministicDeployment: "0xAAAAFFFF",
  });
  const localLatticeGameLocator = (await hre.ethers.getContract(
    "LocalLatticeGameLocator",
    deployer
  )) as LocalLatticeGameLocator;
  console.log(green("LocalLatticeGameLocator: " + localLatticeGameLocator.address));

  if (newlyDeployed) {
    const tx = await localLatticeGameLocator.setLocalLatticeGameAddress(ember.address);
    await tx.wait();
    console.log(blue("Local Lattice game linked"));
  }

  console.log(green(`Setting hardhat time to local time.`));
  await hre.network.provider.send("evm_setNextBlockTimestamp", [Math.round(Date.now() / 1000)]);

  // Only configure the world after setting hardhat time
  // to the correct value because it saves the game
  // start timestamp.
  console.log(blue("Configure world"));
  const tx = await ember.configureWorld();
  await tx.wait();
};
export default func;
func.tags = ["Diamond"];
