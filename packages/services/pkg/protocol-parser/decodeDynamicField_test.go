package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"reflect"
	"testing"

	"github.com/andriidski/abiencode-go/convert"
	"github.com/ethereum/go-ethereum/common"
)

func TestDecodeDynamicFieldBoolArray(t *testing.T) {
	boolArrayData := []string{
		"0x00",
		"0x01",
		"0x0000",
		"0x0001",
		"0x0100",
		"0x0101",
	}
	expectedDecodedData := [][]bool{
		{false},
		{true},
		{false, false},
		{false, true},
		{true, false},
		{true, true},
	}
	for i, data := range boolArrayData {
		decodedData := convert.ToBoolArray(protocolparser.DecodeDynamicField(schematype.BOOL_ARRAY, data))

		if !reflect.DeepEqual(decodedData, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeDynamicFieldUint8Array(t *testing.T) {
	uint8ArrayData := []string{
		"0x00",
		"0x01",
		"0xff",
		"0x0000",
		"0x0001",
		"0x00ff",
		"0x0100",
		"0x0101",
		"0x01ff",
		"0xff00",
		"0xff01",
		"0xffff",
	}
	expectedDecodedData := [][]uint8{
		{0},
		{1},
		{255},
		{0, 0},
		{0, 1},
		{0, 255},
		{1, 0},
		{1, 1},
		{1, 255},
		{255, 0},
		{255, 1},
		{255, 255},
	}
	for i, data := range uint8ArrayData {
		decodedData := convert.ToUint8Array(protocolparser.DecodeDynamicField(schematype.UINT8_ARRAY, data))

		if !reflect.DeepEqual(decodedData, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeDynamicFieldUint256Array(t *testing.T) {
	uint256Data := []string{
		"0x0000000000000000000000000000000000000000000000000000000000000001",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
		"0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe",
		"0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
	}

	expectedDecodedData := [][]*big.Int{
		{big.NewInt(1)},
		{protocolparser.BigIntFromString("115792089237316195423570985008687907853269984665640564039457584007913129639935")},
		{protocolparser.BigIntFromString("115792089237316195423570985008687907853269984665640564039457584007913129639934")},
		{big.NewInt(1), big.NewInt(1)},
		{
			protocolparser.BigIntFromString("115792089237316195423570985008687907853269984665640564039457584007913129639935"),
			protocolparser.BigIntFromString("115792089237316195423570985008687907853269984665640564039457584007913129639935"),
		},
	}

	for i, data := range uint256Data {
		decodedData := convert.ToUint256Array(protocolparser.DecodeDynamicField(schematype.UINT256_ARRAY, data))

		if !reflect.DeepEqual(decodedData, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeDynamicFieldInt8Array(t *testing.T) {
	int8ArrayData := []string{
		"0x00",
		"0x01",
		"0x7f",
		"0x80",
		"0x81",
		"0xff",
		"0x0000",
		"0x0100",
		"0x007f",
		"0x8080",
		"0x8181",
		"0x00ff",
	}
	expectedDecodedData := [][]int8{
		{0},
		{1},
		{127},
		{-128},
		{-127},
		{-1},
		{0, 0},
		{1, 0},
		{0, 127},
		{-128, -128},
		{-127, -127},
		{0, -1},
	}
	for i, data := range int8ArrayData {
		decodedData := convert.ToInt8Array(protocolparser.DecodeDynamicField(schematype.INT8_ARRAY, data))

		if !reflect.DeepEqual(decodedData, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeDynamicFieldInt256Array(t *testing.T) {
	int256ArrayData := []string{
		"0x0000000000000000000000000000000000000000000000000000000000000000",
		"0x0000000000000000000000000000000000000000000000000000000000000001",
		"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
		"0x8000000000000000000000000000000000000000000000000000000000000000",
		"0x8000000000000000000000000000000000000000000000000000000000000001",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
		"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
		"0x80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8000000000000000000000000000000000000000000000000000000000000001",
	}

	expectedDecodedData := [][]*big.Int{
		{big.NewInt(0)},
		{big.NewInt(1)},
		{protocolparser.BigIntFromString("57896044618658097711785492504343953926634992332820282019728792003956564819967")},
		{protocolparser.BigIntFromString("-57896044618658097711785492504343953926634992332820282019728792003956564819968")},
		{protocolparser.BigIntFromString("-57896044618658097711785492504343953926634992332820282019728792003956564819967")},
		{big.NewInt(-1)},
		{
			protocolparser.BigIntFromString("57896044618658097711785492504343953926634992332820282019728792003956564819967"),
			big.NewInt(-1),
		},
		{
			protocolparser.BigIntFromString("-57896044618658097711785492504343953926634992332820282019728792003956564819968"),
			big.NewInt(0),
		},
		{
			big.NewInt(-1),
			protocolparser.BigIntFromString("-57896044618658097711785492504343953926634992332820282019728792003956564819967"),
		},
	}

	for i, data := range int256ArrayData {
		decodedData := convert.ToInt256Array(protocolparser.DecodeDynamicField(schematype.INT256_ARRAY, data))

		for j := range decodedData {
			if decodedData[j].Cmp(expectedDecodedData[i][j]) != 0 {
				t.Errorf("expected value %d, got %d", expectedDecodedData[i][j], decodedData[j])
				t.Errorf("expected array %v, got %v", expectedDecodedData[i], decodedData)
			}
		}
	}
}

func TestDecodeDynamicFieldBytesArray(t *testing.T) {
	bytesArrayData := "0x01"
	expectedDecodedData := [][]byte{
		{1},
	}
	decodedData := convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES1_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0x0001"
	expectedDecodedData = [][]byte{
		{0},
		{1},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES1_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0x0001"
	expectedDecodedData = [][]byte{
		{0, 1},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES2_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0xff00ff00ff00ff00"
	expectedDecodedData = [][]byte{
		{255, 0, 255, 0, 255, 0, 255, 0},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES8_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0xff00ff00ff00ff00"
	expectedDecodedData = [][]byte{
		{255},
		{0},
		{255},
		{0},
		{255},
		{0},
		{255},
		{0},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES1_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0xff00ff00ff00ff00"
	expectedDecodedData = [][]byte{
		{255, 0},
		{255, 0},
		{255, 0},
		{255, 0},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES2_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0xff00ff00ff00ff00"
	expectedDecodedData = [][]byte{
		{255, 0, 255, 0},
		{255, 0, 255, 0},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES4_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0x0000000000000000000000000000000000000000000000000000000000000001"
	expectedDecodedData = [][]byte{
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{0},
		{1},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES1_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	expectedDecodedData = [][]byte{
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES32_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	bytesArrayData = "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
	expectedDecodedData = [][]byte{
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	}
	decodedData = convert.ToBytesArray(protocolparser.DecodeDynamicField(schematype.BYTES32_ARRAY, bytesArrayData))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}
}

func TestDecodeDynamicFieldAddressArray(t *testing.T) {
	addressArrayData := []string{
		"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
	}
	expectedDecodedData := []common.Address{
		common.HexToAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
	}
	decodedData := convert.ToAddressArray(protocolparser.DecodeDynamicField(schematype.ADDRESS_ARRAY, addressArrayData[0]))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}

	addressArrayData = []string{
		"0xffffffffffffffffffffffffffffffffffffffff",
	}
	expectedDecodedData = []common.Address{
		common.HexToAddress("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF"),
	}
	decodedData = convert.ToAddressArray(protocolparser.DecodeDynamicField(schematype.ADDRESS_ARRAY, addressArrayData[0]))

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %v, got %v", expectedDecodedData, decodedData)
	}
}

func TestDecodeDynamicFieldBytes(t *testing.T) {
	bytesData := []string{
		"0x",
		"0x00",
		"0x01",
		"0x0001",
		"0xff00ff00ff00ff00",
		"0x0000000000000000000000000000000000000000000000000000000000000001",
	}

	expectedDecodedData := [][]byte{
		{},
		{0},
		{1},
		{0, 1},
		{255, 0, 255, 0, 255, 0, 255, 0},
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	}

	for i, data := range bytesData {
		decodedData := protocolparser.DecodeDynamicField(schematype.BYTES, data)

		if !reflect.DeepEqual(decodedData, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeDynamicFieldString(t *testing.T) {
	stringData := []string{
		"0x",
		"0x68656c6c6f",
	}

	expectedDecodedData := []string{
		"",
		"hello",
	}

	for i, data := range stringData {
		decodedData := protocolparser.DecodeDynamicField(schematype.STRING, data)

		if !reflect.DeepEqual(decodedData, expectedDecodedData[i]) {
			t.Errorf("expected %v, got %v", expectedDecodedData[i], decodedData)
		}
	}
}
