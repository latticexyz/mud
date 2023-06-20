package mode_test

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"testing"
)

func MakeTests() []struct {
	tableId   string
	tableName string
} {
	return []struct {
		tableId   string
		tableName string
	}{
		{
			"0x00000000000000000000000000000000636f756e746572000000000000000000",
			mode.CONNECTOR + "counter",
		},
		{
			"0x6d756473746f72650000000000000000736368656d6100000000000000000000",
			"mudstore" + mode.CONNECTOR + "schema",
		},
	}
}

func TestTableIdToTableName(t *testing.T) {
	tests := MakeTests()
	for _, test := range tests {
		tableName := mode.TableIdToTableName(test.tableId)
		if tableName != test.tableName {
			t.Errorf("Expected %s, got %s", test.tableName, tableName)
		}
	}
}

func TestTableNameToTableId(t *testing.T) {
	tests := MakeTests()
	for _, test := range tests {
		tableId := mode.TableNameToTableId(test.tableName)
		if tableId != test.tableId {
			t.Errorf("Expected %s, got %s", test.tableId, tableId)
		}
	}
}
