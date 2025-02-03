// TODO: for some reason the package doesn't include a dist directory
import { generateJWTAuthenticatorInputs } from "@zk-email/jwt-tx-builder-helpers/src/input-generators";
import { Hex, encodeAbiParameters, parseAbiParameters } from "viem";
import * as snarkjs from "./snarkjs.js";

export async function generateProof(jwt: string) {
  const startTime = performance.now();
  let lastTime = startTime;

  const header = JSON.parse(Buffer.from(jwt.split(".")[0], "base64").toString("utf-8"));
  const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString("utf-8"));

  const pubkeys = await fetch("https://www.googleapis.com/oauth2/v3/certs").then((res) => res.json());
  const { n } = pubkeys.keys.find((key: any) => key.kid === header.kid);
  const pubkey = { n, e: 65537 };

  const accountCode = BigInt(payload.sub);

  const circuitInputs = await generateJWTAuthenticatorInputs(jwt, pubkey, accountCode, {
    maxMessageLength: 1024,
  });

  const inputGenTime = performance.now();
  console.log(`Circuit input generation took ${(inputGenTime - lastTime).toFixed(2)}ms`);
  lastTime = inputGenTime;

  const serializedInputs = JSON.parse(
    JSON.stringify(circuitInputs, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
  );

  console.log("circuitInputs", serializedInputs);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(serializedInputs, "jwt.wasm", "jwt.zkey");

  console.log({ publicSignals });
  const proofGenTime = performance.now();
  console.log(`Proof generation took ${(proofGenTime - lastTime).toFixed(2)}ms`);
  console.log(`Total time: ${(proofGenTime - startTime).toFixed(2)}ms`);

  // TODO: use helper
  const match = payload.email.match(/@(.+)$/);
  if (!match) {
    throw new Error(`Invalid email format: ${payload.email}`);
  }

  const domainName = match[1];

  const jwtProof = {
    kid: `0x${header.kid}`,
    iss: payload.iss,
    azp: payload.azp,
    publicKeyHash: `0x${BigInt(publicSignals[3]).toString(16).padStart(64, "0")}`,
    timestamp: BigInt(publicSignals[5]).toString(),
    maskedCommand: payload.nonce,
    emailNullifier: `0x${BigInt(publicSignals[4]).toString(16).padStart(64, "0")}`,
    accountSalt: `0x${BigInt(publicSignals[26]).toString(16).padStart(64, "0")}` as Hex,
    isCodeExist: publicSignals[30] == 1,
    domainName,
    proof: encodeAbiParameters(parseAbiParameters("uint256[2], uint256[2][2], uint256[2]"), [
      proof.pi_a.slice(0, 2).map(BigInt),
      [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ],
      proof.pi_c.slice(0, 2).map(BigInt),
    ]),
  };
  console.log("JWT proof:", jwtProof);
  return jwtProof;
}
