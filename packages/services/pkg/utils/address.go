package utils

import (
	"strings"

	"github.com/ethereum/go-ethereum/common"
)

// SplitAddressList splits a list of addresses initially given as a string addressList along with a
// separator to use to split the string.
func SplitAddressList(addressList string, separator string) []common.Address {
	addresses := []common.Address{}
	if len(addressList) == 0 {
		return addresses
	}

	addressStrings := strings.Split(addressList, ",")
	for _, addressString := range addressStrings {
		addresses = append(addresses, common.HexToAddress(addressString))
	}
	return addresses
}

func ChecksumAddressString(address string) string {
	return common.HexToAddress(address).Hex()
}
