package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"reflect"
	"testing"

	"github.com/andriidski/abiencode-go/convert"
)

func TestDecodeRecord(t *testing.T) {
	schema := protocolparser.Schema{
		StaticFields: []schematype.SchemaType{
			schematype.UINT32,
			schematype.UINT128,
		},
		DynamicFields: []schematype.SchemaType{
			schematype.UINT32_ARRAY,
			schematype.STRING,
		},
	}

	hex := "0x0000000100000000000000000000000000000002000000000000130000000008000000000b0000000000000000000000000000000000000300000004736f6d6520737472696e67"

	expectedDecodedData := []interface{}{
		uint32(1),
		big.NewInt(2),
		[]uint32{3, 4},
		"some string",
	}

	decodedData := protocolparser.DecodeRecord(schema, hex)
	if decodedData[0].(uint32) != expectedDecodedData[0] {
		t.Errorf("expected %v, got %v", expectedDecodedData[0], decodedData[0])
	}
	if decodedData[1].(*big.Int).Cmp(expectedDecodedData[1].(*big.Int)) != 0 {
		t.Errorf("expected %v, got %v", expectedDecodedData[1], decodedData[1])
	}
	array := convert.ToUint32Array(decodedData[2])
	if !reflect.DeepEqual(array, expectedDecodedData[2]) {
		t.Errorf("expected %v, got %v", expectedDecodedData[2], array)
	}
	if decodedData[3].(string) != expectedDecodedData[3] {
		t.Errorf("expected %v, got %v", expectedDecodedData[3], decodedData[3])
	}
}
