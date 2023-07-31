package protocolparser

import (
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
)

func HexToSchema(data string) Schema {
	if len(data) != 66 {
		panic(ErrInvalidHexLengthForSchema)
	}

	staticDataLength := HexToNumber(HexSlice(data, 0, 2))
	numStaticFields := HexToNumber(HexSlice(data, 2, 3))
	numDynamicFields := HexToNumber(HexSlice(data, 3, 4))

	staticFields := []schematype.SchemaType{}
	dynamicFields := []schematype.SchemaType{}

	for i := 4; i < 4+numStaticFields; i++ {
		staticFields = append(staticFields, schematype.SchemaType(HexToNumber(HexSlice(data, i, i+1))))
	}
	for i := 4 + numStaticFields; i < 4+numStaticFields+numDynamicFields; i++ {
		dynamicFields = append(dynamicFields, schematype.SchemaType(HexToNumber(HexSlice(data, i, i+1))))
	}

	// Validate static data length
	actualStaticData := 0
	for _, field := range staticFields {
		actualStaticData += schematype.StaticAbiTypeToByteLength(field)
	}
	if actualStaticData != staticDataLength {
		panic(ErrSchemaStaticLengthMismatch)
	}

	return Schema{
		StaticFields:  staticFields,
		DynamicFields: dynamicFields,
	}
}
