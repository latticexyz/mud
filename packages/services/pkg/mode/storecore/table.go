package storecore

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

func SchemaTable() string {
	return "0x" + common.Bytes2Hex(append(RightPadId("mudstore"), RightPadId("schema")...))
}

func RightPadId(id string) []byte {
	return common.RightPadBytes([]byte(id), 16)
}

func MetadataTable() string {
	return "0x" + common.Bytes2Hex(append(RightPadId("mudstore"), RightPadId("StoreMetadata")...))
}

func PaddedTableName(id *big.Int) string {
	return "0x" + common.Bytes2Hex(common.LeftPadBytes(id.Bytes(), 32))
}
