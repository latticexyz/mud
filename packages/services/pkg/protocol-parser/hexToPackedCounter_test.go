package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	"reflect"
	"testing"
)

func TestHexToPackedCounter(t *testing.T) {
	hex := "0x0000000000000000000000000000400000000020000000002000000000000080"
	expectedCounter := protocolparser.PackedCounter{
		TotalByteLength: uint64(128),
		FieldByteLengths: []uint64{
			uint64(32),
			uint64(32),
			uint64(64),
			uint64(0),
			uint64(0),
		},
	}

	if !reflect.DeepEqual(protocolparser.HexToPackedCounter(hex), expectedCounter) {
		t.Errorf("expected %v, got %v", expectedCounter, protocolparser.HexToPackedCounter(hex))
	}
}

func TestHexToPackedCounterInvalidHexData(t *testing.T) {
	defer func() {
		err := recover().(error)

		if err.Error() != protocolparser.ErrInvalidHexLengthForPackedCounter.Error() {
			t.Fatalf("wrong panic message: %s", err.Error())
		}
	}()

	hex := "0x01234"
	protocolparser.HexToPackedCounter(hex)
	t.Error("expected panic")
}

func TestHexToPackedCounterLengthMismatch(t *testing.T) {
	defer func() {
		err := recover().(error)

		if err.Error() != protocolparser.ErrPackedCounterLengthMismatch.Error() {
			t.Fatalf("wrong panic message: %s", err.Error())
		}
	}()

	hex := "0x0000000000000000000000000000400000000020000000002000000000000040"
	protocolparser.HexToPackedCounter(hex)
	t.Error("expected panic")
}
