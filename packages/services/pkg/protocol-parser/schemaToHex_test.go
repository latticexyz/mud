package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	. "latticexyz/mud/packages/services/pkg/schema-type"
	"testing"
)

func TestSchemaToHex(t *testing.T) {
	schemas := []protocolparser.Schema{
		{
			StaticFields: []SchemaType{
				BOOL,
			},
			DynamicFields: []SchemaType{},
		},
		{
			StaticFields: []SchemaType{
				BOOL,
			},
			DynamicFields: []SchemaType{
				BOOL_ARRAY,
			},
		},
		{
			StaticFields: []SchemaType{
				BYTES32,
				INT32,
			},
			DynamicFields: []SchemaType{
				UINT256_ARRAY,
				ADDRESS_ARRAY,
				BYTES,
				STRING,
			},
		},
	}

	expectedHexes := []string{
		"0x0001010060000000000000000000000000000000000000000000000000000000",
		"0x0001010160c20000000000000000000000000000000000000000000000000000",
		"0x002402045f2381c3c4c500000000000000000000000000000000000000000000",
	}

	for i, schema := range schemas {
		hex := protocolparser.SchemaToHex(schema)
		if hex != expectedHexes[i] {
			t.Errorf("Expected hex to be %s, got %s", expectedHexes[i], hex)
		}
	}
}
