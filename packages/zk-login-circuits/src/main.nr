use dep::std;
use jwt::JWT;

// Global constants for bounds
global MAX_DATA_LENGTH: u32 = 900;
global MAX_CLAIM_LENGTH: u32 = 64;       // Maximum length for any claim string
global MAX_DOMAIN_LENGTH: u32 = 64;      // Maximum length for the domain

// Payload scan parameters
global PAYLOAD_SCAN_RANGE: u32 = 300;    // Range to scan in payload for claims

fn main(
    // The full JWT token data (Base64 encoded)
    data: BoundedVec<u8, MAX_DATA_LENGTH>,
    // Offset where payload starts in Base64 data
    base64_decode_offset: u32,
    // RS256 verification parameters
    pubkey_modulus_limbs: [Field; 18],
    redc_params_limbs: [Field; 18],
    signature_limbs: [Field; 18],
    // Public outputs for verified claims
    domain: pub BoundedVec<u8, MAX_DOMAIN_LENGTH>,
    azp: pub BoundedVec<u8, MAX_CLAIM_LENGTH>,
    iss: pub BoundedVec<u8, MAX_CLAIM_LENGTH>
  ) -> pub [u8; 32] {
    // Initialize JWT verifier
    let jwt = JWT::init(
        data,
        base64_decode_offset,
        pubkey_modulus_limbs,
        redc_params_limbs,
        signature_limbs,
    );

    // Verify the JWT signature
    jwt.verify();

    // Assert public inputs
    jwt.assert_claim_string::<PAYLOAD_SCAN_RANGE, 3, MAX_CLAIM_LENGTH>("azp".as_bytes(), azp);
    jwt.assert_claim_string::<PAYLOAD_SCAN_RANGE, 3, MAX_CLAIM_LENGTH>("iss".as_bytes(), iss);
    jwt.assert_claim_string::<PAYLOAD_SCAN_RANGE, 3, MAX_DOMAIN_LENGTH>("aud".as_bytes(), domain);

    // Extract claims
    let email = jwt.get_claim_string::<PAYLOAD_SCAN_RANGE, 5, MAX_CLAIM_LENGTH>("email".as_bytes());
    let sub = jwt.get_claim_string::<PAYLOAD_SCAN_RANGE, 3, MAX_CLAIM_LENGTH>("sub".as_bytes());
    let mut account_salt_input: BoundedVec<u8, MAX_CLAIM_LENGTH * 2> = BoundedVec::new();
    account_salt_input.extend_from_bounded_vec(email);
    account_salt_input.extend_from_bounded_vec(sub);

    let account_salt = std::hash::keccak256(account_salt_input.storage(), account_salt_input.len());
    account_salt
}
