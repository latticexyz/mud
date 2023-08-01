package protocolparser_test

import (
	"testing"

	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
)

func TestSchemaIndexToAbiType(t *testing.T) {
	schema := protocolparser.Schema{
		StaticFields: []schematype.SchemaType{
			schematype.UINT8,
			schematype.UINT16,
			schematype.UINT32,
		},
		DynamicFields: []schematype.SchemaType{
			schematype.STRING,
			schematype.BYTES,
		},
	}
	tests := []struct {
		schemaIndex int
		want        schematype.SchemaType
	}{
		{0, schematype.UINT8},
		{1, schematype.UINT16},
		{2, schematype.UINT32},
		{3, schematype.STRING},
		{4, schematype.BYTES},
	}

	for _, test := range tests {
		got := protocolparser.SchemaIndexToAbiType(schema, test.schemaIndex)
		if got != test.want {
			t.Errorf("SchemaIndexToAbiType(%v, %v) = %v, want %v", schema, test.schemaIndex, got, test.want)
		}
	}
}
