package protocolparser

import (
	"strconv"
	"strings"

	godash "github.com/golodash/godash/strings"
)

func IntToString(number int) string {
	return strconv.FormatInt(int64(number), 16)
}

func SchemaToHex(schema Schema) string {
	strs := []string{
		godash.PadStart(IntToString(StaticDataLength(schema.StaticFields)), 4, "0"),
		godash.PadStart(IntToString(len(schema.StaticFields)), 2, "0"),
		godash.PadStart(IntToString(len(schema.DynamicFields)), 2, "0"),
	}
	for _, field := range schema.StaticFields {
		strs = append(strs, godash.PadStart(IntToString(int(field)), 2, "0"))
	}
	for _, field := range schema.DynamicFields {
		strs = append(strs, godash.PadStart(IntToString(int(field)), 2, "0"))
	}
	return "0x" + godash.PadEnd(strings.Join(strs, ""), 64, "0")
}
