package protocolparser

import (
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common/hexutil"
)

func HexSlice(hex string, start int, end int) string {
	return "0x" + strings.ReplaceAll(hex, "0x", "")[start*2:end*2]
}

func HexSliceFrom(hex string, start int) string {
	return "0x" + strings.ReplaceAll(hex, "0x", "")[start*2:]
}

func HexToNumber(hex string) int {
	b := hexutil.MustDecode(hex)
	i := new(big.Int).SetBytes(b)
	return int(i.Int64())
}

func BigIntFromString(str string) *big.Int {
	b, err := new(big.Int).SetString(str, 10)
	if !err {
		panic(err)
	}
	return b
}

func SchemaTypesToStringTypes(types []schematype.SchemaType) []string {
	strs := []string{}
	for _, t := range types {
		strs = append(strs, strings.ToLower(t.String()))
	}
	return strs
}
