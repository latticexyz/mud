package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	. "latticexyz/mud/packages/services/pkg/schema-type"
	"reflect"
	"testing"
)

func TestAbiTypesToSchema(testing *testing.T) {
	abiTypesList := [][]SchemaType{
		{
			BOOL,
		},
		{
			BOOL,
			BOOL_ARRAY,
		},
		{
			BYTES32,
			INT32,
			UINT256_ARRAY,
			ADDRESS_ARRAY,
			BYTES,
			STRING,
		},
	}

	expectedSchemas := []protocolparser.Schema{
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

	for i, abiTypes := range abiTypesList {
		schema := protocolparser.AbiTypesToSchema(abiTypes)
		if !reflect.DeepEqual(schema, expectedSchemas[i]) {
			testing.Errorf("expected schema to be %v, got %v", expectedSchemas[i], schema)
		}
	}
}
