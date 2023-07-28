package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	. "latticexyz/mud/packages/services/pkg/schema-type"
	"reflect"
	"testing"
)

func TestHexToSchema(t *testing.T) {
	hexes := []string{
		"0x0001010060000000000000000000000000000000000000000000000000000000",
		"0x0001010160c20000000000000000000000000000000000000000000000000000",
		"0x002402045f2381c3c4c500000000000000000000000000000000000000000000",
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

	for i, hex := range hexes {
		schema := protocolparser.HexToSchema(hex)
		if !reflect.DeepEqual(schema.StaticFields, expectedSchemas[i].StaticFields) {
			t.Errorf("Expected static fields to be %v, got %v", expectedSchemas[i].StaticFields, schema.StaticFields)
		}
		if !reflect.DeepEqual(schema.DynamicFields, expectedSchemas[i].DynamicFields) {
			t.Errorf("Expected dynamic fields to be %v, got %v", expectedSchemas[i].DynamicFields, schema.DynamicFields)
		}
	}
}

func TestHexToSchemaInvalidLength(t *testing.T) {
	defer func() {
		err := recover().(error)

		if err.Error() != protocolparser.ErrInvalidHexLengthForSchema.Error() {
			t.Fatalf("wrong panic message: %s", err.Error())
		}
	}()

	schemaHex := "0x002502045f2381c3c4c5"
	schema := protocolparser.HexToSchema(schemaHex)
	t.Errorf("expected to panic, got %v", schema)
}

func TestHexToSchemaStaticLengthMismatch(t *testing.T) {
	defer func() {
		err := recover().(error)

		if err.Error() != protocolparser.ErrSchemaStaticLengthMismatch.Error() {
			t.Fatalf("wrong panic message: %s", err.Error())
		}
	}()

	schemaHex := "0x002502045f2381c3c4c500000000000000000000000000000000000000000000"
	schema := protocolparser.HexToSchema(schemaHex)
	t.Errorf("expected to panic, got %v", schema)
}
