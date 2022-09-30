package utils

import (
	"fmt"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

func RecoverSigAddress(sigHex string, msg []byte) (address string, err error) {
	defer func() {
		// Recover from panic if one occured. Set err to nil otherwise.
		if recover() != nil {
			err = fmt.Errorf("error while recovering signer")
		}
	}()

	sig := hexutil.MustDecode(sigHex)

	msg = accounts.TextHash(msg)
	if sig[crypto.RecoveryIDOffset] == 27 || sig[crypto.RecoveryIDOffset] == 28 {
		sig[crypto.RecoveryIDOffset] -= 27 // Transform yellow paper V from 27/28 to 0/1
	}

	recovered, err := crypto.SigToPub(msg, sig)
	if err != nil {
		return "", err
	}

	return crypto.PubkeyToAddress(*recovered).Hex(), nil
}

func VerifySig(from string, sigHex string, msg []byte) (bool, string, error) {
	// Recover address.
	recovered, err := RecoverSigAddress(sigHex, msg)

	// Compare to provided address.
	return from == recovered, recovered, err
}
