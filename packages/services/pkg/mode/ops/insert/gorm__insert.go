package insert

import (
	"latticexyz/mud/packages/services/pkg/mode"
)

type Gorm__InsertRequest struct {
	Into string
	Row  map[string]interface{}
}

type gorm__InsertBuilder struct {
	Request     *Gorm__InsertRequest
	TableSchema *mode.TableSchema
}

func Gorm__NewInsertBuilder(request *Gorm__InsertRequest, tableSchema *mode.TableSchema) *gorm__InsertBuilder {
	return &gorm__InsertBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *gorm__InsertBuilder) BuildRecord() (interface{}, error) {
	// Build a record from the row.
	record, err := mode.BuildRecord(builder.Request.Row, builder.TableSchema)
	if err != nil {
		return nil, err
	}
	return record, nil
}

func (builder *gorm__InsertBuilder) Table() string {
	return builder.Request.Into
}
