package protocolparser

import schematype "latticexyz/mud/packages/services/pkg/schema-type"

func DecodeField(schemaType schematype.SchemaType, data string) interface{} {
	if schemaType.IsDynamic() {
		return DecodeDynamicField(schemaType, data)
	} else {
		return DecodeStaticField(schemaType, data)
	}
}
