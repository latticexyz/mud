package storecore

import (
	"encoding/json"
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"go.uber.org/zap"
)

type SchemaType uint64

const (
	UINT8 SchemaType = iota
	UINT16
	UINT24
	UINT32
	UINT40
	UINT48
	UINT56
	UINT64
	UINT72
	UINT80
	UINT88
	UINT96
	UINT104
	UINT112
	UINT120
	UINT128
	UINT136
	UINT144
	UINT152
	UINT160
	UINT168
	UINT176
	UINT184
	UINT192
	UINT200
	UINT208
	UINT216
	UINT224
	UINT232
	UINT240
	UINT248
	UINT256
	INT8
	INT16
	INT24
	INT32
	INT40
	INT48
	INT56
	INT64
	INT72
	INT80
	INT88
	INT96
	INT104
	INT112
	INT120
	INT128
	INT136
	INT144
	INT152
	INT160
	INT168
	INT176
	INT184
	INT192
	INT200
	INT208
	INT216
	INT224
	INT232
	INT240
	INT248
	INT256
	BYTES1
	BYTES2
	BYTES3
	BYTES4
	BYTES5
	BYTES6
	BYTES7
	BYTES8
	BYTES9
	BYTES10
	BYTES11
	BYTES12
	BYTES13
	BYTES14
	BYTES15
	BYTES16
	BYTES17
	BYTES18
	BYTES19
	BYTES20
	BYTES21
	BYTES22
	BYTES23
	BYTES24
	BYTES25
	BYTES26
	BYTES27
	BYTES28
	BYTES29
	BYTES30
	BYTES31
	BYTES32
	BOOL
	ADDRESS
	UINT8_ARRAY
	UINT16_ARRAY
	UINT24_ARRAY
	UINT32_ARRAY
	UINT40_ARRAY
	UINT48_ARRAY
	UINT56_ARRAY
	UINT64_ARRAY
	UINT72_ARRAY
	UINT80_ARRAY
	UINT88_ARRAY
	UINT96_ARRAY
	UINT104_ARRAY
	UINT112_ARRAY
	UINT120_ARRAY
	UINT128_ARRAY
	UINT136_ARRAY
	UINT144_ARRAY
	UINT152_ARRAY
	UINT160_ARRAY
	UINT168_ARRAY
	UINT176_ARRAY
	UINT184_ARRAY
	UINT192_ARRAY
	UINT200_ARRAY
	UINT208_ARRAY
	UINT216_ARRAY
	UINT224_ARRAY
	UINT232_ARRAY
	UINT240_ARRAY
	UINT248_ARRAY
	UINT256_ARRAY
	INT8_ARRAY
	INT16_ARRAY
	INT24_ARRAY
	INT32_ARRAY
	INT40_ARRAY
	INT48_ARRAY
	INT56_ARRAY
	INT64_ARRAY
	INT72_ARRAY
	INT80_ARRAY
	INT88_ARRAY
	INT96_ARRAY
	INT104_ARRAY
	INT112_ARRAY
	INT120_ARRAY
	INT128_ARRAY
	INT136_ARRAY
	INT144_ARRAY
	INT152_ARRAY
	INT160_ARRAY
	INT168_ARRAY
	INT176_ARRAY
	INT184_ARRAY
	INT192_ARRAY
	INT200_ARRAY
	INT208_ARRAY
	INT216_ARRAY
	INT224_ARRAY
	INT232_ARRAY
	INT240_ARRAY
	INT248_ARRAY
	INT256_ARRAY
	BYTES1_ARRAY
	BYTES2_ARRAY
	BYTES3_ARRAY
	BYTES4_ARRAY
	BYTES5_ARRAY
	BYTES6_ARRAY
	BYTES7_ARRAY
	BYTES8_ARRAY
	BYTES9_ARRAY
	BYTES10_ARRAY
	BYTES11_ARRAY
	BYTES12_ARRAY
	BYTES13_ARRAY
	BYTES14_ARRAY
	BYTES15_ARRAY
	BYTES16_ARRAY
	BYTES17_ARRAY
	BYTES18_ARRAY
	BYTES19_ARRAY
	BYTES20_ARRAY
	BYTES21_ARRAY
	BYTES22_ARRAY
	BYTES23_ARRAY
	BYTES24_ARRAY
	BYTES25_ARRAY
	BYTES26_ARRAY
	BYTES27_ARRAY
	BYTES28_ARRAY
	BYTES29_ARRAY
	BYTES30_ARRAY
	BYTES31_ARRAY
	BYTES32_ARRAY
	BOOL_ARRAY
	ADDRESS_ARRAY
	BYTES
	STRING
)

type SchemaTypeKV struct {
	Key   *SchemaTypePair `json:"key"`
	Value *SchemaTypePair `json:"value"`
}

func (pair *SchemaTypeKV) Flatten() []SchemaType {
	return append(pair.Key.Flatten(), pair.Value.Flatten()...)
}

type SchemaTypePair struct {
	Static           []SchemaType `json:"static"`
	Dynamic          []SchemaType `json:"dynamic"`
	StaticDataLength uint64       `json:"static_data_length"`
}

func (tuple *SchemaTypePair) Flatten() []SchemaType {
	return append(tuple.Static, tuple.Dynamic...)
}

func (tuple *SchemaTypePair) Length() int {
	return len(tuple.Static) + len(tuple.Dynamic)
}

func (tuple *SchemaTypePair) String() string {
	return fmt.Sprintf("static: %v, dynamic: %v, static data length: %v", tuple.Static, tuple.Dynamic, tuple.StaticDataLength)
}

func DecodeSchemaTypePair(encoding []byte) *SchemaTypePair {

	staticDataLength := new(big.Int).SetBytes(encoding[0:2]).Uint64()
	numStaticFields := new(big.Int).SetBytes(encoding[2:3]).Uint64()
	numDynamicFields := new(big.Int).SetBytes(encoding[3:4]).Uint64()

	staticFields := []SchemaType{}
	dynamicFields := []SchemaType{}

	var i uint64
	for i = 4; i < 4+numStaticFields; i++ {
		staticFields = append(staticFields, SchemaType(encoding[i]))
	}
	for i = 4 + numStaticFields; i < 4+numStaticFields+numDynamicFields; i++ {
		dynamicFields = append(dynamicFields, SchemaType(encoding[i]))
	}

	return &SchemaTypePair{
		Static:           staticFields,
		Dynamic:          dynamicFields,
		StaticDataLength: staticDataLength,
	}
}

func SchemaTypeKVFromPairs(key *SchemaTypePair, value *SchemaTypePair) *SchemaTypeKV {
	return &SchemaTypeKV{
		Key:   key,
		Value: value,
	}
}

func CombineSchemaTypePair(schemaTypePair SchemaTypePair) []SchemaType {
	return schemaTypePair.Flatten()
}

func StringifySchemaTypes(schemaType []SchemaType) []string {
	var types []string
	for _, t := range schemaType {
		types = append(types, strings.ToLower(t.String()))
	}
	return types
}

func CombineStringifySchemaTypes(schemaType []SchemaType) string {
	return strings.Join(StringifySchemaTypes(schemaType), ",")
}

type DataSchemaType__Struct struct {
	Data       interface{}
	SchemaType SchemaType
}

type DecodedData struct {
	values []*DataSchemaType__Struct
	types  []SchemaType
}

func (decodedData *DecodedData) String() string {
	var sb strings.Builder
	sb.WriteString("DecodedData: [\n")
	for _, v := range decodedData.values {
		sb.WriteString(fmt.Sprintf("\t%v\n", v))
	}
	sb.WriteString("]")
	return sb.String()
}

// NewDecodedDataFromSchemaTypePair creates a new instance of DecodedData with the provided SchemaTypePair.
//
// Parameters:
// - schemaTypePair (SchemaTypePair): The SchemaTypePair to use for the DecodedData instance.
//
// Returns:
// (*DecodedData): The new DecodedData instance.
func NewDecodedDataFromSchemaTypePair(schemaTypePair SchemaTypePair) *DecodedData {
	return &DecodedData{
		values: []*DataSchemaType__Struct{},
		types:  CombineSchemaTypePair(schemaTypePair),
	}
}

// NewDecodedDataFromSchemaType creates a new instance of DecodedData with the provided list of SchemaType.
//
// Parameters:
// - schemaType ([]SchemaType): The list of SchemaType to use for the DecodedData instance.
//
// Returns:
// (*DecodedData): The new DecodedData instance.
func NewDecodedDataFromSchemaType(schemaType []SchemaType) *DecodedData {
	return &DecodedData{
		values: []*DataSchemaType__Struct{},
		types:  schemaType,
	}
}

// Length returns the length of the schema types in the DecodedData instance.
//
// Returns:
// (int): The length of the schema types in the DecodedData instance.
func (d *DecodedData) Length() int {
	return len(d.types)
}

// Add adds a value to a DecodedData instance.
//
// Parameters:
// - value (*DataSchemaTypePair): The value to add to the DecodedData instance.
//
// Returns:
// - void.
func (d *DecodedData) Add(value *DataSchemaType__Struct) {
	d.values = append(d.values, value)
}

// Get returns the value at the given index in the DecodedData instance.
//
// Parameters:
// - index (int): The index to retrieve the value for.
//
// Returns:
// - (*DataSchemaType__Struct): The value at the given index in the DecodedData instance.
func (d *DecodedData) Get(index int) *DataSchemaType__Struct {
	return d.values[index]
}

// GetData retrieves the data value at the given index in the DecodedData instance.
//
// Parameters:
// - index (int): The index to retrieve the data value for.
//
// Returns:
// (string): The data value at the given index in the DecodedData instance.
func (d *DecodedData) GetData(index int) interface{} {
	return d.Get(index).Data
}

// GetSchemaType retrieves the schema type at the given index in the DecodedData instance.
//
// Parameters:
// - index (int): The index to retrieve the schema type for.
//
// Returns:
// (SchemaType): The schema type at the given index in the DecodedData instance.
func (d *DecodedData) GetSchemaType(index int) SchemaType {
	return d.Get(index).SchemaType
}

// Types retrieves a slice of all the schema types in the DecodedData instance.
//
// Returns:
// ([]SchemaType): A slice of all the schema types in the DecodedData instance.
func (d *DecodedData) Types() []SchemaType {
	return d.types
}

// DecodeDataField decodes the provided byte encoding using the provided SchemaTypePair and index.
//
// Parameters:
// - encoding ([]byte): The byte encoding to decode.
// - schemaTypePair (SchemaTypePair): The SchemaTypePair to use for decoding.
// - index (uint8): The index of the data field to decode.
//
// Returns:
// (string): The decoded value of the specified data field.
func DecodeDataField(encoding []byte, schemaTypePair SchemaTypePair, index uint8) interface{} {
	// Try to decode either as a static or dynamic field.
	for idx, fieldType := range schemaTypePair.Static {
		if uint8(idx) == index {
			return DecodeStaticField(fieldType, encoding, 0)
		}
	}
	for idx, fieldType := range schemaTypePair.Dynamic {
		// Offset by the static data length.
		if uint8(idx+len(schemaTypePair.Static)) == index {
			return DecodeDynamicField(fieldType, encoding)
		}
	}
	logger.GetLogger().Fatal("could not decode data field at index", zap.Uint8("index", index))
	return ""
}

func DecodeDataField__DecodedData(encoding []byte, schemaTypePair SchemaTypePair, index uint8) *DecodedData {
	data := NewDecodedDataFromSchemaTypePair(schemaTypePair)

	// Try to decode either as a static or dynamic field.
	for idx, fieldType := range schemaTypePair.Static {
		if uint8(idx) == index {
			value := DecodeStaticField(fieldType, encoding, 0)
			data.Add(&DataSchemaType__Struct{
				Data:       value,
				SchemaType: fieldType,
			})
			return data
		}
	}
	for idx, fieldType := range schemaTypePair.Dynamic {
		// Offset by the static data length.
		if uint8(idx+len(schemaTypePair.Static)) == index {
			value := DecodeDynamicField(fieldType, encoding)
			data.Add(&DataSchemaType__Struct{
				Data:       value,
				SchemaType: fieldType,
			})
			return data
		}
	}
	logger.GetLogger().Fatal("could not decode data field at index", zap.Uint8("index", index))
	return nil

}

// DecodeData decodes the given byte slice `encoding` into a `DecodedData` object
// using the provided schema type pair `schemaTypePair`.
//
// To minimize bugs/diff the decoding function (and others) are following
// @frolic's TS implementation in the client sync patch. We should coordinate
// whether or not we want to keep the code exactly the same or if we want to
// refactor / implement in a more idiomatic way.
//
// Parameters:
// - encoding ([]byte) - The byte slice to be decoded.
// - schemaTypePair (SchemaTypePair) - The schema type pair used to decode the byte slice.
//
// Returns:
// - (*DecodedData) - A pointer to the `DecodedData` object.
func DecodeData(encoding []byte, schemaTypePair SchemaTypePair) *DecodedData {
	var bytesOffset uint64 = 0

	// Where the decoded data is stored.
	data := NewDecodedDataFromSchemaTypePair(schemaTypePair)

	// Decode static fields.
	for _, fieldType := range schemaTypePair.Static {
		value := DecodeStaticField(fieldType, encoding, bytesOffset)
		bytesOffset += getStaticByteLength(fieldType)
		data.Add(&DataSchemaType__Struct{
			Data:       value,
			SchemaType: fieldType,
		})
	}

	// Decode dynamic fields.
	if len(schemaTypePair.Dynamic) > 0 {
		dynamicDataSlice := encoding[schemaTypePair.StaticDataLength : schemaTypePair.StaticDataLength+32]
		bytesOffset += 32

		// Keep in sync with client.
		packedCounterAccumulatorType := UINT56
		packedCounterCounterType := UINT40

		for i, fieldType := range schemaTypePair.Dynamic {
			// Decode the length of the data. MODE works with UINT56 decoded as a string from a BigInt
			// since all uints are handled the same to handle those > Go uint64.
			dataLengthString := DecodeStaticField(
				packedCounterCounterType,
				dynamicDataSlice,
				getStaticByteLength(packedCounterAccumulatorType)+uint64(i)*getStaticByteLength(packedCounterCounterType),
			).(string)

			// Convert the length to a uint64.
			dataLengthBigInt, success := new(big.Int).SetString(dataLengthString, 10)
			if !success {
				logger.GetLogger().Fatal("could not decode dynamic data length")
			}
			dataLength := dataLengthBigInt.Uint64()

			// Decode the data using the data length.
			value := DecodeDynamicField(fieldType, encoding[bytesOffset:bytesOffset+dataLength])
			bytesOffset += dataLength

			data.Add(&DataSchemaType__Struct{
				Data:       value,
				SchemaType: fieldType,
			})
		}
	}

	return data
}

// DecodeDynamicField decodes the dynamic field of the specified schema type from the given byte slice encoding.
//
// Parameters:
// - schemaType (SchemaType): The schema type of the dynamic field to be decoded.
// - encodingSlice ([]byte): The byte slice encoding of the dynamic field.
//
// Returns:
// - (string): The decoded value of the dynamic field as a string.
func DecodeDynamicField(schemaType SchemaType, encodingSlice []byte) interface{} {
	switch schemaType {
	case BYTES:
		return handleBytes(encodingSlice)
	case STRING:
		return handleString(encodingSlice)
	default:
		// Try to decode as an array.
		staticSchemaType := (schemaType - 98)

		if staticSchemaType > 97 {
			logger.GetLogger().Fatal("Unknown dynamic field type", zap.String("type", schemaType.String()))
			return ""
		}

		// Allocate an array of the correct size.
		fieldLength := getStaticByteLength(staticSchemaType)
		arrayLength := len(encodingSlice) / int(fieldLength)
		array := make([]interface{}, arrayLength)
		// Iterate and decode each element as a static field.
		for i := 0; i < arrayLength; i++ {
			array[i] = DecodeStaticField(staticSchemaType, encodingSlice, uint64(i)*fieldLength)
		}

		arr, err := json.Marshal(array)
		if err != nil {
			logger.GetLogger().Fatal("Could not marshal array", zap.Error(err))
			return ""
		}

		return arr
	}
}

func postgresHexEncode(data []byte) string {
	return hexutil.Encode(data)
}

// handleBytes handles the decoding of a bytes static field.
//
// Parameters:
// - encoding ([]byte): The byte slice encoding of the bytes field.
//
// Returns:
// - (string): The decoded value of the bytes field as a string.
func handleBytes(encoding []byte) string {
	// Hex-encode bytes for legibility.
	return postgresHexEncode(encoding)
}

// handleUint handles the decoding of a uint static field.
//
// Parameters:
// - encoding ([]byte): The byte slice encoding of the uint field.
//
// Returns:
// - (string): The decoded value of the uint field as a string.
func handleUint(encoding []byte) string {
	return new(big.Int).SetBytes(encoding).String()
}

// handleInt handles the decoding of an int static field.
//
// Parameters:
// - encoding ([]byte): The byte slice encoding of the int field.
//
// Returns:
// - (string): The decoded value of the int field as a string.
func handleInt(encoding []byte) string {
	return new(big.Int).SetBytes(encoding).String()
}

// handleBool handles the decoding of a bool static field.
//
// Parameters:
// - encoding (byte): The byte encoding of the bool field.
//
// Returns:
// - (string): The decoded value of the bool field as a string.
func handleBool(encoding byte) bool {
	return encoding == 1
}

// handleAddress handles the decoding of an address static field.
//
// Parameters:
// - encoding ([]byte): The byte slice encoding of the address field.
//
// Returns:
// - (string): The decoded value of the address field as a string.
func handleAddress(encoding []byte) string {
	return common.BytesToAddress(encoding).String()
}

// handleString handles the decoding of a string static field.
//
// Parameters:
// - encoding ([]byte): The byte slice encoding of the string field.
//
// Returns:
// - (string): The decoded value of the string field as a string.
func handleString(encoding []byte) string {
	return string(encoding)
}

// DecodeStaticField decodes a static field of a given schema type from a byte slice.
//
// Parameters:
// - schemaType (SchemaType): The schema type of the field to decode.
// - encoding ([]byte): The byte slice containing the encoded field.
// - bytesOffset (uint64): The offset in bytes within the encoding byte slice where the field to be decoded starts.
//
// Returns:
// - (string): The decoded field as a string.
func DecodeStaticField(schemaType SchemaType, encoding []byte, bytesOffset uint64) interface{} {
	// To avoid a ton of duplicate handling code per each schema type, we handle
	// using ranges, since the schema types are sequential in specific ranges.

	// UINT8 - UINT256 is the first range. We add one to the schema type to get the
	// number of bytes to read, since enums start from 0 and UINT8 is the first one.
	if schemaType >= UINT8 && schemaType <= UINT256 {
		return handleUint(encoding[bytesOffset : bytesOffset+uint64(schemaType)+1])
	} else
	// INT8 - INT256 is the second range. We subtract UINT256 from the schema type
	// to account for the first range and re-set the bytes count to start from 1.
	if schemaType >= INT8 && schemaType <= INT256 {
		return handleInt(encoding[bytesOffset : bytesOffset+uint64(schemaType-UINT256)])
	} else
	// BYTES is the third range. We subtract INT256 from the schema type to account
	// for the previous ranges and re-set the bytes count to start from 1.
	if schemaType >= BYTES1 && schemaType <= BYTES32 {
		return handleBytes(encoding[bytesOffset : bytesOffset+uint64(schemaType-INT256)])
	} else
	// BOOL is a standalone schema type.
	if schemaType == BOOL {
		return handleBool(encoding[bytesOffset])
	} else
	// ADDRESS is a standalone schema type.
	if schemaType == ADDRESS {
		return handleAddress(encoding[bytesOffset : bytesOffset+20])
	} else
	// STRING is a standalone schema type.
	if schemaType == STRING {
		return handleString(encoding[bytesOffset:])
	} else {
		logger.GetLogger().Fatal("Unknown static field type", zap.String("type", schemaType.String()))
		return ""
	}
}

// getStaticByteLength returns the number of bytes required for a static type schema.
//
// Parameters:
// - schemaType (SchemaType): The SchemaType instance for which to return the number of bytes.
//
// Returns:
// (uint64) - The number of bytes required for a static type schema.
func getStaticByteLength(schemaType SchemaType) uint64 {
	if schemaType < 32 {
		// uint8-256
		return uint64(schemaType) + 1
	} else if schemaType < 64 {
		// int8-256, offset by 32
		return uint64(schemaType) + 1 - 32
	} else if schemaType < 96 {
		// bytes1-32, offset by 64
		return uint64(schemaType) + 1 - 64
	}

	// Other static types
	if schemaType == BOOL {
		return 1
	} else if schemaType == ADDRESS {
		return 20
	}

	// Return 0 for all dynamic types
	return 0
}

// SchemaTypeToSolidityType converts the specified SchemaType instance to the corresponding Solidity type.
//
// Parameters:
// - schemaType (SchemaType): The SchemaType instance to convert to a Solidity type.
//
// Returns:
// (string) - A string representing the Solidity type for the specified SchemaType instance.
func SchemaTypeToSolidityType(schemaType SchemaType) string {
	if strings.Contains(schemaType.String(), "ARRAY") {
		_type := strings.Split(schemaType.String(), "_")[0]
		return fmt.Sprintf("%s[]", strings.ToLower(_type))
	} else {
		return strings.ToLower(schemaType.String())
	}
}

// SchemaTypeToPostgresType converts the specified SchemaType instance to the corresponding PostgreSQL type.
// The function returns a string representing the PostgreSQL type for the specified SchemaType instance.
//
// Parameters:
// - schemaType (SchemaType): The SchemaType instance to convert to a PostgreSQL type.
//
// Returns:
// (string) - A string representing the PostgreSQL type for the specified SchemaType instance.
func SchemaTypeToPostgresType(schemaType SchemaType) string {
	if (schemaType >= UINT8 && schemaType <= UINT32) || (schemaType >= INT8 && schemaType <= INT32) {
		// Integer.
		return "integer"
	} else if (schemaType >= UINT64 && schemaType <= UINT256) || (schemaType >= INT64 && schemaType <= INT256) {
		// Big integer.
		return "text"
	} else if (schemaType >= BYTES1 && schemaType <= BYTES32) || (schemaType == BYTES) {
		// Bytes.
		return "text"
	} else if schemaType == BOOL {
		// Boolean.
		return "boolean"
	} else if schemaType == ADDRESS {
		// Address.
		return "text"
	} else if schemaType == STRING {
		// String.
		return "text"
	} else if (schemaType >= UINT8_ARRAY && schemaType <= UINT32_ARRAY) || (schemaType >= INT8_ARRAY && schemaType <= INT32_ARRAY) {
		// Integer array.
		return "jsonb"
	} else if (schemaType >= UINT64_ARRAY && schemaType <= UINT256_ARRAY) || (schemaType >= INT64_ARRAY && schemaType <= INT256_ARRAY) {
		// Big integer array.
		return "jsonb"
	} else if schemaType >= BYTES1_ARRAY && schemaType <= BYTES32_ARRAY {
		// Bytes array.
		return "jsonb"
	} else if schemaType == BOOL_ARRAY {
		// Boolean array.
		return "jsonb"
	} else if schemaType == ADDRESS_ARRAY {
		// Address array.
		return "jsonb"
	} else {
		// Default to text.
		return "text"
	}
}
