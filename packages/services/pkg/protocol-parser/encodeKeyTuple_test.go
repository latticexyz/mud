package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	. "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"reflect"
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

func TestEncodeKeyTupleBool(t *testing.T) {
	keySchema := protocolparser.Schema{
		StaticFields: []SchemaType{
			BOOL,
		},
		DynamicFields: []SchemaType{},
	}
	keyTuple := []interface{}{
		false,
	}
	expectedEncoding := []string{
		"0x0000000000000000000000000000000000000000000000000000000000000000",
	}
	encoding := protocolparser.EncodeKeyTuple(keySchema, keyTuple)

	if !reflect.DeepEqual(encoding, expectedEncoding) {
		t.Errorf("expected %v, got %v", expectedEncoding, encoding)
	}
}

func TestEncodeKeyTupleComplex(t *testing.T) {
	keySchema := protocolparser.Schema{
		StaticFields: []SchemaType{
			UINT256,
			INT32,
			BYTES16,
			ADDRESS,
			BOOL,
			INT8,
		},
		DynamicFields: []SchemaType{},
	}
	keyTuple := []interface{}{
		big.NewInt(42),
		int32(-42),
		[16]byte{0x12, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
		common.HexToAddress("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF"),
		true,
		int8(3),
	}
	expectedEncoding := []string{
		"0x000000000000000000000000000000000000000000000000000000000000002a",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
		"0x1234000000000000000000000000000000000000000000000000000000000000",
		"0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
		"0x0000000000000000000000000000000000000000000000000000000000000001",
		"0x0000000000000000000000000000000000000000000000000000000000000003",
	}
	encoding := protocolparser.EncodeKeyTuple(keySchema, keyTuple)

	if !reflect.DeepEqual(encoding, expectedEncoding) {
		t.Errorf("expected %v, got %v", expectedEncoding, encoding)
	}
}
