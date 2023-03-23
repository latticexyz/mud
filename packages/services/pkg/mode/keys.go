package mode

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"github.com/ethereum/go-ethereum/common/hexutil"
)

// AggregateKey concatenates the elements of the provided byte arrays into a single byte array.
// It returns the concatenated byte array.
//
// Parameters:
//   - key ([][32]byte): The byte array to concatenate.
//
// Returns:
//   - ([]byte): The concatenated byte array.
func AggregateKey(key [][32]byte) []byte {
	aggregateKey := []byte{}
	for _, keyElement := range key {
		aggregateKey = append(aggregateKey, keyElement[:]...)
	}
	return aggregateKey
}

// KeyElementToString encodes the given byte array into a hexadecimal string.
// It returns the encoded hexadecimal string.
//
// Parameters:
//   - keyElement ([32]byte): The byte array to encode.
//
// Returns:
//   - (string): The hexadecimal string encoded from the provided byte array.
func KeyElementToString(keyElement [32]byte) string {
	return hexutil.Encode(keyElement[:])
}

// KeyToString encodes each byte array element into a hexadecimal string and stores them in a slice.
// It returns the slice of hexadecimal encoded strings.
//
// Parameters:
//   - keys ([][32]byte): The byte arrays to encode.
//
// Returns:
//   - ([]string): The slice of hexadecimal encoded strings.
func KeyToString(keys [][32]byte) []string {
	strings := make([]string, len(keys))
	for i, key := range keys {
		strings[i] = KeyElementToString(key)
	}
	return strings
}

// KeyToFilter converts the given byte array keys into filter objects for use in queries.
// It returns a slice of filter objects, one for each key name in the tableSchema.
//
// Parameters:
//   - tableSchema (*TableSchema): A pointer to the schema of the table containing the keys.
//   - key ([][32]byte): The byte array keys to convert.
//
// Returns:
//   - ([]*pb_mode.Filter): A slice of filter objects.
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
