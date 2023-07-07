package schematype

func ArrayAbiTypeToStaticAbiType(schemaType SchemaType) SchemaType {
	return (schemaType - UINT8_ARRAY)
}
