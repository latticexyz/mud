// TODO: for some reason the package doesn't include a dist directory
import { generateJWTAuthenticatorInputs } from "@zk-email/jwt-tx-builder-helpers/src/input-generators";
import { Hex, encodeAbiParameters, parseAbiParameters } from "viem";

const proverUrl = "http://localhost:3001";

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

  const response = await fetch(proverUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: serializedInputs,
    }),
  });

  if (!response.ok) {
    throw new Error(`Prover request failed with status ${response.status}`);
  }

  const result = await response.json();
  const proofGenTime = performance.now();
  console.log(`Proof generation took ${(proofGenTime - lastTime).toFixed(2)}ms`);
  console.log(`Total time: ${(proofGenTime - startTime).toFixed(2)}ms`);

  const { proof, pub_signals } = result;

  const jwtProof = {
    domainName: `${header.kid}|${payload.iss}|${payload.azp}`,
    publicKeyHash: `0x${BigInt(pub_signals[3]).toString(16).padStart(64, "0")}`,
    timestamp: BigInt(pub_signals[5]).toString(),
    maskedCommand: payload.nonce,
    emailNullifier: `0x${BigInt(pub_signals[4]).toString(16).padStart(64, "0")}`,
    accountSalt: `0x${BigInt(pub_signals[26]).toString(16).padStart(64, "0")}` as Hex,
    isCodeExist: pub_signals[30] == 1,
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
