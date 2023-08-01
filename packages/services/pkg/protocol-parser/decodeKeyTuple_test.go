package protocolparser_test

import (
	"math/big"
	"reflect"
	"testing"

	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	schematype "latticexyz/mud/packages/services/pkg/schema-type"

	"github.com/ethereum/go-ethereum/common"
)

func TestDecodeKeyTupleBool(t *testing.T) {
	schemas := []protocolparser.Schema{
		{
			StaticFields: []schematype.SchemaType{
				schematype.BOOL,
			},
		},
		{
			StaticFields: []schematype.SchemaType{
				schematype.BOOL,
			},
		},
	}
	hexTuples := [][]string{
		{"0x0000000000000000000000000000000000000000000000000000000000000000"},
		{"0x0000000000000000000000000000000000000000000000000000000000000001"},
	}
	expectedDecodedData := [][]interface{}{
		{false},
		{true},
	}

	for i, schema := range schemas {
		decodedData := protocolparser.DecodeKeyTuple(schema, hexTuples[i])
		if decodedData[0].(bool) != expectedDecodedData[i][0] {
			t.Errorf("expected %v, got %v", expectedDecodedData[i][0], decodedData[0])
		}
	}
}

func TestDecodeKeyTupleComplex(t *testing.T) {
	schema := protocolparser.Schema{
		StaticFields: []schematype.SchemaType{
			schematype.UINT256,
			schematype.INT32,
			schematype.BYTES16,
			schematype.ADDRESS,
			schematype.BOOL,
			schematype.INT8,
		},
	}

	hexTuple := []string{
		"0x000000000000000000000000000000000000000000000000000000000000002a",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
		"0x1234000000000000000000000000000000000000000000000000000000000000",
		"0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
		"0x0000000000000000000000000000000000000000000000000000000000000001",
		"0x0000000000000000000000000000000000000000000000000000000000000003",
	}

	expectedDecodedData := []interface{}{
		big.NewInt(42),
		int32(-42),
		[16]byte{0x12, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
		common.HexToAddress("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF"),
		true,
		int8(3),
	}

	decodedData := protocolparser.DecodeKeyTuple(schema, hexTuple)

	for i, data := range decodedData {
		if !reflect.DeepEqual(data, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], data)
		}
	}
}
