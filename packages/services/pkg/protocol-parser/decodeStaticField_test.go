package protocolparser_test

import (
	protocolparser "latticexyz/mud/packages/services/pkg/protocol-parser"
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"math/big"
	"reflect"
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

func TestDecodeStaticFieldBool(t *testing.T) {
	if protocolparser.DecodeStaticField(schematype.BOOL, "0x00") != false {
		t.Error("expected false")
	}
	if protocolparser.DecodeStaticField(schematype.BOOL, "0x01") != true {
		t.Error("expected true")
	}
}

func TestDecodeStaticFieldUint8(t *testing.T) {
	uint8Data := []string{
		"0x00",
		"0x01",
		"0xff",
	}

	expectedDecodedData := []uint8{
		uint8(0),
		uint8(1),
		uint8(255),
	}

	for i, data := range uint8Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT8, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}

}

func TestDecodeStaticFieldUint16(t *testing.T) {
	uint16Data := []string{
		"0x0000",
		"0x0001",
		"0xffff",
	}

	expectedDecodedData := []uint16{
		uint16(0),
		uint16(1),
		uint16(65535),
	}

	for i, data := range uint16Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT16, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint24(t *testing.T) {
	uint24Data := []string{
		"0x000000",
		"0x000001",
		"0xffffff",
	}

	expectedDecodedData := []uint32{
		uint32(0),
		uint32(1),
		uint32(16777215),
	}

	for i, data := range uint24Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT24, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint32(t *testing.T) {
	uint32Data := []string{
		"0x00000000",
		"0x00000001",
		"0xffffffff",
	}

	expectedDecodedData := []uint32{
		uint32(0),
		uint32(1),
		uint32(4294967295),
	}

	for i, data := range uint32Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT32, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint40(t *testing.T) {
	uint40Data := []string{
		"0x0000000000",
		"0x0000000001",
		"0xffffffffff",
	}

	expectedDecodedData := []uint64{
		uint64(0),
		uint64(1),
		uint64(1099511627775),
	}

	for i, data := range uint40Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT40, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint48(t *testing.T) {
	uint48Data := []string{
		"0x000000000000",
		"0x000000000001",
		"0xffffffffffff",
	}

	expectedDecodedData := []uint64{
		uint64(0),
		uint64(1),
		uint64(281474976710655),
	}

	for i, data := range uint48Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT48, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint56(t *testing.T) {
	uint56Data := []string{
		"0x00000000000000",
		"0x00000000000001",
		"0xffffffffffffff",
	}

	expectedDecodedData := []uint64{
		uint64(0),
		uint64(1),
		uint64(72057594037927935),
	}

	for i, data := range uint56Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT56, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint64(t *testing.T) {
	uint64Data := []string{
		"0x0000000000000000",
		"0x0000000000000001",
		"0xffffffffffffffff",
	}

	expectedDecodedData := []uint64{
		uint64(0),
		uint64(1),
		uint64(18446744073709551615),
	}

	for i, data := range uint64Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT64, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldUint256(t *testing.T) {
	uint256Data := []string{
		"0x0000000000000000000000000000000000000000000000000000000000000000",
		"0x0000000000000000000000000000000000000000000000000000000000000001",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
	}

	max, _ := big.NewInt(0).SetString("115792089237316195423570985008687907853269984665640564039457584007913129639935", 10)
	expectedDecodedData := []*big.Int{
		big.NewInt(0),
		big.NewInt(1),
		max,
	}

	for i, data := range uint256Data {
		decodedData := protocolparser.DecodeStaticField(schematype.UINT256, data)
		if decodedData.(*big.Int).Cmp(expectedDecodedData[i]) != 0 {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldInt8(t *testing.T) {
	int8Data := []string{
		"0x00",
		"0x01",
		"0x7f",
		"0xff",
		"0x80",
		"0x81",
	}

	expectedDecodedData := []int8{
		int8(0),
		int8(1),
		int8(127),
		int8(-1),
		int8(-128),
		int8(-127),
	}

	for i, data := range int8Data {
		decodedData := protocolparser.DecodeStaticField(schematype.INT8, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}

	}
}

func TestDecodeStaticFieldInt256(t *testing.T) {
	int256Data := []string{
		"0x0000000000000000000000000000000000000000000000000000000000000000",
		"0x0000000000000000000000000000000000000000000000000000000000000001",
		"0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
		"0x8000000000000000000000000000000000000000000000000000000000000000",
		"0x8000000000000000000000000000000000000000000000000000000000000001",
		"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
	}

	expectedDecodedData := []*big.Int{
		big.NewInt(0),
		big.NewInt(1),
		protocolparser.BigIntFromString("57896044618658097711785492504343953926634992332820282019728792003956564819967"),
		protocolparser.BigIntFromString("-57896044618658097711785492504343953926634992332820282019728792003956564819968"),
		protocolparser.BigIntFromString("-57896044618658097711785492504343953926634992332820282019728792003956564819967"),
		big.NewInt(-1),
	}

	for i, data := range int256Data {
		decodedData := protocolparser.DecodeStaticField(schematype.INT256, data)
		if decodedData.(*big.Int).Cmp(expectedDecodedData[i]) != 0 {
			t.Errorf("expected %d, got %d", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldBytes(t *testing.T) {
	bytesData := "0x01"
	expectedDecodedData := []byte{1}
	decodedData := protocolparser.DecodeStaticField(schematype.BYTES1, bytesData)

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %d, got %d", expectedDecodedData, decodedData)
	}

	bytesData = "0x0001"
	expectedDecodedData = []byte{0, 1}
	decodedData = protocolparser.DecodeStaticField(schematype.BYTES2, bytesData)

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %d, got %d", expectedDecodedData, decodedData)
	}

	bytesData = "0xff00ff00ff00ff00"
	expectedDecodedData = []byte{255, 0, 255, 0, 255, 0, 255, 0}
	decodedData = protocolparser.DecodeStaticField(schematype.BYTES8, bytesData)

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %d, got %d", expectedDecodedData, decodedData)
	}

	bytesData = "0x0000000000000000000000000000000000000000000000000000000000000001"
	expectedDecodedData = []byte{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1}
	decodedData = protocolparser.DecodeStaticField(schematype.BYTES32, bytesData)

	if !reflect.DeepEqual(decodedData, expectedDecodedData) {
		t.Errorf("expected %d, got %d", expectedDecodedData, decodedData)
	}
}

func TestDecodeStaticFieldAddress(t *testing.T) {
	addressData := []string{
		"0xf3958f7F68875735c24424D554eB46ddF8e8eD33",
		"0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
	}

	expectedDecodedData := []common.Address{
		common.HexToAddress("0xf3958f7f68875735c24424d554eb46ddf8e8ed33"),
		common.HexToAddress("0xffffffffffffffffffffffffffffffffffffffff"),
	}

	for i, data := range addressData {
		decodedData := protocolparser.DecodeStaticField(schematype.ADDRESS, data)
		if decodedData != expectedDecodedData[i] {
			t.Errorf("expected %s, got %s", expectedDecodedData[i], decodedData)
		}
	}
}

func TestDecodeStaticFieldInvalidHexLengthForStaticField(t *testing.T) {
	defer func() {
		err := recover().(error)

		if err.Error() != protocolparser.ErrInvalidHexLengthForStaticField.Error() {
			t.Fatalf("wrong panic message: %s", err.Error())
		}
	}()

	data := "0x1"
	protocolparser.DecodeStaticField(schematype.BOOL, data)
	t.Error("expected panic")
}

func TestDecodeStaticFieldInvalidHexLength(t *testing.T) {
	defer func() {
		err := recover().(error)

		if err.Error() != protocolparser.ErrInvalidHexLength.Error() {
			t.Fatalf("wrong panic message: %s", err.Error())
		}
	}()

	data := "0x001"
	protocolparser.DecodeStaticField(schematype.BOOL, data)
	t.Error("expected panic")
}
