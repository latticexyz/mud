package schema

import "testing"

var tests = []struct {
	tableId   string
	tableName string
}{
	{
		"0x00000000000000000000000000000000636f756e746572000000000000000000",
		CONNECTOR + "counter",
	},
	{
		"0x6d756473746f72650000000000000000736368656d6100000000000000000000",
		"mudstore" + CONNECTOR + "schema",
	},
}

func TestTableIdToTableName(t *testing.T) {
	for _, test := range tests {
		tableName := TableIdToTableName(test.tableId)
		if tableName != test.tableName {
			t.Errorf("Expected %s, got %s", test.tableName, tableName)
		}
	}
}

func TestTableNameToTableId(t *testing.T) {
	for _, test := range tests {
		tableId := TableNameToTableId(test.tableName)
		if tableId != test.tableId {
			t.Errorf("Expected %s, got %s", test.tableId, tableId)
		}
	}
}
