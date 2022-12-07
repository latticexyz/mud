package utils

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/params"
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

func EtherToWei(eth *big.Float) *big.Int {
	truncInt, _ := eth.Int(nil)
	truncInt = new(big.Int).Mul(truncInt, big.NewInt(params.Ether))
	fracStr := strings.Split(fmt.Sprintf("%.18f", eth), ".")[1]
	fracStr += strings.Repeat("0", 18-len(fracStr))
	fracInt, _ := new(big.Int).SetString(fracStr, 10)
	wei := new(big.Int).Add(truncInt, fracInt)
	return wei
}

func EtherToWeiFloatToUint64(eth float64) uint64 {
	return EtherToWei(big.NewFloat(eth)).Uint64()
}
