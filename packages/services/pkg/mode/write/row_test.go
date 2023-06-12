package write

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"testing"
)

func TestRowFromDecodedData(t *testing.T) {
	schema := &mode.TableSchema{
		TableName: "test",
		KeyNames: []string{
			"key1",
		},
		FieldNames: []string{
			"field1",
			"field2",
		},
		PostgresTypes: map[string]string{
			"key1":   "text",
			"field1": "text",
			"field2": "text",
		},
		SolidityTypes: map[string]string{
			"key1":   "string",
			"field1": "uint32",
			"field2": "uint32",
		},
	}

	decodedKeyData := storecore.NewDecodedDataFromSchemaType([]storecore.SchemaType{
		storecore.STRING,
	})
	decodedKeyData.Add(&storecore.DataSchemaType__Struct{
		Data:       "0x1234",
		SchemaType: storecore.STRING,
	})

	decodedFieldData := storecore.NewDecodedDataFromSchemaType([]storecore.SchemaType{
		storecore.UINT32,
		storecore.UINT32,
	})
	decodedFieldData.Add(&storecore.DataSchemaType__Struct{
		Data:       1,
		SchemaType: storecore.UINT32,
	})
	decodedFieldData.Add(&storecore.DataSchemaType__Struct{
		Data:       2,
		SchemaType: storecore.UINT32,
	})

	row := RowFromDecodedData(decodedKeyData, decodedFieldData, schema)
	if len(row) != 3 {
		t.Errorf("Expected row to have 3 elements, got %d", len(row))
	}

	if row["key1"] != "0x1234" {
		t.Errorf("Expected key1 to be 0x1234, got %s", row["key1"])
	}

	if row["field1"] != 1 {
		t.Errorf("Expected field1 to be 1, got %d", row["field1"])
	}

	if row["field2"] != 2 {
		t.Errorf("Expected field2 to be 2, got %d", row["field2"])
	}
}
