package storecore

import (
	"fmt"
	"strings"
)

// type Schema struct {
// 	Key   *SchemaTypePair `json:"key"`
// 	Field *SchemaTypePair `json:"field"`
// }

type Schema struct {
	Static           []SchemaType `json:"static"`
	Dynamic          []SchemaType `json:"dynamic"`
	StaticDataLength uint64       `json:"static_data_length"`
}

func (schema *Schema) String() string {
	return fmt.Sprintf("static: %v, dynamic: %v, static data length: %v",
		schema.Static,
		schema.Dynamic,
		schema.StaticDataLength,
	)
}

type DataWithSchemaType struct {
	Data       interface{}
	SchemaType SchemaType
}

func (d *DataWithSchemaType) String() string {
	return fmt.Sprintf("data: %v, schema type: %v", d.Data, d.SchemaType)
}

type DecodedData struct {
	values []*DataWithSchemaType
	types  []SchemaType
}

func (d *DecodedData) String() string {
	var sb strings.Builder
	sb.WriteString("DecodedData: [\n")
	for _, v := range d.values {
		sb.WriteString(fmt.Sprintf("\t%v\n", v))
	}
	for _, t := range d.types {
		sb.WriteString(fmt.Sprintf("\t%v\n", t))
	}
	sb.WriteString("]")
	return sb.String()
}
