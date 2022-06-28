import { Contract, Overrides, Signer, Wallet } from "ethers";
import { ChainSpec } from "./types";
import { abi as PersonaAbi } from "@latticexyz/persona/abi/Persona.json";
import { abi as PersonaMirrorAbi } from "@latticexyz/persona/abi/PersonaMirror.json";
import { abi as PersonaAllMinterAbi } from "@latticexyz/persona/abi/PersonaAllMinter.json";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Persona as PersonaContract, PersonaAllMinter, PersonaMirror } from "./ethers-types";
import { hexZeroPad } from "ethers/lib/utils";

export function Persona({ personaAddress, personaAllMinterAddress, personaMirrorAddress, chainId, rpc }: ChainSpec) {
  const provider = new JsonRpcProvider(rpc, chainId);
  let persona = new Contract(personaAddress, PersonaAbi, provider) as PersonaContract;
  let personaMirror = new Contract(personaMirrorAddress, PersonaMirrorAbi, provider) as PersonaMirror;
  let personaAllMinter = new Contract(personaAllMinterAddress, PersonaAllMinterAbi, provider) as PersonaAllMinter;

  function getPersonasOfAddress(address: string) {
    // Iterate over all personas and filter by address
    // TODO: make persona contract enumerable
    return [];
  }

  function connectSigner(signer: Signer) {
    persona = persona.connect(signer);
    personaMirror = personaMirror.connect(signer);
    personaAllMinter = personaAllMinter.connect(signer);
  }

  async function mintPersona(overrides?: Overrides): Promise<number> {
    if (!persona.signer) throw new Error("Signer is not connected");
    const tx = await personaAllMinter.mintPersona(persona.signer.getAddress(), overrides);
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
      try {
        const { args } = persona.interface.parseLog(log);
        if (args.id) {
          return args.id.toNumber();
        }
      } catch {
        // Unknown event
      }
    }
    throw new Error("Could not mint persona");
  }

  async function authorize(personaId: number, user: string, consumer: string, overrides?: Overrides) {
    const isAuthorized = await personaMirror.isAuthorized(personaId, user, consumer, hexZeroPad("0x0", 4));
    if (!isAuthorized) await personaMirror.authorize(personaId, user, consumer, [], overrides);
    return true;
  }

  async function impersonate(user: Wallet, personaId: number, consumer: string, overrides?: Overrides) {
    const tx = await personaMirror.connect(user).impersonate(personaId, consumer, overrides);
    return tx.wait();
  }

  async function mintAndBurner(consumer: string): Promise<{ personaId: number; burnerWallet: Wallet }> {
    const personaId = await mintPersona();
    const burnerWallet = Wallet.createRandom().connect(provider);
    await authorize(personaId, burnerWallet.address, consumer);
    await impersonate(burnerWallet, personaId, consumer);
    return { personaId, burnerWallet };
  }

  return { connectSigner, getPersonasOfAddress, mintPersona, authorize, impersonate, mintAndBurner };
}
