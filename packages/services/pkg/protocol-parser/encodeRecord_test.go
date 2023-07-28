package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	. "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"testing"
)

func TestEncodeRecord(t *testing.T) {
	schema := protocolparser.Schema{
		StaticFields: []SchemaType{
			UINT32,
			UINT128,
		},
		DynamicFields: []SchemaType{
			UINT32_ARRAY,
			STRING,
		},
	}

	hex := protocolparser.EncodeRecord(schema, []interface{}{
		uint32(1),
		big.NewInt(2),
		[]interface{}{
			uint32(3),
			uint32(4),
		},
		"some string",
	})
	expectedHex := "0x0000000100000000000000000000000000000002000000000000130000000008000000000b0000000000000000000000000000000000000300000004736f6d6520737472696e67"

	if hex != expectedHex {
		t.Errorf("expected %v, got %v", expectedHex, hex)
	}
}

func TestEncodeRecordNoDynamicFields(t *testing.T) {
	schema := protocolparser.Schema{
		StaticFields: []SchemaType{
			UINT32,
			UINT128,
		},
		DynamicFields: []SchemaType{},
	}

	hex := protocolparser.EncodeRecord(schema, []interface{}{
		uint32(1),
		big.NewInt(2),
	})
	expectedHex := "0x0000000100000000000000000000000000000002"

	if hex != expectedHex {
		t.Errorf("expected %v, got %v", expectedHex, hex)
	}
}
