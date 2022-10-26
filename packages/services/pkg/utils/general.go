package utils

import (
	"latticexyz/mud/packages/services/pkg/logger"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"go.uber.org/zap"
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
		entityIdBigInt, err := hexutil.DecodeBig(str)
		if err != nil {
			logger.GetLogger().Error("can't parse entity ID", zap.String("string", str), zap.Error(err))
		}
		bytesArray = append(bytesArray, entityIdBigInt.Bytes())
	}
	return bytesArray
}
