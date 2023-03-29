package storecore

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

func Mudstore__SchemaTableId() string {
	return "0x" + common.Bytes2Hex(append(RightPadId("mudstore"), RightPadId("schema")...))
}

func Mudstore__MetadataTableId() string {
	return "0x" + common.Bytes2Hex(append(RightPadId("mudstore"), RightPadId("StoreMetadata")...))
}

func Mudstore__SchemaTableName() string {
	return "mudstore__schema"
}

func Mudstore__MetadataTableName() string {
	return "mudstore__storemetadata"
}

func RightPadId(id string) []byte {
	return common.RightPadBytes([]byte(id), 16)
}

func PaddedTableId(id *big.Int) string {
	return "0x" + common.Bytes2Hex(common.LeftPadBytes(id.Bytes(), 32))
}
