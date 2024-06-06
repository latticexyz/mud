import { Address, toHex } from "viem";
import { publicKeyToAddress } from "viem/utils";
import { GetPublicKeyCommandInput, KMSClient } from "@aws-sdk/client-kms";
import { getPublicKey } from "./getPublicKey";
// @ts-expect-error Could not find a declaration file for module 'asn1.js'.
import asn1 from "asn1.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EcdsaPubKey = asn1.define("EcdsaPubKey", function (this: any) {
  this.seq().obj(this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()), this.key("pubKey").bitstr());
});

function publicKeyKmsToAddress(publicKey: Uint8Array): Address {
  const res = EcdsaPubKey.decode(Buffer.from(publicKey));

  const publicKeyBuffer: Buffer = res.pubKey.data;

  const publicKeyHex = toHex(publicKeyBuffer);
  const address = publicKeyToAddress(publicKeyHex);

  return address;
}

export async function getAddressFromKms({
  keyId,
  client,
}: {
  keyId: GetPublicKeyCommandInput["KeyId"];
  client: KMSClient;
}): Promise<Address> {
  const KMSKey = await getPublicKey({ keyId, client });

  return publicKeyKmsToAddress(KMSKey.PublicKey as Uint8Array);
}
