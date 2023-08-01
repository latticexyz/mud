package protocolparser

import "errors"

var ErrInvalidHexLength = errors.New("hex value is an odd length, but must be an even length")
var ErrInvalidHexLengthForSchema = errors.New("hex value must be a length of 64 for a schema")
var ErrInvalidHexLengthForPackedCounter = errors.New("hex value must be a length of 64 for a packed counter")
var ErrInvalidHexLengthForStaticField = errors.New("invalid hex length for static field")
var ErrInvalidHexLengthForArrayField = errors.New("invalid hex length for array field")
var ErrSchemaStaticLengthMismatch = errors.New("schema static length mismatch")
var ErrPackedCounterLengthMismatch = errors.New("packed counter length mismatch")
var ErrAbiEncodingLengthMismatchError = errors.New("abi encoding length mismatch")
