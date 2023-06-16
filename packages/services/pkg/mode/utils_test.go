package mode_test

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"testing"
)

func MakeTests() []struct {
	tableID   string
	tableName string
} {
	return []struct {
		tableID   string
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

func TestTableIDToTableName(t *testing.T) {
	tests := MakeTests()
	for _, test := range tests {
		tableName := mode.TableIDToTableName(test.tableID)
		if tableName != test.tableName {
			t.Errorf("Expected %s, got %s", test.tableName, tableName)
		}
	}
}

func TestTableNameToTableID(t *testing.T) {
	tests := MakeTests()
	for _, test := range tests {
		tableID := mode.TableNameToTableID(test.tableName)
		if tableID != test.tableID {
			t.Errorf("Expected %s, got %s", test.tableID, tableID)
		}
	}
}
