package protocolparser

import (
	schematype "latticexyz/mud/packages/services/pkg/schema-type"
	"regexp"
	"strings"

	godash "github.com/golodash/godash/strings"
)

func EncodeRecord(schema Schema, values []interface{}) string {
	staticValues := values[0:len(schema.StaticFields)]
	dynamicValues := values[len(schema.StaticFields):]

	m1 := regexp.MustCompile(`^0x`)

	staticDataItems := []string{}
	for i, staticField := range schema.StaticFields {
		encoding := EncodeField(staticField, staticValues[i])
		encoding = m1.ReplaceAllString(encoding, "")
		staticDataItems = append(staticDataItems, encoding)
	}
	staticData := strings.Join(staticDataItems, "")

	if len(schema.DynamicFields) == 0 {
		return "0x" + staticData
	}

	dynamicDataItems := []string{}
	for i, dynamicField := range schema.DynamicFields {
		encoding := EncodeField(dynamicField, dynamicValues[i])
		encoding = m1.ReplaceAllString(encoding, "")
		dynamicDataItems = append(dynamicDataItems, encoding)
	}

	dynamicFieldByteLengths := []int{}
	for _, value := range dynamicDataItems {
		dynamicFieldByteLengths = append(dynamicFieldByteLengths, len(value)/2)
	}
	dynamicTotalByteLength := 0
	for _, length := range dynamicFieldByteLengths {
		dynamicTotalByteLength += length
	}

	dynamicData := strings.Join(dynamicDataItems, "")

	packedCounter := ""
	encodedDynamicTotalByteLength := EncodeField(schematype.UINT56, uint64(dynamicTotalByteLength))
	packedCounter += m1.ReplaceAllString(encodedDynamicTotalByteLength, "")

	for _, length := range dynamicFieldByteLengths {
		encodedLength := EncodeField(schematype.UINT40, uint64(length))
		packedCounter += m1.ReplaceAllString(encodedLength, "")
	}
	packedCounter = godash.PadEnd(packedCounter, 64, "0")

	return "0x" + staticData + packedCounter + dynamicData
}
