package protocolparser_test

import (
	. "latticexyz/mud/packages/services/pkg/protocol-parser"
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"reflect"
	"testing"
)

func TestHexSlice(t *testing.T) {
	hexStrings := []string{
		"0x123456",
		"0x1234567890",
		"0xabcdef1234567890",
	}
	expectedHexStrings := []string{
		"0x12",
		"0x1234",
		"0xabcdef",
	}
	sliceStarts := []int{
		0,
		0,
		0,
	}
	sliceEnds := []int{
		1,
		2,
		3,
	}

	for i, hexString := range hexStrings {
		slice := HexSlice(hexString, sliceStarts[i], sliceEnds[i])
		if slice != expectedHexStrings[i] {
			t.Errorf("Expected slice to be %s, got %s", expectedHexStrings[i], slice)
		}
	}
}

func TestHexSliceFrom(t *testing.T) {
	hexStrings := []string{
		"0x123456",
		"0x1234567890",
	}
	expectedHexStrings := []string{
		"0x56",
		"0x7890",
	}
	sliceStarts := []int{
		2,
		3,
	}
	for i, hexString := range hexStrings {
		slice := HexSliceFrom(hexString, sliceStarts[i])
		if slice != expectedHexStrings[i] {
			t.Errorf("Expected slice to be %s, got %s", expectedHexStrings[i], slice)
		}
	}
}

func TestHexToNumber(t *testing.T) {
	hexNumber := "0x123456"
	expectedNumber := 1193046
	number := HexToNumber(hexNumber)
	if number != expectedNumber {
		t.Errorf("Expected number to be %d, got %d", expectedNumber, number)
	}
}

func TestBigIntFromString(t *testing.T) {
	bigIntStr := "12345678"
	expectedBigInt := big.NewInt(12345678)
	bigInt := BigIntFromString(bigIntStr)
	if bigInt.Cmp(expectedBigInt) != 0 {
		t.Errorf("Expected bigInt to be %d, got %d", expectedBigInt, bigInt)
	}
}

func TestSchemaTypesToStringTypes(t *testing.T) {
	schemaTypes := []schematype.SchemaType{
		schematype.UINT8,
		schematype.INT16,
		schematype.BOOL,
		schematype.ADDRESS,
		schematype.BYTES32,
	}

	expectedStringTypes := []string{
		"uint8",
		"int16",
		"bool",
		"address",
		"bytes32",
	}

	stringTypes := SchemaTypesToStringTypes(schemaTypes)
	if !reflect.DeepEqual(stringTypes, expectedStringTypes) {
		t.Errorf("Expected stringTypes to be %v, got %v", expectedStringTypes, stringTypes)
	}
}
