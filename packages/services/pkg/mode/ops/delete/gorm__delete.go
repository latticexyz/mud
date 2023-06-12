package delete

import "latticexyz/mud/packages/services/pkg/mode"

type Gorm__DeleteRequest struct {
	Table  string
	Filter map[string]interface{}
}

type gorm__DeleteBuilder struct {
	Request     *Gorm__DeleteRequest
	TableSchema *mode.TableSchema
}

func Gorm__NewUpdateBuilder(request *Gorm__DeleteRequest, tableSchema *mode.TableSchema) *gorm__DeleteBuilder {
	return &gorm__DeleteBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *gorm__DeleteBuilder) Table() string {
	return builder.Request.Table
}
