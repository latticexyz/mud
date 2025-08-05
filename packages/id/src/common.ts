// relying party for the passkey
export const rp = {
  id: "id.place",
  name: "id.place",
} satisfies PublicKeyCredentialRpEntity;

// must be a valid origin for the relying party
// needs trailing slash while it's a Vite static site
export const popupUrl = "https://id.place/popup/";
