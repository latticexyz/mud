package mode

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"github.com/ethereum/go-ethereum/common/hexutil"
)

func AggregateKey(key [][32]byte) []byte {
	aggregateKey := []byte{}
	for _, keyElement := range key {
		aggregateKey = append(aggregateKey, keyElement[:]...)
	}
	return aggregateKey
}

func KeyElementToString(key [32]byte) string {
	return hexutil.Encode(key[:])
}

func KeyToString(keys [][32]byte) []string {
	strings := make([]string, len(keys))
	for i, key := range keys {
		strings[i] = KeyElementToString(key)
	}
	return strings
}

func KeyToFilter(tableSchema *TableSchema, key [][32]byte) []*pb_mode.Filter {
	// First decode the key data so that it's easier to work with.
	aggregateKey := AggregateKey(key)
	decodedKeyData := storecore.DecodeData(aggregateKey, *tableSchema.StoreCoreSchemaTypeKV.Key)

	filters := []*pb_mode.Filter{}

	for idx, key_name := range tableSchema.KeyNames {
		filters = append(filters, &pb_mode.Filter{
			Field: &pb_mode.Field{
				TableName:  tableSchema.TableName,
				TableField: key_name,
			},
			Operator: "=",
			Value:    decodedKeyData.DataAt(idx),
		})
	}
	return filters
}
