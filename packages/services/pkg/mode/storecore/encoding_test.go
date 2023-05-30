package storecore

import (
	"testing"

	"github.com/ethereum/go-ethereum/common/hexutil"
)

func TestDecodeData(t *testing.T) {
	encoding := "0x000000000000ac000000000c00000000a00000000000000000000000000000004d6573736167655461626c65000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000"
	schemaTypePair := SchemaTypePair{
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
	expectedValues := []DataSchemaType__Struct{
		{
			Data:       "MessageTable",
			SchemaType: STRING,
		},
		{
			Data:       "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000",
			SchemaType: BYTES,
		},
	}

	decodedData := DecodeData(hexutil.MustDecode(encoding), schemaTypePair)

	if decodedData.Length() != schemaTypePair.Length() {
		t.Errorf("Expected length to be %d, got %d", schemaTypePair.Length(), decodedData.Length())
	}
	for i := 0; i < decodedData.Length(); i++ {
		if decodedData.types[i] != expectedTypes[i] {
			t.Errorf("Expected type to be %s, got %s", expectedTypes[i], decodedData.types[i])
		}
		if decodedData.values[i].Data.(string) != expectedValues[i].Data.(string) {
			t.Errorf("Expected value to be %s, got %s", expectedValues[i].Data.(string), decodedData.values[i].Data.(string))
		}
		if decodedData.values[i].SchemaType != expectedValues[i].SchemaType {
			t.Errorf("Expected schema type to be %s, got %s", expectedValues[i].SchemaType, decodedData.values[i].SchemaType)
		}
	}
}

func TestDecodeKeyData(t *testing.T) {
	encoding := "0x000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000001"
	encodingBytes := hexutil.MustDecode(encoding)
	var key [][32]byte
	for i := 0; i < len(encodingBytes); i += 32 {
		var temp [32]byte
		copy(temp[:], encodingBytes[i:i+32])
		key = append(key, temp)
	}

	schemaTypePair := SchemaTypePair{
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
	expectedValues := []DataSchemaType__Struct{
		{
			Data:       uint32(12),
			SchemaType: UINT32,
		},
		{
			Data:       uint32(1),
			SchemaType: UINT32,
		},
	}

	decodedData := DecodeKeyData(key, schemaTypePair)

	if decodedData.Length() != schemaTypePair.Length() {
		t.Errorf("Expected length to be %d, got %d", schemaTypePair.Length(), decodedData.Length())
	}
	for i := 0; i < decodedData.Length(); i++ {
		if decodedData.types[i] != expectedTypes[i] {
			t.Errorf("Expected type to be %s, got %s", expectedTypes[i], decodedData.types[i])
		}
		if decodedData.values[i].Data.(uint32) != expectedValues[i].Data.(uint32) {
			t.Errorf("Expected value to be %d, got %d", expectedValues[i].Data.(uint32), decodedData.values[i].Data.(uint32))
		}
		if decodedData.values[i].SchemaType != expectedValues[i].SchemaType {
			t.Errorf("Expected schema type to be %s, got %s", expectedValues[i].SchemaType, decodedData.values[i].SchemaType)
		}
	}
}
