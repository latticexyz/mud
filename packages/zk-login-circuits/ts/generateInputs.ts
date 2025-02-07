// Adapted from https://github.com/zkemail/noir-jwt/blob/ac70b340cdd5f97ded79813b6e6cde0e966091e9/js/generate-inputs.js

export type GenerateInputs = {
  jwt: string;
  pubkey: JsonWebKey;
  maxSignedDataLength: number;
};

export async function generateInputs({ jwt, pubkey, maxSignedDataLength }: GenerateInputs) {
  // Parse token
  const [headerB64, payloadB64] = jwt.split(".");

  // Extract signed data as byte array
  const signedDataString = jwt.split(".").slice(0, 2).join("."); // $header.$payload
  const signedData = new TextEncoder().encode(signedDataString);

  // Extract signature as bigint
  const signatureBase64Url = jwt.split(".")[2];
  const signatureBase64 = signatureBase64Url.replace(/-/g, "+").replace(/_/g, "/");
  const signature = new Uint8Array(
    atob(signatureBase64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );
  const signatureBigInt = BigInt("0x" + Buffer.from(signature).toString("hex"));

  // Extract pubkey modulus as bigint
  const pubkeyJWK = await crypto.subtle.exportKey("jwk", pubkey);
  const pubkeyBigInt = BigInt("0x" + Buffer.from(pubkeyJWK.n, "base64").toString("hex"));
  const redcParam = (1n << (2n * 2048n + 4n)) / pubkeyBigInt; // something needed by the noir big-num lib

  const inputs = {
    pubkey_modulus_limbs: splitBigIntToChunks(pubkeyBigInt, 120, 18),
    redc_params_limbs: splitBigIntToChunks(redcParam, 120, 18),
    signature_limbs: splitBigIntToChunks(signatureBigInt, 120, 18),
  };

  if (!shaPrecomputeTillKeys || shaPrecomputeTillKeys.length === 0) {
    // No precompute selector - no need to precompute SHA256
    if (signedData.length > maxSignedDataLength) {
      throw new Error("Signed data length exceeds maxSignedDataLength");
    }
    const signedDataPadded = new Uint8Array(maxSignedDataLength);
    signedDataPadded.set(signedData);
    inputs.data = {
      storage: Array.from(signedDataPadded),
      len: signedData.length,
    };
    // entire payload is base64 decode-able when not using partial hash
    // offset in signed data is the index of payload start
    // this can be any multiple of 4 from payload start, if you want to skip some bytes from start
    inputs.base64_decode_offset = headerB64.length + 1;
  } else {
    // Precompute SHA256 of the signed data
    // SHA256 is done in 64 byte chunks, so we can hash upto certain portion outside of circuit to save constraints
    // Signed data is $headerB64.$payloadB64
    // We need to find the index in B64 payload corresponding to min(hdIndex, nonceIndex) when decoded
    // Then we find the 64 byte boundary before this index and precompute the SHA256 upto that
    const payloadString = atob(payloadB64);
    const indicesOfPrecomputeKeys = shaPrecomputeTillKeys.map((key) => payloadString.indexOf(`"${key}":`));
    const smallerIndex = Math.min(...indicesOfPrecomputeKeys);
    const smallerIndexInB64 = Math.floor((smallerIndex * 4) / 3); // 4 B64 chars = 3 bytes

    const sliceStart = headerB64.length + smallerIndexInB64 + 1; // +1 for the '.'
    const precomputeSelector = signedDataString.slice(sliceStart, sliceStart + 12); // 12 is a random slice length - to get a unique string selector from base64 payload

    // generatePartialSHA expects padded input - Noir SHA lib doesn't need padded input; so we simply pad to 64x bytes
    const dataPadded = new Uint8Array(Math.ceil(signedData.length / 64) * 64);
    dataPadded.set(signedData);

    // Precompute the SHA256 hash
    const { precomputedSha, bodyRemaining: dataRemainingAfterPartialSHA } = generatePartialSHA({
      body: dataPadded,
      bodyLength: dataPadded.length,
      selectorString: precomputeSelector,
      maxRemainingBodyLength: maxSignedDataLength, // Max length configured in the circuit
    });

    // generatePartialSHA returns the remaining data after the precomputed SHA256 hash including padding
    // We don't need this padding so can we trim to it nearest 64x
    const shaCutoffIndex = Math.floor(sliceStart / 64) * 64; // Index up to which we precomputed SHA256
    const remainingDataLength = signedData.length - shaCutoffIndex;
    const dataRemainingAfterPartialSHAClean = dataRemainingAfterPartialSHA.slice(0, remainingDataLength);

    // Pad to the max length configured in the circuit
    if (dataRemainingAfterPartialSHAClean.length > maxSignedDataLength) {
      throw new Error("dataRemainingAfterPartialSHAClean after partial hash exceeds maxSignedDataLength");
    }

    const dataRemainingAfterPartialSHAPadded = new Uint8Array(maxSignedDataLength);
    dataRemainingAfterPartialSHAPadded.set(dataRemainingAfterPartialSHAClean);

    inputs.partial_data = {
      storage: Array.from(dataRemainingAfterPartialSHAPadded),
      len: remainingDataLength,
    };
    inputs.partial_hash = u8ToU32(precomputedSha);
    inputs.full_data_length = signedData.length;

    // when using partial hash, the data after the partial hash might not be a valid base64
    // we need to find an offset (1, 2, or 3) such that the remaining payload is base64 decode-able
    // this is the number that should be added to the "payload chunk that was included in SHA precompute"
    // to make it a multiple of 4
    // in other words, if you trim offset number of bytes from the remaining payload, it will be base64 decode-able
    const payloadBytesInShaPrecompute = shaCutoffIndex - (headerB64.length + 1);
    const offsetToMakeIt4x = 4 - (payloadBytesInShaPrecompute % 4);
    inputs.base64_decode_offset = offsetToMakeIt4x;
  }

  return inputs;
}

function u8ToU32(input) {
  const out = new Uint32Array(input.length / 4);
  for (let i = 0; i < out.length; i++) {
    out[i] = (input[i * 4 + 0] << 24) | (input[i * 4 + 1] << 16) | (input[i * 4 + 2] << 8) | (input[i * 4 + 3] << 0);
  }
  return out;
}

/*
 * Splits a BigInt into fixed-size chunks
 * @param {bigint} bigInt - The BigInt to split
 * @param {number} chunkSize - Size of each chunk in bits
 * @param {number} numChunks - Number of chunks to split into
 * @returns {bigint[]} Array of BigInt chunks
 */
export function splitBigIntToChunks(bigInt, chunkSize, numChunks) {
  const chunks = [];
  const mask = (1n << BigInt(chunkSize)) - 1n;
  for (let i = 0; i < numChunks; i++) {
    const chunk = (bigInt / (1n << (BigInt(i) * BigInt(chunkSize)))) & mask;
    chunks.push(chunk);
  }
  return chunks;
}
