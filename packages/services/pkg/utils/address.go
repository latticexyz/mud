package utils

import (
	"strings"

	"github.com/ethereum/go-ethereum/common"
)

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
