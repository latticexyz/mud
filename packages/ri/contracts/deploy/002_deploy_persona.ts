import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { blue } from "colorette";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log(blue("Deploying MockL2Bridge"));
  const mockBridge = await deploy("MockL2Bridge", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [],
  });

  console.log(blue("Deploying Persona"));
  const persona = await deploy("Persona", {
    from: deployer,
    log: true,
    autoMine: true,
    args: ["Persona", "LTX-PERSONA", mockBridge.address, hre.ethers.constants.AddressZero],
  });

  console.log(blue("Deploying PersonaMirror"));
  const personaMirror = await deploy("PersonaMirror", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [persona.address, mockBridge.address],
  });

  console.log(blue("Deploying PersonaAllMinter"));
  const personaAllMinter = await deploy("PersonaAllMinter", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [],
    deterministicDeployment: "0xDEADBEEF",
  });
  const personaAllMinterContract = await hre.ethers.getContract("PersonaAllMinter", deployer);

  console.log(blue("Setting Persona address on PersonaAllMinter"));
  let tx = await personaAllMinterContract.setPersona(persona.address);
  await tx.wait();

  const personaContract = await hre.ethers.getContract("Persona", deployer);

  console.log(blue("Authorizing PersonaAllMinter"));
  tx = await personaContract.setMinter(personaAllMinter.address, true);
  await tx.wait();

  console.log(blue("Setting PersonaMirror L2 address on Persona"));
  tx = await personaContract.setPersonaMirrorL2(personaMirror.address);
  await tx.wait();

  const isMinter = await personaContract.isMinter(personaAllMinter.address);
  console.log(blue(`Is PersonaAllMinter authorized as a minter? ${isMinter}`));
};
export default func;
func.tags = ["Persona"];
