package mode

import "latticexyz/mud/packages/services/protobuf/go/mode"

func (table *GenericTable) SetRows(rows []*mode.Row) {
	table.Rows = rows
}

func (table *GenericTable) SetCols(cols []string) {
	table.Cols = cols
}

func (table *GenericTable) SetTypes(types []string) {
	table.Types = types
}

func (table *GenericTable) ToQueryLayerResponse() *mode.QueryLayerResponse {
	return &mode.QueryLayerResponse{
		Rows:  table.Rows,
		Cols:  table.Cols,
		Types: table.Types,
	}
}
