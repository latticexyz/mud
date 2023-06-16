package mode

import (
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
// It returns a map of filter objects, one for each key name in the tableSchema.
//
// Parameters:
//   - key ([][32]byte): The byte array keys to convert.
//   - tableSchema (*TableSchema): A pointer to the schema of the table containing the keys.
//
// Returns:
//   - (map[string]interface{}): A map of filter objects.
func (table *Table) KeyToFilter(key [][32]byte) map[string]interface{} {
	// First decode the key data so that it's easier to work with.
	decodedKeyData := table.StoreCoreKeySchema.DecodeKeyData(key)

	filter := make(map[string]interface{})

	for idx, keyName := range table.KeyNames {
		filter[keyName] = decodedKeyData.GetData(idx)
	}
	return filter
}
