package protocolparser

func HexToTableSchema(data string) TableSchema {
	valueSchema := HexToSchema(HexSlice(data, 0, 32))
	keySchema := HexToSchema(HexSlice(data, 32, 64))

	return TableSchema{
		KeySchema:   keySchema,
		ValueSchema: valueSchema,
	}
}
