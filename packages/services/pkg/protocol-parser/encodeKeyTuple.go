package protocolparser

import (
	schematype "latticexyz/mud/packages/services/pkg/schema-type"

	"github.com/andriidski/abiencode-go/abi"
)

func EncodeKeyTuple(keySchema Schema, keyTuple []interface{}) []string {
	encodings := []string{}
	for i, key := range keyTuple {
		encodings = append(encodings, abi.Encode(
			SchemaTypesToStringTypes([]schematype.SchemaType{keySchema.StaticFields[i]}),
			[]interface{}{key},
		))
	}
	return encodings
}
