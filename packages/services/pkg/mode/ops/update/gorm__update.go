package update

import "latticexyz/mud/packages/services/pkg/mode"

type Gorm__UpdateRequest struct {
	Table  string
	Row    map[string]interface{}
	Filter map[string]interface{}
}

type gorm__UpdateBuilder struct {
	Request     *Gorm__UpdateRequest
	TableSchema *mode.TableSchema
}

func Gorm__NewUpdateBuilder(request *Gorm__UpdateRequest, tableSchema *mode.TableSchema) *gorm__UpdateBuilder {
	return &gorm__UpdateBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *gorm__UpdateBuilder) BuildRecord() (interface{}, error) {
	// Build a record from the row.
	record, err := mode.BuildRecord(builder.Request.Row, builder.TableSchema)
	if err != nil {
		return nil, err
	}
	return record, nil
}

func (builder *gorm__UpdateBuilder) Table() string {
	return builder.Request.Table
}
