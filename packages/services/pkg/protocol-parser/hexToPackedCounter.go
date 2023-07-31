package protocolparser

import (
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"

	"github.com/andriidski/abiencode-go/convert"
)

type PackedCounter struct {
	TotalByteLength  uint64
	FieldByteLengths []uint64
}

func HexToPackedCounter(data string) PackedCounter {
	if len(data) != 66 {
		panic(ErrInvalidHexLengthForPackedCounter)
	}

	totalByteLength := DecodeStaticField(schematype.UINT56, HexSlice(data, 0, 7)).(uint64)
	fieldByteLengths := convert.ToUint64Array(DecodeDynamicField(schematype.UINT40_ARRAY, HexSliceFrom(data, 7)))

	summedLength := new(big.Int)
	for _, length := range fieldByteLengths {
		summedLength.Add(summedLength, new(big.Int).SetUint64(length))
	}
	if summedLength.Cmp(new(big.Int).SetUint64(totalByteLength)) != 0 {
		panic(ErrPackedCounterLengthMismatch)
	}

	return PackedCounter{
		TotalByteLength:  totalByteLength,
		FieldByteLengths: fieldByteLengths,
	}
}
