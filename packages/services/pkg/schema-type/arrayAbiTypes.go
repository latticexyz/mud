package schematype

func ArrayAbiTypeToStaticAbiType(schemaType SchemaType) SchemaType {
	// Check that the type is actually an array type.
	if schemaType < UINT8_ARRAY || schemaType > ADDRESS_ARRAY {
		panic("got non-array type: " + schemaType.String())
	}
	return (schemaType - UINT8_ARRAY)
}
