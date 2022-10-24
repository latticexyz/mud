package utils

import (
	"github.com/ethereum/go-ethereum/common/hexutil"
)

func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func HexStringArrayToBytesArray(strArray []string) [][]byte {
	bytesArray := [][]byte{}
	for _, str := range strArray {
		_bytes, err := hexutil.Decode(str)
		if err == nil {
			bytesArray = append(bytesArray, _bytes)
		}
	}
	return bytesArray
}
