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
