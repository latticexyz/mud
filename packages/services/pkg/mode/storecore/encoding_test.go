package storecore_test

import (
	. "latticexyz/mud/packages/services/pkg/mode/storecore"
	"testing"

	"github.com/ethereum/go-ethereum/common/hexutil"
)

func TestDecodeData(t *testing.T) {
	//nolint:lll // test
	encoding := "0x00000000000000000000000000000000000000a0000000000c000000000000ac4d6573736167655461626c65000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000"
	schema := &Schema{
		Static: []SchemaType{},
		Dynamic: []SchemaType{
			STRING,
			BYTES,
		},
		StaticDataLength: 0,
	}
	expectedTypes := []SchemaType{
		STRING,
		BYTES,
	}
	expectedValues := []DataWithSchemaType{
		{
			Data:       "MessageTable",
			SchemaType: STRING,
		},
		{
			//nolint:lll // test
			Data:       "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000",
			SchemaType: BYTES,
		},
	}

	decodedData := schema.DecodeFieldData(hexutil.MustDecode(encoding))

	if decodedData.Length() != schema.Length() {
		t.Errorf("Expected length to be %d, got %d", schema.Length(), decodedData.Length())
	}
	for i := 0; i < decodedData.Length(); i++ {
		if decodedData.Types()[i] != expectedTypes[i] {
			t.Errorf("Expected type to be %s, got %s", expectedTypes[i], decodedData.Types()[i])
		}
		if decodedData.Values()[i].Data.(string) != expectedValues[i].Data.(string) {
			t.Errorf("Expected value to be %s, got %s", expectedValues[i].Data.(string), decodedData.Values()[i].Data.(string))
		}
		if decodedData.Values()[i].SchemaType != expectedValues[i].SchemaType {
			t.Errorf("Expected schema type to be %s, got %s", expectedValues[i].SchemaType, decodedData.Values()[i].SchemaType)
		}
	}
}

func TestDecodeKeyData(t *testing.T) {
	//nolint:lll // test
	encoding := "0x000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000001"
	encodingBytes := hexutil.MustDecode(encoding)
	var key [][32]byte
	for i := 0; i < len(encodingBytes); i += 32 {
		var temp [32]byte
		copy(temp[:], encodingBytes[i:i+32])
		key = append(key, temp)
	}

	schema := &Schema{
		Static: []SchemaType{
			UINT32,
			UINT32,
		},
		Dynamic:          []SchemaType{},
		StaticDataLength: 8,
	}
	expectedTypes := []SchemaType{
		UINT32,
		UINT32,
	}
	expectedValues := []DataWithSchemaType{
		{
			Data:       uint32(12),
			SchemaType: UINT32,
		},
		{
			Data:       uint32(1),
			SchemaType: UINT32,
		},
	}

	decodedData := schema.DecodeKeyData(key)

	if decodedData.Length() != schema.Length() {
		t.Errorf("Expected length to be %d, got %d", schema.Length(), decodedData.Length())
	}
	for i := 0; i < decodedData.Length(); i++ {
		if decodedData.Types()[i] != expectedTypes[i] {
			t.Errorf("Expected type to be %s, got %s", expectedTypes[i], decodedData.Types()[i])
		}
		if decodedData.Values()[i].Data.(uint32) != expectedValues[i].Data.(uint32) {
			t.Errorf("Expected value to be %d, got %d", expectedValues[i].Data.(uint32), decodedData.Values()[i].Data.(uint32))
		}
		if decodedData.Values()[i].SchemaType != expectedValues[i].SchemaType {
			t.Errorf("Expected schema type to be %s, got %s", expectedValues[i].SchemaType, decodedData.Values()[i].SchemaType)
		}
	}
}
