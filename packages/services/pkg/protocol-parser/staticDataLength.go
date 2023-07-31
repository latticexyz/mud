package protocolparser

import schematype "latticexyz/mud/packages/services/pkg/schema-type"

func StaticDataLength(staticFields []schematype.SchemaType) int {
	var length int
	for _, field := range staticFields {
		length += schematype.StaticAbiTypeToByteLength(field)
	}
	return length
}
