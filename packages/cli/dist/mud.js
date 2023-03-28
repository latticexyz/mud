#!/usr/bin/env -S TS_NODE_COMPILER_OPTIONS={\"module\":\"esnext\"} node --loader=ts-node/esm --no-warnings
import {
  deploy,
  formatSolidity,
  getSchemaTypeInfo,
  importForAbiOrUserType,
  resolveAbiOrUserType
} from "./chunk-MRD7RQIW.js";
import {
  MUDError,
  SchemaTypeArrayToElement,
  loadStoreConfig,
  loadWorldConfig,
  logError
} from "./chunk-BF54R5X6.js";
import {
  JsonRpcProvider,
  componentsDir,
  execLog,
  extractIdFromFile,
  generateAndDeploy,
  generateLibDeploy,
  generateSystemTypes,
  generateTypes,
  hsr,
  keccak256,
  resetLibDeploy,
  systemsDir
} from "./chunk-SLIMIO4Z.js";
import {
  forge,
  getRpcUrl,
  getSrcDirectory,
  getTestDirectory
} from "./chunk-ATAWDHWC.js";
import {
  __commonJS,
  __toESM
} from "./chunk-O6HOO6WA.js";

// ../../node_modules/@protobufjs/aspromise/index.js
var require_aspromise = __commonJS({
  "../../node_modules/@protobufjs/aspromise/index.js"(exports2, module2) {
    "use strict";
    module2.exports = asPromise;
    function asPromise(fn, ctx) {
      var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
      while (index < arguments.length)
        params[offset++] = arguments[index++];
      return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err) {
          if (pending) {
            pending = false;
            if (err)
              reject(err);
            else {
              var params2 = new Array(arguments.length - 1), offset2 = 0;
              while (offset2 < params2.length)
                params2[offset2++] = arguments[offset2];
              resolve.apply(null, params2);
            }
          }
        };
        try {
          fn.apply(ctx || null, params);
        } catch (err) {
          if (pending) {
            pending = false;
            reject(err);
          }
        }
      });
    }
  }
});

// ../../node_modules/@protobufjs/base64/index.js
var require_base64 = __commonJS({
  "../../node_modules/@protobufjs/base64/index.js"(exports2) {
    "use strict";
    var base64 = exports2;
    base64.length = function length(string) {
      var p = string.length;
      if (!p)
        return 0;
      var n = 0;
      while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
      return Math.ceil(string.length * 3) / 4 - n;
    };
    var b64 = new Array(64);
    var s64 = new Array(123);
    for (i = 0; i < 64; )
      s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
    var i;
    base64.encode = function encode(buffer, start, end) {
      var parts = null, chunk = [];
      var i2 = 0, j = 0, t;
      while (start < end) {
        var b = buffer[start++];
        switch (j) {
          case 0:
            chunk[i2++] = b64[b >> 2];
            t = (b & 3) << 4;
            j = 1;
            break;
          case 1:
            chunk[i2++] = b64[t | b >> 4];
            t = (b & 15) << 2;
            j = 2;
            break;
          case 2:
            chunk[i2++] = b64[t | b >> 6];
            chunk[i2++] = b64[b & 63];
            j = 0;
            break;
        }
        if (i2 > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i2 = 0;
        }
      }
      if (j) {
        chunk[i2++] = b64[t];
        chunk[i2++] = 61;
        if (j === 1)
          chunk[i2++] = 61;
      }
      if (parts) {
        if (i2)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i2));
    };
    var invalidEncoding = "invalid encoding";
    base64.decode = function decode(string, buffer, offset) {
      var start = offset;
      var j = 0, t;
      for (var i2 = 0; i2 < string.length; ) {
        var c = string.charCodeAt(i2++);
        if (c === 61 && j > 1)
          break;
        if ((c = s64[c]) === void 0)
          throw Error(invalidEncoding);
        switch (j) {
          case 0:
            t = c;
            j = 1;
            break;
          case 1:
            buffer[offset++] = t << 2 | (c & 48) >> 4;
            t = c;
            j = 2;
            break;
          case 2:
            buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
            t = c;
            j = 3;
            break;
          case 3:
            buffer[offset++] = (t & 3) << 6 | c;
            j = 0;
            break;
        }
      }
      if (j === 1)
        throw Error(invalidEncoding);
      return offset - start;
    };
    base64.test = function test(string) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    };
  }
});

// ../../node_modules/@protobufjs/eventemitter/index.js
var require_eventemitter = __commonJS({
  "../../node_modules/@protobufjs/eventemitter/index.js"(exports2, module2) {
    "use strict";
    module2.exports = EventEmitter;
    function EventEmitter() {
      this._listeners = {};
    }
    EventEmitter.prototype.on = function on(evt, fn, ctx) {
      (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn,
        ctx: ctx || this
      });
      return this;
    };
    EventEmitter.prototype.off = function off(evt, fn) {
      if (evt === void 0)
        this._listeners = {};
      else {
        if (fn === void 0)
          this._listeners[evt] = [];
        else {
          var listeners = this._listeners[evt];
          for (var i = 0; i < listeners.length; )
            if (listeners[i].fn === fn)
              listeners.splice(i, 1);
            else
              ++i;
        }
      }
      return this;
    };
    EventEmitter.prototype.emit = function emit(evt) {
      var listeners = this._listeners[evt];
      if (listeners) {
        var args = [], i = 1;
        for (; i < arguments.length; )
          args.push(arguments[i++]);
        for (i = 0; i < listeners.length; )
          listeners[i].fn.apply(listeners[i++].ctx, args);
      }
      return this;
    };
  }
});

// ../../node_modules/@protobufjs/float/index.js
var require_float = __commonJS({
  "../../node_modules/@protobufjs/float/index.js"(exports2, module2) {
    "use strict";
    module2.exports = factory(factory);
    function factory(exports3) {
      if (typeof Float32Array !== "undefined")
        (function() {
          var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
          function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
          }
          function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
          }
          exports3.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
          exports3.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
          function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
          }
          function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
          }
          exports3.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
          exports3.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
        })();
      else
        (function() {
          function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0)
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf, pos);
            else if (isNaN(val))
              writeUint(2143289344, buf, pos);
            else if (val > 34028234663852886e22)
              writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 11754943508222875e-54)
              writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
            else {
              var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
              writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
          }
          exports3.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
          exports3.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
          function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
            return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
          }
          exports3.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
          exports3.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
        })();
      if (typeof Float64Array !== "undefined")
        (function() {
          var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
          function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
          }
          function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
          }
          exports3.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
          exports3.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
          function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
          }
          function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
          }
          exports3.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
          exports3.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
        })();
      else
        (function() {
          function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0) {
              writeUint(0, buf, pos + off0);
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf, pos + off1);
            } else if (isNaN(val)) {
              writeUint(0, buf, pos + off0);
              writeUint(2146959360, buf, pos + off1);
            } else if (val > 17976931348623157e292) {
              writeUint(0, buf, pos + off0);
              writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
              var mantissa;
              if (val < 22250738585072014e-324) {
                mantissa = val / 5e-324;
                writeUint(mantissa >>> 0, buf, pos + off0);
                writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
              } else {
                var exponent = Math.floor(Math.log(val) / Math.LN2);
                if (exponent === 1024)
                  exponent = 1023;
                mantissa = val * Math.pow(2, -exponent);
                writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
              }
            }
          }
          exports3.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
          exports3.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
          function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
          }
          exports3.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
          exports3.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
        })();
      return exports3;
    }
    function writeUintLE(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    function writeUintBE(val, buf, pos) {
      buf[pos] = val >>> 24;
      buf[pos + 1] = val >>> 16 & 255;
      buf[pos + 2] = val >>> 8 & 255;
      buf[pos + 3] = val & 255;
    }
    function readUintLE(buf, pos) {
      return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
    }
    function readUintBE(buf, pos) {
      return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
    }
  }
});

// ../../node_modules/@protobufjs/inquire/index.js
var require_inquire = __commonJS({
  "../../node_modules/@protobufjs/inquire/index.js"(exports, module) {
    "use strict";
    module.exports = inquire;
    function inquire(moduleName) {
      try {
        var mod = eval("quire".replace(/^/, "re"))(moduleName);
        if (mod && (mod.length || Object.keys(mod).length))
          return mod;
      } catch (e) {
      }
      return null;
    }
  }
});

// ../../node_modules/@protobufjs/utf8/index.js
var require_utf8 = __commonJS({
  "../../node_modules/@protobufjs/utf8/index.js"(exports2) {
    "use strict";
    var utf8 = exports2;
    utf8.length = function utf8_length(string) {
      var len = 0, c = 0;
      for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
          len += 1;
        else if (c < 2048)
          len += 2;
        else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
          ++i;
          len += 4;
        } else
          len += 3;
      }
      return len;
    };
    utf8.read = function utf8_read(buffer, start, end) {
      var len = end - start;
      if (len < 1)
        return "";
      var parts = null, chunk = [], i = 0, t;
      while (start < end) {
        t = buffer[start++];
        if (t < 128)
          chunk[i++] = t;
        else if (t > 191 && t < 224)
          chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
          chunk[i++] = 55296 + (t >> 10);
          chunk[i++] = 56320 + (t & 1023);
        } else
          chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i = 0;
        }
      }
      if (parts) {
        if (i)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i));
    };
    utf8.write = function utf8_write(string, buffer, offset) {
      var start = offset, c1, c2;
      for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
          buffer[offset++] = c1;
        } else if (c1 < 2048) {
          buffer[offset++] = c1 >> 6 | 192;
          buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
          c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
          ++i;
          buffer[offset++] = c1 >> 18 | 240;
          buffer[offset++] = c1 >> 12 & 63 | 128;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        } else {
          buffer[offset++] = c1 >> 12 | 224;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        }
      }
      return offset - start;
    };
  }
});

// ../../node_modules/@protobufjs/pool/index.js
var require_pool = __commonJS({
  "../../node_modules/@protobufjs/pool/index.js"(exports2, module2) {
    "use strict";
    module2.exports = pool;
    function pool(alloc, slice, size) {
      var SIZE = size || 8192;
      var MAX = SIZE >>> 1;
      var slab = null;
      var offset = SIZE;
      return function pool_alloc(size2) {
        if (size2 < 1 || size2 > MAX)
          return alloc(size2);
        if (offset + size2 > SIZE) {
          slab = alloc(SIZE);
          offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size2);
        if (offset & 7)
          offset = (offset | 7) + 1;
        return buf;
      };
    }
  }
});

// ../services/node_modules/protobufjs/src/util/longbits.js
var require_longbits = __commonJS({
  "../services/node_modules/protobufjs/src/util/longbits.js"(exports2, module2) {
    "use strict";
    module2.exports = LongBits;
    var util = require_minimal();
    function LongBits(lo, hi) {
      this.lo = lo >>> 0;
      this.hi = hi >>> 0;
    }
    var zero = LongBits.zero = new LongBits(0, 0);
    zero.toNumber = function() {
      return 0;
    };
    zero.zzEncode = zero.zzDecode = function() {
      return this;
    };
    zero.length = function() {
      return 1;
    };
    var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";
    LongBits.fromNumber = function fromNumber2(value) {
      if (value === 0)
        return zero;
      var sign = value < 0;
      if (sign)
        value = -value;
      var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
      if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
          lo = 0;
          if (++hi > 4294967295)
            hi = 0;
        }
      }
      return new LongBits(lo, hi);
    };
    LongBits.from = function from(value) {
      if (typeof value === "number")
        return LongBits.fromNumber(value);
      if (util.isString(value)) {
        if (util.Long)
          value = util.Long.fromString(value);
        else
          return LongBits.fromNumber(parseInt(value, 10));
      }
      return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
    };
    LongBits.prototype.toNumber = function toNumber2(unsigned) {
      if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
        if (!lo)
          hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    };
    LongBits.prototype.toLong = function toLong(unsigned) {
      return util.Long ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
    };
    var charCodeAt = String.prototype.charCodeAt;
    LongBits.fromHash = function fromHash(hash) {
      if (hash === zeroHash)
        return zero;
      return new LongBits(
        (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
        (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
      );
    };
    LongBits.prototype.toHash = function toHash() {
      return String.fromCharCode(
        this.lo & 255,
        this.lo >>> 8 & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24,
        this.hi & 255,
        this.hi >>> 8 & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
      );
    };
    LongBits.prototype.zzEncode = function zzEncode() {
      var mask = this.hi >> 31;
      this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
      this.lo = (this.lo << 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.zzDecode = function zzDecode() {
      var mask = -(this.lo & 1);
      this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
      this.hi = (this.hi >>> 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.length = function length() {
      var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
      return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
    };
  }
});

// ../services/node_modules/protobufjs/src/util/minimal.js
var require_minimal = __commonJS({
  "../services/node_modules/protobufjs/src/util/minimal.js"(exports2) {
    "use strict";
    var util = exports2;
    util.asPromise = require_aspromise();
    util.base64 = require_base64();
    util.EventEmitter = require_eventemitter();
    util.float = require_float();
    util.inquire = require_inquire();
    util.utf8 = require_utf8();
    util.pool = require_pool();
    util.LongBits = require_longbits();
    util.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
    util.global = util.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports2;
    util.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    );
    util.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    );
    util.isInteger = Number.isInteger || /* istanbul ignore next */
    function isInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
    util.isString = function isString(value) {
      return typeof value === "string" || value instanceof String;
    };
    util.isObject = function isObject(value) {
      return value && typeof value === "object";
    };
    util.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util.isSet = function isSet(obj, prop) {
      var value = obj[prop];
      if (value != null && obj.hasOwnProperty(prop))
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
      return false;
    };
    util.Buffer = function() {
      try {
        var Buffer = util.inquire("buffer").Buffer;
        return Buffer.prototype.utf8Write ? Buffer : (
          /* istanbul ignore next */
          null
        );
      } catch (e) {
        return null;
      }
    }();
    util._Buffer_from = null;
    util._Buffer_allocUnsafe = null;
    util.newBuffer = function newBuffer(sizeOrArray) {
      return typeof sizeOrArray === "number" ? util.Buffer ? util._Buffer_allocUnsafe(sizeOrArray) : new util.Array(sizeOrArray) : util.Buffer ? util._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
    };
    util.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    util.Long = /* istanbul ignore next */
    util.global.dcodeIO && /* istanbul ignore next */
    util.global.dcodeIO.Long || /* istanbul ignore next */
    util.global.Long || util.inquire("long");
    util.key2Re = /^true|false|0|1$/;
    util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    util.longToHash = function longToHash(value) {
      return value ? util.LongBits.from(value).toHash() : util.LongBits.zeroHash;
    };
    util.longFromHash = function longFromHash(hash, unsigned) {
      var bits = util.LongBits.fromHash(hash);
      if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
      return bits.toNumber(Boolean(unsigned));
    };
    function merge(dst, src, ifNotSet) {
      for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === void 0 || !ifNotSet)
          dst[keys[i]] = src[keys[i]];
      return dst;
    }
    util.merge = merge;
    util.lcFirst = function lcFirst(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    };
    function newError(name) {
      function CustomError(message, properties) {
        if (!(this instanceof CustomError))
          return new CustomError(message, properties);
        Object.defineProperty(this, "message", { get: function() {
          return message;
        } });
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, CustomError);
        else
          Object.defineProperty(this, "stack", { value: new Error().stack || "" });
        if (properties)
          merge(this, properties);
      }
      CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
          value: CustomError,
          writable: true,
          enumerable: false,
          configurable: true
        },
        name: {
          get() {
            return name;
          },
          set: void 0,
          enumerable: false,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: true
        },
        toString: {
          value() {
            return this.name + ": " + this.message;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      return CustomError;
    }
    util.newError = newError;
    util.ProtocolError = newError("ProtocolError");
    util.oneOfGetter = function getOneOf(fieldNames) {
      var fieldMap = {};
      for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
      return function() {
        for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
          if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
            return keys[i2];
      };
    };
    util.oneOfSetter = function setOneOf(fieldNames) {
      return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
          if (fieldNames[i] !== name)
            delete this[fieldNames[i]];
      };
    };
    util.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: true
    };
    util._configure = function() {
      var Buffer = util.Buffer;
      if (!Buffer) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
      }
      util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from || /* istanbul ignore next */
      function Buffer_from(value, encoding) {
        return new Buffer(value, encoding);
      };
      util._Buffer_allocUnsafe = Buffer.allocUnsafe || /* istanbul ignore next */
      function Buffer_allocUnsafe(size) {
        return new Buffer(size);
      };
    };
  }
});

// ../services/node_modules/protobufjs/src/writer.js
var require_writer = __commonJS({
  "../services/node_modules/protobufjs/src/writer.js"(exports2, module2) {
    "use strict";
    module2.exports = Writer;
    var util = require_minimal();
    var BufferWriter;
    var LongBits = util.LongBits;
    var base64 = util.base64;
    var utf8 = util.utf8;
    function Op(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    function noop() {
    }
    function State(writer) {
      this.head = writer.head;
      this.tail = writer.tail;
      this.len = writer.len;
      this.next = writer.states;
    }
    function Writer() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup() {
        return (Writer.create = function create_buffer() {
          return new BufferWriter();
        })();
      } : function create_array() {
        return new Writer();
      };
    };
    Writer.create = create();
    Writer.alloc = function alloc(size) {
      return new util.Array(size);
    };
    if (util.Array !== Array)
      Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
    Writer.prototype._push = function push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    };
    function writeByte(val, buf, pos) {
      buf[pos] = val & 255;
    }
    function writeVarint32(val, buf, pos) {
      while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
      }
      buf[pos] = val;
    }
    function VarintOp(len, val) {
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    VarintOp.prototype = Object.create(Op.prototype);
    VarintOp.prototype.fn = writeVarint32;
    Writer.prototype.uint32 = function write_uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
        value
      )).len;
      return this;
    };
    Writer.prototype.int32 = function write_int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
    };
    Writer.prototype.sint32 = function write_sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    };
    function writeVarint64(val, buf, pos) {
      while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
      }
      while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
      }
      buf[pos++] = val.lo;
    }
    Writer.prototype.uint64 = function write_uint64(value) {
      var bits = LongBits.from(value);
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.int64 = Writer.prototype.uint64;
    Writer.prototype.sint64 = function write_sint64(value) {
      var bits = LongBits.from(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.bool = function write_bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    };
    function writeFixed32(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    Writer.prototype.fixed32 = function write_fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    };
    Writer.prototype.sfixed32 = Writer.prototype.fixed32;
    Writer.prototype.fixed64 = function write_fixed64(value) {
      var bits = LongBits.from(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    };
    Writer.prototype.sfixed64 = Writer.prototype.fixed64;
    Writer.prototype.float = function write_float(value) {
      return this._push(util.float.writeFloatLE, 4, value);
    };
    Writer.prototype.double = function write_double(value) {
      return this._push(util.float.writeDoubleLE, 8, value);
    };
    var writeBytes = util.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    } : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };
    Writer.prototype.bytes = function write_bytes(value) {
      var len = value.length >>> 0;
      if (!len)
        return this._push(writeByte, 1, 0);
      if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
      }
      return this.uint32(len)._push(writeBytes, len, value);
    };
    Writer.prototype.string = function write_string(value) {
      var len = utf8.length(value);
      return len ? this.uint32(len)._push(utf8.write, len, value) : this._push(writeByte, 1, 0);
    };
    Writer.prototype.fork = function fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    };
    Writer.prototype.reset = function reset() {
      if (this.states) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    };
    Writer.prototype.ldelim = function ldelim() {
      var head = this.head, tail = this.tail, len = this.len;
      this.reset().uint32(len);
      if (len) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    };
    Writer.prototype.finish = function finish() {
      var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
      while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
      }
      return buf;
    };
    Writer._configure = function(BufferWriter_) {
      BufferWriter = BufferWriter_;
      Writer.create = create();
      BufferWriter._configure();
    };
  }
});

// ../services/node_modules/protobufjs/src/writer_buffer.js
var require_writer_buffer = __commonJS({
  "../services/node_modules/protobufjs/src/writer_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferWriter;
    var Writer = require_writer();
    (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
    var util = require_minimal();
    function BufferWriter() {
      Writer.call(this);
    }
    BufferWriter._configure = function() {
      BufferWriter.alloc = util._Buffer_allocUnsafe;
      BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else
          for (var i = 0; i < val.length; )
            buf[pos++] = val[i++];
      };
    };
    BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
      if (util.isString(value))
        value = util._Buffer_from(value, "base64");
      var len = value.length >>> 0;
      this.uint32(len);
      if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
      return this;
    };
    function writeStringBuffer(val, buf, pos) {
      if (val.length < 40)
        util.utf8.write(val, buf, pos);
      else if (buf.utf8Write)
        buf.utf8Write(val, pos);
      else
        buf.write(val, pos);
    }
    BufferWriter.prototype.string = function write_string_buffer(value) {
      var len = util.Buffer.byteLength(value);
      this.uint32(len);
      if (len)
        this._push(writeStringBuffer, len, value);
      return this;
    };
    BufferWriter._configure();
  }
});

// ../services/node_modules/protobufjs/src/reader.js
var require_reader = __commonJS({
  "../services/node_modules/protobufjs/src/reader.js"(exports2, module2) {
    "use strict";
    module2.exports = Reader;
    var util = require_minimal();
    var BufferReader;
    var LongBits = util.LongBits;
    var utf8 = util.utf8;
    function indexOutOfRange(reader, writeLength) {
      return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    }
    function Reader(buffer) {
      this.buf = buffer;
      this.pos = 0;
      this.len = buffer.length;
    }
    var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    } : function create_array2(buffer) {
      if (Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    };
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup(buffer) {
        return (Reader.create = function create_buffer(buffer2) {
          return util.Buffer.isBuffer(buffer2) ? new BufferReader(buffer2) : create_array(buffer2);
        })(buffer);
      } : create_array;
    };
    Reader.create = create();
    Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */
    util.Array.prototype.slice;
    Reader.prototype.uint32 = function read_uint32_setup() {
      var value = 4294967295;
      return function read_uint32() {
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        if ((this.pos += 5) > this.len) {
          this.pos = this.len;
          throw indexOutOfRange(this, 10);
        }
        return value;
      };
    }();
    Reader.prototype.int32 = function read_int32() {
      return this.uint32() | 0;
    };
    Reader.prototype.sint32 = function read_sint32() {
      var value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    };
    function readLongVarint() {
      var bits = new LongBits(0, 0);
      var i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128)
          return bits;
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      }
      throw Error("invalid varint encoding");
    }
    Reader.prototype.bool = function read_bool() {
      return this.uint32() !== 0;
    };
    function readFixed32_end(buf, end) {
      return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
    }
    Reader.prototype.fixed32 = function read_fixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4);
    };
    Reader.prototype.sfixed32 = function read_sfixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4) | 0;
    };
    function readFixed64() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);
      return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    }
    Reader.prototype.float = function read_float() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    };
    Reader.prototype.double = function read_double() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    };
    Reader.prototype.bytes = function read_bytes() {
      var length = this.uint32(), start = this.pos, end = this.pos + length;
      if (end > this.len)
        throw indexOutOfRange(this, length);
      this.pos += length;
      if (Array.isArray(this.buf))
        return this.buf.slice(start, end);
      return start === end ? new this.buf.constructor(0) : this._slice.call(this.buf, start, end);
    };
    Reader.prototype.string = function read_string() {
      var bytes = this.bytes();
      return utf8.read(bytes, 0, bytes.length);
    };
    Reader.prototype.skip = function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
      } else {
        do {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
      }
      return this;
    };
    Reader.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        default:
          throw Error("invalid wire type " + wireType + " at offset " + this.pos);
      }
      return this;
    };
    Reader._configure = function(BufferReader_) {
      BufferReader = BufferReader_;
      Reader.create = create();
      BufferReader._configure();
      var fn = util.Long ? "toLong" : (
        /* istanbul ignore next */
        "toNumber"
      );
      util.merge(Reader.prototype, {
        int64: function read_int64() {
          return readLongVarint.call(this)[fn](false);
        },
        uint64: function read_uint64() {
          return readLongVarint.call(this)[fn](true);
        },
        sint64: function read_sint64() {
          return readLongVarint.call(this).zzDecode()[fn](false);
        },
        fixed64: function read_fixed64() {
          return readFixed64.call(this)[fn](true);
        },
        sfixed64: function read_sfixed64() {
          return readFixed64.call(this)[fn](false);
        }
      });
    };
  }
});

// ../services/node_modules/protobufjs/src/reader_buffer.js
var require_reader_buffer = __commonJS({
  "../services/node_modules/protobufjs/src/reader_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferReader;
    var Reader = require_reader();
    (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
    var util = require_minimal();
    function BufferReader(buffer) {
      Reader.call(this, buffer);
    }
    BufferReader._configure = function() {
      if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
    };
    BufferReader.prototype.string = function read_string_buffer() {
      var len = this.uint32();
      return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    };
    BufferReader._configure();
  }
});

// ../services/node_modules/protobufjs/src/rpc/service.js
var require_service = __commonJS({
  "../services/node_modules/protobufjs/src/rpc/service.js"(exports2, module2) {
    "use strict";
    module2.exports = Service;
    var util = require_minimal();
    (Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
    function Service(rpcImpl, requestDelimited, responseDelimited) {
      if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");
      util.EventEmitter.call(this);
      this.rpcImpl = rpcImpl;
      this.requestDelimited = Boolean(requestDelimited);
      this.responseDelimited = Boolean(responseDelimited);
    }
    Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
      if (!request)
        throw TypeError("request must be specified");
      var self2 = this;
      if (!callback)
        return util.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
      if (!self2.rpcImpl) {
        setTimeout(function() {
          callback(Error("already ended"));
        }, 0);
        return void 0;
      }
      try {
        return self2.rpcImpl(
          method,
          requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
          function rpcCallback(err, response) {
            if (err) {
              self2.emit("error", err, method);
              return callback(err);
            }
            if (response === null) {
              self2.end(
                /* endedByRPC */
                true
              );
              return void 0;
            }
            if (!(response instanceof responseCtor)) {
              try {
                response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
              } catch (err2) {
                self2.emit("error", err2, method);
                return callback(err2);
              }
            }
            self2.emit("data", response, method);
            return callback(null, response);
          }
        );
      } catch (err) {
        self2.emit("error", err, method);
        setTimeout(function() {
          callback(err);
        }, 0);
        return void 0;
      }
    };
    Service.prototype.end = function end(endedByRPC) {
      if (this.rpcImpl) {
        if (!endedByRPC)
          this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
      }
      return this;
    };
  }
});

// ../services/node_modules/protobufjs/src/rpc.js
var require_rpc = __commonJS({
  "../services/node_modules/protobufjs/src/rpc.js"(exports2) {
    "use strict";
    var rpc = exports2;
    rpc.Service = require_service();
  }
});

// ../services/node_modules/protobufjs/src/roots.js
var require_roots = __commonJS({
  "../services/node_modules/protobufjs/src/roots.js"(exports2, module2) {
    "use strict";
    module2.exports = {};
  }
});

// ../services/node_modules/protobufjs/src/index-minimal.js
var require_index_minimal = __commonJS({
  "../services/node_modules/protobufjs/src/index-minimal.js"(exports2) {
    "use strict";
    var protobuf = exports2;
    protobuf.build = "minimal";
    protobuf.Writer = require_writer();
    protobuf.BufferWriter = require_writer_buffer();
    protobuf.Reader = require_reader();
    protobuf.BufferReader = require_reader_buffer();
    protobuf.util = require_minimal();
    protobuf.rpc = require_rpc();
    protobuf.roots = require_roots();
    protobuf.configure = configure;
    function configure() {
      protobuf.util._configure();
      protobuf.Writer._configure(protobuf.BufferWriter);
      protobuf.Reader._configure(protobuf.BufferReader);
    }
    configure();
  }
});

// ../services/node_modules/protobufjs/minimal.js
var require_minimal2 = __commonJS({
  "../services/node_modules/protobufjs/minimal.js"(exports2, module2) {
    "use strict";
    module2.exports = require_index_minimal();
  }
});

// src/mud.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// src/commands/deprecated/bulkupload.ts
import { execa } from "execa";
import path from "path";
var contractsDirectory = new URL("../src/contracts", import.meta.url).pathname;
var commandModule = {
  command: "bulkupload",
  describe: "Uploads the provided ECS state to the provided World",
  builder(yargs2) {
    return yargs2.options({
      statePath: { type: "string", demandOption: true, desc: "Path to the ECS state to upload" },
      worldAddress: { type: "string", demandOption: true, desc: "Contract address of the World to upload to" },
      rpc: { type: "string", demandOption: true, desc: "JSON RPC endpoint" }
    });
  },
  async handler({ statePath, worldAddress, rpc }) {
    console.log("Uploading state at ", statePath, "to", worldAddress, "on", rpc);
    const url = path.join(contractsDirectory, "BulkUpload.sol");
    console.log("Using BulkUpload script from", url);
    try {
      await execa("forge", [
        "script",
        "--sig",
        '"run(string, address)"',
        "--rpc-url",
        rpc,
        `${url}:BulkUpload`,
        statePath,
        worldAddress
      ]);
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  }
};
var bulkupload_default = commandModule;

// src/commands/deprecated/call-system.ts
import { defaultAbiCoder as abi } from "ethers/lib/utils.js";
import path2 from "path";
var commandModule2 = {
  command: "call-system",
  describe: "Execute a mud system",
  builder(yargs2) {
    return yargs2.options({
      rpc: { type: "string", description: "json rpc endpoint, defaults to http://localhost:8545" },
      caller: { type: "string", description: "caller address" },
      world: { type: "string", required: true, description: "world contract address" },
      systemId: { type: "string", description: "system id preimage (eg mud.system.Move)" },
      systemAddress: { type: "string", description: "system address (alternative to system id)" },
      argTypes: { type: "array", string: true, description: "system argument types for abi encoding" },
      args: { type: "array", description: "system arguments" },
      calldata: { type: "string", description: "abi encoded system arguments (instead of args/argTypes)" },
      broadcast: { type: "boolean", description: "send txs to the chain" },
      callerPrivateKey: {
        type: "string",
        description: "must be set if broadcast is set, must correspond to caller address"
      },
      debug: { type: "boolean", description: "open debugger" }
    });
  },
  async handler({ rpc, caller, world, systemId, argTypes, args, calldata, broadcast, callerPrivateKey, debug }) {
    const encodedArgs = calldata ?? (argTypes && args && abi.encode(argTypes, args)) ?? "";
    const testDir = await getTestDirectory();
    await execLog("forge", [
      "script",
      "--fork-url",
      rpc ?? "http://localhost:8545",
      // default anvil rpc
      "--sig",
      "debug(address,address,string,bytes,bool)",
      path2.join(testDir, "utils/Debug.sol"),
      // the cli expects the Debug.sol file at this path
      caller ?? "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      // default anvil deployer
      world,
      systemId || "",
      encodedArgs,
      broadcast ? "true" : "false",
      "-vvvvv",
      broadcast ? "--broadcast" : "",
      callerPrivateKey ? `--private-key ${callerPrivateKey}` : "",
      debug ? "--debug" : ""
    ]);
    process.exit(0);
  }
};
var call_system_default = commandModule2;

// src/commands/deprecated/codegen-libdeploy.ts
var commandModule3 = {
  command: "codegen-libdeploy",
  describe: "Generate LibDeploy.sol from given deploy config",
  builder(yargs2) {
    return yargs2.options({
      config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
      out: { type: "string", default: ".", desc: "Output directory for LibDeploy.sol" },
      systems: { type: "string", desc: "Only generate deploy code for the given systems" }
    });
  },
  async handler({ config: config2, out, systems }) {
    await generateLibDeploy(config2, out, systems);
    process.exit(0);
  }
};
var codegen_libdeploy_default = commandModule3;

// src/commands/deprecated/deploy-contracts.ts
import openurl from "openurl";
import chalk from "chalk";
var commandModule4 = {
  command: "deploy-contracts",
  describe: "Deploy mud contracts",
  builder(yargs2) {
    return yargs2.options({
      config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
      deployerPrivateKey: { type: "string", desc: "Deployer private key. If omitted, deployment is not broadcasted." },
      worldAddress: { type: "string", desc: "World address to deploy to. If omitted, a new World is deployed." },
      rpc: { type: "string", default: "http://localhost:8545", desc: "RPC URL of the network to deploy to." },
      systems: { type: "string", desc: "Only upgrade the given systems. Requires World address." },
      reuseComponents: { type: "boolean", desc: "Skip deploying components and initialization." },
      watch: { type: "boolean", desc: "Automatically redeploy changed systems" },
      dev: { type: "boolean", desc: "Automatically use funded dev private key for local development" },
      openUrl: {
        type: "string",
        desc: "Opens a browser at the provided url with the worldAddress url param prefilled"
      },
      gasPrice: { type: "number", desc: "Gas price to set for deploy transactions" }
    });
  },
  async handler({
    config: config2,
    deployerPrivateKey,
    worldAddress,
    rpc,
    systems,
    reuseComponents,
    watch,
    dev,
    openUrl,
    gasPrice
  }) {
    if (systems != null && !worldAddress) {
      console.error("Error: Upgrading systems requires a World address.");
      process.exit(1);
    }
    deployerPrivateKey = deployerPrivateKey ?? (dev ? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" : void 0);
    let genDeployResult;
    try {
      genDeployResult = await generateAndDeploy({
        config: config2,
        deployerPrivateKey,
        worldAddress,
        rpc,
        systems,
        reuseComponents,
        clear: true,
        gasPrice
      });
    } catch (e) {
      if (!e.stderr) {
        console.log(e);
      }
      console.log(chalk.red("\n-----------\nError during generateAndDeploy (see above)"));
      process.exit();
    }
    const { deployedWorldAddress, initialBlockNumber } = genDeployResult;
    console.log("World deployed at", worldAddress, "at block", initialBlockNumber);
    if (deployedWorldAddress && openUrl) {
      const url = new URL(openUrl);
      url.searchParams.set("worldAddress", deployedWorldAddress);
      console.log("");
      console.log(chalk.cyan("Opening client URL to", url.toString()));
      console.log("");
      openurl.open(url.toString());
    }
    if (watch) {
      const srcDir = await getSrcDirectory();
      hsr(srcDir, async (systems2) => {
        try {
          return await generateAndDeploy({
            config: config2,
            deployerPrivateKey,
            worldAddress,
            rpc,
            systems: systems2,
            gasPrice,
            reuseComponents: true
          });
        } catch (e) {
          if (!e.stderr) {
            console.log(e);
          }
          console.log(chalk.red("\n-----------\nError during generateAndDeploy in HSR (see above)"));
        }
      });
    } else {
      process.exit(0);
    }
  }
};
var deploy_contracts_default = commandModule4;

// src/commands/deprecated/system-types.ts
var commandModule5 = {
  command: "system-types",
  describe: `Generates system type file. Note: assumes contracts of all systems in <forge src path>/${systemsDir} folder, ABIs of all systems in ./abi and typechain generated types in ./types/ethers-contracts`,
  builder(yargs2) {
    return yargs2.options({
      outputDir: {
        type: "string",
        description: "generated types directory, defaults to ./types",
        default: "./types"
      }
    });
  },
  async handler({ outputDir }) {
    await generateSystemTypes(outputDir);
  }
};
var system_types_default = commandModule5;

// src/commands/deprecated/test.ts
var commandModule6 = {
  command: "test",
  describe: "Run contract tests",
  builder(yargs2) {
    return yargs2.options({
      forgeOpts: { type: "string", desc: "Options passed to `forge test` command" },
      config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
      v: { type: "number", default: 2, desc: "Verbosity for forge test" }
    });
  },
  async handler({ forgeOpts, config: config2, v }) {
    const testDir = await getTestDirectory();
    console.log("Generate LibDeploy.sol");
    await generateLibDeploy(config2, testDir);
    const child = execLog("forge", [
      "test",
      ...v ? ["-" + [...new Array(v)].map(() => "v").join("")] : [],
      ...forgeOpts?.split(" ") || []
    ]);
    process.on("SIGINT", async () => {
      console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
      child.kill();
      await resetLibDeploy(testDir);
      process.exit();
    });
    await child;
    console.log("Reset LibDeploy.sol");
    await resetLibDeploy(testDir);
  }
};
var test_default = commandModule6;

// src/commands/deprecated/trace.ts
import { readFileSync } from "fs";
import { Contract } from "ethers";

// ../solecs/abi/World.json
var World_default = {
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "componentId",
          type: "uint256"
        },
        {
          indexed: true,
          internalType: "address",
          name: "component",
          type: "address"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        }
      ],
      name: "ComponentValueRemoved",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "componentId",
          type: "uint256"
        },
        {
          indexed: true,
          internalType: "address",
          name: "component",
          type: "address"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      name: "ComponentValueSet",
      type: "event"
    },
    {
      inputs: [],
      name: "components",
      outputs: [
        {
          internalType: "contract IUint256Component",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256"
        }
      ],
      name: "getComponent",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "componentAddr",
          type: "address"
        }
      ],
      name: "getComponentIdFromAddress",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getNumEntities",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "systemId",
          type: "uint256"
        }
      ],
      name: "getSystemAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getUniqueEntityId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        }
      ],
      name: "hasEntity",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "init",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "enum QueryType",
              name: "queryType",
              type: "uint8"
            },
            {
              internalType: "uint256",
              name: "componentId",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "value",
              type: "bytes"
            }
          ],
          internalType: "struct WorldQueryFragment[]",
          name: "worldQueryFragments",
          type: "tuple[]"
        }
      ],
      name: "query",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "register",
      outputs: [
        {
          internalType: "contract RegisterSystem",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "componentAddr",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "id",
          type: "uint256"
        }
      ],
      name: "registerComponent",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        }
      ],
      name: "registerComponentValueRemoved",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "component",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        }
      ],
      name: "registerComponentValueRemoved",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "component",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      name: "registerComponentValueSet",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "entity",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      name: "registerComponentValueSet",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "systemAddr",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "id",
          type: "uint256"
        }
      ],
      name: "registerSystem",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "systems",
      outputs: [
        {
          internalType: "contract IUint256Component",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ],
  bytecode: {
    object: "0x6080604052604051620000129062000295565b604051809103906000f0801580156200002f573d6000803e3d6000fd5b50600080546001600160a01b0319166001600160a01b03929092169190911790553480156200005d57600080fd5b5060007f4350dba81aa91e31664a09d24a668f006169a11b3d962b7557aed362d3252aec60001c6040516200009290620002a3565b6001600160a01b0390921682526020820152604001604051809103906000f080158015620000c4573d6000803e3d6000fd5b50600180546001600160a01b0319166001600160a01b03929092169190911790556040516000907f017c816a964927a00e050edd780dcf113ca2756dfa9e9fda94a05c140d9317b0906200011890620002a3565b6001600160a01b0390921682526020820152604001604051809103906000f0801580156200014a573d6000803e3d6000fd5b50600280546001600160a01b0319166001600160a01b03928316179055600154604051309291909116906200017f90620002b1565b6001600160a01b03928316815291166020820152604001604051809103906000f080158015620001b3573d6000803e3d6000fd5b50600380546001600160a01b0319166001600160a01b039283169081179091556002546040516309fded4760e31b8152600481019290925290911690634fef6a3890602401600060405180830381600087803b1580156200021357600080fd5b505af115801562000228573d6000803e3d6000fd5b50506001546003546040516309fded4760e31b81526001600160a01b03918216600482015291169250634fef6a389150602401600060405180830381600087803b1580156200027657600080fd5b505af11580156200028b573d6000803e3d6000fd5b50505050620002bf565b61084a8062002a1f83390190565b612bba806200326983390190565b6110268062005e2383390190565b61275080620002cf6000396000f3fe608060405234801561001057600080fd5b506004361061011b5760003560e01c8063af104e40116100b2578063d803064a11610081578063e3d1287511610066578063e3d128751461023b578063f30347701461025e578063fb3ec48b1461027157600080fd5b8063d803064a14610220578063e1c7392a1461023357600080fd5b8063af104e40146101e1578063ba62fbe4146101f4578063cfd3c57f14610205578063d7ecf62b1461021857600080fd5b80634f27da18116100ee5780634f27da1814610185578063614bfa6e14610198578063687485a6146101ae5780639f54f545146101ce57600080fd5b80630d59332e146101205780630de3b7b51461014a5780631aa3a0081461015f5780631ee444b714610172575b600080fd5b6002546001600160a01b03165b6040516001600160a01b0390911681526020015b60405180910390f35b61015d6101583660046120ef565b610284565b005b60035461012d906001600160a01b031681565b61015d610180366004612124565b610389565b61012d6101933660046120ef565b61042d565b6101a061044c565b604051908152602001610141565b6101c16101bc36600461214e565b6104aa565b60405161014191906121c3565b6101a06101dc366004612207565b61066f565b61015d6101ef36600461226b565b610688565b6001546001600160a01b031661012d565b61015d6102133660046122c5565b61083e565b6101a06109c7565b61015d61022e366004612124565b610a44565b61015d610b71565b61024e6102493660046120ef565b610d1f565b6040519015158152602001610141565b61015d61026c366004612124565b610d8d565b61012d61027f3660046120ef565b610dba565b600154604051636667bd4760e11b81523360048201819052916001600160a01b03169063cccf7a8e90602401602060405180830381865afa1580156102cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102f19190612311565b6103425760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f742072656769737465726564000000000000000060448201526064015b60405180910390fd5b6001548290339061035c906001600160a01b031682610dd3565b6040517f6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b35090600090a45050565b6003546040516001600160a01b03909116906309c5eabe906103b690339060019087908790602001612349565b6040516020818303038152906040526040518263ffffffff1660e01b81526004016103e191906123c7565b6000604051808303816000875af1158015610400573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526104289190810190612441565b505050565b600154600090610446906001600160a01b031683610f24565b92915050565b6000806104576109c7565b905060005b81610466816124eb565b9250508160405160200161047c91815260200190565b6040516020818303038152906040528051906020012060001c90506104a081610d1f565b61045c5792915050565b606060008267ffffffffffffffff8111156104c7576104c76123fa565b60405190808252806020026020018201604052801561051457816020015b604080516060808201835260008083526020830152918101919091528152602001906001900390816104e55790505b50905060005b8381101561065d57604051806060016040528086868481811061053f5761053f612523565b90506020028101906105519190612539565b61055f906020810190612577565b600581111561057057610570612333565b81526001546020909101906105b5906001600160a01b031688888681811061059a5761059a612523565b90506020028101906105ac9190612539565b60200135611023565b6001600160a01b031681526020018686848181106105d5576105d5612523565b90506020028101906105e79190612539565b6105f5906040810190612598565b8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152505050915250825183908390811061063f5761063f612523565b60200260200101819052508080610655906124eb565b91505061051a565b506106678161102f565b949350505050565b600154600090610446906001600160a01b031683610dd3565b60015484906001600160a01b031663cccf7a8e6106ab836001600160a01b031690565b6040518263ffffffff1660e01b81526004016106c991815260200190565b602060405180830381865afa1580156106e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061070a9190612311565b6107565760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f74207265676973746572656400000000000000006044820152606401610339565b336001600160a01b0386161461076b57600080fd5b6000546040517f1003e2d2000000000000000000000000000000000000000000000000000000008152600481018690526001600160a01b0390911690631003e2d290602401600060405180830381600087803b1580156107ca57600080fd5b505af11580156107de573d6000803e3d6000fd5b50506001548692506001600160a01b0380891692506107fe911688610dd3565b7f6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073868660405161082f9291906125fd565b60405180910390a45050505050565b600154604051636667bd4760e11b81523360048201819052916001600160a01b03169063cccf7a8e90602401602060405180830381865afa158015610887573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108ab9190612311565b6108f75760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f74207265676973746572656400000000000000006044820152606401610339565b6000546040517f1003e2d2000000000000000000000000000000000000000000000000000000008152600481018690526001600160a01b0390911690631003e2d290602401600060405180830381600087803b15801561095657600080fd5b505af115801561096a573d6000803e3d6000fd5b5050600154869250339150610988906001600160a01b031682610dd3565b7f6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a607386866040516109b99291906125fd565b60405180910390a450505050565b60008060009054906101000a90046001600160a01b03166001600160a01b031663949d225d6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a1b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3f919061262c565b905090565b60015482906001600160a01b031663cccf7a8e610a67836001600160a01b031690565b6040518263ffffffff1660e01b8152600401610a8591815260200190565b602060405180830381865afa158015610aa2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ac69190612311565b610b125760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f74207265676973746572656400000000000000006044820152606401610339565b336001600160a01b03841614610b2757600080fd5b60015482906001600160a01b0380861691610b43911686610dd3565b6040517f6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b35090600090a4505050565b6001546040517f9d2c76b40000000000000000000000000000000000000000000000000000000081523060048201526001600160a01b0390911690639d2c76b490602401600060405180830381600087803b158015610bcf57600080fd5b505af1158015610be3573d6000803e3d6000fd5b50506002546040517f9d2c76b40000000000000000000000000000000000000000000000000000000081523060048201526001600160a01b039091169250639d2c76b49150602401600060405180830381600087803b158015610c4557600080fd5b505af1158015610c59573d6000803e3d6000fd5b50506003546040516001600160a01b0390911692506309c5eabe9150610caa90339060019085907f554d0b3fe5f19a44775dc4000490ad0bafbc48129e8e396be983226890aece9990602001612349565b6040516020818303038152906040526040518263ffffffff1660e01b8152600401610cd591906123c7565b6000604051808303816000875af1158015610cf4573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610d1c9190810190612441565b50565b60008054604051636667bd4760e11b8152600481018490526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015610d69573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104469190612311565b6003546040516001600160a01b03909116906309c5eabe906103b690339060009087908790602001612349565b600254600090610446906001600160a01b031683610f24565b6000826001600160a01b031663cccf7a8e610df4846001600160a01b031690565b6040518263ffffffff1660e01b8152600401610e1291815260200190565b602060405180830381865afa158015610e2f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e539190612311565b610e9f5760405162461bcd60e51b815260206004820152601660248201527f61646472657373206e6f742072656769737465726564000000000000000000006044820152606401610339565b826001600160a01b0316630ff4c916610ebe846001600160a01b031690565b6040518263ffffffff1660e01b8152600401610edc91815260200190565b602060405180830381865afa158015610ef9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1d919061262c565b9392505050565b6040517ffbdfa1ea0000000000000000000000000000000000000000000000000000000081526004810182905260009081906001600160a01b0385169063fbdfa1ea90602401600060405180830381865afa158015610f87573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610faf9190810190612645565b905080516000036110025760405162461bcd60e51b815260206004820152601160248201527f6964206e6f7420726567697374657265640000000000000000000000000000006044820152606401610339565b6106678160008151811061101857611018612523565b602002602001015190565b6000610f1d8383610f24565b606061103961207c565b7620000000000000000000000000000000000000000000008152600060208201819052600160808301525b835181101561148257600084828151811061108157611081612523565b6020026020010151905061109481611495565b156110e2576004815160058111156110ae576110ae612333565b036110bb57604083018190525b6005815160058111156110d0576110d0612333565b036110dd57606083018190525b61146f565b826080015115611388576110f5816114d0565b6111415760405162461bcd60e51b815260206004820152601960248201527f4e454741544956455f494e495449414c5f465241474d454e54000000000000006044820152606401610339565b600060808401819052808251600581111561115e5761115e612333565b146111e15781602001516001600160a01b031663b361be4683604001516040518263ffffffff1660e01b815260040161119791906123c7565b600060405180830381865afa1580156111b4573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526111dc9190810190612645565b61124b565b81602001516001600160a01b03166331b933b96040518163ffffffff1660e01b8152600401600060405180830381865afa158015611223573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261124b9190810190612645565b9050611256816114f4565b84528051602080860191909152606085015101516001600160a01b03161580159061129c5750600084606001516040015180602001905181019061129a919061262c565b115b156113825760005b81518110156113805760006112f68383815181106112c4576112c4612523565b60200260200101518760600151602001518860600151604001518060200190518101906112f1919061262c565b61155c565b905060005b815181101561136b5761134461133c604051806040016040528085858151811061132757611327612523565b60200260200101518152602001600081525090565b885190611768565b875260208701805190611356826124eb565b90525080611363816124eb565b9150506112fb565b50508080611378906124eb565b9150506112a4565b505b5061146f565b82517620000000000000000000000000000000000000000000009060009060019060601c69ffffffffffffffffffff165b81156114645760006113dd8260408051808201909152600080825260208201525090565b805190915060006113ee82896117cd565b90506113fc8a898484611ad0565b9050801561143a5761142a6114236040518060400160405280858152602001600081525090565b8890611768565b965085611436816124eb565b9650505b6114478a89848a8a611b55565b8b5160b01c8601519198509650801515955093506113b992505050565b505090845260208401525b508061147a816124eb565b915050611064565b50610f1d81600001518260200151611ccc565b60006004825160058111156114ac576114ac612333565b1480610446575060055b825160058111156114c9576114c9612333565b1492915050565b600080825160058111156114e6576114e6612333565b1480610446575060026114b6565b76200000000000000000000000000000000000000000000060005b82518110156115565761154261153b604051806040016040528086858151811061132757611327612523565b8390611768565b91508061154e816124eb565b91505061150f565b50919050565b60608160000361157b5750604080516000815260208101909152610f1d565b6000836001600160a01b031663b361be468660405160200161159f91815260200190565b6040516020818303038152906040526040518263ffffffff1660e01b81526004016115ca91906123c7565b600060405180830381865afa1580156115e7573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261160f9190810190612645565b905082600103611620579050610f1d565b7620000000000000000000000000000000000000000000006000805b83518110156116e157600061167285838151811061165c5761165c612523565b60200260200101518960018a6112f191906126eb565b905060005b81518110156116cc576116aa6116a3604051806040016040528085858151811061132757611327612523565b8690611768565b9450836116b6816124eb565b94505080806116c4906124eb565b915050611677565b505080806116d9906124eb565b91505061163c565b5060006116fa838551846116f59190612702565b611ccc565b905060005b845181101561175c5784818151811061171a5761171a612523565b602002602001015182828561172f9190612702565b8151811061173f5761173f612523565b602090810291909101015280611754816124eb565b9150506116ff565b50979650505050505050565b6000808360501b60b01c116001811461178d578260101b8360601b85171791506117c6565b828460b01c8560a01b60b01c01528260101b7fffffffffffffffffffffffffffffffffffffffff00000000000000000000000085161791505b5092915050565b600080825160058111156117e3576117e3612333565b0361185e576020820151604051636667bd4760e11b8152600481018590526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015611833573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118579190612311565b9050610446565b60028251600581111561187357611873612333565b0361191f5760208201516040517fb8bc073d000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b039091169063b8bc073d90602401600060405180830381865afa1580156118dc573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526119049190810190612441565b80519060200120826040015180519060200120149050610446565b60018251600581111561193457611934612333565b036119b0576020820151604051636667bd4760e11b8152600481018590526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015611984573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119a89190612311565b159050610446565b6003825160058111156119c5576119c5612333565b03611a725760208201516040517fb8bc073d000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b039091169063b8bc073d90602401600060405180830381865afa158015611a2e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052611a569190810190612441565b8051906020012082604001518051906020012014159050610446565b611a7b82611da4565b611ac75760405162461bcd60e51b815260206004820152601260248201527f4e4f5f454e544954595f465241474d454e5400000000000000000000000000006044820152606401610339565b50600092915050565b6040840151602001516000906001600160a01b031615801590611b0e57506000856040015160400151806020019051810190611b0c919061262c565b115b8015611b215750611b1f8285611e03565b155b15611b4d57600080611b3885878960400151611e2e565b915091508015611b4a57509050610667565b50505b509392505050565b60608501516020015160009081906001600160a01b031615801590611b9557506000876060015160400151806020019051810190611b93919061262c565b115b15611cc0576000611bc5868960600151602001518a60600151604001518060200190518101906112f1919061262c565b905060005b8151811015611cbd576000828281518110611be757611be7612523565b602002602001015190506000611bfd828b6117cd565b905080158015611c1d575060408b0151602001516001600160a01b031615155b8015611c44575060008b6040015160400151806020019051810190611c42919061262c565b115b15611c6c57600080611c5b848d8f60400151611e2e565b915091508015611c69578192505b50505b8015611ca857611c98611c9160405180604001604052808c8152602001600081525090565b8990611768565b975086611ca4816124eb565b9750505b50508080611cb5906124eb565b915050611bca565b50505b50919590945092505050565b60608167ffffffffffffffff811115611ce757611ce76123fa565b604051908082528060200260200182016040528015611d10578160200160208202803683370190505b509050811561044657600169ffffffffffffffffffff606085901c1660005b8215611d9b576000611d538360408051808201909152600080825260208201525090565b90508060000151858381518110611d6c57611d6c612523565b602090810291909101015281611d81816124eb565b60b089901c94909401518015159550939250611d2f915050565b50505092915050565b60008082516005811115611dba57611dba612333565b1480611dd85750600282516005811115611dd657611dd6612333565b145b80611df6575060015b82516005811115611df457611df4612333565b145b80610446575060036114b6565b6000828015611e165750611e16826114d0565b80610f1d575082158015610f1d5750610f1d82612073565b600080611e3a84611da4565b611e865760405162461bcd60e51b815260206004820152601260248201527f4e4f5f454e544954595f465241474d454e5400000000000000000000000000006044820152606401610339565b600483516005811115611e9b57611e9b612333565b14611ee85760405162461bcd60e51b815260206004820152601660248201527f4e4f5f50524f58595f524541445f465241474d454e54000000000000000000006044820152606401610339565b8460005b8460400151806020019051810190611f04919061262c565b811015612064576020850151604051636667bd4760e11b8152600481018490526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015611f56573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f7a9190612311565b611f8a57506000915061206b9050565b60208501516040517fb8bc073d000000000000000000000000000000000000000000000000000000008152600481018490526001600160a01b039091169063b8bc073d90602401600060405180830381865afa158015611fee573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526120169190810190612441565b806020019051810190612029919061262c565b915061203582876117cd565b93506120418487611e03565b1561205257506001915061206b9050565b8061205c816124eb565b915050611eec565b5060019150505b935093915050565b60006001611de1565b6040805160a081018252600080825260208201529081016120b86040805160608101909152806000815260006020820152606060409091015290565b81526020016120e26040805160608101909152806000815260006020820152606060409091015290565b8152600060209091015290565b60006020828403121561210157600080fd5b5035919050565b80356001600160a01b038116811461211f57600080fd5b919050565b6000806040838503121561213757600080fd5b61214083612108565b946020939093013593505050565b6000806020838503121561216157600080fd5b823567ffffffffffffffff8082111561217957600080fd5b818501915085601f83011261218d57600080fd5b81358181111561219c57600080fd5b8660208260051b85010111156121b157600080fd5b60209290920196919550909350505050565b6020808252825182820181905260009190848201906040850190845b818110156121fb578351835292840192918401916001016121df565b50909695505050505050565b60006020828403121561221957600080fd5b610f1d82612108565b60008083601f84011261223457600080fd5b50813567ffffffffffffffff81111561224c57600080fd5b60208301915083602082850101111561226457600080fd5b9250929050565b6000806000806060858703121561228157600080fd5b61228a85612108565b935060208501359250604085013567ffffffffffffffff8111156122ad57600080fd5b6122b987828801612222565b95989497509550505050565b6000806000604084860312156122da57600080fd5b83359250602084013567ffffffffffffffff8111156122f857600080fd5b61230486828701612222565b9497909650939450505050565b60006020828403121561232357600080fd5b81518015158114610f1d57600080fd5b634e487b7160e01b600052602160045260246000fd5b6001600160a01b03858116825260808201906002861061237957634e487b7160e01b600052602160045260246000fd5b85602084015280851660408401525082606083015295945050505050565b60005b838110156123b257818101518382015260200161239a565b838111156123c1576000848401525b50505050565b60208152600082518060208401526123e6816040850160208701612397565b601f01601f19169190910160400192915050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715612439576124396123fa565b604052919050565b60006020828403121561245357600080fd5b815167ffffffffffffffff8082111561246b57600080fd5b818401915084601f83011261247f57600080fd5b815181811115612491576124916123fa565b6124a46020601f19601f84011601612410565b91508082528560208285010111156124bb57600080fd5b6124cc816020840160208601612397565b50949350505050565b634e487b7160e01b600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361251c5761251c6124d5565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa183360301811261256d57600080fd5b9190910192915050565b60006020828403121561258957600080fd5b813560068110610f1d57600080fd5b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18436030181126125cd57600080fd5b83018035915067ffffffffffffffff8211156125e857600080fd5b60200191503681900382131561226457600080fd5b60208152816020820152818360408301376000818301604090810191909152601f909201601f19160101919050565b60006020828403121561263e57600080fd5b5051919050565b6000602080838503121561265857600080fd5b825167ffffffffffffffff8082111561267057600080fd5b818501915085601f83011261268457600080fd5b815181811115612696576126966123fa565b8060051b91506126a7848301612410565b81815291830184019184810190888411156126c157600080fd5b938501935b838510156126df578451825293850193908501906126c6565b98975050505050505050565b6000828210156126fd576126fd6124d5565b500390565b60008219821115612715576127156124d5565b50019056fea2646970667358221220902eb3055e323ca228bea31c34153f51121c8b0cf5d6599836cd2715299e67a564736f6c634300080d0033608060405234801561001057600080fd5b5061001a3361001f565b6100b4565b600061003361009060201b6105431760201c565b80546040519192506001600160a01b03808516929116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380546001600160a01b0319166001600160a01b0392909216919091179055565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b610787806100c36000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80638e7cb6e11161005b5780638e7cb6e114610100578063949d225d1461012a578063cccf7a8e1461013b578063f2fde38b1461015e57600080fd5b80631003e2d21461008d578063410d59cc146100a25780634cc82215146100c05780638da5cb5b146100d3575b600080fd5b6100a061009b36600461061b565b610171565b005b6100aa610233565b6040516100b79190610634565b60405180910390f35b6100a06100ce36600461061b565b61028b565b6100db6103ef565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016100b7565b61011361010e36600461061b565b610434565b6040805192151583526020830191909152016100b7565b6000546040519081526020016100b7565b61014e61014936600461061b565b610467565b60405190151581526020016100b7565b6100a061016c366004610678565b6104ca565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1633146101e1576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6101ea81610467565b61023057600080548282526001602081905260408320829055810182559080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563018190555b50565b6060600080548060200260200160405190810160405280929190818152602001828054801561028157602002820191906000526020600020905b81548152602001906001019080831161026d575b5050505050905090565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1633146102fb576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61030481610467565b156102305760008054610319906001906106b5565b81548110610329576103296106f3565b9060005260206000200154600060016000848152602001908152602001600020548154811061035a5761035a6106f3565b60009182526020808320909101929092558281526001918290526040812054815490929190819084908110610391576103916106f3565b9060005260206000200154815260200190815260200160002081905550600160008281526020019081526020016000206000905560008054806103d6576103d6610722565b6001900381819060005260206000200160009055905550565b600061042f7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1690565b905090565b60008061044083610467565b61044f57506000928392509050565b50506000908152600160208190526040909120549091565b60008054810361047957506000919050565b60008281526001602052604081205490036104b55781600080815481106104a2576104a26106f3565b9060005260206000200154149050919050565b50600090815260016020526040902054151590565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff16331461053a576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61023081610567565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804608054604051610230928492909173ffffffffffffffffffffffffffffffffffffffff8085169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b60006020828403121561062d57600080fd5b5035919050565b6020808252825182820181905260009190848201906040850190845b8181101561066c57835183529284019291840191600101610650565b50909695505050505050565b60006020828403121561068a57600080fd5b813573ffffffffffffffffffffffffffffffffffffffff811681146106ae57600080fd5b9392505050565b6000828210156106ee577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b500390565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fdfea2646970667358221220b107c6e5a1895c7db00a5a31e8304afc9a033299a3c9f2108e90ed579f0a6aef64736f6c634300080d003360806040523480156200001157600080fd5b5060405162002bba38038062002bba83398101604081905262000034916200029a565b81818181620000433362000108565b60028190556001600160a01b03821615620000635762000063826200017c565b505060405162000073906200027e565b604051809103906000f08015801562000090573d6000803e3d6000fd5b50600380546001600160a01b0319166001600160a01b0392909216919091179055604051620000bf906200028c565b604051809103906000f080158015620000dc573d6000803e3d6000fd5b50600480546001600160a01b0319166001600160a01b039290921691909117905550620002d692505050565b60006200011f6200023460201b62000ae51760201c565b80546040519192506001600160a01b03808516929116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380546001600160a01b0319166001600160a01b0392909216919091179055565b6200018662000258565b6001600160a01b0316336001600160a01b031614620001b857604051632f7a8ee160e01b815260040160405180910390fd5b600080546001600160a01b0319166001600160a01b038316908117909155600254604051630f30347760e41b8152306004820152602481019190915263f303477090604401600060405180830381600087803b1580156200021857600080fd5b505af11580156200022d573d6000803e3d6000fd5b5050505050565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b60006200026f6200023460201b62000ae51760201c565b546001600160a01b0316919050565b61084a8062001ade83390190565b610892806200232883390190565b60008060408385031215620002ae57600080fd5b82516001600160a01b0381168114620002c657600080fd5b6020939093015192949293505050565b6117f880620002e66000396000f3fe608060405234801561001057600080fd5b50600436106101515760003560e01c80638b282947116100cd578063b8bc073d11610081578063cccf7a8e11610066578063cccf7a8e146102c0578063f2fde38b146102d3578063fbdfa1ea146102e657600080fd5b8063b8bc073d1461028d578063bf4fe57e146102ad57600080fd5b80639d2c76b4116100b25780639d2c76b41461025e578063af640d0f14610271578063b361be461461027a57600080fd5b80638b282947146102435780638da5cb5b1461025657600080fd5b80634cc82215116101245780636b122fe0116101095780636b122fe0146101f757806375c0669c1461020d578063861eb9051461022057600080fd5b80634cc82215146101d15780634fef6a38146101e457600080fd5b80630ff4c916146101565780631ab06ee51461017c57806330b67baa1461019157806331b933b9146101bc575b600080fd5b610169610164366004611267565b6102f9565b6040519081526020015b60405180910390f35b61018f61018a366004611280565b61031f565b005b6000546101a4906001600160a01b031681565b6040516001600160a01b039091168152602001610173565b6101c461034e565b60405161017391906112a2565b61018f6101df366004611267565b6103de565b61018f6101f23660046112e6565b610429565b6101ff6104b6565b604051610173929190611372565b61018f61021b3660046112e6565b6105a2565b61023361022e3660046112e6565b61064b565b6040519015158152602001610173565b61018f610251366004611500565b6106af565b6101a46106f8565b61018f61026c3660046112e6565b61072b565b61016960025481565b6101c4610288366004611547565b610821565b6102a061029b366004611267565b6108b3565b6040516101739190611584565b61018f6102bb3660046112e6565b610955565b6102336102ce366004611267565b6109df565b61018f6102e13660046112e6565b610a66565b6101c46102f4366004611267565b610ab9565b600080610305836108b3565b8060200190518101906103189190611597565b9392505050565b61034a828260405160200161033691815260200190565b6040516020818303038152906040526106af565b5050565b600354604080517f410d59cc00000000000000000000000000000000000000000000000000000000815290516060926001600160a01b03169163410d59cc9160048083019260009291908290030181865afa1580156103b1573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526103d991908101906115b0565b905090565b6103e73361064b565b61041d576040517f406ed3da00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61042681610b09565b50565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b0316331461047357604051632f7a8ee160e01b815260040160405180910390fd5b6001600160a01b031660009081527f8ffeadc5cba727b8cc3cdef48739619490ea317fdb3baae1259089d06f92c90960205260409020805460ff19166001179055565b604080516001808252818301909252606091829190816020015b60608152602001906001900390816104d0575050604080516001808252818301909252919350602080830190803683370190505090506040518060400160405280600581526020017f76616c75650000000000000000000000000000000000000000000000000000008152508260008151811061054f5761054f611656565b6020026020010181905250600d8160008151811061056f5761056f611656565b602002602001019060218111156105885761058861135c565b9081602181111561059b5761059b61135c565b9052509091565b6105ab3361064b565b6105e1576040517f406ed3da00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600580546001810182556000919091527f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db00180547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b6001600160a01b03811660009081527f8ffeadc5cba727b8cc3cdef48739619490ea317fdb3baae1259089d06f92c909602052604081205460ff16806106a957506106946106f8565b6001600160a01b0316826001600160a01b0316145b92915050565b6106b83361064b565b6106ee576040517f406ed3da00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61034a8282610d94565b60006103d97f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b031690565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b0316331461077557604051632f7a8ee160e01b815260040160405180910390fd5b600080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0383169081179091556002546040517ff3034770000000000000000000000000000000000000000000000000000000008152306004820152602481019190915263f3034770906044015b600060405180830381600087803b15801561080657600080fd5b505af115801561081a573d6000803e3d6000fd5b5050505050565b60048054825160208401206040517f796c5e94000000000000000000000000000000000000000000000000000000008152928301526060916001600160a01b039091169063796c5e9490602401600060405180830381865afa15801561088b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526106a991908101906115b0565b60008181526001602052604090208054606091906108d09061166c565b80601f01602080910402602001604051908101604052809291908181526020018280546108fc9061166c565b80156109495780601f1061091e57610100808354040283529160200191610949565b820191906000526020600020905b81548152906001019060200180831161092c57829003601f168201915b50505050509050919050565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b0316331461099f57604051632f7a8ee160e01b815260040160405180910390fd5b6001600160a01b031660009081527f8ffeadc5cba727b8cc3cdef48739619490ea317fdb3baae1259089d06f92c90960205260409020805460ff19169055565b6003546040517fcccf7a8e000000000000000000000000000000000000000000000000000000008152600481018390526000916001600160a01b03169063cccf7a8e90602401602060405180830381865afa158015610a42573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106a991906116a6565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b03163314610ab057604051632f7a8ee160e01b815260040160405180910390fd5b61042681610ff7565b60606106a982604051602001610ad191815260200190565b604051602081830303815290604052610821565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b6004546000828152600160205260409081902090516001600160a01b03909216916385edea1391610b39916116c8565b60405190819003812060e083901b7fffffffff000000000000000000000000000000000000000000000000000000001682526004820152602401602060405180830381865afa158015610b90573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bb49190611597565b600003610bbe5750565b6004546000828152600160205260409081902090516001600160a01b0390921691636526db7a91610bee916116c8565b60405190819003812060e083901b7fffffffff00000000000000000000000000000000000000000000000000000000168252600482015260248101849052604401600060405180830381600087803b158015610c4957600080fd5b505af1158015610c5d573d6000803e3d6000fd5b50506003546040517f4cc82215000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b039091169250634cc822159150602401600060405180830381600087803b158015610cc057600080fd5b505af1158015610cd4573d6000803e3d6000fd5b50505050610ce181611000565b60005b60055481101561034a5760058181548110610d0157610d01611656565b6000918252602090912001546040517f4cc82215000000000000000000000000000000000000000000000000000000008152600481018490526001600160a01b0390911690634cc8221590602401600060405180830381600087803b158015610d6957600080fd5b505af1158015610d7d573d6000803e3d6000fd5b505050508080610d8c90611763565b915050610ce4565b6003546040517f1003e2d2000000000000000000000000000000000000000000000000000000008152600481018490526001600160a01b0390911690631003e2d290602401600060405180830381600087803b158015610df357600080fd5b505af1158015610e07573d6000803e3d6000fd5b50506004546000858152600160205260409081902090516001600160a01b039092169350636526db7a9250610e3b916116c8565b60405190819003812060e083901b7fffffffff00000000000000000000000000000000000000000000000000000000168252600482015260248101859052604401600060405180830381600087803b158015610e9657600080fd5b505af1158015610eaa573d6000803e3d6000fd5b505060048054845160208601206040517f771602f700000000000000000000000000000000000000000000000000000000815292830152602482018690526001600160a01b0316925063771602f79150604401600060405180830381600087803b158015610f1757600080fd5b505af1158015610f2b573d6000803e3d6000fd5b50505050610f398282611061565b60005b600554811015610ff25760058181548110610f5957610f59611656565b6000918252602090912001546040517f0216b8380000000000000000000000000000000000000000000000000000000081526001600160a01b0390911690630216b83890610fad90869086906004016117a9565b600060405180830381600087803b158015610fc757600080fd5b505af1158015610fdb573d6000803e3d6000fd5b505050508080610fea90611763565b915050610f3c565b505050565b61042681611102565b600081815260016020526040812061101791611194565b6000546040517f0de3b7b5000000000000000000000000000000000000000000000000000000008152600481018390526001600160a01b0390911690630de3b7b5906024016107ec565b60008281526001602090815260409091208251611080928401906111ce565b506000546040517fcfd3c57f0000000000000000000000000000000000000000000000000000000081526001600160a01b039091169063cfd3c57f906110cc90859085906004016117a9565b600060405180830381600087803b1580156110e657600080fd5b505af11580156110fa573d6000803e3d6000fd5b505050505050565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046080546040516001600160a01b038481169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b5080546111a09061166c565b6000825580601f106111b0575050565b601f0160209004906000526020600020908101906104269190611252565b8280546111da9061166c565b90600052602060002090601f0160209004810192826111fc5760008555611242565b82601f1061121557805160ff1916838001178555611242565b82800160010185558215611242579182015b82811115611242578251825591602001919060010190611227565b5061124e929150611252565b5090565b5b8082111561124e5760008155600101611253565b60006020828403121561127957600080fd5b5035919050565b6000806040838503121561129357600080fd5b50508035926020909101359150565b6020808252825182820181905260009190848201906040850190845b818110156112da578351835292840192918401916001016112be565b50909695505050505050565b6000602082840312156112f857600080fd5b81356001600160a01b038116811461031857600080fd5b6000815180845260005b8181101561133557602081850181015186830182015201611319565b81811115611347576000602083870101525b50601f01601f19169290920160200192915050565b634e487b7160e01b600052602160045260246000fd5b6000604082016040835280855180835260608501915060608160051b8601019250602080880160005b838110156113e7577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa08887030185526113d586835161130f565b9550938201939082019060010161139b565b50508584038187015286518085528782019482019350915060005b8281101561143c5784516022811061142a57634e487b7160e01b600052602160045260246000fd5b84529381019392810192600101611402565b5091979650505050505050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561148857611488611449565b604052919050565b600082601f8301126114a157600080fd5b813567ffffffffffffffff8111156114bb576114bb611449565b6114ce6020601f19601f8401160161145f565b8181528460208386010111156114e357600080fd5b816020850160208301376000918101602001919091529392505050565b6000806040838503121561151357600080fd5b82359150602083013567ffffffffffffffff81111561153157600080fd5b61153d85828601611490565b9150509250929050565b60006020828403121561155957600080fd5b813567ffffffffffffffff81111561157057600080fd5b61157c84828501611490565b949350505050565b602081526000610318602083018461130f565b6000602082840312156115a957600080fd5b5051919050565b600060208083850312156115c357600080fd5b825167ffffffffffffffff808211156115db57600080fd5b818501915085601f8301126115ef57600080fd5b81518181111561160157611601611449565b8060051b915061161284830161145f565b818152918301840191848101908884111561162c57600080fd5b938501935b8385101561164a57845182529385019390850190611631565b98975050505050505050565b634e487b7160e01b600052603260045260246000fd5b600181811c9082168061168057607f821691505b6020821081036116a057634e487b7160e01b600052602260045260246000fd5b50919050565b6000602082840312156116b857600080fd5b8151801515811461031857600080fd5b600080835481600182811c9150808316806116e457607f831692505b6020808410820361170357634e487b7160e01b86526022600452602486fd5b818015611717576001811461172857611755565b60ff19861689528489019650611755565b60008a81526020902060005b8681101561174d5781548b820152908501908301611734565b505084890196505b509498975050505050505050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036117a257634e487b7160e01b600052601160045260246000fd5b5060010190565b82815260406020820152600061157c604083018461130f56fea2646970667358221220be1a9d3f65378b3e48bdc1a48690cf5c96158aa3929ddbcc8865a0ee69f8bc5264736f6c634300080d0033608060405234801561001057600080fd5b5061001a3361001f565b6100b4565b600061003361009060201b6105431760201c565b80546040519192506001600160a01b03808516929116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380546001600160a01b0319166001600160a01b0392909216919091179055565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b610787806100c36000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80638e7cb6e11161005b5780638e7cb6e114610100578063949d225d1461012a578063cccf7a8e1461013b578063f2fde38b1461015e57600080fd5b80631003e2d21461008d578063410d59cc146100a25780634cc82215146100c05780638da5cb5b146100d3575b600080fd5b6100a061009b36600461061b565b610171565b005b6100aa610233565b6040516100b79190610634565b60405180910390f35b6100a06100ce36600461061b565b61028b565b6100db6103ef565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016100b7565b61011361010e36600461061b565b610434565b6040805192151583526020830191909152016100b7565b6000546040519081526020016100b7565b61014e61014936600461061b565b610467565b60405190151581526020016100b7565b6100a061016c366004610678565b6104ca565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1633146101e1576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6101ea81610467565b61023057600080548282526001602081905260408320829055810182559080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563018190555b50565b6060600080548060200260200160405190810160405280929190818152602001828054801561028157602002820191906000526020600020905b81548152602001906001019080831161026d575b5050505050905090565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1633146102fb576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61030481610467565b156102305760008054610319906001906106b5565b81548110610329576103296106f3565b9060005260206000200154600060016000848152602001908152602001600020548154811061035a5761035a6106f3565b60009182526020808320909101929092558281526001918290526040812054815490929190819084908110610391576103916106f3565b9060005260206000200154815260200190815260200160002081905550600160008281526020019081526020016000206000905560008054806103d6576103d6610722565b6001900381819060005260206000200160009055905550565b600061042f7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1690565b905090565b60008061044083610467565b61044f57506000928392509050565b50506000908152600160208190526040909120549091565b60008054810361047957506000919050565b60008281526001602052604081205490036104b55781600080815481106104a2576104a26106f3565b9060005260206000200154149050919050565b50600090815260016020526040902054151590565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff16331461053a576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61023081610567565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804608054604051610230928492909173ffffffffffffffffffffffffffffffffffffffff8085169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b60006020828403121561062d57600080fd5b5035919050565b6020808252825182820181905260009190848201906040850190845b8181101561066c57835183529284019291840191600101610650565b50909695505050505050565b60006020828403121561068a57600080fd5b813573ffffffffffffffffffffffffffffffffffffffff811681146106ae57600080fd5b9392505050565b6000828210156106ee577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b500390565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fdfea2646970667358221220b107c6e5a1895c7db00a5a31e8304afc9a033299a3c9f2108e90ed579f0a6aef64736f6c634300080d0033608060405234801561001057600080fd5b5061001a3361001f565b6100b4565b600061003361009060201b6105691760201c565b80546040519192506001600160a01b03808516929116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380546001600160a01b0319166001600160a01b0392909216919091179055565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b6107cf806100c36000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c806385edea131161005b57806385edea13146100d35780638da5cb5b14610101578063a0265ff81461012e578063f2fde38b1461015157600080fd5b80636526db7a14610082578063771602f714610097578063796c5e94146100aa575b600080fd5b610095610090366004610641565b610164565b005b6100956100a5366004610641565b610301565b6100bd6100b8366004610663565b6103b5565b6040516100ca919061067c565b60405180910390f35b6100f36100e1366004610663565b60009081526020819052604090205490565b6040519081526020016100ca565b610109610415565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016100ca565b61014161013c366004610641565b61045a565b60405190151581526020016100ca565b61009561015f3660046106c0565b6104ed565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1633146101d4576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6101de828261045a565b156102fd57600082815260208190526040902080546101ff906001906106fd565b8154811061020f5761020f61073b565b600091825260208083209091015484835282825260408084206001845281852086865290935290922054815481106102495761024961073b565b6000918252602080832090910192909255838152600182526040808220848352808452818320548684528385529183208584529381905283549193909291849081106102975761029761073b565b600091825260208083209091015483528281019390935260409182018120939093558483526001825280832084845282528083208390558483529082905290208054806102e6576102e661076a565b600190038181906000526020600020016000905590555b5050565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff163314610371576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61037b828261045a565b6102fd5760009182526020828152604080842080546001808552838720868852855292862081905585845291820181558452922090910155565b6000818152602081815260409182902080548351818402810184019094528084526060939283018282801561040957602002820191906000526020600020905b8154815260200190600101908083116103f5575b50505050509050919050565b60006104557f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff1690565b905090565b6000828152602081905260408120548103610477575060006104e7565b600083815260016020908152604080832085845290915281205490036104c957600083815260208190526040812080548492906104b6576104b661073b565b90600052602060002001541490506104e7565b50600082815260016020908152604080832084845290915290205415155b92915050565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804605473ffffffffffffffffffffffffffffffffffffffff16331461055d576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6105668161058d565b50565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f6716804608054604051610566928492909173ffffffffffffffffffffffffffffffffffffffff8085169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b6000806040838503121561065457600080fd5b50508035926020909101359150565b60006020828403121561067557600080fd5b5035919050565b6020808252825182820181905260009190848201906040850190845b818110156106b457835183529284019291840191600101610698565b50909695505050505050565b6000602082840312156106d257600080fd5b813573ffffffffffffffffffffffffffffffffffffffff811681146106f657600080fd5b9392505050565b600082821015610736577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b500390565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fdfea264697066735822122037b9d977a58232297ee423fa1fe056fd7eeb61e13dc07a2cfe760aab14ed000a64736f6c634300080d003360806040523480156200001157600080fd5b50604051620010263803806200102683398101604081905262000034916200022c565b818162000041336200010f565b6001600160a01b03811615620000585780620000bd565b816001600160a01b031663ba62fbe46040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000097573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000bd91906200026b565b600080546001600160a01b03199081166001600160a01b0393841690811790925560018054909116928516928317905562000105919062000183602090811b6200079617901c565b5050505062000292565b600062000126620001ef60201b6200081a1760201c565b80546040519192506001600160a01b03808516929116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380546001600160a01b0319166001600160a01b0392909216919091179055565b7ff67304f10c7772c78e439bc5cb07781db345424de8878c18100fdaa64d197a8780546001600160a01b039384166001600160a01b0319918216179091557ff67304f10c7772c78e439bc5cb07781db345424de8878c18100fdaa64d197a868054929093169116179055565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b6001600160a01b03811681146200022957600080fd5b50565b600080604083850312156200024057600080fd5b82516200024d8162000213565b6020840151909250620002608162000213565b809150509250929050565b6000602082840312156200027e57600080fd5b81516200028b8162000213565b9392505050565b610d8480620002a26000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c80638da5cb5b116100505780638da5cb5b146100a9578063f2fde38b146100c9578063f6cd7a01146100de57600080fd5b806309c5eabe1461006c5780638b246a5b14610095575b600080fd5b61007f61007a366004610a1b565b6100f1565b60405161008c9190610ab0565b60405180910390f35b61007f6100a3366004610a1b565b50606090565b6100b16106b6565b6040516001600160a01b03909116815260200161008c565b6100dc6100d7366004610b1a565b6106ee565b005b61007f6100ec366004610b4b565b61075d565b60606000806000808580602001905181019061010d9190610b9c565b600154939750919550935091506001600160a01b0316331461019c5760405162461bcd60e51b815260206004820152602360248201527f73797374656d2063616e206f6e6c792062652063616c6c65642076696120576f60448201527f726c64000000000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b60008360018111156101b0576101b0610bef565b14806101cd575060018360018111156101cb576101cb610bef565b145b6102195760405162461bcd60e51b815260206004820152600c60248201527f696e76616c6964207479706500000000000000000000000000000000000000006044820152606401610193565b806000036102695760405162461bcd60e51b815260206004820152600a60248201527f696e76616c6964206964000000000000000000000000000000000000000000006044820152606401610193565b6001600160a01b0382166102bf5760405162461bcd60e51b815260206004820152600f60248201527f696e76616c6964206164647265737300000000000000000000000000000000006044820152606401610193565b6000808460018111156102d4576102d4610bef565b146103145760005461030f906001600160a01b03167f017c816a964927a00e050edd780dcf113ca2756dfa9e9fda94a05c140d9317b061083e565b610321565b6000546001600160a01b03165b905060006001600160a01b0384166040517fcccf7a8e000000000000000000000000000000000000000000000000000000008152600481018290529091506001600160a01b0383169063cccf7a8e90602401602060405180830381865afa158015610390573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103b49190610c05565b156104015760405162461bcd60e51b815260206004820152601960248201527f656e7469747920616c72656164792072656769737465726564000000000000006044820152606401610193565b6040517ffbdfa1ea000000000000000000000000000000000000000000000000000000008152600481018490526000906001600160a01b0384169063fbdfa1ea90602401600060405180830381865afa158015610462573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261048a9190810190610c27565b905080516000148061053a57508051600114801561053a5750866001600160a01b03166104ce826000815181106104c3576104c3610ccd565b602002602001015190565b6001600160a01b0316638da5cb5b6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561050b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061052f9190610ce3565b6001600160a01b0316145b6105ac5760405162461bcd60e51b815260206004820152602a60248201527f696420616c7265616479207265676973746572656420616e642063616c6c657260448201527f206e6f74206f776e6572000000000000000000000000000000000000000000006064820152608401610193565b805160010361063057826001600160a01b0316634cc82215826000815181106105d7576105d7610ccd565b60200260200101516040518263ffffffff1660e01b81526004016105fd91815260200190565b600060405180830381600087803b15801561061757600080fd5b505af115801561062b573d6000803e3d6000fd5b505050505b6040517f1ab06ee500000000000000000000000000000000000000000000000000000000815260048101839052602481018590526001600160a01b03841690631ab06ee590604401600060405180830381600087803b15801561069257600080fd5b505af11580156106a6573d6000803e3d6000fd5b5050505050505050505050919050565b60006106e97f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b031690565b905090565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460546001600160a01b03163314610751576040517f2f7a8ee100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61075a8161093a565b50565b606061078d858585856040516020016107799493929190610d00565b6040516020818303038152906040526100f1565b95945050505050565b7ff67304f10c7772c78e439bc5cb07781db345424de8878c18100fdaa64d197a8780546001600160a01b039384167fffffffffffffffffffffffff0000000000000000000000000000000000000000918216179091557ff67304f10c7772c78e439bc5cb07781db345424de8878c18100fdaa64d197a868054929093169116179055565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f67168046090565b6040517ffbdfa1ea0000000000000000000000000000000000000000000000000000000081526004810182905260009081906001600160a01b0385169063fbdfa1ea90602401600060405180830381865afa1580156108a1573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526108c99190810190610c27565b9050805160000361091c5760405162461bcd60e51b815260206004820152601160248201527f6964206e6f7420726567697374657265640000000000000000000000000000006044820152606401610193565b610932816000815181106104c3576104c3610ccd565b949350505050565b7f8a22373512790c48b83a1fe2efdd2888d4a917bcdc24d0adf63e60f671680460805460405161075a92849290916001600160a01b038085169216907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a380547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715610a1357610a136109d4565b604052919050565b60006020808385031215610a2e57600080fd5b823567ffffffffffffffff80821115610a4657600080fd5b818501915085601f830112610a5a57600080fd5b813581811115610a6c57610a6c6109d4565b610a7e84601f19601f840116016109ea565b91508082528684828501011115610a9457600080fd5b8084840185840137600090820190930192909252509392505050565b600060208083528351808285015260005b81811015610add57858101830151858201604001528201610ac1565b81811115610aef576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b038116811461075a57600080fd5b600060208284031215610b2c57600080fd5b8135610b3781610b05565b9392505050565b6002811061075a57600080fd5b60008060008060808587031215610b6157600080fd5b8435610b6c81610b05565b93506020850135610b7c81610b3e565b92506040850135610b8c81610b05565b9396929550929360600135925050565b60008060008060808587031215610bb257600080fd5b8451610bbd81610b05565b6020860151909450610bce81610b3e565b6040860151909350610bdf81610b05565b6060959095015193969295505050565b634e487b7160e01b600052602160045260246000fd5b600060208284031215610c1757600080fd5b81518015158114610b3757600080fd5b60006020808385031215610c3a57600080fd5b825167ffffffffffffffff80821115610c5257600080fd5b818501915085601f830112610c6657600080fd5b815181811115610c7857610c786109d4565b8060051b9150610c898483016109ea565b8181529183018401918481019088841115610ca357600080fd5b938501935b83851015610cc157845182529385019390850190610ca8565b98975050505050505050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215610cf557600080fd5b8151610b3781610b05565b6001600160a01b038581168252608082019060028610610d3057634e487b7160e01b600052602160045260246000fd5b8560208401528085166040840152508260608301529594505050505056fea2646970667358221220f9082b69045ef00eb4d4aca8bdf01a1fbca7f6f3a65578cbc6c3be53bf6dbc8864736f6c634300080d0033",
    sourceMap: "1597:5812:43:-:0;;;1649:9;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;1626:32:43;;;-1:-1:-1;;;;;;1626:32:43;-1:-1:-1;;;;;1626:32:43;;;;;;;;;;2005:327;;;;;;;;;;2068:1;107:39:45;99:48;;2039:55:43;;;;;:::i;:::-;-1:-1:-1;;;;;206:32:72;;;188:51;;270:2;255:18;;248:34;176:2;161:18;2039:55:43;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;2025:11:43;:69;;-1:-1:-1;;;;;;2025:69:43;-1:-1:-1;;;;;2025:69:43;;;;;;;;;;2111:52;;-1:-1:-1;;195:36:45;;2111:52:43;;;:::i;:::-;-1:-1:-1;;;;;206:32:72;;;188:51;;270:2;255:18;;248:34;176:2;161:18;2111:52:43;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;2100:8:43;:63;;-1:-1:-1;;;;;;2100:63:43;-1:-1:-1;;;;;2100:63:43;;;;;;-1:-1:-1;2213:11:43;2180:46;;2199:4;;2213:11;;;;;2180:46;;;:::i;:::-;-1:-1:-1;;;;;538:15:72;;;520:34;;590:15;;585:2;570:18;;563:43;470:2;455:18;2180:46:43;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;2169:8:43;:57;;-1:-1:-1;;;;;;2169:57:43;-1:-1:-1;;;;;2169:57:43;;;;;;;;;2232:8;;:43;;-1:-1:-1;;;2232:43:43;;;;;763:51:72;;;;2232:8:43;;;;:24;;736:18:72;;2232:43:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;2281:11:43;;2317:8;;2281:46;;-1:-1:-1;;;2281:46:43;;-1:-1:-1;;;;;2317:8:43;;;2281:46;;;763:51:72;2281:11:43;;;-1:-1:-1;2281:27:43;;-1:-1:-1;736:18:72;;2281:46:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1597:5812;;;;;;;;;;:::o;:::-;;;;;;;;:::o;:::-;;;;;;;;:::o;617:203:72:-;1597:5812:43;;;;;;",
    linkReferences: {}
  },
  deployedBytecode: {
    object: "0x608060405234801561001057600080fd5b506004361061011b5760003560e01c8063af104e40116100b2578063d803064a11610081578063e3d1287511610066578063e3d128751461023b578063f30347701461025e578063fb3ec48b1461027157600080fd5b8063d803064a14610220578063e1c7392a1461023357600080fd5b8063af104e40146101e1578063ba62fbe4146101f4578063cfd3c57f14610205578063d7ecf62b1461021857600080fd5b80634f27da18116100ee5780634f27da1814610185578063614bfa6e14610198578063687485a6146101ae5780639f54f545146101ce57600080fd5b80630d59332e146101205780630de3b7b51461014a5780631aa3a0081461015f5780631ee444b714610172575b600080fd5b6002546001600160a01b03165b6040516001600160a01b0390911681526020015b60405180910390f35b61015d6101583660046120ef565b610284565b005b60035461012d906001600160a01b031681565b61015d610180366004612124565b610389565b61012d6101933660046120ef565b61042d565b6101a061044c565b604051908152602001610141565b6101c16101bc36600461214e565b6104aa565b60405161014191906121c3565b6101a06101dc366004612207565b61066f565b61015d6101ef36600461226b565b610688565b6001546001600160a01b031661012d565b61015d6102133660046122c5565b61083e565b6101a06109c7565b61015d61022e366004612124565b610a44565b61015d610b71565b61024e6102493660046120ef565b610d1f565b6040519015158152602001610141565b61015d61026c366004612124565b610d8d565b61012d61027f3660046120ef565b610dba565b600154604051636667bd4760e11b81523360048201819052916001600160a01b03169063cccf7a8e90602401602060405180830381865afa1580156102cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102f19190612311565b6103425760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f742072656769737465726564000000000000000060448201526064015b60405180910390fd5b6001548290339061035c906001600160a01b031682610dd3565b6040517f6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b35090600090a45050565b6003546040516001600160a01b03909116906309c5eabe906103b690339060019087908790602001612349565b6040516020818303038152906040526040518263ffffffff1660e01b81526004016103e191906123c7565b6000604051808303816000875af1158015610400573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526104289190810190612441565b505050565b600154600090610446906001600160a01b031683610f24565b92915050565b6000806104576109c7565b905060005b81610466816124eb565b9250508160405160200161047c91815260200190565b6040516020818303038152906040528051906020012060001c90506104a081610d1f565b61045c5792915050565b606060008267ffffffffffffffff8111156104c7576104c76123fa565b60405190808252806020026020018201604052801561051457816020015b604080516060808201835260008083526020830152918101919091528152602001906001900390816104e55790505b50905060005b8381101561065d57604051806060016040528086868481811061053f5761053f612523565b90506020028101906105519190612539565b61055f906020810190612577565b600581111561057057610570612333565b81526001546020909101906105b5906001600160a01b031688888681811061059a5761059a612523565b90506020028101906105ac9190612539565b60200135611023565b6001600160a01b031681526020018686848181106105d5576105d5612523565b90506020028101906105e79190612539565b6105f5906040810190612598565b8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152505050915250825183908390811061063f5761063f612523565b60200260200101819052508080610655906124eb565b91505061051a565b506106678161102f565b949350505050565b600154600090610446906001600160a01b031683610dd3565b60015484906001600160a01b031663cccf7a8e6106ab836001600160a01b031690565b6040518263ffffffff1660e01b81526004016106c991815260200190565b602060405180830381865afa1580156106e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061070a9190612311565b6107565760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f74207265676973746572656400000000000000006044820152606401610339565b336001600160a01b0386161461076b57600080fd5b6000546040517f1003e2d2000000000000000000000000000000000000000000000000000000008152600481018690526001600160a01b0390911690631003e2d290602401600060405180830381600087803b1580156107ca57600080fd5b505af11580156107de573d6000803e3d6000fd5b50506001548692506001600160a01b0380891692506107fe911688610dd3565b7f6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073868660405161082f9291906125fd565b60405180910390a45050505050565b600154604051636667bd4760e11b81523360048201819052916001600160a01b03169063cccf7a8e90602401602060405180830381865afa158015610887573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108ab9190612311565b6108f75760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f74207265676973746572656400000000000000006044820152606401610339565b6000546040517f1003e2d2000000000000000000000000000000000000000000000000000000008152600481018690526001600160a01b0390911690631003e2d290602401600060405180830381600087803b15801561095657600080fd5b505af115801561096a573d6000803e3d6000fd5b5050600154869250339150610988906001600160a01b031682610dd3565b7f6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a607386866040516109b99291906125fd565b60405180910390a450505050565b60008060009054906101000a90046001600160a01b03166001600160a01b031663949d225d6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a1b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3f919061262c565b905090565b60015482906001600160a01b031663cccf7a8e610a67836001600160a01b031690565b6040518263ffffffff1660e01b8152600401610a8591815260200190565b602060405180830381865afa158015610aa2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ac69190612311565b610b125760405162461bcd60e51b815260206004820152601860248201527f636f6d706f6e656e74206e6f74207265676973746572656400000000000000006044820152606401610339565b336001600160a01b03841614610b2757600080fd5b60015482906001600160a01b0380861691610b43911686610dd3565b6040517f6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b35090600090a4505050565b6001546040517f9d2c76b40000000000000000000000000000000000000000000000000000000081523060048201526001600160a01b0390911690639d2c76b490602401600060405180830381600087803b158015610bcf57600080fd5b505af1158015610be3573d6000803e3d6000fd5b50506002546040517f9d2c76b40000000000000000000000000000000000000000000000000000000081523060048201526001600160a01b039091169250639d2c76b49150602401600060405180830381600087803b158015610c4557600080fd5b505af1158015610c59573d6000803e3d6000fd5b50506003546040516001600160a01b0390911692506309c5eabe9150610caa90339060019085907f554d0b3fe5f19a44775dc4000490ad0bafbc48129e8e396be983226890aece9990602001612349565b6040516020818303038152906040526040518263ffffffff1660e01b8152600401610cd591906123c7565b6000604051808303816000875af1158015610cf4573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610d1c9190810190612441565b50565b60008054604051636667bd4760e11b8152600481018490526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015610d69573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104469190612311565b6003546040516001600160a01b03909116906309c5eabe906103b690339060009087908790602001612349565b600254600090610446906001600160a01b031683610f24565b6000826001600160a01b031663cccf7a8e610df4846001600160a01b031690565b6040518263ffffffff1660e01b8152600401610e1291815260200190565b602060405180830381865afa158015610e2f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e539190612311565b610e9f5760405162461bcd60e51b815260206004820152601660248201527f61646472657373206e6f742072656769737465726564000000000000000000006044820152606401610339565b826001600160a01b0316630ff4c916610ebe846001600160a01b031690565b6040518263ffffffff1660e01b8152600401610edc91815260200190565b602060405180830381865afa158015610ef9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1d919061262c565b9392505050565b6040517ffbdfa1ea0000000000000000000000000000000000000000000000000000000081526004810182905260009081906001600160a01b0385169063fbdfa1ea90602401600060405180830381865afa158015610f87573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610faf9190810190612645565b905080516000036110025760405162461bcd60e51b815260206004820152601160248201527f6964206e6f7420726567697374657265640000000000000000000000000000006044820152606401610339565b6106678160008151811061101857611018612523565b602002602001015190565b6000610f1d8383610f24565b606061103961207c565b7620000000000000000000000000000000000000000000008152600060208201819052600160808301525b835181101561148257600084828151811061108157611081612523565b6020026020010151905061109481611495565b156110e2576004815160058111156110ae576110ae612333565b036110bb57604083018190525b6005815160058111156110d0576110d0612333565b036110dd57606083018190525b61146f565b826080015115611388576110f5816114d0565b6111415760405162461bcd60e51b815260206004820152601960248201527f4e454741544956455f494e495449414c5f465241474d454e54000000000000006044820152606401610339565b600060808401819052808251600581111561115e5761115e612333565b146111e15781602001516001600160a01b031663b361be4683604001516040518263ffffffff1660e01b815260040161119791906123c7565b600060405180830381865afa1580156111b4573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526111dc9190810190612645565b61124b565b81602001516001600160a01b03166331b933b96040518163ffffffff1660e01b8152600401600060405180830381865afa158015611223573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261124b9190810190612645565b9050611256816114f4565b84528051602080860191909152606085015101516001600160a01b03161580159061129c5750600084606001516040015180602001905181019061129a919061262c565b115b156113825760005b81518110156113805760006112f68383815181106112c4576112c4612523565b60200260200101518760600151602001518860600151604001518060200190518101906112f1919061262c565b61155c565b905060005b815181101561136b5761134461133c604051806040016040528085858151811061132757611327612523565b60200260200101518152602001600081525090565b885190611768565b875260208701805190611356826124eb565b90525080611363816124eb565b9150506112fb565b50508080611378906124eb565b9150506112a4565b505b5061146f565b82517620000000000000000000000000000000000000000000009060009060019060601c69ffffffffffffffffffff165b81156114645760006113dd8260408051808201909152600080825260208201525090565b805190915060006113ee82896117cd565b90506113fc8a898484611ad0565b9050801561143a5761142a6114236040518060400160405280858152602001600081525090565b8890611768565b965085611436816124eb565b9650505b6114478a89848a8a611b55565b8b5160b01c8601519198509650801515955093506113b992505050565b505090845260208401525b508061147a816124eb565b915050611064565b50610f1d81600001518260200151611ccc565b60006004825160058111156114ac576114ac612333565b1480610446575060055b825160058111156114c9576114c9612333565b1492915050565b600080825160058111156114e6576114e6612333565b1480610446575060026114b6565b76200000000000000000000000000000000000000000000060005b82518110156115565761154261153b604051806040016040528086858151811061132757611327612523565b8390611768565b91508061154e816124eb565b91505061150f565b50919050565b60608160000361157b5750604080516000815260208101909152610f1d565b6000836001600160a01b031663b361be468660405160200161159f91815260200190565b6040516020818303038152906040526040518263ffffffff1660e01b81526004016115ca91906123c7565b600060405180830381865afa1580156115e7573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261160f9190810190612645565b905082600103611620579050610f1d565b7620000000000000000000000000000000000000000000006000805b83518110156116e157600061167285838151811061165c5761165c612523565b60200260200101518960018a6112f191906126eb565b905060005b81518110156116cc576116aa6116a3604051806040016040528085858151811061132757611327612523565b8690611768565b9450836116b6816124eb565b94505080806116c4906124eb565b915050611677565b505080806116d9906124eb565b91505061163c565b5060006116fa838551846116f59190612702565b611ccc565b905060005b845181101561175c5784818151811061171a5761171a612523565b602002602001015182828561172f9190612702565b8151811061173f5761173f612523565b602090810291909101015280611754816124eb565b9150506116ff565b50979650505050505050565b6000808360501b60b01c116001811461178d578260101b8360601b85171791506117c6565b828460b01c8560a01b60b01c01528260101b7fffffffffffffffffffffffffffffffffffffffff00000000000000000000000085161791505b5092915050565b600080825160058111156117e3576117e3612333565b0361185e576020820151604051636667bd4760e11b8152600481018590526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015611833573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118579190612311565b9050610446565b60028251600581111561187357611873612333565b0361191f5760208201516040517fb8bc073d000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b039091169063b8bc073d90602401600060405180830381865afa1580156118dc573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526119049190810190612441565b80519060200120826040015180519060200120149050610446565b60018251600581111561193457611934612333565b036119b0576020820151604051636667bd4760e11b8152600481018590526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015611984573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119a89190612311565b159050610446565b6003825160058111156119c5576119c5612333565b03611a725760208201516040517fb8bc073d000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b039091169063b8bc073d90602401600060405180830381865afa158015611a2e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052611a569190810190612441565b8051906020012082604001518051906020012014159050610446565b611a7b82611da4565b611ac75760405162461bcd60e51b815260206004820152601260248201527f4e4f5f454e544954595f465241474d454e5400000000000000000000000000006044820152606401610339565b50600092915050565b6040840151602001516000906001600160a01b031615801590611b0e57506000856040015160400151806020019051810190611b0c919061262c565b115b8015611b215750611b1f8285611e03565b155b15611b4d57600080611b3885878960400151611e2e565b915091508015611b4a57509050610667565b50505b509392505050565b60608501516020015160009081906001600160a01b031615801590611b9557506000876060015160400151806020019051810190611b93919061262c565b115b15611cc0576000611bc5868960600151602001518a60600151604001518060200190518101906112f1919061262c565b905060005b8151811015611cbd576000828281518110611be757611be7612523565b602002602001015190506000611bfd828b6117cd565b905080158015611c1d575060408b0151602001516001600160a01b031615155b8015611c44575060008b6040015160400151806020019051810190611c42919061262c565b115b15611c6c57600080611c5b848d8f60400151611e2e565b915091508015611c69578192505b50505b8015611ca857611c98611c9160405180604001604052808c8152602001600081525090565b8990611768565b975086611ca4816124eb565b9750505b50508080611cb5906124eb565b915050611bca565b50505b50919590945092505050565b60608167ffffffffffffffff811115611ce757611ce76123fa565b604051908082528060200260200182016040528015611d10578160200160208202803683370190505b509050811561044657600169ffffffffffffffffffff606085901c1660005b8215611d9b576000611d538360408051808201909152600080825260208201525090565b90508060000151858381518110611d6c57611d6c612523565b602090810291909101015281611d81816124eb565b60b089901c94909401518015159550939250611d2f915050565b50505092915050565b60008082516005811115611dba57611dba612333565b1480611dd85750600282516005811115611dd657611dd6612333565b145b80611df6575060015b82516005811115611df457611df4612333565b145b80610446575060036114b6565b6000828015611e165750611e16826114d0565b80610f1d575082158015610f1d5750610f1d82612073565b600080611e3a84611da4565b611e865760405162461bcd60e51b815260206004820152601260248201527f4e4f5f454e544954595f465241474d454e5400000000000000000000000000006044820152606401610339565b600483516005811115611e9b57611e9b612333565b14611ee85760405162461bcd60e51b815260206004820152601660248201527f4e4f5f50524f58595f524541445f465241474d454e54000000000000000000006044820152606401610339565b8460005b8460400151806020019051810190611f04919061262c565b811015612064576020850151604051636667bd4760e11b8152600481018490526001600160a01b039091169063cccf7a8e90602401602060405180830381865afa158015611f56573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f7a9190612311565b611f8a57506000915061206b9050565b60208501516040517fb8bc073d000000000000000000000000000000000000000000000000000000008152600481018490526001600160a01b039091169063b8bc073d90602401600060405180830381865afa158015611fee573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526120169190810190612441565b806020019051810190612029919061262c565b915061203582876117cd565b93506120418487611e03565b1561205257506001915061206b9050565b8061205c816124eb565b915050611eec565b5060019150505b935093915050565b60006001611de1565b6040805160a081018252600080825260208201529081016120b86040805160608101909152806000815260006020820152606060409091015290565b81526020016120e26040805160608101909152806000815260006020820152606060409091015290565b8152600060209091015290565b60006020828403121561210157600080fd5b5035919050565b80356001600160a01b038116811461211f57600080fd5b919050565b6000806040838503121561213757600080fd5b61214083612108565b946020939093013593505050565b6000806020838503121561216157600080fd5b823567ffffffffffffffff8082111561217957600080fd5b818501915085601f83011261218d57600080fd5b81358181111561219c57600080fd5b8660208260051b85010111156121b157600080fd5b60209290920196919550909350505050565b6020808252825182820181905260009190848201906040850190845b818110156121fb578351835292840192918401916001016121df565b50909695505050505050565b60006020828403121561221957600080fd5b610f1d82612108565b60008083601f84011261223457600080fd5b50813567ffffffffffffffff81111561224c57600080fd5b60208301915083602082850101111561226457600080fd5b9250929050565b6000806000806060858703121561228157600080fd5b61228a85612108565b935060208501359250604085013567ffffffffffffffff8111156122ad57600080fd5b6122b987828801612222565b95989497509550505050565b6000806000604084860312156122da57600080fd5b83359250602084013567ffffffffffffffff8111156122f857600080fd5b61230486828701612222565b9497909650939450505050565b60006020828403121561232357600080fd5b81518015158114610f1d57600080fd5b634e487b7160e01b600052602160045260246000fd5b6001600160a01b03858116825260808201906002861061237957634e487b7160e01b600052602160045260246000fd5b85602084015280851660408401525082606083015295945050505050565b60005b838110156123b257818101518382015260200161239a565b838111156123c1576000848401525b50505050565b60208152600082518060208401526123e6816040850160208701612397565b601f01601f19169190910160400192915050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715612439576124396123fa565b604052919050565b60006020828403121561245357600080fd5b815167ffffffffffffffff8082111561246b57600080fd5b818401915084601f83011261247f57600080fd5b815181811115612491576124916123fa565b6124a46020601f19601f84011601612410565b91508082528560208285010111156124bb57600080fd5b6124cc816020840160208601612397565b50949350505050565b634e487b7160e01b600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361251c5761251c6124d5565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa183360301811261256d57600080fd5b9190910192915050565b60006020828403121561258957600080fd5b813560068110610f1d57600080fd5b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18436030181126125cd57600080fd5b83018035915067ffffffffffffffff8211156125e857600080fd5b60200191503681900382131561226457600080fd5b60208152816020820152818360408301376000818301604090810191909152601f909201601f19160101919050565b60006020828403121561263e57600080fd5b5051919050565b6000602080838503121561265857600080fd5b825167ffffffffffffffff8082111561267057600080fd5b818501915085601f83011261268457600080fd5b815181811115612696576126966123fa565b8060051b91506126a7848301612410565b81815291830184019184810190888411156126c157600080fd5b938501935b838510156126df578451825293850193908501906126c6565b98975050505050505050565b6000828210156126fd576126fd6124d5565b500390565b60008219821115612715576127156124d5565b50019056fea2646970667358221220902eb3055e323ca228bea31c34153f51121c8b0cf5d6599836cd2715299e67a564736f6c634300080d0033",
    sourceMap: "1597:5812:43:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2986:85;3058:8;;-1:-1:-1;;;;;3058:8:43;2986:85;;;-1:-1:-1;;;;;205:55:72;;;187:74;;175:2;160:18;2986:85:43;;;;;;;;5313:199;;;;;;:::i;:::-;;:::i;:::-;;1739:30;;;;;-1:-1:-1;;;;;1739:30:43;;;3401:151;;;;;;:::i;:::-;;:::i;5609:115::-;;;;;;:::i;:::-;;:::i;7152:255::-;;;:::i;:::-;;;1549:25:72;;;1537:2;1522:18;7152:255:43;1403:177:72;6431:500:43;;;;;;:::i;:::-;;:::i;:::-;;;;;;;:::i;5821:150::-;;;;;;:::i;:::-;;:::i;3989:319::-;;;;;;:::i;:::-;;:::i;2785:91::-;2860:11;;-1:-1:-1;;;;;2860:11:43;2785:91;;4443:259;;;;;;:::i;:::-;;:::i;6200:94::-;;;:::i;4910:263::-;;;;;;:::i;:::-;;:::i;2445:221::-;;;:::i;6998:105::-;;;;;;:::i;:::-;;:::i;:::-;;;4627:14:72;;4620:22;4602:41;;4590:2;4575:18;6998:105:43;4462:187:72;3156:163:43;;;;;;:::i;:::-;;:::i;6068:128::-;;;;;;:::i;:::-;;:::i;5313:199::-;3700:11;;:43;;-1:-1:-1;;;3700:43:43;;5402:10;3700:43;;;1549:25:72;;;5402:10:43;-1:-1:-1;;;;;3700:11:43;;:15;;1522:18:72;;3700:43:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;3692:80;;;;-1:-1:-1;;;3692:80:43;;5138:2:72;3692:80:43;;;5120:21:72;5177:2;5157:18;;;5150:30;5216:26;5196:18;;;5189:54;5260:18;;3692:80:43;;;;;;;;;5462:11:::1;::::0;5500:6;;5488:10:::1;::::0;5447:39:::1;::::0;-1:-1:-1;;;;;5462:11:43::1;5488:10:::0;5447:14:::1;:39::i;:::-;5425:82;::::0;::::1;::::0;;;::::1;5313:199:::0;;:::o;3401:151::-;3470:8;;3487:59;;-1:-1:-1;;;;;3470:8:43;;;;:16;;3487:59;;3498:10;;3470:8;;3531:10;;3543:2;;3487:59;;;:::i;:::-;;;;;;;;;;;;;3470:77;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;3470:77:43;;;;;;;;;;;;:::i;:::-;;3401:151;;:::o;5609:115::-;5703:11;;5666:7;;5688:31;;-1:-1:-1;;;;;5703:11:43;5716:2;5688:14;:31::i;:::-;5681:38;5609:115;-1:-1:-1;;5609:115:43:o;7152:255::-;7202:7;7217:17;7237:16;:14;:16::i;:::-;7217:36;;7259:10;7275:112;7286:11;;;;:::i;:::-;;;;7345:9;7328:27;;;;;;8702:19:72;;8746:2;8737:12;;8573:182;7328:27:43;;;;;;;;;;;;;7318:38;;;;;;7310:47;;7305:52;;7372:13;7382:2;7372:9;:13::i;:::-;7275:112;;7400:2;7152:255;-1:-1:-1;;7152:255:43:o;6431:500::-;6518:16;6542:32;6597:19;6577:47;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;;;;;;;;;;;;;;;;;;;;6577:47:43;;;;;;;;;;;;;;;;6542:82;;6635:9;6630:259;6646:30;;;6630:259;;;6706:176;;;;;;;;6729:19;;6749:1;6729:22;;;;;;;:::i;:::-;;;;;;;;;;;;:::i;:::-;:32;;;;;;;:::i;:::-;6706:176;;;;;;;;:::i;:::-;;;6788:11;;6706:176;;;;;6771:65;;-1:-1:-1;;;;;6788:11:43;6801:19;;6821:1;6801:22;;;;;;;:::i;:::-;;;;;;;;;;;;:::i;:::-;:34;;;6771:16;:65::i;:::-;-1:-1:-1;;;;;6706:176:43;;;;;6846:19;;6866:1;6846:22;;;;;;;:::i;:::-;;;;;;;;;;;;:::i;:::-;:28;;;;;;;:::i;:::-;6706:176;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;6706:176:43;;-1:-1:-1;6691:12:43;;:9;;6701:1;;6691:12;;;;;;:::i;:::-;;;;;;:191;;;;6678:3;;;;;:::i;:::-;;;;6630:259;;;;6901:25;6916:9;6901:14;:25::i;:::-;6894:32;6431:500;-1:-1:-1;;;;6431:500:43:o;5821:150::-;5939:11;;5902:7;;5924:42;;-1:-1:-1;;;;;5939:11:43;5952:13;5924:14;:42::i;3989:319::-;3700:11;;4130:9;;-1:-1:-1;;;;;3700:11:43;:15;3716:26;4130:9;-1:-1:-1;;;;;604:22:71;;531:98;3716:26:43;3700:43;;;;;;;;;;;;;1549:25:72;;1537:2;1522:18;;1403:177;3700:43:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;3692:80;;;;-1:-1:-1;;;3692:80:43;;5138:2:72;3692:80:43;;;5120:21:72;5177:2;5157:18;;;5150:30;5216:26;5196:18;;;5189:54;5260:18;;3692:80:43;4936:348:72;3692:80:43;4155:10:::1;-1:-1:-1::0;;;;;4155:23:43;::::1;;4147:32;;;::::0;::::1;;4189:8;::::0;4185:25:::1;::::0;;;;::::1;::::0;::::1;1549::72::0;;;-1:-1:-1;;;;;4189:8:43;;::::1;::::0;4185:17:::1;::::0;1522:18:72;;4185:25:43::1;;;;;;;;;;;;;;;;;::::0;::::1;;;;;;;;;;;;::::0;::::1;;;;;-1:-1:-1::0;;4254:11:43::1;::::0;4290:6;;-1:-1:-1;;;;;;4221:82:43;;::::1;::::0;-1:-1:-1;4239:38:43::1;::::0;4254:11:::1;4279:9:::0;4239:14:::1;:38::i;:::-;4221:82;4298:4;;4221:82;;;;;;;:::i;:::-;;;;;;;;3989:319:::0;;;;;:::o;4443:259::-;3700:11;;:43;;-1:-1:-1;;;3700:43:43;;4557:10;3700:43;;;1549:25:72;;;4557:10:43;-1:-1:-1;;;;;3700:11:43;;:15;;1522:18:72;;3700:43:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;3692:80;;;;-1:-1:-1;;;3692:80:43;;5138:2:72;3692:80:43;;;5120:21:72;5177:2;5157:18;;;5150:30;5216:26;5196:18;;;5189:54;5260:18;;3692:80:43;4936:348:72;3692:80:43;4581:8:::1;::::0;4577:25:::1;::::0;;;;::::1;::::0;::::1;1549::72::0;;;-1:-1:-1;;;;;4581:8:43;;::::1;::::0;4577:17:::1;::::0;1522:18:72;;4577:25:43::1;;;;;;;;;;;;;;;;;::::0;::::1;;;;;;;;;;;;::::0;::::1;;;;;-1:-1:-1::0;;4646:11:43::1;::::0;4684:6;;-1:-1:-1;4672:10:43::1;::::0;-1:-1:-1;4631:39:43::1;::::0;-1:-1:-1;;;;;4646:11:43::1;4672:10:::0;4631:14:::1;:39::i;:::-;4613:84;4692:4;;4613:84;;;;;;;:::i;:::-;;;;;;;;4443:259:::0;;;;:::o;6200:94::-;6247:7;6273:8;;;;;;;;;-1:-1:-1;;;;;6273:8:43;-1:-1:-1;;;;;6269:18:43;;:20;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;6262:27;;6200:94;:::o;4910:263::-;3700:11;;5026:9;;-1:-1:-1;;;;;3700:11:43;:15;3716:26;5026:9;-1:-1:-1;;;;;604:22:71;;531:98;3716:26:43;3700:43;;;;;;;;;;;;;1549:25:72;;1537:2;1522:18;;1403:177;3700:43:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;3692:80;;;;-1:-1:-1;;;3692:80:43;;5138:2:72;3692:80:43;;;5120:21:72;5177:2;5157:18;;;5150:30;5216:26;5196:18;;;5189:54;5260:18;;3692:80:43;4936:348:72;3692:80:43;5053:10:::1;-1:-1:-1::0;;;;;5053:23:43;::::1;;5045:32;;;::::0;::::1;;5125:11;::::0;5161:6;;-1:-1:-1;;;;;5088:80:43;;::::1;::::0;5110:38:::1;::::0;5125:11:::1;5150:9:::0;5110:14:::1;:38::i;:::-;5088:80;::::0;::::1;::::0;;;::::1;4910:263:::0;;;:::o;2445:221::-;2474:11;;:40;;;;;2508:4;2474:40;;;187:74:72;-1:-1:-1;;;;;2474:11:43;;;;:25;;160:18:72;;2474:40:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;2520:8:43;;:37;;;;;2551:4;2520:37;;;187:74:72;-1:-1:-1;;;;;2520:8:43;;;;-1:-1:-1;2520:22:43;;-1:-1:-1;160:18:72;;2520:37:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;2563:8:43;;2580:80;;-1:-1:-1;;;;;2563:8:43;;;;-1:-1:-1;2563:16:43;;-1:-1:-1;2580:80:43;;2591:10;;2563:8;;;;540:34:57;;2580:80:43;;;:::i;:::-;;;;;;;;;;;;;2563:98;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;2563:98:43;;;;;;;;;;;;:::i;:::-;;2445:221::o;6998:105::-;7054:4;7077:8;;7073:25;;-1:-1:-1;;;7073:25:43;;;;;1549::72;;;-1:-1:-1;;;;;7077:8:43;;;;7073:17;;1522:18:72;;7073:25:43;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;3156:163::-;3231:8;;3248:65;;-1:-1:-1;;;;;3231:8:43;;;;:16;;3248:65;;3259:10;;3231:8;;3295:13;;3310:2;;3248:65;;;:::i;6068:128::-;6172:8;;6135:7;;6157:34;;-1:-1:-1;;;;;6172:8:43;6182;6157:14;:34::i;1094:217:71:-;1174:7;1195:8;-1:-1:-1;;;;;1195:12:71;;1208:21;1224:4;-1:-1:-1;;;;;604:22:71;;531:98;1208:21;1195:35;;;;;;;;;;;;;1549:25:72;;1537:2;1522:18;;1403:177;1195:35:71;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1187:70;;;;-1:-1:-1;;;1187:70:71;;11053:2:72;1187:70:71;;;11035:21:72;11092:2;11072:18;;;11065:30;11131:24;11111:18;;;11104:52;11173:18;;1187:70:71;10851:346:72;1187:70:71;1268:8;-1:-1:-1;;;;;1268:17:71;;1286:21;1302:4;-1:-1:-1;;;;;604:22:71;;531:98;1286:21;1268:40;;;;;;;;;;;;;1549:25:72;;1537:2;1522:18;;1403:177;1268:40:71;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1261:47;1094:217;-1:-1:-1;;;1094:217:71:o;741:248::-;860:33;;;;;;;;1549:25:72;;;819:7:71;;;;-1:-1:-1;;;;;860:29:71;;;;;1522:18:72;;860:33:71;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;860:33:71;;;;;;;;;;;;:::i;:::-;832:61;;905:8;:15;924:1;905:20;897:50;;;;-1:-1:-1;;;897:50:71;;12345:2:72;897:50:71;;;12327:21:72;12384:2;12364:18;;;12357:30;12423:19;12403:18;;;12396:47;12460:18;;897:50:71;12143:341:72;897:50:71;958:28;974:8;983:1;974:11;;;;;;;;:::i;:::-;;;;;;;452:6;361:102;1406:150;1488:10;1522:30;1537:10;1549:2;1522:14;:30::i;3984:3450:32:-;4056:16;4080:18;;:::i;:::-;4237:24:17;4104:44:32;;:10;4154:13;;;:17;;;4233:4;4213:17;;;:24;4269:3109;4289:9;:16;4285:1;:20;4269:3109;;;4320:29;4352:9;4362:1;4352:12;;;;;;;;:::i;:::-;;;;;;;4320:44;;4376:27;4394:8;4376:17;:27::i;:::-;4372:3000;;;4507:19;4485:18;;:41;;;;;;;;:::i;:::-;;4481:69;;4528:11;;;:22;;;4481:69;4586:21;4564:18;;:43;;;;;;;;:::i;:::-;;4560:73;;4609:13;;;:24;;;4560:73;4372:3000;;;4652:1;:17;;;4648:2724;;;4788:28;4807:8;4788:18;:28::i;:::-;4780:66;;;;-1:-1:-1;;;4780:66:32;;12691:2:72;4780:66:32;;;12673:21:72;12730:2;12710:18;;;12703:30;12769:27;12749:18;;;12742:55;12814:18;;4780:66:32;12489:349:72;4780:66:32;4876:5;4856:17;;;:25;;;4876:5;4966:18;;:35;;;;;;;;:::i;:::-;;:148;;5059:8;:18;;;-1:-1:-1;;;;;5059:39:32;;5099:8;:14;;;5059:55;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;5059:55:32;;;;;;;;;;;;:::i;:::-;4966:148;;;5014:8;:18;;;-1:-1:-1;;;;;5014:30:32;;:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;5014:32:32;;;;;;;;;;;;:::i;:::-;4935:179;;5138:24;5150:11;5138;:24::i;:::-;5125:37;;5188:18;;5172:13;;;;:34;;;;5316:13;;;;:23;;-1:-1:-1;;;;;5308:46:32;;;;;5307:98;;;5404:1;5370;:13;;;:19;;;5359:42;;;;;;;;;;;;:::i;:::-;:46;5307:98;5303:635;;;5424:11;5419:509;5443:11;:18;5437:3;:24;5419:509;;;5484:30;5517:159;5549:11;5561:3;5549:16;;;;;;;;:::i;:::-;;;;;;;5581:1;:13;;;:23;;;5631:1;:13;;;:19;;;5620:42;;;;;;;;;;;;:::i;:::-;5517:16;:159::i;:::-;5484:192;;5696:18;5691:225;5729:13;:20;5716:10;:33;5691:225;;;5794:76;5819:50;5827:41;;;;;;;;5839:13;5853:10;5839:25;;;;;;;;:::i;:::-;;;;;;;5827:41;;;;5866:1;5827:41;;;452:6:71;361:102;5819:50:32;5794:10;;;:24;:76::i;:::-;5781:89;;5886:13;;;:15;;;;;;:::i;:::-;;;-1:-1:-1;5751:12:32;;;;:::i;:::-;;;;5691:225;;;;5470:458;5463:5;;;;;:::i;:::-;;;;5419:509;;;;5303:635;4671:1275;4648:2724;;;6187:10;;4237:24:17;;6036:23:32;;6155:4;;4582:20:17;;;;6269:985:32;6276:7;6269:985;;;6297:23;6323:20;6335:7;-1:-1:-1;;;;;;;;;;;;;;;;;;579:3:32;448:140;6323:20;6372:10;;6297:46;;-1:-1:-1;6355:14:32;6495:37;6372:10;6523:8;6495:19;:37::i;:::-;6481:51;;6632:46;6650:1;6653:8;6663:6;6671;6632:17;:46::i;:::-;6623:55;;6782:6;6778:144;;;6819:59;6846:31;6854:22;;;;;;;;6866:6;6854:22;;;;6874:1;6854:22;;;452:6:71;361:102;6846:31:32;6819:12;;:26;:59::i;:::-;6804:74;-1:-1:-1;6892:17:32;;;;:::i;:::-;;;;6778:144;7077:71;7097:1;7100:8;7110:6;7118:12;7132:15;7077:19;:71::i;:::-;7219:10;;6494:3:17;6490:14;6477:28;;6471:35;7043:105:32;;-1:-1:-1;7043:105:32;-1:-1:-1;6529:14:17;;;7198:45:32;-1:-1:-1;7198:45:32;-1:-1:-1;6269:985:32;;-1:-1:-1;;;6269:985:32;;-1:-1:-1;;7297:25:32;;;7332:13;;;:31;4648:2724;-1:-1:-1;4307:3:32;;;;:::i;:::-;;;;4269:3109;;;;7391:38;7403:1;:10;;;7415:1;:13;;;7391:11;:38::i;938:180::-;1010:4;1049:19;1027:18;;:41;;;;;;;;:::i;:::-;;:88;;;-1:-1:-1;1094:21:32;1072:43;:18;;:43;;;;;;;;:::i;:::-;;1020:95;938:180;-1:-1:-1;;938:180:32:o;590:172::-;663:4;;680:18;;:35;;;;;;;;:::i;:::-;;:79;;;-1:-1:-1;741:18:32;719:40;;12216:251;4237:24:17;12282:15:32;12349:114;12369:5;:12;12365:1;:16;12349:114;;;12403:53;12422:33;12430:24;;;;;;;;12442:5;12448:1;12442:8;;;;;;;;:::i;12422:33::-;12403:4;;:18;:53::i;:::-;12396:60;-1:-1:-1;12383:3:32;;;;:::i;:::-;;;;12349:114;;;;12216:251;;;:::o;9853:1054::-;9971:16;9999:5;10008:1;9999:10;9995:39;;-1:-1:-1;10018:16:32;;;10032:1;10018:16;;;;;;;;10011:23;;9995:39;10041:31;10075:9;-1:-1:-1;;;;;10075:30:32;;10117:6;10106:18;;;;;;1549:25:72;;1537:2;1522:18;;1403:177;10106:18:32;;;;;;;;;;;;;10075:50;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;10075:50:32;;;;;;;;;;;;:::i;:::-;10041:84;;10135:5;10144:1;10135:10;10131:37;;10154:14;-1:-1:-1;10147:21:32;;10131:37;4237:24:17;10175:28:32;;10281:360;10301:14;:21;10297:1;:25;10281:360;;;10337:33;10373:57;10390:14;10405:1;10390:17;;;;;;;;:::i;:::-;;;;;;;10409:9;10428:1;10420:5;:9;;;;:::i;10373:57::-;10337:93;;10443:9;10438:197;10458:16;:23;10454:1;:27;10438:197;;;10518:77;10550:44;10558:35;;;;;;;;10570:16;10587:1;10570:19;;;;;;;;:::i;10550:44::-;10518:17;;:31;:77::i;:::-;10498:97;-1:-1:-1;10605:21:32;;;;:::i;:::-;;;;10483:3;;;;;:::i;:::-;;;;10438:197;;;;10329:312;10324:3;;;;;:::i;:::-;;;;10281:360;;;;10647:28;10678:75;10690:17;10731:14;:21;10709:19;:43;;;;:::i;:::-;10678:11;:75::i;:::-;10647:106;;10764:9;10759:119;10779:14;:21;10775:1;:25;10759:119;;;10854:14;10869:1;10854:17;;;;;;;;:::i;:::-;;;;;;;10815:11;10849:1;10827:19;:23;;;;:::i;:::-;10815:36;;;;;;;;:::i;:::-;;;;;;;;;;:56;10802:3;;;;:::i;:::-;;;;10759:119;;;-1:-1:-1;10891:11:32;9853:1054;-1:-1:-1;;;;;;;9853:1054:32:o;5475:835:17:-;5555:12;5653:1;5645:4;5641:2;5637:13;5632:3;5628:23;5625:30;5674:1;5669:462;;;;6271:7;6267:2;6263:16;6252:7;6248:2;6244:16;6238:4;6235:26;6232:48;6227:53;;5618:676;;5669:462;5988:7;5902:4;5897:3;5893:14;5841:4;5836:3;5832:14;5827:3;5823:24;5794:172;5766:247;6108:7;6104:2;6100:16;6088:9;6082:4;6078:20;6075:42;6070:47;;5618:676;;5475:835;;;;:::o;1391:843:32:-;1481:4;;1495:18;;:35;;;;;;;;:::i;:::-;;1491:129;;1585:18;;;;:30;;-1:-1:-1;;;1585:30:32;;;;;1549:25:72;;;-1:-1:-1;;;;;1585:22:32;;;;;;1522:18:72;;1585:30:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1578:37;;;;1491:129;1650:18;1628;;:40;;;;;;;;:::i;:::-;;1624:192;;1772:18;;;;:38;;;;;;;;1549:25:72;;;-1:-1:-1;;;;;1772:30:32;;;;;;1522:18:72;;1772:38:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1772:38:32;;;;;;;;;;;;:::i;:::-;1762:49;;;;;;1743:8;:14;;;1733:25;;;;;;:78;1726:85;;;;1624:192;1846:13;1824:18;;:35;;;;;;;;:::i;:::-;;1820:134;;1919:18;;;;:30;;-1:-1:-1;;;1919:30:32;;;;;1549:25:72;;;-1:-1:-1;;;;;1919:22:32;;;;;;1522:18:72;;1919:30:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1918:31;1911:38;;;;1820:134;1984:18;1962;;:40;;;;;;;;:::i;:::-;;1958:196;;2110:18;;;;:38;;;;;;;;1549:25:72;;;-1:-1:-1;;;;;2110:30:32;;;;;;1522:18:72;;2110:38:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;2110:38:32;;;;;;;;;;;;:::i;:::-;2100:49;;;;;;2081:8;:14;;;2071:25;;;;;;:78;;2064:85;;;;1958:196;2166:26;2183:8;2166:16;:26::i;:::-;2158:57;;;;-1:-1:-1;;;2158:57:32;;13308:2:72;2158:57:32;;;13290:21:72;13347:2;13327:18;;;13320:30;13386:20;13366:18;;;13359:48;13424:18;;2158:57:32;13106:342:72;2158:57:32;-1:-1:-1;2226:5:32;1391:843;;;;:::o;7508:495::-;7689:11;;;;:21;;;7658:4;;-1:-1:-1;;;;;7681:44:32;;;;;:98;;;7778:1;7746;:11;;;:17;;;7735:40;;;;;;;;;;;;:::i;:::-;:44;7681:98;:146;;;;;7790:37;7810:6;7818:8;7790:19;:37::i;:::-;7789:38;7681:146;7670:310;;;7843:14;7859:15;7878:55;7903:6;7911:8;7921:1;:11;;;7878:24;:55::i;:::-;7842:91;;;;7945:10;7941:32;;;-1:-1:-1;7964:9:32;-1:-1:-1;7957:16:32;;7941:32;7834:146;;7670:310;-1:-1:-1;7992:6:32;7508:495;-1:-1:-1;;;7508:495:32:o;8108:1346::-;8341:13;;;;:23;;;8301:10;;;;-1:-1:-1;;;;;8333:46:32;;;;;8332:98;;;8429:1;8395;:13;;;:19;;;8384:42;;;;;;;;;;;;:::i;:::-;:46;8332:98;8328:1077;;;8440:30;8473:125;8499:6;8515:1;:13;;;:23;;;8559:1;:13;;;:19;;;8548:42;;;;;;;;;;;;:::i;8473:125::-;8440:158;;8612:11;8607:792;8631:13;:20;8625:3;:26;8607:792;;;8670:19;8692:13;8706:3;8692:18;;;;;;;;:::i;:::-;;;;;;;8670:40;;8783:16;8802:42;8822:11;8835:8;8802:19;:42::i;:::-;8783:61;;8946:11;8945:12;:60;;;;-1:-1:-1;8969:11:32;;;;:21;;;-1:-1:-1;;;;;8961:44:32;;;8945:60;:108;;;;;9052:1;9020;:11;;;:17;;;9009:40;;;;;;;;;;;;:::i;:::-;:44;8945:108;8930:308;;;9077:16;9095:15;9114:60;9139:11;9152:8;9162:1;:11;;;9114:24;:60::i;:::-;9076:98;;;;9190:10;9186:41;;;9216:11;9202:25;;9186:41;9064:174;;8930:308;9252:11;9248:143;;;9292:59;9319:31;9327:22;;;;;;;;9339:6;9327:22;;;;9347:1;9327:22;;;452:6:71;361:102;9319:31:32;9292:12;;:26;:59::i;:::-;9277:74;-1:-1:-1;9363:17:32;;;;:::i;:::-;;;;9248:143;8660:739;;8653:5;;;;;:::i;:::-;;;;8607:792;;;;8432:973;8328:1077;-1:-1:-1;9419:12:32;;9433:15;;-1:-1:-1;8108:1346:32;-1:-1:-1;;;8108:1346:32:o;11719:424::-;11794:22;11846:6;11832:21;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;11832:21:32;-1:-1:-1;11824:29:32;-1:-1:-1;11859:29:32;;11876:12;11859:29;11910:4;4582:20:17;;;;;;11895:12:32;11975:164;11982:7;11975:164;;;11999:23;12025:20;12037:7;-1:-1:-1;;;;;;;;;;;;;;;;;;579:3:32;448:140;12025:20;11999:46;;12064:4;:10;;;12053:5;12059:1;12053:8;;;;;;;;:::i;:::-;;;;;;;;;;:21;12082:3;;;;:::i;:::-;6494::17;6490:14;;;6477:28;;;;6471:35;6529:14;;;;-1:-1:-1;6471:35:17;12082:3:32;-1:-1:-1;11975:164:32;;-1:-1:-1;;11975:164:32;;11818:325;;;11719:424;;;;:::o;1120:269::-;1191:4;;1212:18;;:35;;;;;;;;:::i;:::-;;:83;;;-1:-1:-1;1277:18:32;1255;;:40;;;;;;;;:::i;:::-;;1212:83;:126;;;-1:-1:-1;1325:13:32;1303:35;:18;;:35;;;;;;;;:::i;:::-;;1212:126;:174;;;-1:-1:-1;1368:18:32;1346:40;;3394:192;3481:4;3499:6;:38;;;;;3509:28;3528:8;3509:18;:28::i;:::-;3498:85;;;;3544:6;3543:7;:39;;;;;3554:28;3573:8;3554:18;:28::i;2236:858::-;2371:11;2384:15;2413:26;2430:8;2413:16;:26::i;:::-;2405:57;;;;-1:-1:-1;;;2405:57:32;;13308:2:72;2405:57:32;;;13290:21:72;13347:2;13327:18;;;13320:30;13386:20;13366:18;;;13359:48;13424:18;;2405:57:32;13106:342:72;2405:57:32;2497:19;2474;;:42;;;;;;;;:::i;:::-;;2466:77;;;;-1:-1:-1;;;2466:77:32;;13655:2:72;2466:77:32;;;13637:21:72;13694:2;13674:18;;;13667:30;13733:24;13713:18;;;13706:52;13775:18;;2466:77:32;13453:346:72;2466:77:32;2570:6;2548:19;2581:486;2612:9;:15;;;2601:38;;;;;;;;;;;;:::i;:::-;2597:1;:42;2581:486;;;2727:19;;;;:36;;-1:-1:-1;;;2727:36:32;;;;;1549:25:72;;;-1:-1:-1;;;;;2727:23:32;;;;;;1522:18:72;;2727:36:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;2722:80;;-1:-1:-1;2789:5:32;;-1:-1:-1;2773:22:32;;-1:-1:-1;2773:22:32;2722:80;2864:19;;;;:44;;;;;;;;1549:25:72;;;-1:-1:-1;;;;;2864:31:32;;;;;;1522:18:72;;2864:44:32;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;2864:44:32;;;;;;;;;;;;:::i;:::-;2853:67;;;;;;;;;;;;:::i;:::-;2839:81;;2935:42;2955:11;2968:8;2935:19;:42::i;:::-;2926:51;;2988:37;3008:6;3016:8;2988:19;:37::i;:::-;2984:79;;;-1:-1:-1;3051:4:32;;-1:-1:-1;3035:21:32;;-1:-1:-1;3035:21:32;2984:79;2641:3;;;;:::i;:::-;;;;2581:486;;;-1:-1:-1;3086:4:32;;-1:-1:-1;;2236:858:32;;;;;;;:::o;764:172::-;837:4;876:13;854:35;;-1:-1:-1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;272:180:72:-;331:6;384:2;372:9;363:7;359:23;355:32;352:52;;;400:1;397;390:12;352:52;-1:-1:-1;423:23:72;;272:180;-1:-1:-1;272:180:72:o;712:196::-;780:20;;-1:-1:-1;;;;;829:54:72;;819:65;;809:93;;898:1;895;888:12;809:93;712:196;;;:::o;913:254::-;981:6;989;1042:2;1030:9;1021:7;1017:23;1013:32;1010:52;;;1058:1;1055;1048:12;1010:52;1081:29;1100:9;1081:29;:::i;:::-;1071:39;1157:2;1142:18;;;;1129:32;;-1:-1:-1;;;913:254:72:o;1585:654::-;1710:6;1718;1771:2;1759:9;1750:7;1746:23;1742:32;1739:52;;;1787:1;1784;1777:12;1739:52;1827:9;1814:23;1856:18;1897:2;1889:6;1886:14;1883:34;;;1913:1;1910;1903:12;1883:34;1951:6;1940:9;1936:22;1926:32;;1996:7;1989:4;1985:2;1981:13;1977:27;1967:55;;2018:1;2015;2008:12;1967:55;2058:2;2045:16;2084:2;2076:6;2073:14;2070:34;;;2100:1;2097;2090:12;2070:34;2153:7;2148:2;2138:6;2135:1;2131:14;2127:2;2123:23;2119:32;2116:45;2113:65;;;2174:1;2171;2164:12;2113:65;2205:2;2197:11;;;;;2227:6;;-1:-1:-1;1585:654:72;;-1:-1:-1;;;;1585:654:72:o;2244:632::-;2415:2;2467:21;;;2537:13;;2440:18;;;2559:22;;;2386:4;;2415:2;2638:15;;;;2612:2;2597:18;;;2386:4;2681:169;2695:6;2692:1;2689:13;2681:169;;;2756:13;;2744:26;;2825:15;;;;2790:12;;;;2717:1;2710:9;2681:169;;;-1:-1:-1;2867:3:72;;2244:632;-1:-1:-1;;;;;;2244:632:72:o;2881:186::-;2940:6;2993:2;2981:9;2972:7;2968:23;2964:32;2961:52;;;3009:1;3006;2999:12;2961:52;3032:29;3051:9;3032:29;:::i;3072:347::-;3123:8;3133:6;3187:3;3180:4;3172:6;3168:17;3164:27;3154:55;;3205:1;3202;3195:12;3154:55;-1:-1:-1;3228:20:72;;3271:18;3260:30;;3257:50;;;3303:1;3300;3293:12;3257:50;3340:4;3332:6;3328:17;3316:29;;3392:3;3385:4;3376:6;3368;3364:19;3360:30;3357:39;3354:59;;;3409:1;3406;3399:12;3354:59;3072:347;;;;;:::o;3424:551::-;3512:6;3520;3528;3536;3589:2;3577:9;3568:7;3564:23;3560:32;3557:52;;;3605:1;3602;3595:12;3557:52;3628:29;3647:9;3628:29;:::i;:::-;3618:39;;3704:2;3693:9;3689:18;3676:32;3666:42;;3759:2;3748:9;3744:18;3731:32;3786:18;3778:6;3775:30;3772:50;;;3818:1;3815;3808:12;3772:50;3857:58;3907:7;3898:6;3887:9;3883:22;3857:58;:::i;:::-;3424:551;;;;-1:-1:-1;3934:8:72;-1:-1:-1;;;;3424:551:72:o;3980:477::-;4059:6;4067;4075;4128:2;4116:9;4107:7;4103:23;4099:32;4096:52;;;4144:1;4141;4134:12;4096:52;4180:9;4167:23;4157:33;;4241:2;4230:9;4226:18;4213:32;4268:18;4260:6;4257:30;4254:50;;;4300:1;4297;4290:12;4254:50;4339:58;4389:7;4380:6;4369:9;4365:22;4339:58;:::i;:::-;3980:477;;4416:8;;-1:-1:-1;4313:84:72;;-1:-1:-1;;;;3980:477:72:o;4654:277::-;4721:6;4774:2;4762:9;4753:7;4749:23;4745:32;4742:52;;;4790:1;4787;4780:12;4742:52;4822:9;4816:16;4875:5;4868:13;4861:21;4854:5;4851:32;4841:60;;4897:1;4894;4887:12;5289:184;-1:-1:-1;;;5338:1:72;5331:88;5438:4;5435:1;5428:15;5462:4;5459:1;5452:15;5478:696;-1:-1:-1;;;;;5804:15:72;;;5786:34;;5712:3;5697:19;;;5850:1;5839:13;;5829:201;;-1:-1:-1;;;5883:1:72;5876:88;5987:4;5984:1;5977:15;6015:4;6012:1;6005:15;5829:201;6066:6;6061:2;6050:9;6046:18;6039:34;6121:2;6113:6;6109:15;6104:2;6093:9;6089:18;6082:43;;6161:6;6156:2;6145:9;6141:18;6134:34;5478:696;;;;;;;:::o;6179:258::-;6251:1;6261:113;6275:6;6272:1;6269:13;6261:113;;;6351:11;;;6345:18;6332:11;;;6325:39;6297:2;6290:10;6261:113;;;6392:6;6389:1;6386:13;6383:48;;;6427:1;6418:6;6413:3;6409:16;6402:27;6383:48;;6179:258;;;:::o;6442:440::-;6589:2;6578:9;6571:21;6552:4;6621:6;6615:13;6664:6;6659:2;6648:9;6644:18;6637:34;6680:66;6739:6;6734:2;6723:9;6719:18;6714:2;6706:6;6702:15;6680:66;:::i;:::-;6798:2;6786:15;-1:-1:-1;;6782:88:72;6767:104;;;;6873:2;6763:113;;6442:440;-1:-1:-1;;6442:440:72:o;6887:184::-;-1:-1:-1;;;6936:1:72;6929:88;7036:4;7033:1;7026:15;7060:4;7057:1;7050:15;7076:334;7147:2;7141:9;7203:2;7193:13;;-1:-1:-1;;7189:86:72;7177:99;;7306:18;7291:34;;7327:22;;;7288:62;7285:88;;;7353:18;;:::i;:::-;7389:2;7382:22;7076:334;;-1:-1:-1;7076:334:72:o;7415:764::-;7494:6;7547:2;7535:9;7526:7;7522:23;7518:32;7515:52;;;7563:1;7560;7553:12;7515:52;7596:9;7590:16;7625:18;7666:2;7658:6;7655:14;7652:34;;;7682:1;7679;7672:12;7652:34;7720:6;7709:9;7705:22;7695:32;;7765:7;7758:4;7754:2;7750:13;7746:27;7736:55;;7787:1;7784;7777:12;7736:55;7816:2;7810:9;7838:2;7834;7831:10;7828:36;;;7844:18;;:::i;:::-;7886:112;7994:2;-1:-1:-1;;7918:4:72;7914:2;7910:13;7906:86;7902:95;7886:112;:::i;:::-;7873:125;;8021:2;8014:5;8007:17;8061:7;8056:2;8051;8047;8043:11;8039:20;8036:33;8033:53;;;8082:1;8079;8072:12;8033:53;8095:54;8146:2;8141;8134:5;8130:14;8125:2;8121;8117:11;8095:54;:::i;:::-;-1:-1:-1;8168:5:72;7415:764;-1:-1:-1;;;;7415:764:72:o;8184:184::-;-1:-1:-1;;;8233:1:72;8226:88;8333:4;8330:1;8323:15;8357:4;8354:1;8347:15;8373:195;8412:3;8443:66;8436:5;8433:77;8430:103;;8513:18;;:::i;:::-;-1:-1:-1;8560:1:72;8549:13;;8373:195::o;8760:184::-;-1:-1:-1;;;8809:1:72;8802:88;8909:4;8906:1;8899:15;8933:4;8930:1;8923:15;8949:395;9054:4;9112:11;9099:25;9202:66;9191:8;9175:14;9171:29;9167:102;9147:18;9143:127;9133:155;;9284:1;9281;9274:12;9133:155;9305:33;;;;;8949:395;-1:-1:-1;;8949:395:72:o;9349:271::-;9423:6;9476:2;9464:9;9455:7;9451:23;9447:32;9444:52;;;9492:1;9489;9482:12;9444:52;9531:9;9518:23;9570:1;9563:5;9560:12;9550:40;;9586:1;9583;9576:12;9625:580;9702:4;9708:6;9768:11;9755:25;9858:66;9847:8;9831:14;9827:29;9823:102;9803:18;9799:127;9789:155;;9940:1;9937;9930:12;9789:155;9967:33;;10019:20;;;-1:-1:-1;10062:18:72;10051:30;;10048:50;;;10094:1;10091;10084:12;10048:50;10127:4;10115:17;;-1:-1:-1;10158:14:72;10154:27;;;10144:38;;10141:58;;;10195:1;10192;10185:12;10210:447;10367:2;10356:9;10349:21;10406:6;10401:2;10390:9;10386:18;10379:34;10463:6;10455;10450:2;10439:9;10435:18;10422:48;10519:1;10490:22;;;10514:2;10486:31;;;10479:42;;;;10573:2;10561:15;;;-1:-1:-1;;10557:88:72;10542:104;10538:113;;10210:447;-1:-1:-1;10210:447:72:o;10662:184::-;10732:6;10785:2;10773:9;10764:7;10760:23;10756:32;10753:52;;;10801:1;10798;10791:12;10753:52;-1:-1:-1;10824:16:72;;10662:184;-1:-1:-1;10662:184:72:o;11202:936::-;11297:6;11328:2;11371;11359:9;11350:7;11346:23;11342:32;11339:52;;;11387:1;11384;11377:12;11339:52;11420:9;11414:16;11449:18;11490:2;11482:6;11479:14;11476:34;;;11506:1;11503;11496:12;11476:34;11544:6;11533:9;11529:22;11519:32;;11589:7;11582:4;11578:2;11574:13;11570:27;11560:55;;11611:1;11608;11601:12;11560:55;11640:2;11634:9;11662:2;11658;11655:10;11652:36;;;11668:18;;:::i;:::-;11714:2;11711:1;11707:10;11697:20;;11737:28;11761:2;11757;11753:11;11737:28;:::i;:::-;11799:15;;;11869:11;;;11865:20;;;11830:12;;;;11897:19;;;11894:39;;;11929:1;11926;11919:12;11894:39;11953:11;;;;11973:135;11989:6;11984:3;11981:15;11973:135;;;12055:10;;12043:23;;12006:12;;;;12086;;;;11973:135;;;12127:5;11202:936;-1:-1:-1;;;;;;;;11202:936:72:o;12843:125::-;12883:4;12911:1;12908;12905:8;12902:34;;;12916:18;;:::i;:::-;-1:-1:-1;12953:9:72;;12843:125::o;12973:128::-;13013:3;13044:1;13040:6;13037:1;13034:13;13031:39;;;13050:18;;:::i;:::-;-1:-1:-1;13086:9:72;;12973:128::o",
    linkReferences: {}
  },
  methodIdentifiers: {
    "components()": "ba62fbe4",
    "getComponent(uint256)": "4f27da18",
    "getComponentIdFromAddress(address)": "9f54f545",
    "getNumEntities()": "d7ecf62b",
    "getSystemAddress(uint256)": "fb3ec48b",
    "getUniqueEntityId()": "614bfa6e",
    "hasEntity(uint256)": "e3d12875",
    "init()": "e1c7392a",
    "query((uint8,uint256,bytes)[])": "687485a6",
    "register()": "1aa3a008",
    "registerComponent(address,uint256)": "f3034770",
    "registerComponentValueRemoved(address,uint256)": "d803064a",
    "registerComponentValueRemoved(uint256)": "0de3b7b5",
    "registerComponentValueSet(address,uint256,bytes)": "af104e40",
    "registerComponentValueSet(uint256,bytes)": "cfd3c57f",
    "registerSystem(address,uint256)": "1ee444b7",
    "systems()": "0d59332e"
  },
  rawMetadata: '{"compiler":{"version":"0.8.13+commit.abaa5c0e"},"language":"Solidity","output":{"abi":[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"componentId","type":"uint256"},{"indexed":true,"internalType":"address","name":"component","type":"address"},{"indexed":true,"internalType":"uint256","name":"entity","type":"uint256"}],"name":"ComponentValueRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"componentId","type":"uint256"},{"indexed":true,"internalType":"address","name":"component","type":"address"},{"indexed":true,"internalType":"uint256","name":"entity","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"ComponentValueSet","type":"event"},{"inputs":[],"name":"components","outputs":[{"internalType":"contract IUint256Component","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"getComponent","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"componentAddr","type":"address"}],"name":"getComponentIdFromAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNumEntities","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"systemId","type":"uint256"}],"name":"getSystemAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUniqueEntityId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"entity","type":"uint256"}],"name":"hasEntity","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"enum QueryType","name":"queryType","type":"uint8"},{"internalType":"uint256","name":"componentId","type":"uint256"},{"internalType":"bytes","name":"value","type":"bytes"}],"internalType":"struct WorldQueryFragment[]","name":"worldQueryFragments","type":"tuple[]"}],"name":"query","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"register","outputs":[{"internalType":"contract RegisterSystem","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"componentAddr","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"registerComponent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"entity","type":"uint256"}],"name":"registerComponentValueRemoved","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"component","type":"address"},{"internalType":"uint256","name":"entity","type":"uint256"}],"name":"registerComponentValueRemoved","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"component","type":"address"},{"internalType":"uint256","name":"entity","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"registerComponentValueSet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"entity","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"registerComponentValueSet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"systemAddr","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"registerSystem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"systems","outputs":[{"internalType":"contract IUint256Component","name":"","type":"address"}],"stateMutability":"view","type":"function"}],"devdoc":{"kind":"dev","methods":{},"version":1},"userdoc":{"kind":"user","methods":{"components()":{"notice":"Get the component registry Uint256Component (mapping from component address to component id)"},"getComponent(uint256)":{"notice":"Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "},"getComponentIdFromAddress(address)":{"notice":"Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "},"getSystemAddress(uint256)":{"notice":"Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "},"getUniqueEntityId()":{"notice":"Get a new unique entity ID."},"hasEntity(uint256)":{"notice":"Check whether an entity exists in this world."},"init()":{"notice":"Initialize the World. Separated from the constructor to prevent circular dependencies."},"query((uint8,uint256,bytes)[])":{"notice":"Helper function to execute a query with query fragments referring to a component ID instead of a component address."},"registerComponent(address,uint256)":{"notice":"Register a new component in this World. ID must be unique."},"registerComponentValueRemoved(address,uint256)":{"notice":"Deprecated - use registerComponentValueRemoved(entity) instead Register a component value removal. Emits the `ComponentValueRemoved` event for clients to reconstruct the state."},"registerComponentValueRemoved(uint256)":{"notice":"Register a component value removal. Emits the `ComponentValueRemoved` event for clients to reconstruct the state."},"registerComponentValueSet(address,uint256,bytes)":{"notice":"Deprecated - use registerComponentValueSet(entity, data) instead Register a component value update. Emits the `ComponentValueSet` event for clients to reconstruct the state."},"registerComponentValueSet(uint256,bytes)":{"notice":"Register a component value update. Emits the `ComponentValueSet` event for clients to reconstruct the state."},"registerSystem(address,uint256)":{"notice":"Register a new system in this World. ID must be unique."},"systems()":{"notice":"Get the system registry Uint256Component (mapping from system address to system id)"}},"notice":"The `World` contract is at the core of every on-chain world. Entities, components and systems are registered in the `World`. Components register updates to their state via the `registerComponentValueSet` and `registerComponentValueRemoved` methods, which emit the `ComponentValueSet` and `ComponentValueRemoved` events respectively. Clients can reconstruct the entire state (of all components) by listening to these two events, instead of having to add a separate getter or event listener for every type of data. (Have a look at the MUD network package for a TypeScript implementation of contract/client state sync.) The `World` is an ownerless and permissionless contract. Anyone can register new components and systems in the world (via the `registerComponent` and `registerSystem` methods). Clients decide which components and systems they care about.","version":1}},"settings":{"compilationTarget":{"src/World.sol":"World"},"evmVersion":"london","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":true,"runs":3000},"remappings":[":@rari-capital/=../../node_modules/@rari-capital/",":@solidstate/=../../node_modules/@solidstate/",":abdk-libraries-solidity/=../../node_modules/abdk-libraries-solidity/",":base64-sol/=../../node_modules/base64-sol/",":create-mud/=../../node_modules/create-mud/",":ds-test/=../../node_modules/ds-test/src/",":forge-std/=../../node_modules/forge-std/src/",":hardhat/=../../node_modules/hardhat/",":memmove/=../../node_modules/memmove/src/",":solmate/=../../node_modules/@rari-capital/solmate/src/"]},"sources":{"../../node_modules/@solidstate/contracts/access/ownable/IOwnable.sol":{"keccak256":"0xd2d21c507ed587cd5de6cc016d4b9c7e956e468108b784455a400301707031c1","license":"MIT","urls":["bzz-raw://091a98176309554295f1d471f888b1567d07e0250b11e23fa540739b6dfdce38","dweb:/ipfs/Qme69DrKhhtwkSBMU456C3NxzXNMC7AJ4sVNMg5rKcrtPn"]},"../../node_modules/@solidstate/contracts/access/ownable/IOwnableInternal.sol":{"keccak256":"0x6237a634712261bd82d5c7753780d35f77af215406d1e59512052f743f8f1c60","license":"MIT","urls":["bzz-raw://8e54ac6cd1b376224b8d148c704693ff3f7ac9f69954fd30ee3d949fa17210c3","dweb:/ipfs/QmWjq37K3gg29XhFbepg5GbmmFYoyXb81sh2K1MnVZqG6y"]},"../../node_modules/@solidstate/contracts/access/ownable/Ownable.sol":{"keccak256":"0xe16b09090c1251f8cc97fb2cc10c86675e0d0d9f0fc0032b417c37c8dba2db5f","license":"MIT","urls":["bzz-raw://8482effd630de3e3eb3c66ce6bc5ddd12838381e6e585df42116b4fd7764e4bc","dweb:/ipfs/Qma9ga6QS2SooCYKyB7J5EHE8uUGiAv49kosEyjHt9Zg79"]},"../../node_modules/@solidstate/contracts/access/ownable/OwnableInternal.sol":{"keccak256":"0x0185d24250a5e6fbafce443b9ba19bba761803e3e5d91ba423bfb1f5f0bbdbf9","license":"MIT","urls":["bzz-raw://547fadeaec559ee824f4dd37b2ef972a061ca59576f5733cf643e00d88a4db52","dweb:/ipfs/QmYx6rmRmZZQkoS8TykMVsz9ZvfQ8MfSPt6UzWJ8pyj8qF"]},"../../node_modules/@solidstate/contracts/access/ownable/OwnableStorage.sol":{"keccak256":"0x7385e2020de914f75cabdc83c6adf88ed21e9de14669a89b3832b80f4f8c7b73","license":"MIT","urls":["bzz-raw://a367c512bf29fb4923ed5d2454783e3dae88e5e03dec216e65c3986f3c3a8995","dweb:/ipfs/QmfYkD6osr6SQzod6wc7WPae6YvVnYbn2BjJuHrYL3ERXM"]},"../../node_modules/@solidstate/contracts/interfaces/IERC173.sol":{"keccak256":"0x9b18a5ad66323c65a81ecd62c3536db99115fe69a30b56a04409de941da7deb6","license":"MIT","urls":["bzz-raw://a93684363c5bfd4e31fa2cc2d3402e9451ba61c7dbb404e8e50658610fb2a555","dweb:/ipfs/QmanFgF5v5GjBBrAEYCpaZyXRFRvzLGgB8SQcSEf9Dkj5Q"]},"../../node_modules/@solidstate/contracts/interfaces/IERC173Internal.sol":{"keccak256":"0x9644c3e56c9ecd1763f8aaa437d5d573a7f64a8d93ad7bea1a9c44beb5911b89","license":"MIT","urls":["bzz-raw://c32cfda38b44878ab196d32eeb72823a9f9904e8193286c787caccfb2e5bfa75","dweb:/ipfs/QmfBNKWUSKaJtYL3JJ3YFioXCVFeeakqQ4cR5XzAxxZkCx"]},"../../node_modules/@solidstate/contracts/utils/AddressUtils.sol":{"keccak256":"0x7d924db4dbd9210923ab08db77db3c77438014c255fd49fa208ebce283d991bf","license":"MIT","urls":["bzz-raw://5189eebdf91899224a14b4cd5184fa9e67a9b8904e6d88ff9610944d06c63929","dweb:/ipfs/QmRwNhfcp98pPgbzK4i9hbypHLTWPGYpuRCtEJRCTNASRm"]},"../../node_modules/@solidstate/contracts/utils/UintUtils.sol":{"keccak256":"0x5aaeaea22a0800402c6f2d8ce6185293bc64f74f6c390c1b1c53b624b43972f8","license":"MIT","urls":["bzz-raw://8b1c95c745da8ca4de7b68e65ef9122dab4e748c3ae3c9f5fd5aa7c65887c9d2","dweb:/ipfs/QmX2KURY4JbM4NVFp5KPYsNxoJGA8n8w6SdAFdD5Pasgza"]},"../../node_modules/memmove/src/Array.sol":{"keccak256":"0x0d7681d3392c34f811cebc9598c5e8f4eef6aba431dca9e1fa87267ba51a4515","license":"MIT","urls":["bzz-raw://0ffb5179dd40ccacadc2cb26ac99e9ea5148796f6d21413d7e0f37913831bea1","dweb:/ipfs/QmfJogaoqook5JgnUZKib6w6khzViUag3EQb1EZ8aUEasQ"]},"../../node_modules/memmove/src/LinkedList.sol":{"keccak256":"0x2374863d39689178dda92b841e77b835ba8fa550561be23b7861d2e52c0fe8c1","license":"MIT","urls":["bzz-raw://8538ec6ca6be4e1b25b74dfd2139586fa2b9dab8d49d91428ed64dc683884598","dweb:/ipfs/Qma7Z6urenqG5Dzqwe8ouGiFH37mbsJEX83tqjSq1PTnRc"]},"src/BareComponent.sol":{"keccak256":"0x2cd722acd3cad5a9318bd5907a3d9f3849756727a5b2303eaf76aa7ea8caa65a","license":"MIT","urls":["bzz-raw://890e17cd1f2f2ed87c99ca7b9383f7eabb31570989247a81e268a636b163a89a","dweb:/ipfs/QmXJEKkMBQniSwHvC9aqHjRCaMohwkpPT7ssCtkL31j4FA"]},"src/Component.sol":{"keccak256":"0x40085c2f86bf6be7a756015025477aa46308b1618083ece93ae13093881a6874","license":"MIT","urls":["bzz-raw://ca8653540b5674e50abfd4b4898009b472fc7fd2fba456146c1a1c44b615d83a","dweb:/ipfs/QmSqbRng5fHuGUKgkFuNw3BfoefNteYU95sYi4g9QjCCNh"]},"src/LibQuery.sol":{"keccak256":"0x880ef5273d93926a8edb17b0314c5a7368a0da4ea4b818e354c89891b1080ba0","license":"MIT","urls":["bzz-raw://6163c65c40133c58326c9890d1db1feb4cb9291c4d15149d801ae52865df9f4c","dweb:/ipfs/QmdrfbUFc3ApNSYWWv4t7GMbaMwxwpPTJf8SfZHsH3X3Hd"]},"src/LibTypes.sol":{"keccak256":"0xa3898035fd9fa865bcfc9861e3b5ecce36be3196fb27705e50a02fed9831f102","license":"MIT","urls":["bzz-raw://273284a35a950f6d0bc4223d345cf46c59972a00510ddbc4ba695ede38714798","dweb:/ipfs/QmdqzKMaAfKWfBzUsrzsDMWnyxSKJRuEvrc6VTR5VarQaH"]},"src/MapSet.sol":{"keccak256":"0xe1a1f412b22d586c01a3e9e0e0af40893b880260f6765b9a5e23e56154dae1db","license":"MIT","urls":["bzz-raw://f8aeddb1af783e43e8ca8a004954016c9f00d9d217d86454b3a3839ef0981288","dweb:/ipfs/QmegHggcpmgGgL9xbZKqnWMwNMSqvs622MuhyEhR9bVfb9"]},"src/Ownable.sol":{"keccak256":"0x7572ffd98860b2539eacdbb2112ce3d25ad8521c5d95f91e21ea5588a6904209","license":"MIT","urls":["bzz-raw://3516b95146224d3fc04c5cc2818161fa9504a048894f6dd905b1e42307494fc4","dweb:/ipfs/QmTqvvAs1fSLzXVWjAgSt3TtE3MM3M1DFXRzkkSsixtVza"]},"src/OwnableWritable.sol":{"keccak256":"0x0e3e9a7ca8ee0a020753c233db1b757f09f3be37d9ea21614892311e6d29baaf","license":"MIT","urls":["bzz-raw://43d631dfbedce59f2f0d594bfd432eafaaa75e76a381368d309bbadb062ec76c","dweb:/ipfs/QmNjGZPJGAXf26HgMCUk68euquWUkKQ13sEyLMvkjTJ91A"]},"src/OwnableWritableStorage.sol":{"keccak256":"0x9f99bbacdfd6c5b0779bd18d3900dd4f957c5a0d89d5986815fae2eff8254df5","license":"MIT","urls":["bzz-raw://3ee736ebade674846118859290603b8ad2cc91efbe13e3621aa52fb4987cb0b4","dweb:/ipfs/QmNUzZS4LPhBCacrPNjbQXLV4anrvNxQ2yPEPETj3sgbzW"]},"src/Set.sol":{"keccak256":"0xcddfd88e4fd1c183470f470dbe5e6fdd48ed0d26bd1ccefb8070a476bc8ba344","license":"MIT","urls":["bzz-raw://e81ffd8a5b104abd04876a42d613378181009bae9368779223fabc1b1d514e46","dweb:/ipfs/QmUywR2WzJfzPn1bRkd7e6Sy6jo3q9AjuQWU55BHKUiNME"]},"src/System.sol":{"keccak256":"0xa26b5061fdcbb516111cebd798db1ac8d7733cbf562700aa9892276f3e40e1e7","license":"MIT","urls":["bzz-raw://471b323faa1baf8b14f3c0a4acf539643ac2fba105b13314066452ebaa228281","dweb:/ipfs/QmRmTjgggZcziB9FH2oPyQGQAAnxEsubiY1gDC1vQz6uWW"]},"src/SystemStorage.sol":{"keccak256":"0x3adf624854f860099d0911cdc51b29e6690e413f2c260e3536552d223fe77b2b","license":"MIT","urls":["bzz-raw://9fa473135604adb13a95583e6cc8092bc82be534bdcdd915e1f344eb78fc645d","dweb:/ipfs/QmYvRKgZ2iRVmSykLAtrrdsr27Eyg6QorhHGL5ZLE8wTTW"]},"src/World.sol":{"keccak256":"0x5eb54e585f9edeba68519e411e9a73a6d80460b01f87590f2b212f7ac511b9bd","license":"MIT","urls":["bzz-raw://6caf469b0a696767bb72288b16d4dca20187daa9261cdca253671489738cf27c","dweb:/ipfs/QmbEoVs4VUh7uK8LTyS4A6jd9Fkkoix6tWPHAm2DZmkkVX"]},"src/components/Uint256Component.sol":{"keccak256":"0x6f4f16d1a14a8587d9bd21a7f33744d1ffb3cfd5309c6b8229236e5e2d84b465","license":"MIT","urls":["bzz-raw://2dde592cc08fb85378b2b4c263434122c4e4a19a10a6a0b5857c48b002571470","dweb:/ipfs/QmafCQgVugZuVfCNBQaFGFM2Qc9sWML4fG6Pct5ujRXt94"]},"src/constants.sol":{"keccak256":"0x024a3ff3077a272339b7baa96b826fd75f040d7cd2c6e13b9c8cf7ad16f789b8","license":"MIT","urls":["bzz-raw://1ddcb26a7703e9b03b34d5465010a4ae5ced137021c94987053544ad1156a644","dweb:/ipfs/QmYue4gnb8noyoxxTchs5chZji7DKynKMp2x33RgRW6xqZ"]},"src/interfaces/IComponent.sol":{"keccak256":"0xc25ab58cac1449fcd501ddcc56dade0653a7946adcd9eee2931bc095eda2a6b4","license":"MIT","urls":["bzz-raw://c9505da36322f3b3de4dc0aaf0aec911e76be6cbd091f4d142070a7316df4629","dweb:/ipfs/QmY5aGhwzBV5fXeLRDuzWMUfbPZGGdggbLdARhrkjmPBYW"]},"src/interfaces/IERC173.sol":{"keccak256":"0x2bd9a729a3bfcfc445bc557a914aee17fcaf1c0f74b909b6a91a5d3755a699e9","license":"MIT","urls":["bzz-raw://203741d681a686fb75f0715332e554083733f349100dfe11252c17fbe9cd094e","dweb:/ipfs/QmaBXDHiU4ZdJ8K5jQZ3FfswMpWEqSPsBWGFkJMU2qmmWi"]},"src/interfaces/IEntityContainer.sol":{"keccak256":"0x4506db1dcbdbe68a397107a57bfa3da888a889f14181a90eb728cfecc60700b8","license":"MIT","urls":["bzz-raw://23f5c02d110f5abf6340a08a2a8b7e0b5668f211fe6baf41213e6c4f69dece10","dweb:/ipfs/QmYfKeZMeEUNExsxjkCF5nGdw8KRyPe1t5tcGFTEkP7CkV"]},"src/interfaces/IEntityIndexer.sol":{"keccak256":"0xd89023b2a5e9961be3c9d49d9f7f9ac7dcc416e3f43a8758dc058d1db2eea6b5","license":"MIT","urls":["bzz-raw://3266ea1dd5a7f372f8814db24ac4981730f66fba8e6f90f614246ca5cec529b4","dweb:/ipfs/QmQ71BtaBsDjfke46dndaTBVhyXAHxs5qs7d9GHJwVXuvw"]},"src/interfaces/IOwnableWritable.sol":{"keccak256":"0x804db2685d65f5d4029431c47276b6ac43d3c329ea4ce75358928dbd4d11ee77","license":"MIT","urls":["bzz-raw://a1d85dfe46f678ce4cf3a788092519251a24c2c015f9e858a81111b506b0ee78","dweb:/ipfs/QmVmE4f8axCeh8V2kcs8nxYd27rSiwvXJbDbNCg3VZHSXY"]},"src/interfaces/ISystem.sol":{"keccak256":"0xbc1c0b0c72ab5e20ff7eae3cf53627aac367a2f9a65d2e87451a0313869d3bed","license":"MIT","urls":["bzz-raw://b2a7c4c30beb9b96c4e8112b9864f7bac5c761e61765e0dc359d926572feaa5a","dweb:/ipfs/QmVNJbky7itfqBBdDCh8anSWMaHhXs2mKhzuW7hbCVWgj3"]},"src/interfaces/IUint256Component.sol":{"keccak256":"0x12e2eaa4c5663048343e43a1994c446baacb16a4aacbe314ed5202d878751be9","license":"MIT","urls":["bzz-raw://2d78184a1b1868773f2d5a7cf54bb42bccc666dc75cea14eeed15b8573fd000f","dweb:/ipfs/QmemXPHPB7V8StWR8kZcKt3eDxB78sZFZW4Dp7TcEFTxx9"]},"src/interfaces/IWorld.sol":{"keccak256":"0x3ac1853f4cade8f432f5b3144e0c914b93f110ea3eabd85438cde39160716114","license":"MIT","urls":["bzz-raw://1f0ba421b481b66d43c9da4de63171a79ffadc708956893bddf10eec666a0f4a","dweb:/ipfs/QmdSyzQUDrP3MXt8JjgXt1QUgraUKBUPHE2CVzJiEwfMAK"]},"src/interfaces/Query.sol":{"keccak256":"0x987e47a4d3f076910382b4e8619f607ea15abdedd786d6095bd27126ff6f941c","license":"MIT","urls":["bzz-raw://8c3d57f9da85917b77e1043a179d3b516bc8c00a8880fdcb1bffca7e53169059","dweb:/ipfs/QmaHxqsT1ZpS8toN88qxgbeaDSMvnhYv9J9FMjVnKrMgoP"]},"src/systems/RegisterSystem.sol":{"keccak256":"0x5b238c1bacaa26480ae434f15754b9ad53856accb46ca41ce769713bbfc73f8f","license":"MIT","urls":["bzz-raw://c5449b9bf09030b85130d1fc3de196484d75459bea492175d13d01ec4d11e469","dweb:/ipfs/QmWPf9LREhwNLn2Bc1MYw9vQM1RN7Dstadh8NYsF5zrPTq"]},"src/utils.sol":{"keccak256":"0x17f7831c03bdd77f0c7d98c94931d830fbbfa1878c365f54b12841c85611e24e","license":"MIT","urls":["bzz-raw://6ae566ee03c5050b239277ef4184b9e5dcb332c8cc65b032f8e0d9e46408ea6d","dweb:/ipfs/QmetdhxahRf7FJk1kn8KgDmizU2zYk3jjt9qo6Gwz2M5YP"]}},"version":1}',
  metadata: {
    compiler: {
      version: "0.8.13+commit.abaa5c0e"
    },
    language: "Solidity",
    output: {
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "componentId",
              type: "uint256",
              indexed: true
            },
            {
              internalType: "address",
              name: "component",
              type: "address",
              indexed: true
            },
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256",
              indexed: true
            }
          ],
          type: "event",
          name: "ComponentValueRemoved",
          anonymous: false
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "componentId",
              type: "uint256",
              indexed: true
            },
            {
              internalType: "address",
              name: "component",
              type: "address",
              indexed: true
            },
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256",
              indexed: true
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
              indexed: false
            }
          ],
          type: "event",
          name: "ComponentValueSet",
          anonymous: false
        },
        {
          inputs: [],
          stateMutability: "view",
          type: "function",
          name: "components",
          outputs: [
            {
              internalType: "contract IUint256Component",
              name: "",
              type: "address"
            }
          ]
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function",
          name: "getComponent",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ]
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "componentAddr",
              type: "address"
            }
          ],
          stateMutability: "view",
          type: "function",
          name: "getComponentIdFromAddress",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ]
        },
        {
          inputs: [],
          stateMutability: "view",
          type: "function",
          name: "getNumEntities",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ]
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "systemId",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function",
          name: "getSystemAddress",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address"
            }
          ]
        },
        {
          inputs: [],
          stateMutability: "view",
          type: "function",
          name: "getUniqueEntityId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ]
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function",
          name: "hasEntity",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool"
            }
          ]
        },
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "function",
          name: "init"
        },
        {
          inputs: [
            {
              internalType: "struct WorldQueryFragment[]",
              name: "worldQueryFragments",
              type: "tuple[]",
              components: [
                {
                  internalType: "enum QueryType",
                  name: "queryType",
                  type: "uint8"
                },
                {
                  internalType: "uint256",
                  name: "componentId",
                  type: "uint256"
                },
                {
                  internalType: "bytes",
                  name: "value",
                  type: "bytes"
                }
              ]
            }
          ],
          stateMutability: "view",
          type: "function",
          name: "query",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]"
            }
          ]
        },
        {
          inputs: [],
          stateMutability: "view",
          type: "function",
          name: "register",
          outputs: [
            {
              internalType: "contract RegisterSystem",
              name: "",
              type: "address"
            }
          ]
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "componentAddr",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "registerComponent"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "registerComponentValueRemoved"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "component",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "registerComponentValueRemoved"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "component",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "registerComponentValueSet"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "entity",
              type: "uint256"
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "registerComponentValueSet"
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "systemAddr",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "registerSystem"
        },
        {
          inputs: [],
          stateMutability: "view",
          type: "function",
          name: "systems",
          outputs: [
            {
              internalType: "contract IUint256Component",
              name: "",
              type: "address"
            }
          ]
        }
      ],
      devdoc: {
        kind: "dev",
        methods: {},
        version: 1
      },
      userdoc: {
        kind: "user",
        methods: {
          "components()": {
            notice: "Get the component registry Uint256Component (mapping from component address to component id)"
          },
          "getComponent(uint256)": {
            notice: "Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "
          },
          "getComponentIdFromAddress(address)": {
            notice: "Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "
          },
          "getSystemAddress(uint256)": {
            notice: "Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "
          },
          "getUniqueEntityId()": {
            notice: "Get a new unique entity ID."
          },
          "hasEntity(uint256)": {
            notice: "Check whether an entity exists in this world."
          },
          "init()": {
            notice: "Initialize the World. Separated from the constructor to prevent circular dependencies."
          },
          "query((uint8,uint256,bytes)[])": {
            notice: "Helper function to execute a query with query fragments referring to a component ID instead of a component address."
          },
          "registerComponent(address,uint256)": {
            notice: "Register a new component in this World. ID must be unique."
          },
          "registerComponentValueRemoved(address,uint256)": {
            notice: "Deprecated - use registerComponentValueRemoved(entity) instead Register a component value removal. Emits the `ComponentValueRemoved` event for clients to reconstruct the state."
          },
          "registerComponentValueRemoved(uint256)": {
            notice: "Register a component value removal. Emits the `ComponentValueRemoved` event for clients to reconstruct the state."
          },
          "registerComponentValueSet(address,uint256,bytes)": {
            notice: "Deprecated - use registerComponentValueSet(entity, data) instead Register a component value update. Emits the `ComponentValueSet` event for clients to reconstruct the state."
          },
          "registerComponentValueSet(uint256,bytes)": {
            notice: "Register a component value update. Emits the `ComponentValueSet` event for clients to reconstruct the state."
          },
          "registerSystem(address,uint256)": {
            notice: "Register a new system in this World. ID must be unique."
          },
          "systems()": {
            notice: "Get the system registry Uint256Component (mapping from system address to system id)"
          }
        },
        version: 1
      }
    },
    settings: {
      remappings: [
        ":@rari-capital/=../../node_modules/@rari-capital/",
        ":@solidstate/=../../node_modules/@solidstate/",
        ":abdk-libraries-solidity/=../../node_modules/abdk-libraries-solidity/",
        ":base64-sol/=../../node_modules/base64-sol/",
        ":create-mud/=../../node_modules/create-mud/",
        ":ds-test/=../../node_modules/ds-test/src/",
        ":forge-std/=../../node_modules/forge-std/src/",
        ":hardhat/=../../node_modules/hardhat/",
        ":memmove/=../../node_modules/memmove/src/",
        ":solmate/=../../node_modules/@rari-capital/solmate/src/"
      ],
      optimizer: {
        enabled: true,
        runs: 3e3
      },
      metadata: {
        bytecodeHash: "ipfs"
      },
      compilationTarget: {
        "src/World.sol": "World"
      },
      libraries: {}
    },
    sources: {
      "../../node_modules/@solidstate/contracts/access/ownable/IOwnable.sol": {
        keccak256: "0xd2d21c507ed587cd5de6cc016d4b9c7e956e468108b784455a400301707031c1",
        urls: [
          "bzz-raw://091a98176309554295f1d471f888b1567d07e0250b11e23fa540739b6dfdce38",
          "dweb:/ipfs/Qme69DrKhhtwkSBMU456C3NxzXNMC7AJ4sVNMg5rKcrtPn"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/access/ownable/IOwnableInternal.sol": {
        keccak256: "0x6237a634712261bd82d5c7753780d35f77af215406d1e59512052f743f8f1c60",
        urls: [
          "bzz-raw://8e54ac6cd1b376224b8d148c704693ff3f7ac9f69954fd30ee3d949fa17210c3",
          "dweb:/ipfs/QmWjq37K3gg29XhFbepg5GbmmFYoyXb81sh2K1MnVZqG6y"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/access/ownable/Ownable.sol": {
        keccak256: "0xe16b09090c1251f8cc97fb2cc10c86675e0d0d9f0fc0032b417c37c8dba2db5f",
        urls: [
          "bzz-raw://8482effd630de3e3eb3c66ce6bc5ddd12838381e6e585df42116b4fd7764e4bc",
          "dweb:/ipfs/Qma9ga6QS2SooCYKyB7J5EHE8uUGiAv49kosEyjHt9Zg79"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/access/ownable/OwnableInternal.sol": {
        keccak256: "0x0185d24250a5e6fbafce443b9ba19bba761803e3e5d91ba423bfb1f5f0bbdbf9",
        urls: [
          "bzz-raw://547fadeaec559ee824f4dd37b2ef972a061ca59576f5733cf643e00d88a4db52",
          "dweb:/ipfs/QmYx6rmRmZZQkoS8TykMVsz9ZvfQ8MfSPt6UzWJ8pyj8qF"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/access/ownable/OwnableStorage.sol": {
        keccak256: "0x7385e2020de914f75cabdc83c6adf88ed21e9de14669a89b3832b80f4f8c7b73",
        urls: [
          "bzz-raw://a367c512bf29fb4923ed5d2454783e3dae88e5e03dec216e65c3986f3c3a8995",
          "dweb:/ipfs/QmfYkD6osr6SQzod6wc7WPae6YvVnYbn2BjJuHrYL3ERXM"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/interfaces/IERC173.sol": {
        keccak256: "0x9b18a5ad66323c65a81ecd62c3536db99115fe69a30b56a04409de941da7deb6",
        urls: [
          "bzz-raw://a93684363c5bfd4e31fa2cc2d3402e9451ba61c7dbb404e8e50658610fb2a555",
          "dweb:/ipfs/QmanFgF5v5GjBBrAEYCpaZyXRFRvzLGgB8SQcSEf9Dkj5Q"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/interfaces/IERC173Internal.sol": {
        keccak256: "0x9644c3e56c9ecd1763f8aaa437d5d573a7f64a8d93ad7bea1a9c44beb5911b89",
        urls: [
          "bzz-raw://c32cfda38b44878ab196d32eeb72823a9f9904e8193286c787caccfb2e5bfa75",
          "dweb:/ipfs/QmfBNKWUSKaJtYL3JJ3YFioXCVFeeakqQ4cR5XzAxxZkCx"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/utils/AddressUtils.sol": {
        keccak256: "0x7d924db4dbd9210923ab08db77db3c77438014c255fd49fa208ebce283d991bf",
        urls: [
          "bzz-raw://5189eebdf91899224a14b4cd5184fa9e67a9b8904e6d88ff9610944d06c63929",
          "dweb:/ipfs/QmRwNhfcp98pPgbzK4i9hbypHLTWPGYpuRCtEJRCTNASRm"
        ],
        license: "MIT"
      },
      "../../node_modules/@solidstate/contracts/utils/UintUtils.sol": {
        keccak256: "0x5aaeaea22a0800402c6f2d8ce6185293bc64f74f6c390c1b1c53b624b43972f8",
        urls: [
          "bzz-raw://8b1c95c745da8ca4de7b68e65ef9122dab4e748c3ae3c9f5fd5aa7c65887c9d2",
          "dweb:/ipfs/QmX2KURY4JbM4NVFp5KPYsNxoJGA8n8w6SdAFdD5Pasgza"
        ],
        license: "MIT"
      },
      "../../node_modules/memmove/src/Array.sol": {
        keccak256: "0x0d7681d3392c34f811cebc9598c5e8f4eef6aba431dca9e1fa87267ba51a4515",
        urls: [
          "bzz-raw://0ffb5179dd40ccacadc2cb26ac99e9ea5148796f6d21413d7e0f37913831bea1",
          "dweb:/ipfs/QmfJogaoqook5JgnUZKib6w6khzViUag3EQb1EZ8aUEasQ"
        ],
        license: "MIT"
      },
      "../../node_modules/memmove/src/LinkedList.sol": {
        keccak256: "0x2374863d39689178dda92b841e77b835ba8fa550561be23b7861d2e52c0fe8c1",
        urls: [
          "bzz-raw://8538ec6ca6be4e1b25b74dfd2139586fa2b9dab8d49d91428ed64dc683884598",
          "dweb:/ipfs/Qma7Z6urenqG5Dzqwe8ouGiFH37mbsJEX83tqjSq1PTnRc"
        ],
        license: "MIT"
      },
      "src/BareComponent.sol": {
        keccak256: "0x2cd722acd3cad5a9318bd5907a3d9f3849756727a5b2303eaf76aa7ea8caa65a",
        urls: [
          "bzz-raw://890e17cd1f2f2ed87c99ca7b9383f7eabb31570989247a81e268a636b163a89a",
          "dweb:/ipfs/QmXJEKkMBQniSwHvC9aqHjRCaMohwkpPT7ssCtkL31j4FA"
        ],
        license: "MIT"
      },
      "src/Component.sol": {
        keccak256: "0x40085c2f86bf6be7a756015025477aa46308b1618083ece93ae13093881a6874",
        urls: [
          "bzz-raw://ca8653540b5674e50abfd4b4898009b472fc7fd2fba456146c1a1c44b615d83a",
          "dweb:/ipfs/QmSqbRng5fHuGUKgkFuNw3BfoefNteYU95sYi4g9QjCCNh"
        ],
        license: "MIT"
      },
      "src/LibQuery.sol": {
        keccak256: "0x880ef5273d93926a8edb17b0314c5a7368a0da4ea4b818e354c89891b1080ba0",
        urls: [
          "bzz-raw://6163c65c40133c58326c9890d1db1feb4cb9291c4d15149d801ae52865df9f4c",
          "dweb:/ipfs/QmdrfbUFc3ApNSYWWv4t7GMbaMwxwpPTJf8SfZHsH3X3Hd"
        ],
        license: "MIT"
      },
      "src/LibTypes.sol": {
        keccak256: "0xa3898035fd9fa865bcfc9861e3b5ecce36be3196fb27705e50a02fed9831f102",
        urls: [
          "bzz-raw://273284a35a950f6d0bc4223d345cf46c59972a00510ddbc4ba695ede38714798",
          "dweb:/ipfs/QmdqzKMaAfKWfBzUsrzsDMWnyxSKJRuEvrc6VTR5VarQaH"
        ],
        license: "MIT"
      },
      "src/MapSet.sol": {
        keccak256: "0xe1a1f412b22d586c01a3e9e0e0af40893b880260f6765b9a5e23e56154dae1db",
        urls: [
          "bzz-raw://f8aeddb1af783e43e8ca8a004954016c9f00d9d217d86454b3a3839ef0981288",
          "dweb:/ipfs/QmegHggcpmgGgL9xbZKqnWMwNMSqvs622MuhyEhR9bVfb9"
        ],
        license: "MIT"
      },
      "src/Ownable.sol": {
        keccak256: "0x7572ffd98860b2539eacdbb2112ce3d25ad8521c5d95f91e21ea5588a6904209",
        urls: [
          "bzz-raw://3516b95146224d3fc04c5cc2818161fa9504a048894f6dd905b1e42307494fc4",
          "dweb:/ipfs/QmTqvvAs1fSLzXVWjAgSt3TtE3MM3M1DFXRzkkSsixtVza"
        ],
        license: "MIT"
      },
      "src/OwnableWritable.sol": {
        keccak256: "0x0e3e9a7ca8ee0a020753c233db1b757f09f3be37d9ea21614892311e6d29baaf",
        urls: [
          "bzz-raw://43d631dfbedce59f2f0d594bfd432eafaaa75e76a381368d309bbadb062ec76c",
          "dweb:/ipfs/QmNjGZPJGAXf26HgMCUk68euquWUkKQ13sEyLMvkjTJ91A"
        ],
        license: "MIT"
      },
      "src/OwnableWritableStorage.sol": {
        keccak256: "0x9f99bbacdfd6c5b0779bd18d3900dd4f957c5a0d89d5986815fae2eff8254df5",
        urls: [
          "bzz-raw://3ee736ebade674846118859290603b8ad2cc91efbe13e3621aa52fb4987cb0b4",
          "dweb:/ipfs/QmNUzZS4LPhBCacrPNjbQXLV4anrvNxQ2yPEPETj3sgbzW"
        ],
        license: "MIT"
      },
      "src/Set.sol": {
        keccak256: "0xcddfd88e4fd1c183470f470dbe5e6fdd48ed0d26bd1ccefb8070a476bc8ba344",
        urls: [
          "bzz-raw://e81ffd8a5b104abd04876a42d613378181009bae9368779223fabc1b1d514e46",
          "dweb:/ipfs/QmUywR2WzJfzPn1bRkd7e6Sy6jo3q9AjuQWU55BHKUiNME"
        ],
        license: "MIT"
      },
      "src/System.sol": {
        keccak256: "0xa26b5061fdcbb516111cebd798db1ac8d7733cbf562700aa9892276f3e40e1e7",
        urls: [
          "bzz-raw://471b323faa1baf8b14f3c0a4acf539643ac2fba105b13314066452ebaa228281",
          "dweb:/ipfs/QmRmTjgggZcziB9FH2oPyQGQAAnxEsubiY1gDC1vQz6uWW"
        ],
        license: "MIT"
      },
      "src/SystemStorage.sol": {
        keccak256: "0x3adf624854f860099d0911cdc51b29e6690e413f2c260e3536552d223fe77b2b",
        urls: [
          "bzz-raw://9fa473135604adb13a95583e6cc8092bc82be534bdcdd915e1f344eb78fc645d",
          "dweb:/ipfs/QmYvRKgZ2iRVmSykLAtrrdsr27Eyg6QorhHGL5ZLE8wTTW"
        ],
        license: "MIT"
      },
      "src/World.sol": {
        keccak256: "0x5eb54e585f9edeba68519e411e9a73a6d80460b01f87590f2b212f7ac511b9bd",
        urls: [
          "bzz-raw://6caf469b0a696767bb72288b16d4dca20187daa9261cdca253671489738cf27c",
          "dweb:/ipfs/QmbEoVs4VUh7uK8LTyS4A6jd9Fkkoix6tWPHAm2DZmkkVX"
        ],
        license: "MIT"
      },
      "src/components/Uint256Component.sol": {
        keccak256: "0x6f4f16d1a14a8587d9bd21a7f33744d1ffb3cfd5309c6b8229236e5e2d84b465",
        urls: [
          "bzz-raw://2dde592cc08fb85378b2b4c263434122c4e4a19a10a6a0b5857c48b002571470",
          "dweb:/ipfs/QmafCQgVugZuVfCNBQaFGFM2Qc9sWML4fG6Pct5ujRXt94"
        ],
        license: "MIT"
      },
      "src/constants.sol": {
        keccak256: "0x024a3ff3077a272339b7baa96b826fd75f040d7cd2c6e13b9c8cf7ad16f789b8",
        urls: [
          "bzz-raw://1ddcb26a7703e9b03b34d5465010a4ae5ced137021c94987053544ad1156a644",
          "dweb:/ipfs/QmYue4gnb8noyoxxTchs5chZji7DKynKMp2x33RgRW6xqZ"
        ],
        license: "MIT"
      },
      "src/interfaces/IComponent.sol": {
        keccak256: "0xc25ab58cac1449fcd501ddcc56dade0653a7946adcd9eee2931bc095eda2a6b4",
        urls: [
          "bzz-raw://c9505da36322f3b3de4dc0aaf0aec911e76be6cbd091f4d142070a7316df4629",
          "dweb:/ipfs/QmY5aGhwzBV5fXeLRDuzWMUfbPZGGdggbLdARhrkjmPBYW"
        ],
        license: "MIT"
      },
      "src/interfaces/IERC173.sol": {
        keccak256: "0x2bd9a729a3bfcfc445bc557a914aee17fcaf1c0f74b909b6a91a5d3755a699e9",
        urls: [
          "bzz-raw://203741d681a686fb75f0715332e554083733f349100dfe11252c17fbe9cd094e",
          "dweb:/ipfs/QmaBXDHiU4ZdJ8K5jQZ3FfswMpWEqSPsBWGFkJMU2qmmWi"
        ],
        license: "MIT"
      },
      "src/interfaces/IEntityContainer.sol": {
        keccak256: "0x4506db1dcbdbe68a397107a57bfa3da888a889f14181a90eb728cfecc60700b8",
        urls: [
          "bzz-raw://23f5c02d110f5abf6340a08a2a8b7e0b5668f211fe6baf41213e6c4f69dece10",
          "dweb:/ipfs/QmYfKeZMeEUNExsxjkCF5nGdw8KRyPe1t5tcGFTEkP7CkV"
        ],
        license: "MIT"
      },
      "src/interfaces/IEntityIndexer.sol": {
        keccak256: "0xd89023b2a5e9961be3c9d49d9f7f9ac7dcc416e3f43a8758dc058d1db2eea6b5",
        urls: [
          "bzz-raw://3266ea1dd5a7f372f8814db24ac4981730f66fba8e6f90f614246ca5cec529b4",
          "dweb:/ipfs/QmQ71BtaBsDjfke46dndaTBVhyXAHxs5qs7d9GHJwVXuvw"
        ],
        license: "MIT"
      },
      "src/interfaces/IOwnableWritable.sol": {
        keccak256: "0x804db2685d65f5d4029431c47276b6ac43d3c329ea4ce75358928dbd4d11ee77",
        urls: [
          "bzz-raw://a1d85dfe46f678ce4cf3a788092519251a24c2c015f9e858a81111b506b0ee78",
          "dweb:/ipfs/QmVmE4f8axCeh8V2kcs8nxYd27rSiwvXJbDbNCg3VZHSXY"
        ],
        license: "MIT"
      },
      "src/interfaces/ISystem.sol": {
        keccak256: "0xbc1c0b0c72ab5e20ff7eae3cf53627aac367a2f9a65d2e87451a0313869d3bed",
        urls: [
          "bzz-raw://b2a7c4c30beb9b96c4e8112b9864f7bac5c761e61765e0dc359d926572feaa5a",
          "dweb:/ipfs/QmVNJbky7itfqBBdDCh8anSWMaHhXs2mKhzuW7hbCVWgj3"
        ],
        license: "MIT"
      },
      "src/interfaces/IUint256Component.sol": {
        keccak256: "0x12e2eaa4c5663048343e43a1994c446baacb16a4aacbe314ed5202d878751be9",
        urls: [
          "bzz-raw://2d78184a1b1868773f2d5a7cf54bb42bccc666dc75cea14eeed15b8573fd000f",
          "dweb:/ipfs/QmemXPHPB7V8StWR8kZcKt3eDxB78sZFZW4Dp7TcEFTxx9"
        ],
        license: "MIT"
      },
      "src/interfaces/IWorld.sol": {
        keccak256: "0x3ac1853f4cade8f432f5b3144e0c914b93f110ea3eabd85438cde39160716114",
        urls: [
          "bzz-raw://1f0ba421b481b66d43c9da4de63171a79ffadc708956893bddf10eec666a0f4a",
          "dweb:/ipfs/QmdSyzQUDrP3MXt8JjgXt1QUgraUKBUPHE2CVzJiEwfMAK"
        ],
        license: "MIT"
      },
      "src/interfaces/Query.sol": {
        keccak256: "0x987e47a4d3f076910382b4e8619f607ea15abdedd786d6095bd27126ff6f941c",
        urls: [
          "bzz-raw://8c3d57f9da85917b77e1043a179d3b516bc8c00a8880fdcb1bffca7e53169059",
          "dweb:/ipfs/QmaHxqsT1ZpS8toN88qxgbeaDSMvnhYv9J9FMjVnKrMgoP"
        ],
        license: "MIT"
      },
      "src/systems/RegisterSystem.sol": {
        keccak256: "0x5b238c1bacaa26480ae434f15754b9ad53856accb46ca41ce769713bbfc73f8f",
        urls: [
          "bzz-raw://c5449b9bf09030b85130d1fc3de196484d75459bea492175d13d01ec4d11e469",
          "dweb:/ipfs/QmWPf9LREhwNLn2Bc1MYw9vQM1RN7Dstadh8NYsF5zrPTq"
        ],
        license: "MIT"
      },
      "src/utils.sol": {
        keccak256: "0x17f7831c03bdd77f0c7d98c94931d830fbbfa1878c365f54b12841c85611e24e",
        urls: [
          "bzz-raw://6ae566ee03c5050b239277ef4184b9e5dcb332c8cc65b032f8e0d9e46408ea6d",
          "dweb:/ipfs/QmetdhxahRf7FJk1kn8KgDmizU2zYk3jjt9qo6Gwz2M5YP"
        ],
        license: "MIT"
      }
    },
    version: 1
  },
  ast: {
    absolutePath: "src/World.sol",
    id: 16951,
    exportedSymbols: {
      IUint256Component: [
        17286
      ],
      IWorld: [
        17399
      ],
      LibQuery: [
        15641
      ],
      QueryFragment: [
        17421
      ],
      RegisterSystem: [
        17658
      ],
      RegisterType: [
        17442
      ],
      Set: [
        16225
      ],
      Uint256Component: [
        17073
      ],
      World: [
        16950
      ],
      WorldQueryFragment: [
        17300
      ],
      addressToEntity: [
        22653
      ],
      componentsComponentId: [
        17083
      ],
      entityToAddress: [
        22636
      ],
      getAddressById: [
        22689
      ],
      getComponentById: [
        22738
      ],
      getIdByAddress: [
        22718
      ],
      registerSystemId: [
        17450
      ],
      systemsComponentId: [
        17091
      ]
    },
    nodeType: "SourceUnit",
    src: "32:7378:43",
    nodes: [
      {
        id: 16414,
        nodeType: "PragmaDirective",
        src: "32:24:43",
        nodes: [],
        literals: [
          "solidity",
          ">=",
          "0.8",
          ".0"
        ]
      },
      {
        id: 16416,
        nodeType: "ImportDirective",
        src: "58:32:43",
        nodes: [],
        absolutePath: "src/Set.sol",
        file: "./Set.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 16226,
        symbolAliases: [
          {
            foreign: {
              id: 16415,
              name: "Set",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 16225,
              src: "67:3:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16418,
        nodeType: "ImportDirective",
        src: "91:42:43",
        nodes: [],
        absolutePath: "src/LibQuery.sol",
        file: "./LibQuery.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 15642,
        symbolAliases: [
          {
            foreign: {
              id: 16417,
              name: "LibQuery",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 15641,
              src: "100:8:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16421,
        nodeType: "ImportDirective",
        src: "134:69:43",
        nodes: [],
        absolutePath: "src/interfaces/IWorld.sol",
        file: "./interfaces/IWorld.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 17400,
        symbolAliases: [
          {
            foreign: {
              id: 16419,
              name: "IWorld",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17399,
              src: "143:6:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16420,
              name: "WorldQueryFragment",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17300,
              src: "151:18:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16423,
        nodeType: "ImportDirective",
        src: "204:55:43",
        nodes: [],
        absolutePath: "src/interfaces/Query.sol",
        file: "./interfaces/Query.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 17422,
        symbolAliases: [
          {
            foreign: {
              id: 16422,
              name: "QueryFragment",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17421,
              src: "213:13:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16425,
        nodeType: "ImportDirective",
        src: "260:71:43",
        nodes: [],
        absolutePath: "src/interfaces/IUint256Component.sol",
        file: "./interfaces/IUint256Component.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 17287,
        symbolAliases: [
          {
            foreign: {
              id: 16424,
              name: "IUint256Component",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17286,
              src: "269:17:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16427,
        nodeType: "ImportDirective",
        src: "332:69:43",
        nodes: [],
        absolutePath: "src/components/Uint256Component.sol",
        file: "./components/Uint256Component.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 17074,
        symbolAliases: [
          {
            foreign: {
              id: 16426,
              name: "Uint256Component",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17073,
              src: "341:16:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16433,
        nodeType: "ImportDirective",
        src: "402:113:43",
        nodes: [],
        absolutePath: "src/utils.sol",
        file: "./utils.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 22877,
        symbolAliases: [
          {
            foreign: {
              id: 16428,
              name: "addressToEntity",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 22653,
              src: "411:15:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16429,
              name: "entityToAddress",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 22636,
              src: "428:15:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16430,
              name: "getIdByAddress",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 22718,
              src: "445:14:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16431,
              name: "getAddressById",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 22689,
              src: "461:14:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16432,
              name: "getComponentById",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 22738,
              src: "477:16:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16436,
        nodeType: "ImportDirective",
        src: "516:76:43",
        nodes: [],
        absolutePath: "src/constants.sol",
        file: "./constants.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 17092,
        symbolAliases: [
          {
            foreign: {
              id: 16434,
              name: "componentsComponentId",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17083,
              src: "525:21:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16435,
              name: "systemsComponentId",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17091,
              src: "548:18:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16440,
        nodeType: "ImportDirective",
        src: "593:100:43",
        nodes: [],
        absolutePath: "src/systems/RegisterSystem.sol",
        file: "./systems/RegisterSystem.sol",
        nameLocation: "-1:-1:-1",
        scope: 16951,
        sourceUnit: 17659,
        symbolAliases: [
          {
            foreign: {
              id: 16437,
              name: "RegisterSystem",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17658,
              src: "602:14:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16438,
              name: "ID",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17450,
              src: "618:2:43",
              typeDescriptions: {}
            },
            local: "registerSystemId",
            nameLocation: "-1:-1:-1"
          },
          {
            foreign: {
              id: 16439,
              name: "RegisterType",
              nodeType: "Identifier",
              overloadedDeclarations: [],
              referencedDeclaration: 17442,
              src: "642:12:43",
              typeDescriptions: {}
            },
            nameLocation: "-1:-1:-1"
          }
        ],
        unitAlias: ""
      },
      {
        id: 16950,
        nodeType: "ContractDefinition",
        src: "1597:5812:43",
        nodes: [
          {
            id: 16450,
            nodeType: "VariableDeclaration",
            src: "1626:32:43",
            nodes: [],
            constant: false,
            mutability: "mutable",
            name: "entities",
            nameLocation: "1638:8:43",
            scope: 16950,
            stateVariable: true,
            storageLocation: "default",
            typeDescriptions: {
              typeIdentifier: "t_contract$_Set_$16225",
              typeString: "contract Set"
            },
            typeName: {
              id: 16445,
              nodeType: "UserDefinedTypeName",
              pathNode: {
                id: 16444,
                name: "Set",
                nodeType: "IdentifierPath",
                referencedDeclaration: 16225,
                src: "1626:3:43"
              },
              referencedDeclaration: 16225,
              src: "1626:3:43",
              typeDescriptions: {
                typeIdentifier: "t_contract$_Set_$16225",
                typeString: "contract Set"
              }
            },
            value: {
              arguments: [],
              expression: {
                argumentTypes: [],
                id: 16448,
                isConstant: false,
                isLValue: false,
                isPure: false,
                lValueRequested: false,
                nodeType: "NewExpression",
                src: "1649:7:43",
                typeDescriptions: {
                  typeIdentifier: "t_function_creation_nonpayable$__$returns$_t_contract$_Set_$16225_$",
                  typeString: "function () returns (contract Set)"
                },
                typeName: {
                  id: 16447,
                  nodeType: "UserDefinedTypeName",
                  pathNode: {
                    id: 16446,
                    name: "Set",
                    nodeType: "IdentifierPath",
                    referencedDeclaration: 16225,
                    src: "1653:3:43"
                  },
                  referencedDeclaration: 16225,
                  src: "1653:3:43",
                  typeDescriptions: {
                    typeIdentifier: "t_contract$_Set_$16225",
                    typeString: "contract Set"
                  }
                }
              },
              id: 16449,
              isConstant: false,
              isLValue: false,
              isPure: false,
              kind: "functionCall",
              lValueRequested: false,
              names: [],
              nodeType: "FunctionCall",
              src: "1649:9:43",
              tryCall: false,
              typeDescriptions: {
                typeIdentifier: "t_contract$_Set_$16225",
                typeString: "contract Set"
              }
            },
            visibility: "private"
          },
          {
            id: 16453,
            nodeType: "VariableDeclaration",
            src: "1662:36:43",
            nodes: [],
            constant: false,
            mutability: "mutable",
            name: "_components",
            nameLocation: "1687:11:43",
            scope: 16950,
            stateVariable: true,
            storageLocation: "default",
            typeDescriptions: {
              typeIdentifier: "t_contract$_Uint256Component_$17073",
              typeString: "contract Uint256Component"
            },
            typeName: {
              id: 16452,
              nodeType: "UserDefinedTypeName",
              pathNode: {
                id: 16451,
                name: "Uint256Component",
                nodeType: "IdentifierPath",
                referencedDeclaration: 17073,
                src: "1662:16:43"
              },
              referencedDeclaration: 17073,
              src: "1662:16:43",
              typeDescriptions: {
                typeIdentifier: "t_contract$_Uint256Component_$17073",
                typeString: "contract Uint256Component"
              }
            },
            visibility: "private"
          },
          {
            id: 16456,
            nodeType: "VariableDeclaration",
            src: "1702:33:43",
            nodes: [],
            constant: false,
            mutability: "mutable",
            name: "_systems",
            nameLocation: "1727:8:43",
            scope: 16950,
            stateVariable: true,
            storageLocation: "default",
            typeDescriptions: {
              typeIdentifier: "t_contract$_Uint256Component_$17073",
              typeString: "contract Uint256Component"
            },
            typeName: {
              id: 16455,
              nodeType: "UserDefinedTypeName",
              pathNode: {
                id: 16454,
                name: "Uint256Component",
                nodeType: "IdentifierPath",
                referencedDeclaration: 17073,
                src: "1702:16:43"
              },
              referencedDeclaration: 17073,
              src: "1702:16:43",
              typeDescriptions: {
                typeIdentifier: "t_contract$_Uint256Component_$17073",
                typeString: "contract Uint256Component"
              }
            },
            visibility: "private"
          },
          {
            id: 16459,
            nodeType: "VariableDeclaration",
            src: "1739:30:43",
            nodes: [],
            constant: false,
            functionSelector: "1aa3a008",
            mutability: "mutable",
            name: "register",
            nameLocation: "1761:8:43",
            scope: 16950,
            stateVariable: true,
            storageLocation: "default",
            typeDescriptions: {
              typeIdentifier: "t_contract$_RegisterSystem_$17658",
              typeString: "contract RegisterSystem"
            },
            typeName: {
              id: 16458,
              nodeType: "UserDefinedTypeName",
              pathNode: {
                id: 16457,
                name: "RegisterSystem",
                nodeType: "IdentifierPath",
                referencedDeclaration: 17658,
                src: "1739:14:43"
              },
              referencedDeclaration: 17658,
              src: "1739:14:43",
              typeDescriptions: {
                typeIdentifier: "t_contract$_RegisterSystem_$17658",
                typeString: "contract RegisterSystem"
              }
            },
            visibility: "public"
          },
          {
            id: 16469,
            nodeType: "EventDefinition",
            src: "1774:116:43",
            nodes: [],
            anonymous: false,
            eventSelector: "6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073",
            name: "ComponentValueSet",
            nameLocation: "1780:17:43",
            parameters: {
              id: 16468,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16461,
                  indexed: true,
                  mutability: "mutable",
                  name: "componentId",
                  nameLocation: "1814:11:43",
                  nodeType: "VariableDeclaration",
                  scope: 16469,
                  src: "1798:27:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16460,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "1798:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16463,
                  indexed: true,
                  mutability: "mutable",
                  name: "component",
                  nameLocation: "1843:9:43",
                  nodeType: "VariableDeclaration",
                  scope: 16469,
                  src: "1827:25:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16462,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "1827:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16465,
                  indexed: true,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "1870:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16469,
                  src: "1854:22:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16464,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "1854:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16467,
                  indexed: false,
                  mutability: "mutable",
                  name: "data",
                  nameLocation: "1884:4:43",
                  nodeType: "VariableDeclaration",
                  scope: 16469,
                  src: "1878:10:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_bytes_memory_ptr",
                    typeString: "bytes"
                  },
                  typeName: {
                    id: 16466,
                    name: "bytes",
                    nodeType: "ElementaryTypeName",
                    src: "1878:5:43",
                    typeDescriptions: {
                      typeIdentifier: "t_bytes_storage_ptr",
                      typeString: "bytes"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "1797:92:43"
            }
          },
          {
            id: 16477,
            nodeType: "EventDefinition",
            src: "1893:108:43",
            nodes: [],
            anonymous: false,
            eventSelector: "6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b350",
            name: "ComponentValueRemoved",
            nameLocation: "1899:21:43",
            parameters: {
              id: 16476,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16471,
                  indexed: true,
                  mutability: "mutable",
                  name: "componentId",
                  nameLocation: "1937:11:43",
                  nodeType: "VariableDeclaration",
                  scope: 16477,
                  src: "1921:27:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16470,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "1921:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16473,
                  indexed: true,
                  mutability: "mutable",
                  name: "component",
                  nameLocation: "1966:9:43",
                  nodeType: "VariableDeclaration",
                  scope: 16477,
                  src: "1950:25:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16472,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "1950:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16475,
                  indexed: true,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "1993:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16477,
                  src: "1977:22:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16474,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "1977:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "1920:80:43"
            }
          },
          {
            id: 16535,
            nodeType: "FunctionDefinition",
            src: "2005:327:43",
            nodes: [],
            body: {
              id: 16534,
              nodeType: "Block",
              src: "2019:313:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    id: 16490,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      id: 16480,
                      name: "_components",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16453,
                      src: "2025:11:43",
                      typeDescriptions: {
                        typeIdentifier: "t_contract$_Uint256Component_$17073",
                        typeString: "contract Uint256Component"
                      }
                    },
                    nodeType: "Assignment",
                    operator: "=",
                    rightHandSide: {
                      arguments: [
                        {
                          arguments: [
                            {
                              hexValue: "30",
                              id: 16486,
                              isConstant: false,
                              isLValue: false,
                              isPure: true,
                              kind: "number",
                              lValueRequested: false,
                              nodeType: "Literal",
                              src: "2068:1:43",
                              typeDescriptions: {
                                typeIdentifier: "t_rational_0_by_1",
                                typeString: "int_const 0"
                              },
                              value: "0"
                            }
                          ],
                          expression: {
                            argumentTypes: [
                              {
                                typeIdentifier: "t_rational_0_by_1",
                                typeString: "int_const 0"
                              }
                            ],
                            id: 16485,
                            isConstant: false,
                            isLValue: false,
                            isPure: true,
                            lValueRequested: false,
                            nodeType: "ElementaryTypeNameExpression",
                            src: "2060:7:43",
                            typeDescriptions: {
                              typeIdentifier: "t_type$_t_address_$",
                              typeString: "type(address)"
                            },
                            typeName: {
                              id: 16484,
                              name: "address",
                              nodeType: "ElementaryTypeName",
                              src: "2060:7:43",
                              typeDescriptions: {}
                            }
                          },
                          id: 16487,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          kind: "typeConversion",
                          lValueRequested: false,
                          names: [],
                          nodeType: "FunctionCall",
                          src: "2060:10:43",
                          tryCall: false,
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        },
                        {
                          id: 16488,
                          name: "componentsComponentId",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 17083,
                          src: "2072:21:43",
                          typeDescriptions: {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        }
                      ],
                      expression: {
                        argumentTypes: [
                          {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          },
                          {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        ],
                        id: 16483,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: "NewExpression",
                        src: "2039:20:43",
                        typeDescriptions: {
                          typeIdentifier: "t_function_creation_nonpayable$_t_address_$_t_uint256_$returns$_t_contract$_Uint256Component_$17073_$",
                          typeString: "function (address,uint256) returns (contract Uint256Component)"
                        },
                        typeName: {
                          id: 16482,
                          nodeType: "UserDefinedTypeName",
                          pathNode: {
                            id: 16481,
                            name: "Uint256Component",
                            nodeType: "IdentifierPath",
                            referencedDeclaration: 17073,
                            src: "2043:16:43"
                          },
                          referencedDeclaration: 17073,
                          src: "2043:16:43",
                          typeDescriptions: {
                            typeIdentifier: "t_contract$_Uint256Component_$17073",
                            typeString: "contract Uint256Component"
                          }
                        }
                      },
                      id: 16489,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      kind: "functionCall",
                      lValueRequested: false,
                      names: [],
                      nodeType: "FunctionCall",
                      src: "2039:55:43",
                      tryCall: false,
                      typeDescriptions: {
                        typeIdentifier: "t_contract$_Uint256Component_$17073",
                        typeString: "contract Uint256Component"
                      }
                    },
                    src: "2025:69:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_Uint256Component_$17073",
                      typeString: "contract Uint256Component"
                    }
                  },
                  id: 16491,
                  nodeType: "ExpressionStatement",
                  src: "2025:69:43"
                },
                {
                  expression: {
                    id: 16502,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      id: 16492,
                      name: "_systems",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16456,
                      src: "2100:8:43",
                      typeDescriptions: {
                        typeIdentifier: "t_contract$_Uint256Component_$17073",
                        typeString: "contract Uint256Component"
                      }
                    },
                    nodeType: "Assignment",
                    operator: "=",
                    rightHandSide: {
                      arguments: [
                        {
                          arguments: [
                            {
                              hexValue: "30",
                              id: 16498,
                              isConstant: false,
                              isLValue: false,
                              isPure: true,
                              kind: "number",
                              lValueRequested: false,
                              nodeType: "Literal",
                              src: "2140:1:43",
                              typeDescriptions: {
                                typeIdentifier: "t_rational_0_by_1",
                                typeString: "int_const 0"
                              },
                              value: "0"
                            }
                          ],
                          expression: {
                            argumentTypes: [
                              {
                                typeIdentifier: "t_rational_0_by_1",
                                typeString: "int_const 0"
                              }
                            ],
                            id: 16497,
                            isConstant: false,
                            isLValue: false,
                            isPure: true,
                            lValueRequested: false,
                            nodeType: "ElementaryTypeNameExpression",
                            src: "2132:7:43",
                            typeDescriptions: {
                              typeIdentifier: "t_type$_t_address_$",
                              typeString: "type(address)"
                            },
                            typeName: {
                              id: 16496,
                              name: "address",
                              nodeType: "ElementaryTypeName",
                              src: "2132:7:43",
                              typeDescriptions: {}
                            }
                          },
                          id: 16499,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          kind: "typeConversion",
                          lValueRequested: false,
                          names: [],
                          nodeType: "FunctionCall",
                          src: "2132:10:43",
                          tryCall: false,
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        },
                        {
                          id: 16500,
                          name: "systemsComponentId",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 17091,
                          src: "2144:18:43",
                          typeDescriptions: {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        }
                      ],
                      expression: {
                        argumentTypes: [
                          {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          },
                          {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        ],
                        id: 16495,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: "NewExpression",
                        src: "2111:20:43",
                        typeDescriptions: {
                          typeIdentifier: "t_function_creation_nonpayable$_t_address_$_t_uint256_$returns$_t_contract$_Uint256Component_$17073_$",
                          typeString: "function (address,uint256) returns (contract Uint256Component)"
                        },
                        typeName: {
                          id: 16494,
                          nodeType: "UserDefinedTypeName",
                          pathNode: {
                            id: 16493,
                            name: "Uint256Component",
                            nodeType: "IdentifierPath",
                            referencedDeclaration: 17073,
                            src: "2115:16:43"
                          },
                          referencedDeclaration: 17073,
                          src: "2115:16:43",
                          typeDescriptions: {
                            typeIdentifier: "t_contract$_Uint256Component_$17073",
                            typeString: "contract Uint256Component"
                          }
                        }
                      },
                      id: 16501,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      kind: "functionCall",
                      lValueRequested: false,
                      names: [],
                      nodeType: "FunctionCall",
                      src: "2111:52:43",
                      tryCall: false,
                      typeDescriptions: {
                        typeIdentifier: "t_contract$_Uint256Component_$17073",
                        typeString: "contract Uint256Component"
                      }
                    },
                    src: "2100:63:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_Uint256Component_$17073",
                      typeString: "contract Uint256Component"
                    }
                  },
                  id: 16503,
                  nodeType: "ExpressionStatement",
                  src: "2100:63:43"
                },
                {
                  expression: {
                    id: 16514,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      id: 16504,
                      name: "register",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16459,
                      src: "2169:8:43",
                      typeDescriptions: {
                        typeIdentifier: "t_contract$_RegisterSystem_$17658",
                        typeString: "contract RegisterSystem"
                      }
                    },
                    nodeType: "Assignment",
                    operator: "=",
                    rightHandSide: {
                      arguments: [
                        {
                          id: 16508,
                          name: "this",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: -28,
                          src: "2199:4:43",
                          typeDescriptions: {
                            typeIdentifier: "t_contract$_World_$16950",
                            typeString: "contract World"
                          }
                        },
                        {
                          arguments: [
                            {
                              id: 16511,
                              name: "_components",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 16453,
                              src: "2213:11:43",
                              typeDescriptions: {
                                typeIdentifier: "t_contract$_Uint256Component_$17073",
                                typeString: "contract Uint256Component"
                              }
                            }
                          ],
                          expression: {
                            argumentTypes: [
                              {
                                typeIdentifier: "t_contract$_Uint256Component_$17073",
                                typeString: "contract Uint256Component"
                              }
                            ],
                            id: 16510,
                            isConstant: false,
                            isLValue: false,
                            isPure: true,
                            lValueRequested: false,
                            nodeType: "ElementaryTypeNameExpression",
                            src: "2205:7:43",
                            typeDescriptions: {
                              typeIdentifier: "t_type$_t_address_$",
                              typeString: "type(address)"
                            },
                            typeName: {
                              id: 16509,
                              name: "address",
                              nodeType: "ElementaryTypeName",
                              src: "2205:7:43",
                              typeDescriptions: {}
                            }
                          },
                          id: 16512,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          kind: "typeConversion",
                          lValueRequested: false,
                          names: [],
                          nodeType: "FunctionCall",
                          src: "2205:20:43",
                          tryCall: false,
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        }
                      ],
                      expression: {
                        argumentTypes: [
                          {
                            typeIdentifier: "t_contract$_World_$16950",
                            typeString: "contract World"
                          },
                          {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        ],
                        id: 16507,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: "NewExpression",
                        src: "2180:18:43",
                        typeDescriptions: {
                          typeIdentifier: "t_function_creation_nonpayable$_t_contract$_IWorld_$17399_$_t_address_$returns$_t_contract$_RegisterSystem_$17658_$",
                          typeString: "function (contract IWorld,address) returns (contract RegisterSystem)"
                        },
                        typeName: {
                          id: 16506,
                          nodeType: "UserDefinedTypeName",
                          pathNode: {
                            id: 16505,
                            name: "RegisterSystem",
                            nodeType: "IdentifierPath",
                            referencedDeclaration: 17658,
                            src: "2184:14:43"
                          },
                          referencedDeclaration: 17658,
                          src: "2184:14:43",
                          typeDescriptions: {
                            typeIdentifier: "t_contract$_RegisterSystem_$17658",
                            typeString: "contract RegisterSystem"
                          }
                        }
                      },
                      id: 16513,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      kind: "functionCall",
                      lValueRequested: false,
                      names: [],
                      nodeType: "FunctionCall",
                      src: "2180:46:43",
                      tryCall: false,
                      typeDescriptions: {
                        typeIdentifier: "t_contract$_RegisterSystem_$17658",
                        typeString: "contract RegisterSystem"
                      }
                    },
                    src: "2169:57:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_RegisterSystem_$17658",
                      typeString: "contract RegisterSystem"
                    }
                  },
                  id: 16515,
                  nodeType: "ExpressionStatement",
                  src: "2169:57:43"
                },
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16521,
                            name: "register",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16459,
                            src: "2265:8:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_RegisterSystem_$17658",
                              typeString: "contract RegisterSystem"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_RegisterSystem_$17658",
                              typeString: "contract RegisterSystem"
                            }
                          ],
                          id: 16520,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          nodeType: "ElementaryTypeNameExpression",
                          src: "2257:7:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_address_$",
                            typeString: "type(address)"
                          },
                          typeName: {
                            id: 16519,
                            name: "address",
                            nodeType: "ElementaryTypeName",
                            src: "2257:7:43",
                            typeDescriptions: {}
                          }
                        },
                        id: 16522,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "2257:17:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      ],
                      expression: {
                        id: 16516,
                        name: "_systems",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16456,
                        src: "2232:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      id: 16518,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "authorizeWriter",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 15963,
                      src: "2232:24:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_address_$returns$__$",
                        typeString: "function (address) external"
                      }
                    },
                    id: 16523,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "2232:43:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16524,
                  nodeType: "ExpressionStatement",
                  src: "2232:43:43"
                },
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16530,
                            name: "register",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16459,
                            src: "2317:8:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_RegisterSystem_$17658",
                              typeString: "contract RegisterSystem"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_RegisterSystem_$17658",
                              typeString: "contract RegisterSystem"
                            }
                          ],
                          id: 16529,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          nodeType: "ElementaryTypeNameExpression",
                          src: "2309:7:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_address_$",
                            typeString: "type(address)"
                          },
                          typeName: {
                            id: 16528,
                            name: "address",
                            nodeType: "ElementaryTypeName",
                            src: "2309:7:43",
                            typeDescriptions: {}
                          }
                        },
                        id: 16531,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "2309:17:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      ],
                      expression: {
                        id: 16525,
                        name: "_components",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16453,
                        src: "2281:11:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      id: 16527,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "authorizeWriter",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 15963,
                      src: "2281:27:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_address_$returns$__$",
                        typeString: "function (address) external"
                      }
                    },
                    id: 16532,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "2281:46:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16533,
                  nodeType: "ExpressionStatement",
                  src: "2281:46:43"
                }
              ]
            },
            implemented: true,
            kind: "constructor",
            modifiers: [],
            name: "",
            nameLocation: "-1:-1:-1",
            parameters: {
              id: 16478,
              nodeType: "ParameterList",
              parameters: [],
              src: "2016:2:43"
            },
            returnParameters: {
              id: 16479,
              nodeType: "ParameterList",
              parameters: [],
              src: "2019:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16575,
            nodeType: "FunctionDefinition",
            src: "2445:221:43",
            nodes: [],
            body: {
              id: 16574,
              nodeType: "Block",
              src: "2468:198:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16544,
                            name: "this",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -28,
                            src: "2508:4:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_World_$16950",
                              typeString: "contract World"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_World_$16950",
                              typeString: "contract World"
                            }
                          ],
                          id: 16543,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          nodeType: "ElementaryTypeNameExpression",
                          src: "2500:7:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_address_$",
                            typeString: "type(address)"
                          },
                          typeName: {
                            id: 16542,
                            name: "address",
                            nodeType: "ElementaryTypeName",
                            src: "2500:7:43",
                            typeDescriptions: {}
                          }
                        },
                        id: 16545,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "2500:13:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      ],
                      expression: {
                        id: 16539,
                        name: "_components",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16453,
                        src: "2474:11:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      id: 16541,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "registerWorld",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 13439,
                      src: "2474:25:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_address_$returns$__$",
                        typeString: "function (address) external"
                      }
                    },
                    id: 16546,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "2474:40:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16547,
                  nodeType: "ExpressionStatement",
                  src: "2474:40:43"
                },
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16553,
                            name: "this",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -28,
                            src: "2551:4:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_World_$16950",
                              typeString: "contract World"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_World_$16950",
                              typeString: "contract World"
                            }
                          ],
                          id: 16552,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          nodeType: "ElementaryTypeNameExpression",
                          src: "2543:7:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_address_$",
                            typeString: "type(address)"
                          },
                          typeName: {
                            id: 16551,
                            name: "address",
                            nodeType: "ElementaryTypeName",
                            src: "2543:7:43",
                            typeDescriptions: {}
                          }
                        },
                        id: 16554,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "2543:13:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      ],
                      expression: {
                        id: 16548,
                        name: "_systems",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16456,
                        src: "2520:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      id: 16550,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "registerWorld",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 13439,
                      src: "2520:22:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_address_$returns$__$",
                        typeString: "function (address) external"
                      }
                    },
                    id: 16555,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "2520:37:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16556,
                  nodeType: "ExpressionStatement",
                  src: "2520:37:43"
                },
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            expression: {
                              id: 16562,
                              name: "msg",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: -15,
                              src: "2591:3:43",
                              typeDescriptions: {
                                typeIdentifier: "t_magic_message",
                                typeString: "msg"
                              }
                            },
                            id: 16563,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            lValueRequested: false,
                            memberName: "sender",
                            nodeType: "MemberAccess",
                            src: "2591:10:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          },
                          {
                            expression: {
                              id: 16564,
                              name: "RegisterType",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 17442,
                              src: "2603:12:43",
                              typeDescriptions: {
                                typeIdentifier: "t_type$_t_enum$_RegisterType_$17442_$",
                                typeString: "type(enum RegisterType)"
                              }
                            },
                            id: 16565,
                            isConstant: false,
                            isLValue: false,
                            isPure: true,
                            lValueRequested: false,
                            memberName: "System",
                            nodeType: "MemberAccess",
                            referencedDeclaration: 17441,
                            src: "2603:19:43",
                            typeDescriptions: {
                              typeIdentifier: "t_enum$_RegisterType_$17442",
                              typeString: "enum RegisterType"
                            }
                          },
                          {
                            arguments: [
                              {
                                id: 16568,
                                name: "register",
                                nodeType: "Identifier",
                                overloadedDeclarations: [],
                                referencedDeclaration: 16459,
                                src: "2632:8:43",
                                typeDescriptions: {
                                  typeIdentifier: "t_contract$_RegisterSystem_$17658",
                                  typeString: "contract RegisterSystem"
                                }
                              }
                            ],
                            expression: {
                              argumentTypes: [
                                {
                                  typeIdentifier: "t_contract$_RegisterSystem_$17658",
                                  typeString: "contract RegisterSystem"
                                }
                              ],
                              id: 16567,
                              isConstant: false,
                              isLValue: false,
                              isPure: true,
                              lValueRequested: false,
                              nodeType: "ElementaryTypeNameExpression",
                              src: "2624:7:43",
                              typeDescriptions: {
                                typeIdentifier: "t_type$_t_address_$",
                                typeString: "type(address)"
                              },
                              typeName: {
                                id: 16566,
                                name: "address",
                                nodeType: "ElementaryTypeName",
                                src: "2624:7:43",
                                typeDescriptions: {}
                              }
                            },
                            id: 16569,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            kind: "typeConversion",
                            lValueRequested: false,
                            names: [],
                            nodeType: "FunctionCall",
                            src: "2624:17:43",
                            tryCall: false,
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          },
                          {
                            id: 16570,
                            name: "registerSystemId",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 17450,
                            src: "2643:16:43",
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            },
                            {
                              typeIdentifier: "t_enum$_RegisterType_$17442",
                              typeString: "enum RegisterType"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            },
                            {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          ],
                          expression: {
                            id: 16560,
                            name: "abi",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -1,
                            src: "2580:3:43",
                            typeDescriptions: {
                              typeIdentifier: "t_magic_abi",
                              typeString: "abi"
                            }
                          },
                          id: 16561,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          memberName: "encode",
                          nodeType: "MemberAccess",
                          src: "2580:10:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_abiencode_pure$__$returns$_t_bytes_memory_ptr_$",
                            typeString: "function () pure returns (bytes memory)"
                          }
                        },
                        id: 16571,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "2580:80:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_bytes_memory_ptr",
                          typeString: "bytes memory"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_bytes_memory_ptr",
                          typeString: "bytes memory"
                        }
                      ],
                      expression: {
                        id: 16557,
                        name: "register",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16459,
                        src: "2563:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_RegisterSystem_$17658",
                          typeString: "contract RegisterSystem"
                        }
                      },
                      id: 16559,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "execute",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 17657,
                      src: "2563:16:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_bytes_memory_ptr_$returns$_t_bytes_memory_ptr_$",
                        typeString: "function (bytes memory) external returns (bytes memory)"
                      }
                    },
                    id: 16572,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "2563:98:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_bytes_memory_ptr",
                      typeString: "bytes memory"
                    }
                  },
                  id: 16573,
                  nodeType: "ExpressionStatement",
                  src: "2563:98:43"
                }
              ]
            },
            baseFunctions: [
              17398
            ],
            documentation: {
              id: 16536,
              nodeType: "StructuredDocumentation",
              src: "2336:106:43",
              text: " Initialize the World.\n Separated from the constructor to prevent circular dependencies."
            },
            functionSelector: "e1c7392a",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "init",
            nameLocation: "2454:4:43",
            parameters: {
              id: 16537,
              nodeType: "ParameterList",
              parameters: [],
              src: "2458:2:43"
            },
            returnParameters: {
              id: 16538,
              nodeType: "ParameterList",
              parameters: [],
              src: "2468:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16585,
            nodeType: "FunctionDefinition",
            src: "2785:91:43",
            nodes: [],
            body: {
              id: 16584,
              nodeType: "Block",
              src: "2847:29:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    id: 16582,
                    name: "_components",
                    nodeType: "Identifier",
                    overloadedDeclarations: [],
                    referencedDeclaration: 16453,
                    src: "2860:11:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_Uint256Component_$17073",
                      typeString: "contract Uint256Component"
                    }
                  },
                  functionReturnParameters: 16581,
                  id: 16583,
                  nodeType: "Return",
                  src: "2853:18:43"
                }
              ]
            },
            baseFunctions: [
              17306
            ],
            documentation: {
              id: 16576,
              nodeType: "StructuredDocumentation",
              src: "2670:112:43",
              text: " Get the component registry Uint256Component\n (mapping from component address to component id)"
            },
            functionSelector: "ba62fbe4",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "components",
            nameLocation: "2794:10:43",
            parameters: {
              id: 16577,
              nodeType: "ParameterList",
              parameters: [],
              src: "2804:2:43"
            },
            returnParameters: {
              id: 16581,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16580,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16585,
                  src: "2828:17:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_contract$_IUint256Component_$17286",
                    typeString: "contract IUint256Component"
                  },
                  typeName: {
                    id: 16579,
                    nodeType: "UserDefinedTypeName",
                    pathNode: {
                      id: 16578,
                      name: "IUint256Component",
                      nodeType: "IdentifierPath",
                      referencedDeclaration: 17286,
                      src: "2828:17:43"
                    },
                    referencedDeclaration: 17286,
                    src: "2828:17:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_IUint256Component_$17286",
                      typeString: "contract IUint256Component"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "2827:19:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16595,
            nodeType: "FunctionDefinition",
            src: "2986:85:43",
            nodes: [],
            body: {
              id: 16594,
              nodeType: "Block",
              src: "3045:26:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    id: 16592,
                    name: "_systems",
                    nodeType: "Identifier",
                    overloadedDeclarations: [],
                    referencedDeclaration: 16456,
                    src: "3058:8:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_Uint256Component_$17073",
                      typeString: "contract Uint256Component"
                    }
                  },
                  functionReturnParameters: 16591,
                  id: 16593,
                  nodeType: "Return",
                  src: "3051:15:43"
                }
              ]
            },
            baseFunctions: [
              17312
            ],
            documentation: {
              id: 16586,
              nodeType: "StructuredDocumentation",
              src: "2880:103:43",
              text: " Get the system registry Uint256Component\n (mapping from system address to system id)"
            },
            functionSelector: "0d59332e",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "systems",
            nameLocation: "2995:7:43",
            parameters: {
              id: 16587,
              nodeType: "ParameterList",
              parameters: [],
              src: "3002:2:43"
            },
            returnParameters: {
              id: 16591,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16590,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16595,
                  src: "3026:17:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_contract$_IUint256Component_$17286",
                    typeString: "contract IUint256Component"
                  },
                  typeName: {
                    id: 16589,
                    nodeType: "UserDefinedTypeName",
                    pathNode: {
                      id: 16588,
                      name: "IUint256Component",
                      nodeType: "IdentifierPath",
                      referencedDeclaration: 17286,
                      src: "3026:17:43"
                    },
                    referencedDeclaration: 17286,
                    src: "3026:17:43",
                    typeDescriptions: {
                      typeIdentifier: "t_contract$_IUint256Component_$17286",
                      typeString: "contract IUint256Component"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "3025:19:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16618,
            nodeType: "FunctionDefinition",
            src: "3156:163:43",
            nodes: [],
            body: {
              id: 16617,
              nodeType: "Block",
              src: "3225:94:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            expression: {
                              id: 16608,
                              name: "msg",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: -15,
                              src: "3259:3:43",
                              typeDescriptions: {
                                typeIdentifier: "t_magic_message",
                                typeString: "msg"
                              }
                            },
                            id: 16609,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            lValueRequested: false,
                            memberName: "sender",
                            nodeType: "MemberAccess",
                            src: "3259:10:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          },
                          {
                            expression: {
                              id: 16610,
                              name: "RegisterType",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 17442,
                              src: "3271:12:43",
                              typeDescriptions: {
                                typeIdentifier: "t_type$_t_enum$_RegisterType_$17442_$",
                                typeString: "type(enum RegisterType)"
                              }
                            },
                            id: 16611,
                            isConstant: false,
                            isLValue: false,
                            isPure: true,
                            lValueRequested: false,
                            memberName: "Component",
                            nodeType: "MemberAccess",
                            referencedDeclaration: 17440,
                            src: "3271:22:43",
                            typeDescriptions: {
                              typeIdentifier: "t_enum$_RegisterType_$17442",
                              typeString: "enum RegisterType"
                            }
                          },
                          {
                            id: 16612,
                            name: "componentAddr",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16598,
                            src: "3295:13:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          },
                          {
                            id: 16613,
                            name: "id",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16600,
                            src: "3310:2:43",
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            },
                            {
                              typeIdentifier: "t_enum$_RegisterType_$17442",
                              typeString: "enum RegisterType"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            },
                            {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          ],
                          expression: {
                            id: 16606,
                            name: "abi",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -1,
                            src: "3248:3:43",
                            typeDescriptions: {
                              typeIdentifier: "t_magic_abi",
                              typeString: "abi"
                            }
                          },
                          id: 16607,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          memberName: "encode",
                          nodeType: "MemberAccess",
                          src: "3248:10:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_abiencode_pure$__$returns$_t_bytes_memory_ptr_$",
                            typeString: "function () pure returns (bytes memory)"
                          }
                        },
                        id: 16614,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "3248:65:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_bytes_memory_ptr",
                          typeString: "bytes memory"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_bytes_memory_ptr",
                          typeString: "bytes memory"
                        }
                      ],
                      expression: {
                        id: 16603,
                        name: "register",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16459,
                        src: "3231:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_RegisterSystem_$17658",
                          typeString: "contract RegisterSystem"
                        }
                      },
                      id: 16605,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "execute",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 17657,
                      src: "3231:16:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_bytes_memory_ptr_$returns$_t_bytes_memory_ptr_$",
                        typeString: "function (bytes memory) external returns (bytes memory)"
                      }
                    },
                    id: 16615,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "3231:83:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_bytes_memory_ptr",
                      typeString: "bytes memory"
                    }
                  },
                  id: 16616,
                  nodeType: "ExpressionStatement",
                  src: "3231:83:43"
                }
              ]
            },
            baseFunctions: [
              17319
            ],
            documentation: {
              id: 16596,
              nodeType: "StructuredDocumentation",
              src: "3075:78:43",
              text: " Register a new component in this World.\n ID must be unique."
            },
            functionSelector: "f3034770",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "registerComponent",
            nameLocation: "3165:17:43",
            parameters: {
              id: 16601,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16598,
                  mutability: "mutable",
                  name: "componentAddr",
                  nameLocation: "3191:13:43",
                  nodeType: "VariableDeclaration",
                  scope: 16618,
                  src: "3183:21:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16597,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "3183:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16600,
                  mutability: "mutable",
                  name: "id",
                  nameLocation: "3214:2:43",
                  nodeType: "VariableDeclaration",
                  scope: 16618,
                  src: "3206:10:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16599,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "3206:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "3182:35:43"
            },
            returnParameters: {
              id: 16602,
              nodeType: "ParameterList",
              parameters: [],
              src: "3225:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16641,
            nodeType: "FunctionDefinition",
            src: "3401:151:43",
            nodes: [],
            body: {
              id: 16640,
              nodeType: "Block",
              src: "3464:88:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            expression: {
                              id: 16631,
                              name: "msg",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: -15,
                              src: "3498:3:43",
                              typeDescriptions: {
                                typeIdentifier: "t_magic_message",
                                typeString: "msg"
                              }
                            },
                            id: 16632,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            lValueRequested: false,
                            memberName: "sender",
                            nodeType: "MemberAccess",
                            src: "3498:10:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          },
                          {
                            expression: {
                              id: 16633,
                              name: "RegisterType",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 17442,
                              src: "3510:12:43",
                              typeDescriptions: {
                                typeIdentifier: "t_type$_t_enum$_RegisterType_$17442_$",
                                typeString: "type(enum RegisterType)"
                              }
                            },
                            id: 16634,
                            isConstant: false,
                            isLValue: false,
                            isPure: true,
                            lValueRequested: false,
                            memberName: "System",
                            nodeType: "MemberAccess",
                            referencedDeclaration: 17441,
                            src: "3510:19:43",
                            typeDescriptions: {
                              typeIdentifier: "t_enum$_RegisterType_$17442",
                              typeString: "enum RegisterType"
                            }
                          },
                          {
                            id: 16635,
                            name: "systemAddr",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16621,
                            src: "3531:10:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          },
                          {
                            id: 16636,
                            name: "id",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16623,
                            src: "3543:2:43",
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            },
                            {
                              typeIdentifier: "t_enum$_RegisterType_$17442",
                              typeString: "enum RegisterType"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            },
                            {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          ],
                          expression: {
                            id: 16629,
                            name: "abi",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -1,
                            src: "3487:3:43",
                            typeDescriptions: {
                              typeIdentifier: "t_magic_abi",
                              typeString: "abi"
                            }
                          },
                          id: 16630,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          memberName: "encode",
                          nodeType: "MemberAccess",
                          src: "3487:10:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_abiencode_pure$__$returns$_t_bytes_memory_ptr_$",
                            typeString: "function () pure returns (bytes memory)"
                          }
                        },
                        id: 16637,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "3487:59:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_bytes_memory_ptr",
                          typeString: "bytes memory"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_bytes_memory_ptr",
                          typeString: "bytes memory"
                        }
                      ],
                      expression: {
                        id: 16626,
                        name: "register",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16459,
                        src: "3470:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_RegisterSystem_$17658",
                          typeString: "contract RegisterSystem"
                        }
                      },
                      id: 16628,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "execute",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 17657,
                      src: "3470:16:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_bytes_memory_ptr_$returns$_t_bytes_memory_ptr_$",
                        typeString: "function (bytes memory) external returns (bytes memory)"
                      }
                    },
                    id: 16638,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "3470:77:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_bytes_memory_ptr",
                      typeString: "bytes memory"
                    }
                  },
                  id: 16639,
                  nodeType: "ExpressionStatement",
                  src: "3470:77:43"
                }
              ]
            },
            baseFunctions: [
              17340
            ],
            documentation: {
              id: 16619,
              nodeType: "StructuredDocumentation",
              src: "3323:75:43",
              text: " Register a new system in this World.\n ID must be unique."
            },
            functionSelector: "1ee444b7",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "registerSystem",
            nameLocation: "3410:14:43",
            parameters: {
              id: 16624,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16621,
                  mutability: "mutable",
                  name: "systemAddr",
                  nameLocation: "3433:10:43",
                  nodeType: "VariableDeclaration",
                  scope: 16641,
                  src: "3425:18:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16620,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "3425:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16623,
                  mutability: "mutable",
                  name: "id",
                  nameLocation: "3453:2:43",
                  nodeType: "VariableDeclaration",
                  scope: 16641,
                  src: "3445:10:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16622,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "3445:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "3424:32:43"
            },
            returnParameters: {
              id: 16625,
              nodeType: "ParameterList",
              parameters: [],
              src: "3464:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16658,
            nodeType: "ModifierDefinition",
            src: "3631:153:43",
            nodes: [],
            body: {
              id: 16657,
              nodeType: "Block",
              src: "3686:98:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        arguments: [
                          {
                            arguments: [
                              {
                                id: 16650,
                                name: "component",
                                nodeType: "Identifier",
                                overloadedDeclarations: [],
                                referencedDeclaration: 16644,
                                src: "3732:9:43",
                                typeDescriptions: {
                                  typeIdentifier: "t_address",
                                  typeString: "address"
                                }
                              }
                            ],
                            expression: {
                              argumentTypes: [
                                {
                                  typeIdentifier: "t_address",
                                  typeString: "address"
                                }
                              ],
                              id: 16649,
                              name: "addressToEntity",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 22653,
                              src: "3716:15:43",
                              typeDescriptions: {
                                typeIdentifier: "t_function_internal_pure$_t_address_$returns$_t_uint256_$",
                                typeString: "function (address) pure returns (uint256)"
                              }
                            },
                            id: 16651,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            kind: "functionCall",
                            lValueRequested: false,
                            names: [],
                            nodeType: "FunctionCall",
                            src: "3716:26:43",
                            tryCall: false,
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          ],
                          expression: {
                            id: 16647,
                            name: "_components",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16453,
                            src: "3700:11:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            }
                          },
                          id: 16648,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          memberName: "has",
                          nodeType: "MemberAccess",
                          referencedDeclaration: 13652,
                          src: "3700:15:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_external_view$_t_uint256_$returns$_t_bool_$",
                            typeString: "function (uint256) view external returns (bool)"
                          }
                        },
                        id: 16652,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "3700:43:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_bool",
                          typeString: "bool"
                        }
                      },
                      {
                        hexValue: "636f6d706f6e656e74206e6f742072656769737465726564",
                        id: 16653,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: "string",
                        lValueRequested: false,
                        nodeType: "Literal",
                        src: "3745:26:43",
                        typeDescriptions: {
                          typeIdentifier: "t_stringliteral_5727e039034a4314d3425cca06c2299c4d2b694e041c8512dc0e0f0d86950a39",
                          typeString: 'literal_string "component not registered"'
                        },
                        value: "component not registered"
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_bool",
                          typeString: "bool"
                        },
                        {
                          typeIdentifier: "t_stringliteral_5727e039034a4314d3425cca06c2299c4d2b694e041c8512dc0e0f0d86950a39",
                          typeString: 'literal_string "component not registered"'
                        }
                      ],
                      id: 16646,
                      name: "require",
                      nodeType: "Identifier",
                      overloadedDeclarations: [
                        -18,
                        -18
                      ],
                      referencedDeclaration: -18,
                      src: "3692:7:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                        typeString: "function (bool,string memory) pure"
                      }
                    },
                    id: 16654,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "3692:80:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16655,
                  nodeType: "ExpressionStatement",
                  src: "3692:80:43"
                },
                {
                  id: 16656,
                  nodeType: "PlaceholderStatement",
                  src: "3778:1:43"
                }
              ]
            },
            documentation: {
              id: 16642,
              nodeType: "StructuredDocumentation",
              src: "3556:72:43",
              text: " Reverts if the component is not registered in this World."
            },
            name: "requireComponentRegistered",
            nameLocation: "3640:26:43",
            parameters: {
              id: 16645,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16644,
                  mutability: "mutable",
                  name: "component",
                  nameLocation: "3675:9:43",
                  nodeType: "VariableDeclaration",
                  scope: 16658,
                  src: "3667:17:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16643,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "3667:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "3666:19:43"
            },
            virtual: false,
            visibility: "internal"
          },
          {
            id: 16696,
            nodeType: "FunctionDefinition",
            src: "3989:319:43",
            nodes: [],
            body: {
              id: 16695,
              nodeType: "Block",
              src: "4141:167:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        commonType: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        },
                        id: 16675,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        leftExpression: {
                          expression: {
                            id: 16672,
                            name: "msg",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -15,
                            src: "4155:3:43",
                            typeDescriptions: {
                              typeIdentifier: "t_magic_message",
                              typeString: "msg"
                            }
                          },
                          id: 16673,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          memberName: "sender",
                          nodeType: "MemberAccess",
                          src: "4155:10:43",
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        },
                        nodeType: "BinaryOperation",
                        operator: "==",
                        rightExpression: {
                          id: 16674,
                          name: "component",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16661,
                          src: "4169:9:43",
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        },
                        src: "4155:23:43",
                        typeDescriptions: {
                          typeIdentifier: "t_bool",
                          typeString: "bool"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_bool",
                          typeString: "bool"
                        }
                      ],
                      id: 16671,
                      name: "require",
                      nodeType: "Identifier",
                      overloadedDeclarations: [
                        -18,
                        -18
                      ],
                      referencedDeclaration: -18,
                      src: "4147:7:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_require_pure$_t_bool_$returns$__$",
                        typeString: "function (bool) pure"
                      }
                    },
                    id: 16676,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "4147:32:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16677,
                  nodeType: "ExpressionStatement",
                  src: "4147:32:43"
                },
                {
                  expression: {
                    arguments: [
                      {
                        id: 16682,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16663,
                        src: "4203:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      expression: {
                        arguments: [
                          {
                            id: 16679,
                            name: "entities",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16450,
                            src: "4189:8:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          ],
                          id: 16678,
                          name: "Set",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16225,
                          src: "4185:3:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_contract$_Set_$16225_$",
                            typeString: "type(contract Set)"
                          }
                        },
                        id: 16680,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "4185:13:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Set_$16225",
                          typeString: "contract Set"
                        }
                      },
                      id: 16681,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "add",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 16099,
                      src: "4185:17:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_uint256_$returns$__$",
                        typeString: "function (uint256) external"
                      }
                    },
                    id: 16683,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "4185:25:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16684,
                  nodeType: "ExpressionStatement",
                  src: "4185:25:43"
                },
                {
                  eventCall: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16687,
                            name: "_components",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16453,
                            src: "4254:11:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            }
                          },
                          {
                            id: 16688,
                            name: "component",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16661,
                            src: "4267:9:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          ],
                          id: 16686,
                          name: "getIdByAddress",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 22718,
                          src: "4239:14:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_address_$returns$_t_uint256_$",
                            typeString: "function (contract IUint256Component,address) view returns (uint256)"
                          }
                        },
                        id: 16689,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "4239:38:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      {
                        id: 16690,
                        name: "component",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16661,
                        src: "4279:9:43",
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      },
                      {
                        id: 16691,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16663,
                        src: "4290:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      {
                        id: 16692,
                        name: "data",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16665,
                        src: "4298:4:43",
                        typeDescriptions: {
                          typeIdentifier: "t_bytes_calldata_ptr",
                          typeString: "bytes calldata"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        },
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        {
                          typeIdentifier: "t_bytes_calldata_ptr",
                          typeString: "bytes calldata"
                        }
                      ],
                      id: 16685,
                      name: "ComponentValueSet",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16469,
                      src: "4221:17:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_event_nonpayable$_t_uint256_$_t_address_$_t_uint256_$_t_bytes_memory_ptr_$returns$__$",
                        typeString: "function (uint256,address,uint256,bytes memory)"
                      }
                    },
                    id: 16693,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "4221:82:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16694,
                  nodeType: "EmitStatement",
                  src: "4216:87:43"
                }
              ]
            },
            baseFunctions: [
              17349
            ],
            documentation: {
              id: 16659,
              nodeType: "StructuredDocumentation",
              src: "3788:198:43",
              text: " Deprecated - use registerComponentValueSet(entity, data) instead\n Register a component value update.\n Emits the `ComponentValueSet` event for clients to reconstruct the state."
            },
            functionSelector: "af104e40",
            implemented: true,
            kind: "function",
            modifiers: [
              {
                arguments: [
                  {
                    id: 16668,
                    name: "component",
                    nodeType: "Identifier",
                    overloadedDeclarations: [],
                    referencedDeclaration: 16661,
                    src: "4130:9:43",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  }
                ],
                id: 16669,
                kind: "modifierInvocation",
                modifierName: {
                  id: 16667,
                  name: "requireComponentRegistered",
                  nodeType: "IdentifierPath",
                  referencedDeclaration: 16658,
                  src: "4103:26:43"
                },
                nodeType: "ModifierInvocation",
                src: "4103:37:43"
              }
            ],
            name: "registerComponentValueSet",
            nameLocation: "3998:25:43",
            parameters: {
              id: 16666,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16661,
                  mutability: "mutable",
                  name: "component",
                  nameLocation: "4037:9:43",
                  nodeType: "VariableDeclaration",
                  scope: 16696,
                  src: "4029:17:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16660,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "4029:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16663,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "4060:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16696,
                  src: "4052:14:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16662,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "4052:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16665,
                  mutability: "mutable",
                  name: "data",
                  nameLocation: "4087:4:43",
                  nodeType: "VariableDeclaration",
                  scope: 16696,
                  src: "4072:19:43",
                  stateVariable: false,
                  storageLocation: "calldata",
                  typeDescriptions: {
                    typeIdentifier: "t_bytes_calldata_ptr",
                    typeString: "bytes"
                  },
                  typeName: {
                    id: 16664,
                    name: "bytes",
                    nodeType: "ElementaryTypeName",
                    src: "4072:5:43",
                    typeDescriptions: {
                      typeIdentifier: "t_bytes_storage_ptr",
                      typeString: "bytes"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "4023:72:43"
            },
            returnParameters: {
              id: 16670,
              nodeType: "ParameterList",
              parameters: [],
              src: "4141:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16728,
            nodeType: "FunctionDefinition",
            src: "4443:259:43",
            nodes: [],
            body: {
              id: 16727,
              nodeType: "Block",
              src: "4571:131:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        id: 16712,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16699,
                        src: "4595:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      expression: {
                        arguments: [
                          {
                            id: 16709,
                            name: "entities",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16450,
                            src: "4581:8:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          ],
                          id: 16708,
                          name: "Set",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16225,
                          src: "4577:3:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_contract$_Set_$16225_$",
                            typeString: "type(contract Set)"
                          }
                        },
                        id: 16710,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "4577:13:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Set_$16225",
                          typeString: "contract Set"
                        }
                      },
                      id: 16711,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "add",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 16099,
                      src: "4577:17:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_nonpayable$_t_uint256_$returns$__$",
                        typeString: "function (uint256) external"
                      }
                    },
                    id: 16713,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "4577:25:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16714,
                  nodeType: "ExpressionStatement",
                  src: "4577:25:43"
                },
                {
                  eventCall: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16717,
                            name: "_components",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16453,
                            src: "4646:11:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            }
                          },
                          {
                            expression: {
                              id: 16718,
                              name: "msg",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: -15,
                              src: "4659:3:43",
                              typeDescriptions: {
                                typeIdentifier: "t_magic_message",
                                typeString: "msg"
                              }
                            },
                            id: 16719,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            lValueRequested: false,
                            memberName: "sender",
                            nodeType: "MemberAccess",
                            src: "4659:10:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          ],
                          id: 16716,
                          name: "getIdByAddress",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 22718,
                          src: "4631:14:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_address_$returns$_t_uint256_$",
                            typeString: "function (contract IUint256Component,address) view returns (uint256)"
                          }
                        },
                        id: 16720,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "4631:39:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      {
                        expression: {
                          id: 16721,
                          name: "msg",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: -15,
                          src: "4672:3:43",
                          typeDescriptions: {
                            typeIdentifier: "t_magic_message",
                            typeString: "msg"
                          }
                        },
                        id: 16722,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        memberName: "sender",
                        nodeType: "MemberAccess",
                        src: "4672:10:43",
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      },
                      {
                        id: 16723,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16699,
                        src: "4684:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      {
                        id: 16724,
                        name: "data",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16701,
                        src: "4692:4:43",
                        typeDescriptions: {
                          typeIdentifier: "t_bytes_calldata_ptr",
                          typeString: "bytes calldata"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        },
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        {
                          typeIdentifier: "t_bytes_calldata_ptr",
                          typeString: "bytes calldata"
                        }
                      ],
                      id: 16715,
                      name: "ComponentValueSet",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16469,
                      src: "4613:17:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_event_nonpayable$_t_uint256_$_t_address_$_t_uint256_$_t_bytes_memory_ptr_$returns$__$",
                        typeString: "function (uint256,address,uint256,bytes memory)"
                      }
                    },
                    id: 16725,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "4613:84:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16726,
                  nodeType: "EmitStatement",
                  src: "4608:89:43"
                }
              ]
            },
            baseFunctions: [
              17356
            ],
            documentation: {
              id: 16697,
              nodeType: "StructuredDocumentation",
              src: "4312:128:43",
              text: " Register a component value update.\n Emits the `ComponentValueSet` event for clients to reconstruct the state."
            },
            functionSelector: "cfd3c57f",
            implemented: true,
            kind: "function",
            modifiers: [
              {
                arguments: [
                  {
                    expression: {
                      id: 16704,
                      name: "msg",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: -15,
                      src: "4557:3:43",
                      typeDescriptions: {
                        typeIdentifier: "t_magic_message",
                        typeString: "msg"
                      }
                    },
                    id: 16705,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    memberName: "sender",
                    nodeType: "MemberAccess",
                    src: "4557:10:43",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  }
                ],
                id: 16706,
                kind: "modifierInvocation",
                modifierName: {
                  id: 16703,
                  name: "requireComponentRegistered",
                  nodeType: "IdentifierPath",
                  referencedDeclaration: 16658,
                  src: "4530:26:43"
                },
                nodeType: "ModifierInvocation",
                src: "4530:38:43"
              }
            ],
            name: "registerComponentValueSet",
            nameLocation: "4452:25:43",
            parameters: {
              id: 16702,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16699,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "4486:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16728,
                  src: "4478:14:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16698,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "4478:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16701,
                  mutability: "mutable",
                  name: "data",
                  nameLocation: "4509:4:43",
                  nodeType: "VariableDeclaration",
                  scope: 16728,
                  src: "4494:19:43",
                  stateVariable: false,
                  storageLocation: "calldata",
                  typeDescriptions: {
                    typeIdentifier: "t_bytes_calldata_ptr",
                    typeString: "bytes"
                  },
                  typeName: {
                    id: 16700,
                    name: "bytes",
                    nodeType: "ElementaryTypeName",
                    src: "4494:5:43",
                    typeDescriptions: {
                      typeIdentifier: "t_bytes_storage_ptr",
                      typeString: "bytes"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "4477:37:43"
            },
            returnParameters: {
              id: 16707,
              nodeType: "ParameterList",
              parameters: [],
              src: "4571:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16756,
            nodeType: "FunctionDefinition",
            src: "4910:263:43",
            nodes: [],
            body: {
              id: 16755,
              nodeType: "Block",
              src: "5039:134:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        commonType: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        },
                        id: 16743,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        leftExpression: {
                          expression: {
                            id: 16740,
                            name: "msg",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: -15,
                            src: "5053:3:43",
                            typeDescriptions: {
                              typeIdentifier: "t_magic_message",
                              typeString: "msg"
                            }
                          },
                          id: 16741,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          memberName: "sender",
                          nodeType: "MemberAccess",
                          src: "5053:10:43",
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        },
                        nodeType: "BinaryOperation",
                        operator: "==",
                        rightExpression: {
                          id: 16742,
                          name: "component",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16731,
                          src: "5067:9:43",
                          typeDescriptions: {
                            typeIdentifier: "t_address",
                            typeString: "address"
                          }
                        },
                        src: "5053:23:43",
                        typeDescriptions: {
                          typeIdentifier: "t_bool",
                          typeString: "bool"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_bool",
                          typeString: "bool"
                        }
                      ],
                      id: 16739,
                      name: "require",
                      nodeType: "Identifier",
                      overloadedDeclarations: [
                        -18,
                        -18
                      ],
                      referencedDeclaration: -18,
                      src: "5045:7:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_require_pure$_t_bool_$returns$__$",
                        typeString: "function (bool) pure"
                      }
                    },
                    id: 16744,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "5045:32:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16745,
                  nodeType: "ExpressionStatement",
                  src: "5045:32:43"
                },
                {
                  eventCall: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16748,
                            name: "_components",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16453,
                            src: "5125:11:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            }
                          },
                          {
                            id: 16749,
                            name: "component",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16731,
                            src: "5138:9:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          ],
                          id: 16747,
                          name: "getIdByAddress",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 22718,
                          src: "5110:14:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_address_$returns$_t_uint256_$",
                            typeString: "function (contract IUint256Component,address) view returns (uint256)"
                          }
                        },
                        id: 16750,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "5110:38:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      {
                        id: 16751,
                        name: "component",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16731,
                        src: "5150:9:43",
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      },
                      {
                        id: 16752,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16733,
                        src: "5161:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        },
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      id: 16746,
                      name: "ComponentValueRemoved",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16477,
                      src: "5088:21:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_event_nonpayable$_t_uint256_$_t_address_$_t_uint256_$returns$__$",
                        typeString: "function (uint256,address,uint256)"
                      }
                    },
                    id: 16753,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "5088:80:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16754,
                  nodeType: "EmitStatement",
                  src: "5083:85:43"
                }
              ]
            },
            baseFunctions: [
              17363
            ],
            documentation: {
              id: 16729,
              nodeType: "StructuredDocumentation",
              src: "4706:201:43",
              text: " Deprecated - use registerComponentValueRemoved(entity) instead\n Register a component value removal.\n Emits the `ComponentValueRemoved` event for clients to reconstruct the state."
            },
            functionSelector: "d803064a",
            implemented: true,
            kind: "function",
            modifiers: [
              {
                arguments: [
                  {
                    id: 16736,
                    name: "component",
                    nodeType: "Identifier",
                    overloadedDeclarations: [],
                    referencedDeclaration: 16731,
                    src: "5026:9:43",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  }
                ],
                id: 16737,
                kind: "modifierInvocation",
                modifierName: {
                  id: 16735,
                  name: "requireComponentRegistered",
                  nodeType: "IdentifierPath",
                  referencedDeclaration: 16658,
                  src: "4999:26:43"
                },
                nodeType: "ModifierInvocation",
                src: "4999:37:43"
              }
            ],
            name: "registerComponentValueRemoved",
            nameLocation: "4919:29:43",
            parameters: {
              id: 16734,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16731,
                  mutability: "mutable",
                  name: "component",
                  nameLocation: "4957:9:43",
                  nodeType: "VariableDeclaration",
                  scope: 16756,
                  src: "4949:17:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16730,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "4949:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                },
                {
                  constant: false,
                  id: 16733,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "4976:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16756,
                  src: "4968:14:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16732,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "4968:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "4948:35:43"
            },
            returnParameters: {
              id: 16738,
              nodeType: "ParameterList",
              parameters: [],
              src: "5039:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16778,
            nodeType: "FunctionDefinition",
            src: "5313:199:43",
            nodes: [],
            body: {
              id: 16777,
              nodeType: "Block",
              src: "5414:98:43",
              nodes: [],
              statements: [
                {
                  eventCall: {
                    arguments: [
                      {
                        arguments: [
                          {
                            id: 16768,
                            name: "_components",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16453,
                            src: "5462:11:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            }
                          },
                          {
                            expression: {
                              id: 16769,
                              name: "msg",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: -15,
                              src: "5475:3:43",
                              typeDescriptions: {
                                typeIdentifier: "t_magic_message",
                                typeString: "msg"
                              }
                            },
                            id: 16770,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            lValueRequested: false,
                            memberName: "sender",
                            nodeType: "MemberAccess",
                            src: "5475:10:43",
                            typeDescriptions: {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Uint256Component_$17073",
                              typeString: "contract Uint256Component"
                            },
                            {
                              typeIdentifier: "t_address",
                              typeString: "address"
                            }
                          ],
                          id: 16767,
                          name: "getIdByAddress",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 22718,
                          src: "5447:14:43",
                          typeDescriptions: {
                            typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_address_$returns$_t_uint256_$",
                            typeString: "function (contract IUint256Component,address) view returns (uint256)"
                          }
                        },
                        id: 16771,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "functionCall",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "5447:39:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      {
                        expression: {
                          id: 16772,
                          name: "msg",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: -15,
                          src: "5488:3:43",
                          typeDescriptions: {
                            typeIdentifier: "t_magic_message",
                            typeString: "msg"
                          }
                        },
                        id: 16773,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        memberName: "sender",
                        nodeType: "MemberAccess",
                        src: "5488:10:43",
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      },
                      {
                        id: 16774,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16759,
                        src: "5500:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        },
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      id: 16766,
                      name: "ComponentValueRemoved",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16477,
                      src: "5425:21:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_event_nonpayable$_t_uint256_$_t_address_$_t_uint256_$returns$__$",
                        typeString: "function (uint256,address,uint256)"
                      }
                    },
                    id: 16775,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "5425:82:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_tuple$__$",
                      typeString: "tuple()"
                    }
                  },
                  id: 16776,
                  nodeType: "EmitStatement",
                  src: "5420:87:43"
                }
              ]
            },
            baseFunctions: [
              17368
            ],
            documentation: {
              id: 16757,
              nodeType: "StructuredDocumentation",
              src: "5177:133:43",
              text: " Register a component value removal.\n Emits the `ComponentValueRemoved` event for clients to reconstruct the state."
            },
            functionSelector: "0de3b7b5",
            implemented: true,
            kind: "function",
            modifiers: [
              {
                arguments: [
                  {
                    expression: {
                      id: 16762,
                      name: "msg",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: -15,
                      src: "5402:3:43",
                      typeDescriptions: {
                        typeIdentifier: "t_magic_message",
                        typeString: "msg"
                      }
                    },
                    id: 16763,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    memberName: "sender",
                    nodeType: "MemberAccess",
                    src: "5402:10:43",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  }
                ],
                id: 16764,
                kind: "modifierInvocation",
                modifierName: {
                  id: 16761,
                  name: "requireComponentRegistered",
                  nodeType: "IdentifierPath",
                  referencedDeclaration: 16658,
                  src: "5375:26:43"
                },
                nodeType: "ModifierInvocation",
                src: "5375:38:43"
              }
            ],
            name: "registerComponentValueRemoved",
            nameLocation: "5322:29:43",
            parameters: {
              id: 16760,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16759,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "5360:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16778,
                  src: "5352:14:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16758,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "5352:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "5351:16:43"
            },
            returnParameters: {
              id: 16765,
              nodeType: "ParameterList",
              parameters: [],
              src: "5414:0:43"
            },
            scope: 16950,
            stateMutability: "nonpayable",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16792,
            nodeType: "FunctionDefinition",
            src: "5609:115:43",
            nodes: [],
            body: {
              id: 16791,
              nodeType: "Block",
              src: "5675:49:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        id: 16787,
                        name: "_components",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16453,
                        src: "5703:11:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      {
                        id: 16788,
                        name: "id",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16781,
                        src: "5716:2:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        },
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      id: 16786,
                      name: "getAddressById",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 22689,
                      src: "5688:14:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_uint256_$returns$_t_address_$",
                        typeString: "function (contract IUint256Component,uint256) view returns (address)"
                      }
                    },
                    id: 16789,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "5688:31:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  functionReturnParameters: 16785,
                  id: 16790,
                  nodeType: "Return",
                  src: "5681:38:43"
                }
              ]
            },
            baseFunctions: [
              17326
            ],
            documentation: {
              id: 16779,
              nodeType: "StructuredDocumentation",
              src: "5516:90:43",
              text: "Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "
            },
            functionSelector: "4f27da18",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "getComponent",
            nameLocation: "5618:12:43",
            parameters: {
              id: 16782,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16781,
                  mutability: "mutable",
                  name: "id",
                  nameLocation: "5639:2:43",
                  nodeType: "VariableDeclaration",
                  scope: 16792,
                  src: "5631:10:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16780,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "5631:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "5630:12:43"
            },
            returnParameters: {
              id: 16785,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16784,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16792,
                  src: "5666:7:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16783,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "5666:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "5665:9:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "external"
          },
          {
            id: 16806,
            nodeType: "FunctionDefinition",
            src: "5821:150:43",
            nodes: [],
            body: {
              id: 16805,
              nodeType: "Block",
              src: "5911:60:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        id: 16801,
                        name: "_components",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16453,
                        src: "5939:11:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      {
                        id: 16802,
                        name: "componentAddr",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16795,
                        src: "5952:13:43",
                        typeDescriptions: {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        },
                        {
                          typeIdentifier: "t_address",
                          typeString: "address"
                        }
                      ],
                      id: 16800,
                      name: "getIdByAddress",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 22718,
                      src: "5924:14:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_address_$returns$_t_uint256_$",
                        typeString: "function (contract IUint256Component,address) view returns (uint256)"
                      }
                    },
                    id: 16803,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "5924:42:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  functionReturnParameters: 16799,
                  id: 16804,
                  nodeType: "Return",
                  src: "5917:49:43"
                }
              ]
            },
            baseFunctions: [
              17333
            ],
            documentation: {
              id: 16793,
              nodeType: "StructuredDocumentation",
              src: "5728:90:43",
              text: "Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "
            },
            functionSelector: "9f54f545",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "getComponentIdFromAddress",
            nameLocation: "5830:25:43",
            parameters: {
              id: 16796,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16795,
                  mutability: "mutable",
                  name: "componentAddr",
                  nameLocation: "5864:13:43",
                  nodeType: "VariableDeclaration",
                  scope: 16806,
                  src: "5856:21:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16794,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "5856:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "5855:23:43"
            },
            returnParameters: {
              id: 16799,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16798,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16806,
                  src: "5902:7:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16797,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "5902:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "5901:9:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "external"
          },
          {
            id: 16820,
            nodeType: "FunctionDefinition",
            src: "6068:128:43",
            nodes: [],
            body: {
              id: 16819,
              nodeType: "Block",
              src: "6144:52:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        id: 16815,
                        name: "_systems",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16456,
                        src: "6172:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        }
                      },
                      {
                        id: 16816,
                        name: "systemId",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16809,
                        src: "6182:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_contract$_Uint256Component_$17073",
                          typeString: "contract Uint256Component"
                        },
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      id: 16814,
                      name: "getAddressById",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 22689,
                      src: "6157:14:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_uint256_$returns$_t_address_$",
                        typeString: "function (contract IUint256Component,uint256) view returns (address)"
                      }
                    },
                    id: 16817,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "6157:34:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  functionReturnParameters: 16813,
                  id: 16818,
                  nodeType: "Return",
                  src: "6150:41:43"
                }
              ]
            },
            documentation: {
              id: 16807,
              nodeType: "StructuredDocumentation",
              src: "5975:90:43",
              text: "Deprecated, but left here for backward compatibility. TODO: refactor all consumers. "
            },
            functionSelector: "fb3ec48b",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "getSystemAddress",
            nameLocation: "6077:16:43",
            parameters: {
              id: 16810,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16809,
                  mutability: "mutable",
                  name: "systemId",
                  nameLocation: "6102:8:43",
                  nodeType: "VariableDeclaration",
                  scope: 16820,
                  src: "6094:16:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16808,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "6094:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "6093:18:43"
            },
            returnParameters: {
              id: 16813,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16812,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16820,
                  src: "6135:7:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_address",
                    typeString: "address"
                  },
                  typeName: {
                    id: 16811,
                    name: "address",
                    nodeType: "ElementaryTypeName",
                    src: "6135:7:43",
                    stateMutability: "nonpayable",
                    typeDescriptions: {
                      typeIdentifier: "t_address",
                      typeString: "address"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "6134:9:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "external"
          },
          {
            id: 16832,
            nodeType: "FunctionDefinition",
            src: "6200:94:43",
            nodes: [],
            body: {
              id: 16831,
              nodeType: "Block",
              src: "6256:38:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [],
                    expression: {
                      argumentTypes: [],
                      expression: {
                        arguments: [
                          {
                            id: 16826,
                            name: "entities",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16450,
                            src: "6273:8:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          ],
                          id: 16825,
                          name: "Set",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16225,
                          src: "6269:3:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_contract$_Set_$16225_$",
                            typeString: "type(contract Set)"
                          }
                        },
                        id: 16827,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "6269:13:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Set_$16225",
                          typeString: "contract Set"
                        }
                      },
                      id: 16828,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "size",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 16224,
                      src: "6269:18:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_view$__$returns$_t_uint256_$",
                        typeString: "function () view external returns (uint256)"
                      }
                    },
                    id: 16829,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "6269:20:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  functionReturnParameters: 16824,
                  id: 16830,
                  nodeType: "Return",
                  src: "6262:27:43"
                }
              ]
            },
            baseFunctions: [
              17373
            ],
            functionSelector: "d7ecf62b",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "getNumEntities",
            nameLocation: "6209:14:43",
            parameters: {
              id: 16821,
              nodeType: "ParameterList",
              parameters: [],
              src: "6223:2:43"
            },
            returnParameters: {
              id: 16824,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16823,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16832,
                  src: "6247:7:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16822,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "6247:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "6246:9:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16896,
            nodeType: "FunctionDefinition",
            src: "6431:500:43",
            nodes: [],
            body: {
              id: 16895,
              nodeType: "Block",
              src: "6536:395:43",
              nodes: [],
              statements: [
                {
                  assignments: [
                    16847
                  ],
                  declarations: [
                    {
                      constant: false,
                      id: 16847,
                      mutability: "mutable",
                      name: "fragments",
                      nameLocation: "6565:9:43",
                      nodeType: "VariableDeclaration",
                      scope: 16895,
                      src: "6542:32:43",
                      stateVariable: false,
                      storageLocation: "memory",
                      typeDescriptions: {
                        typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr",
                        typeString: "struct QueryFragment[]"
                      },
                      typeName: {
                        baseType: {
                          id: 16845,
                          nodeType: "UserDefinedTypeName",
                          pathNode: {
                            id: 16844,
                            name: "QueryFragment",
                            nodeType: "IdentifierPath",
                            referencedDeclaration: 17421,
                            src: "6542:13:43"
                          },
                          referencedDeclaration: 17421,
                          src: "6542:13:43",
                          typeDescriptions: {
                            typeIdentifier: "t_struct$_QueryFragment_$17421_storage_ptr",
                            typeString: "struct QueryFragment"
                          }
                        },
                        id: 16846,
                        nodeType: "ArrayTypeName",
                        src: "6542:15:43",
                        typeDescriptions: {
                          typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_storage_$dyn_storage_ptr",
                          typeString: "struct QueryFragment[]"
                        }
                      },
                      visibility: "internal"
                    }
                  ],
                  id: 16855,
                  initialValue: {
                    arguments: [
                      {
                        expression: {
                          id: 16852,
                          name: "worldQueryFragments",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16837,
                          src: "6597:19:43",
                          typeDescriptions: {
                            typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_calldata_ptr_$dyn_calldata_ptr",
                            typeString: "struct WorldQueryFragment calldata[] calldata"
                          }
                        },
                        id: 16853,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        memberName: "length",
                        nodeType: "MemberAccess",
                        src: "6597:26:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      id: 16851,
                      isConstant: false,
                      isLValue: false,
                      isPure: true,
                      lValueRequested: false,
                      nodeType: "NewExpression",
                      src: "6577:19:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_objectcreation_pure$_t_uint256_$returns$_t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr_$",
                        typeString: "function (uint256) pure returns (struct QueryFragment memory[] memory)"
                      },
                      typeName: {
                        baseType: {
                          id: 16849,
                          nodeType: "UserDefinedTypeName",
                          pathNode: {
                            id: 16848,
                            name: "QueryFragment",
                            nodeType: "IdentifierPath",
                            referencedDeclaration: 17421,
                            src: "6581:13:43"
                          },
                          referencedDeclaration: 17421,
                          src: "6581:13:43",
                          typeDescriptions: {
                            typeIdentifier: "t_struct$_QueryFragment_$17421_storage_ptr",
                            typeString: "struct QueryFragment"
                          }
                        },
                        id: 16850,
                        nodeType: "ArrayTypeName",
                        src: "6581:15:43",
                        typeDescriptions: {
                          typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_storage_$dyn_storage_ptr",
                          typeString: "struct QueryFragment[]"
                        }
                      }
                    },
                    id: 16854,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "6577:47:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr",
                      typeString: "struct QueryFragment memory[] memory"
                    }
                  },
                  nodeType: "VariableDeclarationStatement",
                  src: "6542:82:43"
                },
                {
                  body: {
                    id: 16888,
                    nodeType: "Block",
                    src: "6683:206:43",
                    statements: [
                      {
                        expression: {
                          id: 16886,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          leftHandSide: {
                            baseExpression: {
                              id: 16866,
                              name: "fragments",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 16847,
                              src: "6691:9:43",
                              typeDescriptions: {
                                typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr",
                                typeString: "struct QueryFragment memory[] memory"
                              }
                            },
                            id: 16868,
                            indexExpression: {
                              id: 16867,
                              name: "i",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 16857,
                              src: "6701:1:43",
                              typeDescriptions: {
                                typeIdentifier: "t_uint256",
                                typeString: "uint256"
                              }
                            },
                            isConstant: false,
                            isLValue: true,
                            isPure: false,
                            lValueRequested: true,
                            nodeType: "IndexAccess",
                            src: "6691:12:43",
                            typeDescriptions: {
                              typeIdentifier: "t_struct$_QueryFragment_$17421_memory_ptr",
                              typeString: "struct QueryFragment memory"
                            }
                          },
                          nodeType: "Assignment",
                          operator: "=",
                          rightHandSide: {
                            arguments: [
                              {
                                expression: {
                                  baseExpression: {
                                    id: 16870,
                                    name: "worldQueryFragments",
                                    nodeType: "Identifier",
                                    overloadedDeclarations: [],
                                    referencedDeclaration: 16837,
                                    src: "6729:19:43",
                                    typeDescriptions: {
                                      typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_calldata_ptr_$dyn_calldata_ptr",
                                      typeString: "struct WorldQueryFragment calldata[] calldata"
                                    }
                                  },
                                  id: 16872,
                                  indexExpression: {
                                    id: 16871,
                                    name: "i",
                                    nodeType: "Identifier",
                                    overloadedDeclarations: [],
                                    referencedDeclaration: 16857,
                                    src: "6749:1:43",
                                    typeDescriptions: {
                                      typeIdentifier: "t_uint256",
                                      typeString: "uint256"
                                    }
                                  },
                                  isConstant: false,
                                  isLValue: false,
                                  isPure: false,
                                  lValueRequested: false,
                                  nodeType: "IndexAccess",
                                  src: "6729:22:43",
                                  typeDescriptions: {
                                    typeIdentifier: "t_struct$_WorldQueryFragment_$17300_calldata_ptr",
                                    typeString: "struct WorldQueryFragment calldata"
                                  }
                                },
                                id: 16873,
                                isConstant: false,
                                isLValue: false,
                                isPure: false,
                                lValueRequested: false,
                                memberName: "queryType",
                                nodeType: "MemberAccess",
                                referencedDeclaration: 17295,
                                src: "6729:32:43",
                                typeDescriptions: {
                                  typeIdentifier: "t_enum$_QueryType_$17412",
                                  typeString: "enum QueryType"
                                }
                              },
                              {
                                arguments: [
                                  {
                                    id: 16875,
                                    name: "_components",
                                    nodeType: "Identifier",
                                    overloadedDeclarations: [],
                                    referencedDeclaration: 16453,
                                    src: "6788:11:43",
                                    typeDescriptions: {
                                      typeIdentifier: "t_contract$_Uint256Component_$17073",
                                      typeString: "contract Uint256Component"
                                    }
                                  },
                                  {
                                    expression: {
                                      baseExpression: {
                                        id: 16876,
                                        name: "worldQueryFragments",
                                        nodeType: "Identifier",
                                        overloadedDeclarations: [],
                                        referencedDeclaration: 16837,
                                        src: "6801:19:43",
                                        typeDescriptions: {
                                          typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_calldata_ptr_$dyn_calldata_ptr",
                                          typeString: "struct WorldQueryFragment calldata[] calldata"
                                        }
                                      },
                                      id: 16878,
                                      indexExpression: {
                                        id: 16877,
                                        name: "i",
                                        nodeType: "Identifier",
                                        overloadedDeclarations: [],
                                        referencedDeclaration: 16857,
                                        src: "6821:1:43",
                                        typeDescriptions: {
                                          typeIdentifier: "t_uint256",
                                          typeString: "uint256"
                                        }
                                      },
                                      isConstant: false,
                                      isLValue: false,
                                      isPure: false,
                                      lValueRequested: false,
                                      nodeType: "IndexAccess",
                                      src: "6801:22:43",
                                      typeDescriptions: {
                                        typeIdentifier: "t_struct$_WorldQueryFragment_$17300_calldata_ptr",
                                        typeString: "struct WorldQueryFragment calldata"
                                      }
                                    },
                                    id: 16879,
                                    isConstant: false,
                                    isLValue: false,
                                    isPure: false,
                                    lValueRequested: false,
                                    memberName: "componentId",
                                    nodeType: "MemberAccess",
                                    referencedDeclaration: 17297,
                                    src: "6801:34:43",
                                    typeDescriptions: {
                                      typeIdentifier: "t_uint256",
                                      typeString: "uint256"
                                    }
                                  }
                                ],
                                expression: {
                                  argumentTypes: [
                                    {
                                      typeIdentifier: "t_contract$_Uint256Component_$17073",
                                      typeString: "contract Uint256Component"
                                    },
                                    {
                                      typeIdentifier: "t_uint256",
                                      typeString: "uint256"
                                    }
                                  ],
                                  id: 16874,
                                  name: "getComponentById",
                                  nodeType: "Identifier",
                                  overloadedDeclarations: [],
                                  referencedDeclaration: 22738,
                                  src: "6771:16:43",
                                  typeDescriptions: {
                                    typeIdentifier: "t_function_internal_view$_t_contract$_IUint256Component_$17286_$_t_uint256_$returns$_t_contract$_IComponent_$17161_$",
                                    typeString: "function (contract IUint256Component,uint256) view returns (contract IComponent)"
                                  }
                                },
                                id: 16880,
                                isConstant: false,
                                isLValue: false,
                                isPure: false,
                                kind: "functionCall",
                                lValueRequested: false,
                                names: [],
                                nodeType: "FunctionCall",
                                src: "6771:65:43",
                                tryCall: false,
                                typeDescriptions: {
                                  typeIdentifier: "t_contract$_IComponent_$17161",
                                  typeString: "contract IComponent"
                                }
                              },
                              {
                                expression: {
                                  baseExpression: {
                                    id: 16881,
                                    name: "worldQueryFragments",
                                    nodeType: "Identifier",
                                    overloadedDeclarations: [],
                                    referencedDeclaration: 16837,
                                    src: "6846:19:43",
                                    typeDescriptions: {
                                      typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_calldata_ptr_$dyn_calldata_ptr",
                                      typeString: "struct WorldQueryFragment calldata[] calldata"
                                    }
                                  },
                                  id: 16883,
                                  indexExpression: {
                                    id: 16882,
                                    name: "i",
                                    nodeType: "Identifier",
                                    overloadedDeclarations: [],
                                    referencedDeclaration: 16857,
                                    src: "6866:1:43",
                                    typeDescriptions: {
                                      typeIdentifier: "t_uint256",
                                      typeString: "uint256"
                                    }
                                  },
                                  isConstant: false,
                                  isLValue: false,
                                  isPure: false,
                                  lValueRequested: false,
                                  nodeType: "IndexAccess",
                                  src: "6846:22:43",
                                  typeDescriptions: {
                                    typeIdentifier: "t_struct$_WorldQueryFragment_$17300_calldata_ptr",
                                    typeString: "struct WorldQueryFragment calldata"
                                  }
                                },
                                id: 16884,
                                isConstant: false,
                                isLValue: false,
                                isPure: false,
                                lValueRequested: false,
                                memberName: "value",
                                nodeType: "MemberAccess",
                                referencedDeclaration: 17299,
                                src: "6846:28:43",
                                typeDescriptions: {
                                  typeIdentifier: "t_bytes_calldata_ptr",
                                  typeString: "bytes calldata"
                                }
                              }
                            ],
                            expression: {
                              argumentTypes: [
                                {
                                  typeIdentifier: "t_enum$_QueryType_$17412",
                                  typeString: "enum QueryType"
                                },
                                {
                                  typeIdentifier: "t_contract$_IComponent_$17161",
                                  typeString: "contract IComponent"
                                },
                                {
                                  typeIdentifier: "t_bytes_calldata_ptr",
                                  typeString: "bytes calldata"
                                }
                              ],
                              id: 16869,
                              name: "QueryFragment",
                              nodeType: "Identifier",
                              overloadedDeclarations: [],
                              referencedDeclaration: 17421,
                              src: "6706:13:43",
                              typeDescriptions: {
                                typeIdentifier: "t_type$_t_struct$_QueryFragment_$17421_storage_ptr_$",
                                typeString: "type(struct QueryFragment storage pointer)"
                              }
                            },
                            id: 16885,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            kind: "structConstructorCall",
                            lValueRequested: false,
                            names: [],
                            nodeType: "FunctionCall",
                            src: "6706:176:43",
                            tryCall: false,
                            typeDescriptions: {
                              typeIdentifier: "t_struct$_QueryFragment_$17421_memory_ptr",
                              typeString: "struct QueryFragment memory"
                            }
                          },
                          src: "6691:191:43",
                          typeDescriptions: {
                            typeIdentifier: "t_struct$_QueryFragment_$17421_memory_ptr",
                            typeString: "struct QueryFragment memory"
                          }
                        },
                        id: 16887,
                        nodeType: "ExpressionStatement",
                        src: "6691:191:43"
                      }
                    ]
                  },
                  condition: {
                    commonType: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    },
                    id: 16862,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftExpression: {
                      id: 16859,
                      name: "i",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16857,
                      src: "6646:1:43",
                      typeDescriptions: {
                        typeIdentifier: "t_uint256",
                        typeString: "uint256"
                      }
                    },
                    nodeType: "BinaryOperation",
                    operator: "<",
                    rightExpression: {
                      expression: {
                        id: 16860,
                        name: "worldQueryFragments",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16837,
                        src: "6650:19:43",
                        typeDescriptions: {
                          typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_calldata_ptr_$dyn_calldata_ptr",
                          typeString: "struct WorldQueryFragment calldata[] calldata"
                        }
                      },
                      id: 16861,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "length",
                      nodeType: "MemberAccess",
                      src: "6650:26:43",
                      typeDescriptions: {
                        typeIdentifier: "t_uint256",
                        typeString: "uint256"
                      }
                    },
                    src: "6646:30:43",
                    typeDescriptions: {
                      typeIdentifier: "t_bool",
                      typeString: "bool"
                    }
                  },
                  id: 16889,
                  initializationExpression: {
                    assignments: [
                      16857
                    ],
                    declarations: [
                      {
                        constant: false,
                        id: 16857,
                        mutability: "mutable",
                        name: "i",
                        nameLocation: "6643:1:43",
                        nodeType: "VariableDeclaration",
                        scope: 16889,
                        src: "6635:9:43",
                        stateVariable: false,
                        storageLocation: "default",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        },
                        typeName: {
                          id: 16856,
                          name: "uint256",
                          nodeType: "ElementaryTypeName",
                          src: "6635:7:43",
                          typeDescriptions: {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        },
                        visibility: "internal"
                      }
                    ],
                    id: 16858,
                    nodeType: "VariableDeclarationStatement",
                    src: "6635:9:43"
                  },
                  loopExpression: {
                    expression: {
                      id: 16864,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: "UnaryOperation",
                      operator: "++",
                      prefix: false,
                      src: "6678:3:43",
                      subExpression: {
                        id: 16863,
                        name: "i",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16857,
                        src: "6678:1:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      typeDescriptions: {
                        typeIdentifier: "t_uint256",
                        typeString: "uint256"
                      }
                    },
                    id: 16865,
                    nodeType: "ExpressionStatement",
                    src: "6678:3:43"
                  },
                  nodeType: "ForStatement",
                  src: "6630:259:43"
                },
                {
                  expression: {
                    arguments: [
                      {
                        id: 16892,
                        name: "fragments",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16847,
                        src: "6916:9:43",
                        typeDescriptions: {
                          typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr",
                          typeString: "struct QueryFragment memory[] memory"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr",
                          typeString: "struct QueryFragment memory[] memory"
                        }
                      ],
                      expression: {
                        id: 16890,
                        name: "LibQuery",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 15641,
                        src: "6901:8:43",
                        typeDescriptions: {
                          typeIdentifier: "t_type$_t_contract$_LibQuery_$15641_$",
                          typeString: "type(library LibQuery)"
                        }
                      },
                      id: 16891,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "query",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 15073,
                      src: "6901:14:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_internal_view$_t_array$_t_struct$_QueryFragment_$17421_memory_ptr_$dyn_memory_ptr_$returns$_t_array$_t_uint256_$dyn_memory_ptr_$",
                        typeString: "function (struct QueryFragment memory[] memory) view returns (uint256[] memory)"
                      }
                    },
                    id: 16893,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "6901:25:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_array$_t_uint256_$dyn_memory_ptr",
                      typeString: "uint256[] memory"
                    }
                  },
                  functionReturnParameters: 16842,
                  id: 16894,
                  nodeType: "Return",
                  src: "6894:32:43"
                }
              ]
            },
            baseFunctions: [
              17395
            ],
            documentation: {
              id: 16833,
              nodeType: "StructuredDocumentation",
              src: "6298:130:43",
              text: " Helper function to execute a query with query fragments referring to a component ID instead of a component address."
            },
            functionSelector: "687485a6",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "query",
            nameLocation: "6440:5:43",
            parameters: {
              id: 16838,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16837,
                  mutability: "mutable",
                  name: "worldQueryFragments",
                  nameLocation: "6476:19:43",
                  nodeType: "VariableDeclaration",
                  scope: 16896,
                  src: "6446:49:43",
                  stateVariable: false,
                  storageLocation: "calldata",
                  typeDescriptions: {
                    typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_calldata_ptr_$dyn_calldata_ptr",
                    typeString: "struct WorldQueryFragment[]"
                  },
                  typeName: {
                    baseType: {
                      id: 16835,
                      nodeType: "UserDefinedTypeName",
                      pathNode: {
                        id: 16834,
                        name: "WorldQueryFragment",
                        nodeType: "IdentifierPath",
                        referencedDeclaration: 17300,
                        src: "6446:18:43"
                      },
                      referencedDeclaration: 17300,
                      src: "6446:18:43",
                      typeDescriptions: {
                        typeIdentifier: "t_struct$_WorldQueryFragment_$17300_storage_ptr",
                        typeString: "struct WorldQueryFragment"
                      }
                    },
                    id: 16836,
                    nodeType: "ArrayTypeName",
                    src: "6446:20:43",
                    typeDescriptions: {
                      typeIdentifier: "t_array$_t_struct$_WorldQueryFragment_$17300_storage_$dyn_storage_ptr",
                      typeString: "struct WorldQueryFragment[]"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "6445:51:43"
            },
            returnParameters: {
              id: 16842,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16841,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16896,
                  src: "6518:16:43",
                  stateVariable: false,
                  storageLocation: "memory",
                  typeDescriptions: {
                    typeIdentifier: "t_array$_t_uint256_$dyn_memory_ptr",
                    typeString: "uint256[]"
                  },
                  typeName: {
                    baseType: {
                      id: 16839,
                      name: "uint256",
                      nodeType: "ElementaryTypeName",
                      src: "6518:7:43",
                      typeDescriptions: {
                        typeIdentifier: "t_uint256",
                        typeString: "uint256"
                      }
                    },
                    id: 16840,
                    nodeType: "ArrayTypeName",
                    src: "6518:9:43",
                    typeDescriptions: {
                      typeIdentifier: "t_array$_t_uint256_$dyn_storage_ptr",
                      typeString: "uint256[]"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "6517:18:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16912,
            nodeType: "FunctionDefinition",
            src: "6998:105:43",
            nodes: [],
            body: {
              id: 16911,
              nodeType: "Block",
              src: "7060:43:43",
              nodes: [],
              statements: [
                {
                  expression: {
                    arguments: [
                      {
                        id: 16908,
                        name: "entity",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16899,
                        src: "7091:6:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      expression: {
                        arguments: [
                          {
                            id: 16905,
                            name: "entities",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16450,
                            src: "7077:8:43",
                            typeDescriptions: {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: "t_contract$_Set_$16225",
                              typeString: "contract Set"
                            }
                          ],
                          id: 16904,
                          name: "Set",
                          nodeType: "Identifier",
                          overloadedDeclarations: [],
                          referencedDeclaration: 16225,
                          src: "7073:3:43",
                          typeDescriptions: {
                            typeIdentifier: "t_type$_t_contract$_Set_$16225_$",
                            typeString: "type(contract Set)"
                          }
                        },
                        id: 16906,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: "typeConversion",
                        lValueRequested: false,
                        names: [],
                        nodeType: "FunctionCall",
                        src: "7073:13:43",
                        tryCall: false,
                        typeDescriptions: {
                          typeIdentifier: "t_contract$_Set_$16225",
                          typeString: "contract Set"
                        }
                      },
                      id: 16907,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: "has",
                      nodeType: "MemberAccess",
                      referencedDeclaration: 16206,
                      src: "7073:17:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_external_view$_t_uint256_$returns$_t_bool_$",
                        typeString: "function (uint256) view external returns (bool)"
                      }
                    },
                    id: 16909,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "7073:25:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_bool",
                      typeString: "bool"
                    }
                  },
                  functionReturnParameters: 16903,
                  id: 16910,
                  nodeType: "Return",
                  src: "7066:32:43"
                }
              ]
            },
            baseFunctions: [
              17380
            ],
            documentation: {
              id: 16897,
              nodeType: "StructuredDocumentation",
              src: "6935:60:43",
              text: " Check whether an entity exists in this world."
            },
            functionSelector: "e3d12875",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "hasEntity",
            nameLocation: "7007:9:43",
            parameters: {
              id: 16900,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16899,
                  mutability: "mutable",
                  name: "entity",
                  nameLocation: "7025:6:43",
                  nodeType: "VariableDeclaration",
                  scope: 16912,
                  src: "7017:14:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16898,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "7017:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "7016:16:43"
            },
            returnParameters: {
              id: 16903,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16902,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16912,
                  src: "7054:4:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_bool",
                    typeString: "bool"
                  },
                  typeName: {
                    id: 16901,
                    name: "bool",
                    nodeType: "ElementaryTypeName",
                    src: "7054:4:43",
                    typeDescriptions: {
                      typeIdentifier: "t_bool",
                      typeString: "bool"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "7053:6:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "public"
          },
          {
            id: 16949,
            nodeType: "FunctionDefinition",
            src: "7152:255:43",
            nodes: [],
            body: {
              id: 16948,
              nodeType: "Block",
              src: "7211:196:43",
              nodes: [],
              statements: [
                {
                  assignments: [
                    16919
                  ],
                  declarations: [
                    {
                      constant: false,
                      id: 16919,
                      mutability: "mutable",
                      name: "entityNum",
                      nameLocation: "7225:9:43",
                      nodeType: "VariableDeclaration",
                      scope: 16948,
                      src: "7217:17:43",
                      stateVariable: false,
                      storageLocation: "default",
                      typeDescriptions: {
                        typeIdentifier: "t_uint256",
                        typeString: "uint256"
                      },
                      typeName: {
                        id: 16918,
                        name: "uint256",
                        nodeType: "ElementaryTypeName",
                        src: "7217:7:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      visibility: "internal"
                    }
                  ],
                  id: 16922,
                  initialValue: {
                    arguments: [],
                    expression: {
                      argumentTypes: [],
                      id: 16920,
                      name: "getNumEntities",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16832,
                      src: "7237:14:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_internal_view$__$returns$_t_uint256_$",
                        typeString: "function () view returns (uint256)"
                      }
                    },
                    id: 16921,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "7237:16:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  nodeType: "VariableDeclarationStatement",
                  src: "7217:36:43"
                },
                {
                  assignments: [
                    16924
                  ],
                  declarations: [
                    {
                      constant: false,
                      id: 16924,
                      mutability: "mutable",
                      name: "id",
                      nameLocation: "7267:2:43",
                      nodeType: "VariableDeclaration",
                      scope: 16948,
                      src: "7259:10:43",
                      stateVariable: false,
                      storageLocation: "default",
                      typeDescriptions: {
                        typeIdentifier: "t_uint256",
                        typeString: "uint256"
                      },
                      typeName: {
                        id: 16923,
                        name: "uint256",
                        nodeType: "ElementaryTypeName",
                        src: "7259:7:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      },
                      visibility: "internal"
                    }
                  ],
                  id: 16925,
                  nodeType: "VariableDeclarationStatement",
                  src: "7259:10:43"
                },
                {
                  body: {
                    id: 16941,
                    nodeType: "Block",
                    src: "7278:86:43",
                    statements: [
                      {
                        expression: {
                          id: 16927,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          nodeType: "UnaryOperation",
                          operator: "++",
                          prefix: false,
                          src: "7286:11:43",
                          subExpression: {
                            id: 16926,
                            name: "entityNum",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16919,
                            src: "7286:9:43",
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          },
                          typeDescriptions: {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        },
                        id: 16928,
                        nodeType: "ExpressionStatement",
                        src: "7286:11:43"
                      },
                      {
                        expression: {
                          id: 16939,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          leftHandSide: {
                            id: 16929,
                            name: "id",
                            nodeType: "Identifier",
                            overloadedDeclarations: [],
                            referencedDeclaration: 16924,
                            src: "7305:2:43",
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          },
                          nodeType: "Assignment",
                          operator: "=",
                          rightHandSide: {
                            arguments: [
                              {
                                arguments: [
                                  {
                                    arguments: [
                                      {
                                        id: 16935,
                                        name: "entityNum",
                                        nodeType: "Identifier",
                                        overloadedDeclarations: [],
                                        referencedDeclaration: 16919,
                                        src: "7345:9:43",
                                        typeDescriptions: {
                                          typeIdentifier: "t_uint256",
                                          typeString: "uint256"
                                        }
                                      }
                                    ],
                                    expression: {
                                      argumentTypes: [
                                        {
                                          typeIdentifier: "t_uint256",
                                          typeString: "uint256"
                                        }
                                      ],
                                      expression: {
                                        id: 16933,
                                        name: "abi",
                                        nodeType: "Identifier",
                                        overloadedDeclarations: [],
                                        referencedDeclaration: -1,
                                        src: "7328:3:43",
                                        typeDescriptions: {
                                          typeIdentifier: "t_magic_abi",
                                          typeString: "abi"
                                        }
                                      },
                                      id: 16934,
                                      isConstant: false,
                                      isLValue: false,
                                      isPure: true,
                                      lValueRequested: false,
                                      memberName: "encodePacked",
                                      nodeType: "MemberAccess",
                                      src: "7328:16:43",
                                      typeDescriptions: {
                                        typeIdentifier: "t_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$",
                                        typeString: "function () pure returns (bytes memory)"
                                      }
                                    },
                                    id: 16936,
                                    isConstant: false,
                                    isLValue: false,
                                    isPure: false,
                                    kind: "functionCall",
                                    lValueRequested: false,
                                    names: [],
                                    nodeType: "FunctionCall",
                                    src: "7328:27:43",
                                    tryCall: false,
                                    typeDescriptions: {
                                      typeIdentifier: "t_bytes_memory_ptr",
                                      typeString: "bytes memory"
                                    }
                                  }
                                ],
                                expression: {
                                  argumentTypes: [
                                    {
                                      typeIdentifier: "t_bytes_memory_ptr",
                                      typeString: "bytes memory"
                                    }
                                  ],
                                  id: 16932,
                                  name: "keccak256",
                                  nodeType: "Identifier",
                                  overloadedDeclarations: [],
                                  referencedDeclaration: -8,
                                  src: "7318:9:43",
                                  typeDescriptions: {
                                    typeIdentifier: "t_function_keccak256_pure$_t_bytes_memory_ptr_$returns$_t_bytes32_$",
                                    typeString: "function (bytes memory) pure returns (bytes32)"
                                  }
                                },
                                id: 16937,
                                isConstant: false,
                                isLValue: false,
                                isPure: false,
                                kind: "functionCall",
                                lValueRequested: false,
                                names: [],
                                nodeType: "FunctionCall",
                                src: "7318:38:43",
                                tryCall: false,
                                typeDescriptions: {
                                  typeIdentifier: "t_bytes32",
                                  typeString: "bytes32"
                                }
                              }
                            ],
                            expression: {
                              argumentTypes: [
                                {
                                  typeIdentifier: "t_bytes32",
                                  typeString: "bytes32"
                                }
                              ],
                              id: 16931,
                              isConstant: false,
                              isLValue: false,
                              isPure: true,
                              lValueRequested: false,
                              nodeType: "ElementaryTypeNameExpression",
                              src: "7310:7:43",
                              typeDescriptions: {
                                typeIdentifier: "t_type$_t_uint256_$",
                                typeString: "type(uint256)"
                              },
                              typeName: {
                                id: 16930,
                                name: "uint256",
                                nodeType: "ElementaryTypeName",
                                src: "7310:7:43",
                                typeDescriptions: {}
                              }
                            },
                            id: 16938,
                            isConstant: false,
                            isLValue: false,
                            isPure: false,
                            kind: "typeConversion",
                            lValueRequested: false,
                            names: [],
                            nodeType: "FunctionCall",
                            src: "7310:47:43",
                            tryCall: false,
                            typeDescriptions: {
                              typeIdentifier: "t_uint256",
                              typeString: "uint256"
                            }
                          },
                          src: "7305:52:43",
                          typeDescriptions: {
                            typeIdentifier: "t_uint256",
                            typeString: "uint256"
                          }
                        },
                        id: 16940,
                        nodeType: "ExpressionStatement",
                        src: "7305:52:43"
                      }
                    ]
                  },
                  condition: {
                    arguments: [
                      {
                        id: 16943,
                        name: "id",
                        nodeType: "Identifier",
                        overloadedDeclarations: [],
                        referencedDeclaration: 16924,
                        src: "7382:2:43",
                        typeDescriptions: {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: "t_uint256",
                          typeString: "uint256"
                        }
                      ],
                      id: 16942,
                      name: "hasEntity",
                      nodeType: "Identifier",
                      overloadedDeclarations: [],
                      referencedDeclaration: 16912,
                      src: "7372:9:43",
                      typeDescriptions: {
                        typeIdentifier: "t_function_internal_view$_t_uint256_$returns$_t_bool_$",
                        typeString: "function (uint256) view returns (bool)"
                      }
                    },
                    id: 16944,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: "functionCall",
                    lValueRequested: false,
                    names: [],
                    nodeType: "FunctionCall",
                    src: "7372:13:43",
                    tryCall: false,
                    typeDescriptions: {
                      typeIdentifier: "t_bool",
                      typeString: "bool"
                    }
                  },
                  id: 16945,
                  nodeType: "DoWhileStatement",
                  src: "7275:112:43"
                },
                {
                  expression: {
                    id: 16946,
                    name: "id",
                    nodeType: "Identifier",
                    overloadedDeclarations: [],
                    referencedDeclaration: 16924,
                    src: "7400:2:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  functionReturnParameters: 16917,
                  id: 16947,
                  nodeType: "Return",
                  src: "7393:9:43"
                }
              ]
            },
            baseFunctions: [
              17385
            ],
            documentation: {
              id: 16913,
              nodeType: "StructuredDocumentation",
              src: "7107:42:43",
              text: " Get a new unique entity ID."
            },
            functionSelector: "614bfa6e",
            implemented: true,
            kind: "function",
            modifiers: [],
            name: "getUniqueEntityId",
            nameLocation: "7161:17:43",
            parameters: {
              id: 16914,
              nodeType: "ParameterList",
              parameters: [],
              src: "7178:2:43"
            },
            returnParameters: {
              id: 16917,
              nodeType: "ParameterList",
              parameters: [
                {
                  constant: false,
                  id: 16916,
                  mutability: "mutable",
                  name: "",
                  nameLocation: "-1:-1:-1",
                  nodeType: "VariableDeclaration",
                  scope: 16949,
                  src: "7202:7:43",
                  stateVariable: false,
                  storageLocation: "default",
                  typeDescriptions: {
                    typeIdentifier: "t_uint256",
                    typeString: "uint256"
                  },
                  typeName: {
                    id: 16915,
                    name: "uint256",
                    nodeType: "ElementaryTypeName",
                    src: "7202:7:43",
                    typeDescriptions: {
                      typeIdentifier: "t_uint256",
                      typeString: "uint256"
                    }
                  },
                  visibility: "internal"
                }
              ],
              src: "7201:9:43"
            },
            scope: 16950,
            stateMutability: "view",
            virtual: false,
            visibility: "public"
          }
        ],
        abstract: false,
        baseContracts: [
          {
            baseName: {
              id: 16442,
              name: "IWorld",
              nodeType: "IdentifierPath",
              referencedDeclaration: 17399,
              src: "1615:6:43"
            },
            id: 16443,
            nodeType: "InheritanceSpecifier",
            src: "1615:6:43"
          }
        ],
        canonicalName: "World",
        contractDependencies: [
          16225,
          17073,
          17658
        ],
        contractKind: "contract",
        documentation: {
          id: 16441,
          nodeType: "StructuredDocumentation",
          src: "695:901:43",
          text: " The `World` contract is at the core of every on-chain world.\n Entities, components and systems are registered in the `World`.\n Components register updates to their state via the `registerComponentValueSet`\n and `registerComponentValueRemoved` methods, which emit the `ComponentValueSet` and `ComponentValueRemoved` events respectively.\n Clients can reconstruct the entire state (of all components) by listening to\n these two events, instead of having to add a separate getter or event listener\n for every type of data. (Have a look at the MUD network package for a TypeScript\n implementation of contract/client state sync.)\n The `World` is an ownerless and permissionless contract.\n Anyone can register new components and systems in the world (via the `registerComponent` and `registerSystem` methods).\n Clients decide which components and systems they care about."
        },
        fullyImplemented: true,
        linearizedBaseContracts: [
          16950,
          17399
        ],
        name: "World",
        nameLocation: "1606:5:43",
        scope: 16951,
        usedErrors: []
      }
    ],
    license: "MIT"
  },
  id: 43
};

// src/commands/deprecated/trace.ts
import path3 from "path";
var commandModule7 = {
  command: "trace",
  describe: "Display the trace of a transaction",
  builder(yargs2) {
    return yargs2.options({
      config: { type: "string", description: "path to mud deploy config (deploy.json)" },
      world: { type: "string", required: true, description: "world contract address" },
      tx: { type: "string", required: true, description: "tx hash to replay" },
      rpc: { type: "string", description: "json rpc endpoint, defaults to http://localhost:8545" },
      debug: { type: "boolean", description: "open debugger" }
    });
  },
  async handler({ config: config2, world, rpc, tx, debug }) {
    const wd = process.cwd();
    const deployData = config2 && JSON.parse(readFileSync(config2, { encoding: "utf8" }));
    const labels = [];
    const rpcUrl = rpc || "http://localhost:8545";
    const provider = new JsonRpcProvider(rpcUrl);
    const World = new Contract(world, World_default.abi, provider);
    if (deployData) {
      const srcDir = await getSrcDirectory();
      const componentPromises = deployData.components.map(async (component) => {
        const filePath = path3.join(wd, srcDir, componentsDir, `${component}.sol`);
        const id = extractIdFromFile(filePath);
        if (!id)
          return;
        const address = await World.getComponent(keccak256(id));
        return [component, address];
      });
      const systemPromises = deployData.systems.map(async (system) => {
        const filePath = path3.join(wd, srcDir, systemsDir, `${system.name}.sol`);
        const id = extractIdFromFile(filePath);
        if (!id)
          return;
        const address = await World.getSystemAddress(keccak256(id));
        return [system.name, address];
      });
      const components = await Promise.all(componentPromises);
      const systems = await Promise.all(systemPromises);
      labels.push(...components, ...systems);
    }
    await execLog("cast", [
      "run",
      ...labels.map((label) => ["--label", `${label[1]}:${label[0]}`]).flat(),
      ...debug ? ["--debug"] : [],
      `--rpc-url`,
      `${rpcUrl}`,
      `${tx}`
    ]);
    process.exit(0);
  }
};
var trace_default = commandModule7;

// src/commands/deprecated/types.ts
var commandModule8 = {
  command: "types",
  describe: "Generates typescript types for contracts and systems.",
  builder(yargs2) {
    return yargs2.options({
      abiDir: {
        type: "string",
        description: "Input directory of existing ABI to use to generate types. If not provided, contracts are built."
      },
      outputDir: {
        type: "string",
        description: "Output directory for generated types. Defaults to ./types",
        default: "./types"
      }
    });
  },
  async handler({ abiDir, outputDir }) {
    await generateTypes(abiDir, outputDir, { clear: true });
  }
};
var types_default = commandModule8;

// src/commands/devnode.ts
import { rmSync } from "fs";
import { homedir } from "os";
import path4 from "path";
var commandModule9 = {
  command: "devnode",
  describe: "Start a local Ethereum node for development",
  builder(yargs2) {
    return yargs2.options({
      blocktime: { type: "number", default: 1, decs: "Interval in which new blocks are produced" }
    });
  },
  async handler({ blocktime }) {
    console.log("Clearing devnode history");
    const userHomeDir = homedir();
    rmSync(path4.join(userHomeDir, ".foundry", "anvil", "tmp"), { recursive: true, force: true });
    const child = execLog("anvil", ["-b", String(blocktime), "--block-base-fee-per-gas", "0"]);
    process.on("SIGINT", () => {
      console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
      child.kill();
      process.exit();
    });
    await child;
  }
};
var devnode_default = commandModule9;

// ../services/node_modules/long/index.js
var wasm = null;
try {
  wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    13,
    2,
    96,
    0,
    1,
    127,
    96,
    4,
    127,
    127,
    127,
    127,
    1,
    127,
    3,
    7,
    6,
    0,
    1,
    1,
    1,
    1,
    1,
    6,
    6,
    1,
    127,
    1,
    65,
    0,
    11,
    7,
    50,
    6,
    3,
    109,
    117,
    108,
    0,
    1,
    5,
    100,
    105,
    118,
    95,
    115,
    0,
    2,
    5,
    100,
    105,
    118,
    95,
    117,
    0,
    3,
    5,
    114,
    101,
    109,
    95,
    115,
    0,
    4,
    5,
    114,
    101,
    109,
    95,
    117,
    0,
    5,
    8,
    103,
    101,
    116,
    95,
    104,
    105,
    103,
    104,
    0,
    0,
    10,
    191,
    1,
    6,
    4,
    0,
    35,
    0,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    126,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    127,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    128,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    129,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    130,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11
  ])), {}).exports;
} catch (e) {
}
function Long(low, high, unsigned) {
  this.low = low | 0;
  this.high = high | 0;
  this.unsigned = !!unsigned;
}
Long.prototype.__isLong__;
Object.defineProperty(Long.prototype, "__isLong__", { value: true });
function isLong(obj) {
  return (obj && obj["__isLong__"]) === true;
}
function ctz32(value) {
  var c = Math.clz32(value & -value);
  return value ? 31 - c : c;
}
Long.isLong = isLong;
var INT_CACHE = {};
var UINT_CACHE = {};
function fromInt(value, unsigned) {
  var obj, cachedObj, cache;
  if (unsigned) {
    value >>>= 0;
    if (cache = 0 <= value && value < 256) {
      cachedObj = UINT_CACHE[value];
      if (cachedObj)
        return cachedObj;
    }
    obj = fromBits(value, 0, true);
    if (cache)
      UINT_CACHE[value] = obj;
    return obj;
  } else {
    value |= 0;
    if (cache = -128 <= value && value < 128) {
      cachedObj = INT_CACHE[value];
      if (cachedObj)
        return cachedObj;
    }
    obj = fromBits(value, value < 0 ? -1 : 0, false);
    if (cache)
      INT_CACHE[value] = obj;
    return obj;
  }
}
Long.fromInt = fromInt;
function fromNumber(value, unsigned) {
  if (isNaN(value))
    return unsigned ? UZERO : ZERO;
  if (unsigned) {
    if (value < 0)
      return UZERO;
    if (value >= TWO_PWR_64_DBL)
      return MAX_UNSIGNED_VALUE;
  } else {
    if (value <= -TWO_PWR_63_DBL)
      return MIN_VALUE;
    if (value + 1 >= TWO_PWR_63_DBL)
      return MAX_VALUE;
  }
  if (value < 0)
    return fromNumber(-value, unsigned).neg();
  return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
}
Long.fromNumber = fromNumber;
function fromBits(lowBits, highBits, unsigned) {
  return new Long(lowBits, highBits, unsigned);
}
Long.fromBits = fromBits;
var pow_dbl = Math.pow;
function fromString(str, unsigned, radix) {
  if (str.length === 0)
    throw Error("empty string");
  if (typeof unsigned === "number") {
    radix = unsigned;
    unsigned = false;
  } else {
    unsigned = !!unsigned;
  }
  if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
    return unsigned ? UZERO : ZERO;
  radix = radix || 10;
  if (radix < 2 || 36 < radix)
    throw RangeError("radix");
  var p;
  if ((p = str.indexOf("-")) > 0)
    throw Error("interior hyphen");
  else if (p === 0) {
    return fromString(str.substring(1), unsigned, radix).neg();
  }
  var radixToPower = fromNumber(pow_dbl(radix, 8));
  var result = ZERO;
  for (var i = 0; i < str.length; i += 8) {
    var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      var power = fromNumber(pow_dbl(radix, size));
      result = result.mul(power).add(fromNumber(value));
    } else {
      result = result.mul(radixToPower);
      result = result.add(fromNumber(value));
    }
  }
  result.unsigned = unsigned;
  return result;
}
Long.fromString = fromString;
function fromValue(val, unsigned) {
  if (typeof val === "number")
    return fromNumber(val, unsigned);
  if (typeof val === "string")
    return fromString(val, unsigned);
  return fromBits(val.low, val.high, typeof unsigned === "boolean" ? unsigned : val.unsigned);
}
Long.fromValue = fromValue;
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
var ZERO = fromInt(0);
Long.ZERO = ZERO;
var UZERO = fromInt(0, true);
Long.UZERO = UZERO;
var ONE = fromInt(1);
Long.ONE = ONE;
var UONE = fromInt(1, true);
Long.UONE = UONE;
var NEG_ONE = fromInt(-1);
Long.NEG_ONE = NEG_ONE;
var MAX_VALUE = fromBits(4294967295 | 0, 2147483647 | 0, false);
Long.MAX_VALUE = MAX_VALUE;
var MAX_UNSIGNED_VALUE = fromBits(4294967295 | 0, 4294967295 | 0, true);
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
var MIN_VALUE = fromBits(0, 2147483648 | 0, false);
Long.MIN_VALUE = MIN_VALUE;
var LongPrototype = Long.prototype;
LongPrototype.toInt = function toInt() {
  return this.unsigned ? this.low >>> 0 : this.low;
};
LongPrototype.toNumber = function toNumber() {
  if (this.unsigned)
    return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
  return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};
LongPrototype.toString = function toString(radix) {
  radix = radix || 10;
  if (radix < 2 || 36 < radix)
    throw RangeError("radix");
  if (this.isZero())
    return "0";
  if (this.isNegative()) {
    if (this.eq(MIN_VALUE)) {
      var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
      return div.toString(radix) + rem1.toInt().toString(radix);
    } else
      return "-" + this.neg().toString(radix);
  }
  var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
  var result = "";
  while (true) {
    var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
    rem = remDiv;
    if (rem.isZero())
      return digits + result;
    else {
      while (digits.length < 6)
        digits = "0" + digits;
      result = "" + digits + result;
    }
  }
};
LongPrototype.getHighBits = function getHighBits() {
  return this.high;
};
LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
  return this.high >>> 0;
};
LongPrototype.getLowBits = function getLowBits() {
  return this.low;
};
LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
  return this.low >>> 0;
};
LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
  if (this.isNegative())
    return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
  var val = this.high != 0 ? this.high : this.low;
  for (var bit = 31; bit > 0; bit--)
    if ((val & 1 << bit) != 0)
      break;
  return this.high != 0 ? bit + 33 : bit + 1;
};
LongPrototype.isZero = function isZero() {
  return this.high === 0 && this.low === 0;
};
LongPrototype.eqz = LongPrototype.isZero;
LongPrototype.isNegative = function isNegative() {
  return !this.unsigned && this.high < 0;
};
LongPrototype.isPositive = function isPositive() {
  return this.unsigned || this.high >= 0;
};
LongPrototype.isOdd = function isOdd() {
  return (this.low & 1) === 1;
};
LongPrototype.isEven = function isEven() {
  return (this.low & 1) === 0;
};
LongPrototype.equals = function equals(other) {
  if (!isLong(other))
    other = fromValue(other);
  if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
    return false;
  return this.high === other.high && this.low === other.low;
};
LongPrototype.eq = LongPrototype.equals;
LongPrototype.notEquals = function notEquals(other) {
  return !this.eq(
    /* validates */
    other
  );
};
LongPrototype.neq = LongPrototype.notEquals;
LongPrototype.ne = LongPrototype.notEquals;
LongPrototype.lessThan = function lessThan(other) {
  return this.comp(
    /* validates */
    other
  ) < 0;
};
LongPrototype.lt = LongPrototype.lessThan;
LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
  return this.comp(
    /* validates */
    other
  ) <= 0;
};
LongPrototype.lte = LongPrototype.lessThanOrEqual;
LongPrototype.le = LongPrototype.lessThanOrEqual;
LongPrototype.greaterThan = function greaterThan(other) {
  return this.comp(
    /* validates */
    other
  ) > 0;
};
LongPrototype.gt = LongPrototype.greaterThan;
LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
  return this.comp(
    /* validates */
    other
  ) >= 0;
};
LongPrototype.gte = LongPrototype.greaterThanOrEqual;
LongPrototype.ge = LongPrototype.greaterThanOrEqual;
LongPrototype.compare = function compare(other) {
  if (!isLong(other))
    other = fromValue(other);
  if (this.eq(other))
    return 0;
  var thisNeg = this.isNegative(), otherNeg = other.isNegative();
  if (thisNeg && !otherNeg)
    return -1;
  if (!thisNeg && otherNeg)
    return 1;
  if (!this.unsigned)
    return this.sub(other).isNegative() ? -1 : 1;
  return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
};
LongPrototype.comp = LongPrototype.compare;
LongPrototype.negate = function negate() {
  if (!this.unsigned && this.eq(MIN_VALUE))
    return MIN_VALUE;
  return this.not().add(ONE);
};
LongPrototype.neg = LongPrototype.negate;
LongPrototype.add = function add(addend) {
  if (!isLong(addend))
    addend = fromValue(addend);
  var a48 = this.high >>> 16;
  var a32 = this.high & 65535;
  var a16 = this.low >>> 16;
  var a00 = this.low & 65535;
  var b48 = addend.high >>> 16;
  var b32 = addend.high & 65535;
  var b16 = addend.low >>> 16;
  var b00 = addend.low & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 + b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 + b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 + b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 + b48;
  c48 &= 65535;
  return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
};
LongPrototype.subtract = function subtract(subtrahend) {
  if (!isLong(subtrahend))
    subtrahend = fromValue(subtrahend);
  return this.add(subtrahend.neg());
};
LongPrototype.sub = LongPrototype.subtract;
LongPrototype.multiply = function multiply(multiplier) {
  if (this.isZero())
    return this;
  if (!isLong(multiplier))
    multiplier = fromValue(multiplier);
  if (wasm) {
    var low = wasm["mul"](
      this.low,
      this.high,
      multiplier.low,
      multiplier.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  if (multiplier.isZero())
    return this.unsigned ? UZERO : ZERO;
  if (this.eq(MIN_VALUE))
    return multiplier.isOdd() ? MIN_VALUE : ZERO;
  if (multiplier.eq(MIN_VALUE))
    return this.isOdd() ? MIN_VALUE : ZERO;
  if (this.isNegative()) {
    if (multiplier.isNegative())
      return this.neg().mul(multiplier.neg());
    else
      return this.neg().mul(multiplier).neg();
  } else if (multiplier.isNegative())
    return this.mul(multiplier.neg()).neg();
  if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
    return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
  var a48 = this.high >>> 16;
  var a32 = this.high & 65535;
  var a16 = this.low >>> 16;
  var a00 = this.low & 65535;
  var b48 = multiplier.high >>> 16;
  var b32 = multiplier.high & 65535;
  var b16 = multiplier.low >>> 16;
  var b00 = multiplier.low & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 65535;
  return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
};
LongPrototype.mul = LongPrototype.multiply;
LongPrototype.divide = function divide(divisor) {
  if (!isLong(divisor))
    divisor = fromValue(divisor);
  if (divisor.isZero())
    throw Error("division by zero");
  if (wasm) {
    if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
      return this;
    }
    var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  if (this.isZero())
    return this.unsigned ? UZERO : ZERO;
  var approx, rem, res;
  if (!this.unsigned) {
    if (this.eq(MIN_VALUE)) {
      if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
        return MIN_VALUE;
      else if (divisor.eq(MIN_VALUE))
        return ONE;
      else {
        var halfThis = this.shr(1);
        approx = halfThis.div(divisor).shl(1);
        if (approx.eq(ZERO)) {
          return divisor.isNegative() ? ONE : NEG_ONE;
        } else {
          rem = this.sub(divisor.mul(approx));
          res = approx.add(rem.div(divisor));
          return res;
        }
      }
    } else if (divisor.eq(MIN_VALUE))
      return this.unsigned ? UZERO : ZERO;
    if (this.isNegative()) {
      if (divisor.isNegative())
        return this.neg().div(divisor.neg());
      return this.neg().div(divisor).neg();
    } else if (divisor.isNegative())
      return this.div(divisor.neg()).neg();
    res = ZERO;
  } else {
    if (!divisor.unsigned)
      divisor = divisor.toUnsigned();
    if (divisor.gt(this))
      return UZERO;
    if (divisor.gt(this.shru(1)))
      return UONE;
    res = UZERO;
  }
  rem = this;
  while (rem.gte(divisor)) {
    approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
    var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
    while (approxRem.isNegative() || approxRem.gt(rem)) {
      approx -= delta;
      approxRes = fromNumber(approx, this.unsigned);
      approxRem = approxRes.mul(divisor);
    }
    if (approxRes.isZero())
      approxRes = ONE;
    res = res.add(approxRes);
    rem = rem.sub(approxRem);
  }
  return res;
};
LongPrototype.div = LongPrototype.divide;
LongPrototype.modulo = function modulo(divisor) {
  if (!isLong(divisor))
    divisor = fromValue(divisor);
  if (wasm) {
    var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  return this.sub(this.div(divisor).mul(divisor));
};
LongPrototype.mod = LongPrototype.modulo;
LongPrototype.rem = LongPrototype.modulo;
LongPrototype.not = function not() {
  return fromBits(~this.low, ~this.high, this.unsigned);
};
LongPrototype.countLeadingZeros = function countLeadingZeros() {
  return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
};
LongPrototype.clz = LongPrototype.countLeadingZeros;
LongPrototype.countTrailingZeros = function countTrailingZeros() {
  return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
};
LongPrototype.ctz = LongPrototype.countTrailingZeros;
LongPrototype.and = function and(other) {
  if (!isLong(other))
    other = fromValue(other);
  return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
};
LongPrototype.or = function or(other) {
  if (!isLong(other))
    other = fromValue(other);
  return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
};
LongPrototype.xor = function xor(other) {
  if (!isLong(other))
    other = fromValue(other);
  return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
};
LongPrototype.shiftLeft = function shiftLeft(numBits) {
  if (isLong(numBits))
    numBits = numBits.toInt();
  if ((numBits &= 63) === 0)
    return this;
  else if (numBits < 32)
    return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);
  else
    return fromBits(0, this.low << numBits - 32, this.unsigned);
};
LongPrototype.shl = LongPrototype.shiftLeft;
LongPrototype.shiftRight = function shiftRight(numBits) {
  if (isLong(numBits))
    numBits = numBits.toInt();
  if ((numBits &= 63) === 0)
    return this;
  else if (numBits < 32)
    return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);
  else
    return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
};
LongPrototype.shr = LongPrototype.shiftRight;
LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
  if (isLong(numBits))
    numBits = numBits.toInt();
  if ((numBits &= 63) === 0)
    return this;
  if (numBits < 32)
    return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >>> numBits, this.unsigned);
  if (numBits === 32)
    return fromBits(this.high, 0, this.unsigned);
  return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
};
LongPrototype.shru = LongPrototype.shiftRightUnsigned;
LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
LongPrototype.rotateLeft = function rotateLeft(numBits) {
  var b;
  if (isLong(numBits))
    numBits = numBits.toInt();
  if ((numBits &= 63) === 0)
    return this;
  if (numBits === 32)
    return fromBits(this.high, this.low, this.unsigned);
  if (numBits < 32) {
    b = 32 - numBits;
    return fromBits(this.low << numBits | this.high >>> b, this.high << numBits | this.low >>> b, this.unsigned);
  }
  numBits -= 32;
  b = 32 - numBits;
  return fromBits(this.high << numBits | this.low >>> b, this.low << numBits | this.high >>> b, this.unsigned);
};
LongPrototype.rotl = LongPrototype.rotateLeft;
LongPrototype.rotateRight = function rotateRight(numBits) {
  var b;
  if (isLong(numBits))
    numBits = numBits.toInt();
  if ((numBits &= 63) === 0)
    return this;
  if (numBits === 32)
    return fromBits(this.high, this.low, this.unsigned);
  if (numBits < 32) {
    b = 32 - numBits;
    return fromBits(this.high << b | this.low >>> numBits, this.low << b | this.high >>> numBits, this.unsigned);
  }
  numBits -= 32;
  b = 32 - numBits;
  return fromBits(this.low << b | this.high >>> numBits, this.high << b | this.low >>> numBits, this.unsigned);
};
LongPrototype.rotr = LongPrototype.rotateRight;
LongPrototype.toSigned = function toSigned() {
  if (!this.unsigned)
    return this;
  return fromBits(this.low, this.high, false);
};
LongPrototype.toUnsigned = function toUnsigned() {
  if (this.unsigned)
    return this;
  return fromBits(this.low, this.high, true);
};
LongPrototype.toBytes = function toBytes(le) {
  return le ? this.toBytesLE() : this.toBytesBE();
};
LongPrototype.toBytesLE = function toBytesLE() {
  var hi = this.high, lo = this.low;
  return [
    lo & 255,
    lo >>> 8 & 255,
    lo >>> 16 & 255,
    lo >>> 24,
    hi & 255,
    hi >>> 8 & 255,
    hi >>> 16 & 255,
    hi >>> 24
  ];
};
LongPrototype.toBytesBE = function toBytesBE() {
  var hi = this.high, lo = this.low;
  return [
    hi >>> 24,
    hi >>> 16 & 255,
    hi >>> 8 & 255,
    hi & 255,
    lo >>> 24,
    lo >>> 16 & 255,
    lo >>> 8 & 255,
    lo & 255
  ];
};
Long.fromBytes = function fromBytes(bytes, unsigned, le) {
  return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
};
Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
  return new Long(
    bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
    bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24,
    unsigned
  );
};
Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
  return new Long(
    bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
    bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3],
    unsigned
  );
};
var long_default = Long;

// ../services/protobuf/ts/faucet/faucet.ts
var import_minimal = __toESM(require_minimal2(), 1);
function createBaseLinkedTwitterPair() {
  return { username: "", address: "" };
}
var LinkedTwitterPair = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseLinkedTwitterPair();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseDripRequest() {
  return { username: "", address: "" };
}
var DripRequest = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDripRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseDripRequest();
    message.username = object.username ?? "";
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseDripDevRequest() {
  return { address: "" };
}
var DripDevRequest = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDripDevRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseDripDevRequest();
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseDripResponse() {
  return { dripTxHash: "", ecsTxHash: "" };
}
var DripResponse = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.dripTxHash !== "") {
      writer.uint32(10).string(message.dripTxHash);
    }
    if (message.ecsTxHash !== "") {
      writer.uint32(18).string(message.ecsTxHash);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDripResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.dripTxHash = reader.string();
          break;
        case 2:
          message.ecsTxHash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseDripResponse();
    message.dripTxHash = object.dripTxHash ?? "";
    message.ecsTxHash = object.ecsTxHash ?? "";
    return message;
  }
};
function createBaseTimeUntilDripResponse() {
  return { timeUntilDripMinutes: 0, timeUntilDripSeconds: 0 };
}
var TimeUntilDripResponse = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.timeUntilDripMinutes !== 0) {
      writer.uint32(9).double(message.timeUntilDripMinutes);
    }
    if (message.timeUntilDripSeconds !== 0) {
      writer.uint32(17).double(message.timeUntilDripSeconds);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseTimeUntilDripResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timeUntilDripMinutes = reader.double();
          break;
        case 2:
          message.timeUntilDripSeconds = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseTimeUntilDripResponse();
    message.timeUntilDripMinutes = object.timeUntilDripMinutes ?? 0;
    message.timeUntilDripSeconds = object.timeUntilDripSeconds ?? 0;
    return message;
  }
};
function createBaseGetLinkedTwittersRequest() {
  return {};
}
var GetLinkedTwittersRequest = {
  encode(_, writer = import_minimal.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGetLinkedTwittersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_) {
    const message = createBaseGetLinkedTwittersRequest();
    return message;
  }
};
function createBaseGetLinkedTwittersResponse() {
  return { linkedTwitters: [] };
}
var GetLinkedTwittersResponse = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.linkedTwitters) {
      LinkedTwitterPair.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGetLinkedTwittersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.linkedTwitters.push(LinkedTwitterPair.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseGetLinkedTwittersResponse();
    message.linkedTwitters = object.linkedTwitters?.map((e) => LinkedTwitterPair.fromPartial(e)) || [];
    return message;
  }
};
function createBaseLinkedTwitterForAddressRequest() {
  return { address: "" };
}
var LinkedTwitterForAddressRequest = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterForAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseLinkedTwitterForAddressRequest();
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseLinkedTwitterForAddressResponse() {
  return { username: "" };
}
var LinkedTwitterForAddressResponse = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedTwitterForAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseLinkedTwitterForAddressResponse();
    message.username = object.username ?? "";
    return message;
  }
};
function createBaseLinkedAddressForTwitterRequest() {
  return { username: "" };
}
var LinkedAddressForTwitterRequest = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedAddressForTwitterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseLinkedAddressForTwitterRequest();
    message.username = object.username ?? "";
    return message;
  }
};
function createBaseLinkedAddressForTwitterResponse() {
  return { address: "" };
}
var LinkedAddressForTwitterResponse = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseLinkedAddressForTwitterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseLinkedAddressForTwitterResponse();
    message.address = object.address ?? "";
    return message;
  }
};
function createBaseSetLinkedTwitterRequest() {
  return { address: "", username: "", signature: "" };
}
var SetLinkedTwitterRequest = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.username !== "") {
      writer.uint32(18).string(message.username);
    }
    if (message.signature !== "") {
      writer.uint32(26).string(message.signature);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetLinkedTwitterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.username = reader.string();
          break;
        case 3:
          message.signature = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object) {
    const message = createBaseSetLinkedTwitterRequest();
    message.address = object.address ?? "";
    message.username = object.username ?? "";
    message.signature = object.signature ?? "";
    return message;
  }
};
function createBaseSetLinkedTwitterResponse() {
  return {};
}
var SetLinkedTwitterResponse = {
  encode(_, writer = import_minimal.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : new import_minimal.default.Reader(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetLinkedTwitterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_) {
    const message = createBaseSetLinkedTwitterResponse();
    return message;
  }
};
var FaucetServiceDefinition = {
  name: "FaucetService",
  fullName: "faucet.FaucetService",
  methods: {
    drip: {
      name: "Drip",
      requestType: DripRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {}
    },
    dripDev: {
      name: "DripDev",
      requestType: DripDevRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {}
    },
    dripVerifyTweet: {
      name: "DripVerifyTweet",
      requestType: DripRequest,
      requestStream: false,
      responseType: DripResponse,
      responseStream: false,
      options: {}
    },
    timeUntilDrip: {
      name: "TimeUntilDrip",
      requestType: DripRequest,
      requestStream: false,
      responseType: TimeUntilDripResponse,
      responseStream: false,
      options: {}
    },
    getLinkedTwitters: {
      name: "GetLinkedTwitters",
      requestType: GetLinkedTwittersRequest,
      requestStream: false,
      responseType: GetLinkedTwittersResponse,
      responseStream: false,
      options: {}
    },
    getLinkedTwitterForAddress: {
      name: "GetLinkedTwitterForAddress",
      requestType: LinkedTwitterForAddressRequest,
      requestStream: false,
      responseType: LinkedTwitterForAddressResponse,
      responseStream: false,
      options: {}
    },
    getLinkedAddressForTwitter: {
      name: "GetLinkedAddressForTwitter",
      requestType: LinkedAddressForTwitterRequest,
      requestStream: false,
      responseType: LinkedAddressForTwitterResponse,
      responseStream: false,
      options: {}
    },
    /** Admin utility endpoints for modifying state. Requires a signature with faucet private key. */
    setLinkedTwitter: {
      name: "SetLinkedTwitter",
      requestType: SetLinkedTwitterRequest,
      requestStream: false,
      responseType: SetLinkedTwitterResponse,
      responseStream: false,
      options: {}
    }
  }
};
var globalThis = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();
if (import_minimal.default.util.Long !== long_default) {
  import_minimal.default.util.Long = long_default;
  import_minimal.default.configure();
}

// src/commands/faucet.ts
import { createChannel, createClient } from "nice-grpc-web";
import chalk2 from "chalk";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
function createFaucetService(url) {
  return createClient(FaucetServiceDefinition, createChannel(url, NodeHttpTransport()));
}
var commandModule10 = {
  command: "faucet",
  describe: "Interact with a MUD faucet",
  builder(yargs2) {
    return yargs2.options({
      dripDev: {
        type: "boolean",
        desc: "Request a drip from the dev endpoint (requires faucet to have dev mode enabled)",
        default: true
      },
      faucetUrl: {
        type: "string",
        desc: "URL of the MUD faucet",
        default: "https://faucet.testnet-mud-services.linfra.xyz"
      },
      address: {
        type: "string",
        desc: "Ethereum address to fund",
        required: true
      }
    });
  },
  async handler({ dripDev, faucetUrl, address }) {
    const faucet = createFaucetService(faucetUrl);
    if (dripDev) {
      console.log(chalk2.yellow("Dripping to", address));
      await faucet.dripDev({ address });
      console.log(chalk2.yellow("Success"));
    }
    process.exit(0);
  }
};
var faucet_default = commandModule10;

// src/commands/gas-report.ts
import { readFileSync as readFileSync2, writeFileSync, rmSync as rmSync2 } from "fs";
import { execa as execa2 } from "execa";
import chalk3 from "chalk";
import { table, getBorderCharacters } from "table";
var commandModule11 = {
  command: "gas-report",
  describe: "Create a gas report",
  builder(yargs2) {
    return yargs2.options({
      path: { type: "array", string: true, default: ["Gas.t.sol"], desc: "File containing the gas tests" },
      save: { type: "string", desc: "Save the gas report to a file" },
      compare: { type: "string", desc: "Compare to an existing gas report" }
    });
  },
  async handler({ path: path12, save, compare: compare2 }) {
    let gasReport = [];
    for (const file of path12) {
      gasReport = gasReport.concat(await runGasReport(file));
    }
    const compareGasReport = [];
    if (compare2) {
      try {
        const compareFileContents = readFileSync2(compare2, "utf8");
        const compareGasReportRegex = new RegExp(/\((.*)\) \| (.*) \[(.*)\]: (.*)/g);
        let compareGasReportMatch;
        while ((compareGasReportMatch = compareGasReportRegex.exec(compareFileContents)) !== null) {
          const source = compareGasReportMatch[1];
          const name = compareGasReportMatch[2];
          const functionCall = compareGasReportMatch[3];
          const gasUsed = compareGasReportMatch[4];
          compareGasReport.push({ source, name, functionCall, gasUsed: parseInt(gasUsed) });
        }
      } catch {
        console.log(chalk3.red(`Gas report to compare not found: ${compare2}`));
        compare2 = void 0;
      }
    }
    gasReport = gasReport.map((entry) => {
      const prevEntry = compareGasReport.find((e) => e.name === entry.name && e.functionCall === entry.functionCall);
      return { ...entry, prevGasUsed: prevEntry?.gasUsed };
    });
    printGasReport(gasReport, compare2);
    if (save)
      saveGasReport(gasReport, save);
    process.exit(0);
  }
};
var gas_report_default = commandModule11;
async function runGasReport(path12) {
  if (!path12.endsWith(".t.sol")) {
    console.log("Skipping gas report for", chalk3.bold(path12), "(not a test file)");
    return [];
  }
  console.log("Running gas report for", chalk3.bold(path12));
  const gasReport = [];
  const fileContents = readFileSync2(path12, "utf8");
  let newFile = fileContents;
  const functionRegex = new RegExp(/function (.*){/g);
  let functionMatch;
  while ((functionMatch = functionRegex.exec(fileContents)) !== null) {
    const functionSignature = functionMatch[0];
    newFile = newFile.replace(functionSignature, `${functionSignature}
uint256 _gasreport;`);
  }
  const regex = new RegExp(/\/\/ !gasreport (.*)\n(.*)/g);
  let match;
  while ((match = regex.exec(fileContents)) !== null) {
    const name = match[1];
    const functionCall = match[2].trim();
    newFile = newFile.replace(
      match[0],
      `
_gasreport = gasleft();
${functionCall}
_gasreport = _gasreport - gasleft();
console.log("GAS REPORT: ${name} [${functionCall.replaceAll('"', '\\"')}]:", _gasreport);`
    );
  }
  newFile = newFile.replace(/pure/g, "view");
  const tempFileName = path12.replace(/\.t\.sol$/, "MudGasReport.t.sol");
  writeFileSync(tempFileName, newFile);
  const child = execa2("forge", ["test", "--match-path", tempFileName, "-vvv"], {
    stdio: ["inherit", "pipe", "inherit"]
  });
  let logs = "";
  try {
    logs = (await child).stdout;
    rmSync2(tempFileName);
  } catch (e) {
    console.log(e.stdout ?? e);
    console.log(chalk3.red("\n-----------\nError while running the gas report (see above)"));
    rmSync2(tempFileName);
    process.exit();
  }
  const gasReportRegex = new RegExp(/GAS REPORT: (.*) \[(.*)\]: (.*)/g);
  let gasReportMatch;
  while ((gasReportMatch = gasReportRegex.exec(logs)) !== null) {
    const name = gasReportMatch[1];
    const functionCall = gasReportMatch[2].replace(";", "");
    const gasUsed = gasReportMatch[3];
    gasReport.push({ source: path12, name, functionCall, gasUsed: parseInt(gasUsed) });
  }
  return gasReport;
}
function printGasReport(gasReport, compare2) {
  if (compare2)
    console.log(chalk3.bold(`Gas report compared to ${compare2}`));
  const headers = [
    chalk3.bold("Source"),
    chalk3.bold("Name"),
    chalk3.bold("Function call"),
    chalk3.bold("Gas used"),
    ...compare2 ? [chalk3.bold("Prev gas used"), chalk3.bold("Difference")] : []
  ];
  const values = gasReport.map((entry) => {
    const diff = entry.prevGasUsed ? entry.gasUsed - entry.prevGasUsed : 0;
    const diffEntry = diff > 0 ? chalk3.red(`+${diff}`) : diff < 0 ? chalk3.green(`${diff}`) : diff;
    const compareColumns = compare2 ? [entry.prevGasUsed ?? "n/a", diffEntry] : [];
    const gasUsedEntry = diff > 0 ? chalk3.red(entry.gasUsed) : diff < 0 ? chalk3.green(entry.gasUsed) : entry.gasUsed;
    return [entry.source, entry.name, entry.functionCall, gasUsedEntry, ...compareColumns];
  });
  const rows = [headers, ...values];
  console.log(table(rows, { border: getBorderCharacters("norc") }));
}
function saveGasReport(gasReport, path12) {
  console.log(chalk3.bold(`Saving gas report to ${path12}`));
  const serializedGasReport = gasReport.map((entry) => `(${entry.source}) | ${entry.name} [${entry.functionCall}]: ${entry.gasUsed}`).join("\n");
  writeFileSync(path12, serializedGasReport);
}

// src/commands/hello.ts
var commandModule12 = {
  command: "hello <name>",
  describe: "Greet <name> with Hello",
  builder(yargs2) {
    return yargs2.options({
      upper: { type: "boolean" }
    }).positional("name", { type: "string", demandOption: true });
  },
  handler({ name }) {
    const greeting = `Gm, ${name}!`;
    console.log(greeting);
    process.exit(0);
  }
};
var hello_default = commandModule12;

// src/render-solidity/tablegen.ts
import { mkdirSync, writeFileSync as writeFileSync2 } from "fs";
import path7 from "path";

// src/render-solidity/tableOptions.ts
import path5 from "path";
function getTableOptions(config2) {
  const storeImportPath = config2.storeImportPath;
  const options = [];
  for (const tableName of Object.keys(config2.tables)) {
    const tableData = config2.tables[tableName];
    const withStruct = tableData.dataStruct;
    const withRecordMethods = withStruct || Object.keys(tableData.schema).length > 1;
    const noFieldMethodSuffix = !withRecordMethods && Object.keys(tableData.schema).length === 1;
    const imports = [];
    const primaryKeys = Object.keys(tableData.primaryKeys).map((name) => {
      const abiOrUserType = tableData.primaryKeys[name];
      const { renderTableType } = resolveAbiOrUserType(abiOrUserType, config2);
      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config2);
      if (importDatum)
        imports.push(importDatum);
      if (renderTableType.isDynamic)
        throw new Error(`Parsing error: found dynamic primary key ${name} in table ${tableName}`);
      const primaryKey = {
        ...renderTableType,
        name,
        isDynamic: false
      };
      return primaryKey;
    });
    const fields = Object.keys(tableData.schema).map((name) => {
      const abiOrUserType = tableData.schema[name];
      const { renderTableType, schemaType } = resolveAbiOrUserType(abiOrUserType, config2);
      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config2);
      if (importDatum)
        imports.push(importDatum);
      const elementType = SchemaTypeArrayToElement[schemaType];
      const field = {
        ...renderTableType,
        arrayElement: elementType !== void 0 ? getSchemaTypeInfo(elementType) : void 0,
        name,
        methodNameSuffix: noFieldMethodSuffix ? "" : `${name[0].toUpperCase()}${name.slice(1)}`
      };
      return field;
    });
    const staticFields = fields.filter(({ isDynamic }) => !isDynamic);
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic);
    const staticResourceData = (() => {
      if (tableData.tableIdArgument) {
        return;
      } else {
        return {
          tableIdName: tableName + "TableId",
          namespace: config2.namespace,
          fileSelector: tableData.fileSelector
        };
      }
    })();
    options.push({
      outputPath: path5.join(tableData.directory, `${tableName}.sol`),
      tableName,
      renderOptions: {
        imports,
        libraryName: tableName,
        structName: withStruct ? tableName + "Data" : void 0,
        staticResourceData,
        storeImportPath,
        primaryKeys,
        fields,
        staticFields,
        dynamicFields,
        withRecordMethods,
        storeArgument: tableData.storeArgument
      }
    });
  }
  return options;
}

// src/render-solidity/common.ts
import path6 from "path";
var renderedSolidityHeader = `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/* Autogenerated file. Do not edit manually. */`;
function renderList(list, renderItem) {
  return internalRenderList("", list, renderItem);
}
function renderArguments(args) {
  const filteredArgs = args.filter((arg) => arg !== void 0 && arg !== "");
  return internalRenderList(",", filteredArgs, (arg) => arg);
}
function renderCommonData({
  staticResourceData,
  primaryKeys
}) {
  const _tableId = staticResourceData ? "" : "_tableId";
  const _typedTableId = staticResourceData ? "" : "uint256 _tableId";
  const _keyArgs = renderArguments(primaryKeys.map(({ name }) => name));
  const _typedKeyArgs = renderArguments(primaryKeys.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`));
  const _primaryKeysDefinition = `
    bytes32[] memory _primaryKeys = new bytes32[](${primaryKeys.length});
    ${renderList(
    primaryKeys,
    (primaryKey, index) => `_primaryKeys[${index}] = ${renderValueTypeToBytes32(primaryKey.name, primaryKey)};`
  )}
  `;
  return {
    _tableId,
    _typedTableId,
    _keyArgs,
    _typedKeyArgs,
    _primaryKeysDefinition
  };
}
function solidityRelativeImportPath(fromPath, usedInPath) {
  return "./" + path6.relative("./" + usedInPath, "./" + fromPath);
}
function renderImports(imports) {
  const aggregatedImports = /* @__PURE__ */ new Map();
  for (const { symbol, fromPath, usedInPath } of imports) {
    const path12 = solidityRelativeImportPath(fromPath, usedInPath);
    if (!aggregatedImports.has(path12)) {
      aggregatedImports.set(path12, /* @__PURE__ */ new Set());
    }
    aggregatedImports.get(path12)?.add(symbol);
  }
  const renderedImports = [];
  for (const [path12, symbols] of aggregatedImports) {
    const renderedSymbols = [...symbols].join(", ");
    renderedImports.push(`import { ${renderedSymbols} } from "${path12}";`);
  }
  return renderedImports.join("\n");
}
function renderWithStore(storeArgument, callback) {
  let result = "";
  result += callback(void 0, "StoreSwitch", "", void 0);
  if (storeArgument) {
    result += "\n" + callback("IStore _store", "_store", " (using the specified store)", "_store");
  }
  return result;
}
function renderTableId(staticResourceData) {
  const hardcodedTableId = `uint256(bytes32(abi.encodePacked(bytes16("${staticResourceData.namespace}"), bytes16("${staticResourceData.fileSelector}"))))`;
  const tableIdDefinition = `
    uint256 constant _tableId = ${hardcodedTableId};
    uint256 constant ${staticResourceData.tableIdName} = _tableId;
  `;
  return {
    hardcodedTableId,
    tableIdDefinition
  };
}
function renderValueTypeToBytes32(name, { staticByteLength, typeUnwrap, internalTypeId }) {
  const bits = staticByteLength * 8;
  const innerText = `${typeUnwrap}(${name})`;
  if (internalTypeId.match(/^uint\d{1,3}$/)) {
    return `bytes32(uint256(${innerText}))`;
  } else if (internalTypeId.match(/^int\d{1,3}$/)) {
    return `bytes32(uint256(uint${bits}(${innerText})))`;
  } else if (internalTypeId.match(/^bytes\d{1,2}$/)) {
    return `bytes32(${innerText})`;
  } else if (internalTypeId === "address") {
    return `bytes32(bytes20(${innerText}))`;
  } else if (internalTypeId === "bool") {
    return `_boolToBytes32(${innerText})`;
  } else {
    throw new Error(`Unknown value type id ${internalTypeId}`);
  }
}
function internalRenderList(lineTerminator, list, renderItem) {
  return list.map((item, index) => renderItem(item, index) + (index === list.length - 1 ? "" : lineTerminator)).join("\n");
}

// src/render-solidity/field.ts
function renderFieldMethods(options) {
  const storeArgument = options.storeArgument;
  const { _typedTableId, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);
  let result = "";
  for (const [index, field] of options.fields.entries()) {
    const _typedFieldName = `${field.typeWithLocation} ${field.name}`;
    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix) => `
      /** Get ${field.name}${_commentSuffix} */
      function get${field.methodNameSuffix}(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs
      ])}) internal view returns (${_typedFieldName}) {
        ${_primaryKeysDefinition}
        bytes memory _blob = ${_store}.getField(_tableId, _primaryKeys, ${index});
        return ${renderDecodeFieldSingle(field)};
      }
    `
    );
    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix) => `
      /** Set ${field.name}${_commentSuffix} */
      function set${field.methodNameSuffix}(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
        _typedFieldName
      ])}) internal {
        ${_primaryKeysDefinition}
        ${_store}.setField(_tableId, _primaryKeys, ${index}, ${renderEncodeField(field)});
      }
    `
    );
    if (field.isDynamic) {
      const portionData = fieldPortionData(field);
      result += renderWithStore(
        storeArgument,
        (_typedStore, _store, _commentSuffix) => `
        /** Push ${portionData.title} to ${field.name}${_commentSuffix} */
        function push${field.methodNameSuffix}(${renderArguments([
          _typedStore,
          _typedTableId,
          _typedKeyArgs,
          `${portionData.typeWithLocation} ${portionData.name}`
        ])}) internal {
          ${_primaryKeysDefinition}
          ${_store}.pushToField(_tableId, _primaryKeys, ${index}, ${portionData.encoded});
        }
      `
      );
    }
  }
  return result;
}
function renderEncodeField(field) {
  let func;
  if (field.arrayElement) {
    func = "EncodeArray.encode";
  } else if (field.isDynamic) {
    func = "bytes";
  } else {
    func = "abi.encodePacked";
  }
  return `${func}(${field.typeUnwrap}(${field.name}))`;
}
function renderDecodeValueType(field, offset) {
  const { staticByteLength, internalTypeId } = field;
  const innerSlice = `Bytes.slice${staticByteLength}(_blob, ${offset})`;
  const bits = staticByteLength * 8;
  let result;
  if (internalTypeId.match(/^uint\d{1,3}$/) || internalTypeId === "address") {
    result = `${internalTypeId}(${innerSlice})`;
  } else if (internalTypeId.match(/^int\d{1,3}$/)) {
    result = `${internalTypeId}(uint${bits}(${innerSlice}))`;
  } else if (internalTypeId.match(/^bytes\d{1,2}$/)) {
    result = innerSlice;
  } else if (internalTypeId === "bool") {
    result = `_toBool(uint8(${innerSlice}))`;
  } else {
    throw new Error(`Unknown value type id ${internalTypeId}`);
  }
  return `${field.typeWrap}(${result})`;
}
function fieldPortionData(field) {
  const methodNameSuffix = "";
  if (field.arrayElement) {
    const name = "_element";
    return {
      typeWithLocation: field.arrayElement.typeWithLocation,
      name: "_element",
      encoded: renderEncodeField({ ...field.arrayElement, arrayElement: void 0, name, methodNameSuffix }),
      title: "an element"
    };
  } else {
    const name = "_slice";
    return {
      typeWithLocation: `${field.typeId} memory`,
      name,
      encoded: renderEncodeField({ ...field, name, methodNameSuffix }),
      title: "a slice"
    };
  }
}
function renderDecodeFieldSingle(field) {
  const { isDynamic, arrayElement } = field;
  if (arrayElement) {
    return `${field.typeWrap}(
      SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_${arrayElement.internalTypeId}()
    )`;
  } else if (isDynamic) {
    return `${field.typeWrap}(${field.internalTypeId}(_blob))`;
  } else {
    return renderDecodeValueType(field, 0);
  }
}

// src/render-solidity/record.ts
function renderRecordMethods(options) {
  const { structName, storeArgument } = options;
  const { _tableId, _typedTableId, _keyArgs, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);
  let result = renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Get the full data${_commentSuffix} */
    function get(${renderArguments([
      _typedStore,
      _typedTableId,
      _typedKeyArgs
    ])}) internal view returns (${renderDecodedRecord(options)}) {
      ${_primaryKeysDefinition}
      bytes memory _blob = ${_store}.getRecord(_tableId, _primaryKeys, getSchema());
      return decode(_blob);
    }
  `
  );
  result += renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Set the full data using individual values${_commentSuffix} */
    function set(${renderArguments([
      _typedStore,
      _typedTableId,
      _typedKeyArgs,
      renderArguments(options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`))
    ])}) internal {
      bytes memory _data = encode(${renderArguments(options.fields.map(({ name }) => name))});

      ${_primaryKeysDefinition}

      ${_store}.setRecord(_tableId, _primaryKeys, _data);
    }
  `
  );
  if (structName !== void 0) {
    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix, _untypedStore) => `
      /** Set the full data using the data struct${_commentSuffix} */
      function set(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
        `${structName} memory _table`
      ])}) internal {
        set(${renderArguments([
        _untypedStore,
        _tableId,
        _keyArgs,
        renderArguments(options.fields.map(({ name }) => `_table.${name}`))
      ])});
      }
    `
    );
  }
  result += renderDecodeFunction(options);
  return result;
}
function renderDecodeFunction({ structName, fields, staticFields, dynamicFields }) {
  const renderedDecodedRecord = structName ? `${structName} memory _table` : renderArguments(fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`));
  const fieldNamePrefix = structName ? "_table." : "";
  const staticOffsets = staticFields.map(() => 0);
  let _acc = 0;
  for (const [index, field] of staticFields.entries()) {
    staticOffsets[index] = _acc;
    _acc += field.staticByteLength;
  }
  if (dynamicFields.length > 0) {
    const totalStaticLength = staticFields.reduce((acc, { staticByteLength }) => acc + staticByteLength, 0);
    return `
    /** Decode the tightly packed blob using this table's schema */
    function decode(bytes memory _blob) internal view returns (${renderedDecodedRecord}) {
      // ${totalStaticLength} is the total byte length of static data
      PackedCounter _encodedLengths = PackedCounter.wrap(Bytes.slice32(_blob, ${totalStaticLength})); 

      ${renderList(
      staticFields,
      (field, index) => `
        ${fieldNamePrefix}${field.name} = ${renderDecodeValueType(field, staticOffsets[index])};
        `
    )}
      uint256 _start;
      uint256 _end = ${totalStaticLength + 32};
      ${renderList(
      dynamicFields,
      (field, index) => `
        _start = _end;
        _end += _encodedLengths.atIndex(${index});
        ${fieldNamePrefix}${field.name} = ${renderDecodeDynamicFieldPartial(field)};
        `
    )}
    }
  `;
  } else {
    return `
    /** Decode the tightly packed blob using this table's schema */
    function decode(bytes memory _blob) internal pure returns (${renderedDecodedRecord}) {
      ${renderList(
      staticFields,
      (field, index) => `
        ${fieldNamePrefix}${field.name} = ${renderDecodeValueType(field, staticOffsets[index])};
        `
    )}
    }
    `;
  }
}
function renderDecodedRecord({ structName, fields }) {
  if (structName) {
    return `${structName} memory _table`;
  } else {
    return renderArguments(fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`));
  }
}
function renderDecodeDynamicFieldPartial(field) {
  const { typeId, arrayElement, typeWrap } = field;
  if (arrayElement) {
    return `${typeWrap}(
      SliceLib.getSubslice(_blob, _start, _end).decodeArray_${arrayElement.typeId}()
    )`;
  } else {
    return `${typeWrap}(
      ${typeId}(
        SliceLib.getSubslice(_blob, _start, _end).toBytes()
      )
    )`;
  }
}

// src/render-solidity/renderTypeHelpers.ts
function renderTypeHelpers(options) {
  const { fields, primaryKeys } = options;
  let result = "";
  for (const wrappingHelper of getWrappingHelpers([...fields, ...primaryKeys])) {
    result += wrappingHelper;
  }
  if (fields.some(({ typeId }) => typeId === "bool")) {
    result += `
    function _toBool(uint8 value) pure returns (bool result) {
      assembly {
        result := value
      }
    }
    `;
  }
  if (primaryKeys.some(({ typeId }) => typeId === "bool")) {
    result += `
    function _boolToBytes32(bool value) pure returns (bytes32 result) {
      assembly {
        result := value
      }
    }
    `;
  }
  return result;
}
function getWrappingHelpers(array) {
  const wrappers = /* @__PURE__ */ new Map();
  const unwrappers = /* @__PURE__ */ new Map();
  for (const { typeWrappingData, typeWrap, typeUnwrap, internalTypeId } of array) {
    if (!typeWrappingData)
      continue;
    const { kind } = typeWrappingData;
    if (kind === "staticArray") {
      const { elementType, staticLength } = typeWrappingData;
      wrappers.set(typeWrap, renderWrapperStaticArray(typeWrap, elementType, staticLength, internalTypeId));
      unwrappers.set(typeUnwrap, renderUnwrapperStaticArray(typeUnwrap, elementType, staticLength, internalTypeId));
    }
  }
  return [...wrappers.values(), ...unwrappers.values()];
}
function renderWrapperStaticArray(functionName, elementType, staticLength, internalTypeId) {
  return `
    function ${functionName}(
      ${internalTypeId} memory _value
    ) pure returns (
      ${elementType}[${staticLength}] memory _result
    ) {
      // in memory static arrays are just dynamic arrays without the length byte
      assembly {
        _result := add(_value, 0x20)
      }
    }
  `;
}
function renderUnwrapperStaticArray(functionName, elementType, staticLength, internalTypeId) {
  const byteLength = staticLength * 32;
  return `
    function ${functionName}(
      ${elementType}[${staticLength}] memory _value
    ) view returns (
      ${internalTypeId} memory _result
    ) {
      _result = new ${internalTypeId}(${staticLength});
      uint256 fromPointer;
      uint256 toPointer;
      assembly {
        fromPointer := _value
        toPointer := add(_result, 0x20)
      }
      Memory.copy(fromPointer, toPointer, ${byteLength});
    }
  `;
}

// src/render-solidity/renderTable.ts
function renderTable(options) {
  const {
    imports,
    libraryName,
    structName,
    staticResourceData,
    storeImportPath,
    fields,
    staticFields,
    dynamicFields,
    withRecordMethods,
    storeArgument,
    primaryKeys
  } = options;
  const { _typedTableId, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);
  return `${renderedSolidityHeader}

// Import schema type
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

// Import store internals
import { IStore } from "${storeImportPath}IStore.sol";
import { StoreSwitch } from "${storeImportPath}StoreSwitch.sol";
import { StoreCore } from "${storeImportPath}StoreCore.sol";
import { Bytes } from "${storeImportPath}Bytes.sol";
import { Memory } from "${storeImportPath}Memory.sol";
import { SliceLib } from "${storeImportPath}Slice.sol";
import { EncodeArray } from "${storeImportPath}tightcoder/EncodeArray.sol";
import { Schema, SchemaLib } from "${storeImportPath}Schema.sol";
import { PackedCounter, PackedCounterLib } from "${storeImportPath}PackedCounter.sol";

${imports.length > 0 ? `
      // Import user types
      ${renderImports(imports)}
    ` : ""}

${staticResourceData ? renderTableId(staticResourceData).tableIdDefinition : ""}

${!structName ? "" : `
      struct ${structName} {
        ${renderList(fields, ({ name, typeId }) => `${typeId} ${name};`)}
      }
`}

library ${libraryName} {
  /** Get the table's schema */
  function getSchema() internal pure returns (Schema) {
    SchemaType[] memory _schema = new SchemaType[](${fields.length});
    ${renderList(fields, ({ enumName }, index) => `_schema[${index}] = SchemaType.${enumName};`)}

    return SchemaLib.encode(_schema);
  }

  function getKeySchema() internal pure returns (Schema) {
    SchemaType[] memory _schema = new SchemaType[](${primaryKeys.length});
    ${renderList(primaryKeys, ({ enumName }, index) => `_schema[${index}] = SchemaType.${enumName};`)}

    return SchemaLib.encode(_schema);
  }

  /** Get the table's metadata */
  function getMetadata() internal pure returns (string memory, string[] memory) {
    string[] memory _fieldNames = new string[](${fields.length});
    ${renderList(fields, (field, index) => `_fieldNames[${index}] = "${field.name}";`)}
    return ("${libraryName}", _fieldNames);
  }

  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Register the table's schema${_commentSuffix} */
    function registerSchema(${renderArguments([_typedStore, _typedTableId])}) internal {
      ${_store}.registerSchema(_tableId, getSchema(), getKeySchema());
    }
  `
  )}
  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Set the table's metadata${_commentSuffix} */
    function setMetadata(${renderArguments([_typedStore, _typedTableId])}) internal {
      (string memory _tableName, string[] memory _fieldNames) = getMetadata();
      ${_store}.setMetadata(_tableId, _tableName, _fieldNames);
    }
  `
  )}

  ${renderFieldMethods(options)}

  ${withRecordMethods ? renderRecordMethods(options) : ""}

  /** Tightly pack full data using this table's schema */
  function encode(${renderArguments(
    options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
  )}) internal view returns (bytes memory) {
    ${renderEncodedLengths(dynamicFields)}
    return abi.encodePacked(${renderArguments([
    renderArguments(staticFields.map(({ name }) => name)),
    // TODO try gas optimization (preallocate for all, encodePacked statics, and direct encode dynamics)
    // (see https://github.com/latticexyz/mud/issues/444)
    ...dynamicFields.length === 0 ? [] : ["_encodedLengths.unwrap()", renderArguments(dynamicFields.map((field) => renderEncodeField(field)))]
  ])});
  }

  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /* Delete all data for given keys${_commentSuffix} */
    function deleteRecord(${renderArguments([_typedStore, _typedTableId, _typedKeyArgs])}) internal {
      ${_primaryKeysDefinition}
      ${_store}.deleteRecord(_tableId, _primaryKeys);
    }
  `
  )}
}

${renderTypeHelpers(options)}

`;
}
function renderEncodedLengths(dynamicFields) {
  if (dynamicFields.length > 0) {
    return `
    uint16[] memory _counters = new uint16[](${dynamicFields.length});
    ${renderList(dynamicFields, ({ name, arrayElement }, index) => {
      if (arrayElement) {
        return `_counters[${index}] = uint16(${name}.length * ${arrayElement.staticByteLength});`;
      } else {
        return `_counters[${index}] = uint16(bytes(${name}).length);`;
      }
    })}
    PackedCounter _encodedLengths = PackedCounterLib.pack(_counters);
    `;
  } else {
    return "";
  }
}

// src/render-solidity/renderTypes.ts
function renderTypes(options) {
  const { enums } = options;
  return `${renderedSolidityHeader}

${renderList(
    enums,
    ({ name, memberNames }) => `
  enum ${name} {
    ${renderArguments(memberNames)}
  }
`
  )}

`;
}

// src/render-solidity/renderTypesFromConfig.ts
function renderTypesFromConfig(config2) {
  const enums = Object.keys(config2.enums).map((name) => ({
    name,
    memberNames: config2.enums[name]
  }));
  return renderTypes({
    enums
  });
}

// src/render-solidity/tablegen.ts
async function tablegen(config2, outputBaseDirectory) {
  const allTableOptions = getTableOptions(config2);
  for (const { outputPath, renderOptions } of allTableOptions) {
    const fullOutputPath = path7.join(outputBaseDirectory, outputPath);
    const output = renderTable(renderOptions);
    formatAndWrite(output, fullOutputPath, "Generated table");
  }
  if (Object.keys(config2.enums).length > 0) {
    const fullOutputPath = path7.join(outputBaseDirectory, `${config2.userTypesPath}.sol`);
    const output = renderTypesFromConfig(config2);
    formatAndWrite(output, fullOutputPath, "Generated types file");
  }
}
async function formatAndWrite(output, fullOutputPath, logPrefix) {
  const formattedOutput = await formatSolidity(output);
  mkdirSync(path7.dirname(fullOutputPath), { recursive: true });
  writeFileSync2(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}

// src/commands/tablegen.ts
var commandModule13 = {
  command: "tablegen",
  describe: "Autogenerate MUD Store table libraries based on the config file",
  builder(yargs2) {
    return yargs2.options({
      configPath: { type: "string", desc: "Path to the config file" }
    });
  },
  async handler({ configPath }) {
    const srcDirectory = await getSrcDirectory();
    const config2 = await loadStoreConfig(configPath);
    await tablegen(config2, srcDirectory);
    process.exit(0);
  }
};
var tablegen_default = commandModule13;

// src/commands/deploy-v2.ts
import chalk4 from "chalk";
import glob from "glob";
import path8, { basename } from "path";
import { mkdirSync as mkdirSync2, writeFileSync as writeFileSync3 } from "fs";

// src/utils/getChainId.ts
import { ethers } from "ethers";
async function getChainId(rpc) {
  const { result: chainId } = await ethers.utils.fetchJson(
    rpc,
    '{ "id": 42, "jsonrpc": "2.0", "method": "eth_chainId", "params": [ ] }'
  );
  return Number(chainId);
}

// src/commands/deploy-v2.ts
var commandModule14 = {
  command: "deploy-v2",
  describe: "Deploy MUD v2 contracts",
  builder(yargs2) {
    return yargs2.options({
      configPath: { type: "string", desc: "Path to the config file" },
      clean: { type: "boolean", desc: "Remove the build forge artifacts and cache directories before building" },
      printConfig: { type: "boolean", desc: "Print the resolved config" },
      profile: { type: "string", desc: "The foundry profile to use" },
      debug: { type: "boolean", desc: "Print debug logs, like full error messages" },
      priorityFeeMultiplier: {
        type: "number",
        desc: "Multiply the estimated priority fee by the provided factor",
        default: 1
      }
    });
  },
  async handler(args) {
    args.profile = args.profile ?? process.env.FOUNDRY_PROFILE;
    const { configPath, printConfig, profile, clean } = args;
    const rpc = await getRpcUrl(profile);
    console.log(
      chalk4.bgBlue(
        chalk4.whiteBright(`
 Deploying MUD v2 contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} 
`)
      )
    );
    if (clean)
      await forge(["clean"], { profile });
    await forge(["build"], { profile });
    const srcDir = await getSrcDirectory();
    const existingContracts = glob.sync(`${srcDir}/**/*.sol`).map((path12) => basename(path12, ".sol"));
    const worldConfig = await loadWorldConfig(configPath, existingContracts);
    const storeConfig = await loadStoreConfig(configPath);
    const mudConfig = { ...worldConfig, ...storeConfig };
    if (printConfig)
      console.log(chalk4.green("\nResolved config:\n"), JSON.stringify(mudConfig, null, 2));
    try {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey)
        throw new MUDError("Missing PRIVATE_KEY environment variable");
      const deploymentInfo = await deploy(mudConfig, { ...args, rpc, privateKey });
      const chainId = await getChainId(rpc);
      const outputDir = path8.join(mudConfig.deploymentInfoDirectory, chainId.toString());
      mkdirSync2(outputDir, { recursive: true });
      writeFileSync3(path8.join(outputDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
      writeFileSync3(path8.join(outputDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));
      console.log(chalk4.bgGreen(chalk4.whiteBright(`
 Deployment result (written to ${outputDir}): 
`)));
      console.log(deploymentInfo);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  }
};
var deploy_v2_default = commandModule14;

// src/commands/worldgen.ts
import glob2 from "glob";
import path10, { basename as basename2 } from "path";

// src/render-solidity/worldgen.ts
import { readFileSync as readFileSync3 } from "fs";
import path9 from "path";

// src/utils/contractToInterface.ts
import { parse, visit } from "@solidity-parser/parser";
function contractToInterface(data, contractName) {
  const ast = parse(data);
  let withContract = false;
  let symbols = [];
  const functions = [];
  visit(ast, {
    ContractDefinition({ name }) {
      if (name === contractName) {
        withContract = true;
      }
    },
    FunctionDefinition({ name, visibility, parameters, returnParameters, isConstructor, isFallback, isReceiveEther }, parent) {
      if (parent !== void 0 && parent.type === "ContractDefinition" && parent.name === contractName) {
        try {
          if (isConstructor || isFallback || isReceiveEther)
            return;
          if (visibility === "default")
            throw new MUDError(`Visibility is not specified`);
          if (visibility === "external" || visibility === "public") {
            functions.push({
              name: name === null ? "" : name,
              parameters: parameters.map(parseParameter),
              returnParameters: returnParameters === null ? [] : returnParameters.map(parseParameter)
            });
            for (const { typeName } of parameters.concat(returnParameters ?? [])) {
              symbols = symbols.concat(typeNameToExternalSymbols(typeName));
            }
          }
        } catch (error) {
          if (error instanceof MUDError) {
            error.message = `Function "${name}" in contract "${contractName}": ${error.message}`;
          }
          throw error;
        }
      }
    }
  });
  if (!withContract) {
    throw new MUDError(`Contract not found: ${contractName}`);
  }
  return {
    functions,
    symbols
  };
}
function parseParameter({ name, typeName, storageLocation }) {
  let typedNameWithLocation = "";
  const { name: flattenedTypeName, stateMutability } = flattenTypeName(typeName);
  typedNameWithLocation += flattenedTypeName;
  if (stateMutability !== null) {
    typedNameWithLocation += ` ${stateMutability}`;
  }
  if (storageLocation !== null) {
    typedNameWithLocation += ` ${storageLocation}`;
  }
  if (name !== null) {
    typedNameWithLocation += ` ${name}`;
  }
  return typedNameWithLocation;
}
function flattenTypeName(typeName) {
  if (typeName === null) {
    return {
      name: "",
      stateMutability: null
    };
  }
  if (typeName.type === "ElementaryTypeName") {
    return {
      name: typeName.name,
      stateMutability: typeName.stateMutability
    };
  } else if (typeName.type === "UserDefinedTypeName") {
    return {
      name: typeName.namePath,
      stateMutability: null
    };
  } else if (typeName.type === "ArrayTypeName") {
    const { name, stateMutability } = flattenTypeName(typeName.baseTypeName);
    return {
      name: `${name}[]`,
      stateMutability
    };
  } else {
    throw new MUDError(`Invalid typeName.type ${typeName.type}`);
  }
}
function typeNameToExternalSymbols(typeName) {
  if (typeName?.type === "UserDefinedTypeName") {
    const symbol = typeName.namePath.split(".")[0];
    return [symbol];
  } else if (typeName?.type === "ArrayTypeName") {
    return typeNameToExternalSymbols(typeName.baseTypeName);
  } else {
    return [];
  }
}

// src/utils/formatAndWrite.ts
import { mkdirSync as mkdirSync3, writeFileSync as writeFileSync4 } from "fs";
import { dirname } from "path";
async function formatAndWrite2(output, fullOutputPath, logPrefix) {
  const formattedOutput = await formatSolidity(output);
  mkdirSync3(dirname(fullOutputPath), { recursive: true });
  writeFileSync4(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}

// src/render-solidity/renderSystemInterface.ts
function renderSystemInterface(options) {
  const { imports, name, functionPrefix, functions } = options;
  return `${renderedSolidityHeader}

${renderImports(imports)}

interface ${name} {
  ${renderList(
    functions,
    ({ name: name2, parameters, returnParameters }) => `
    function ${functionPrefix}${name2}(${renderArguments(parameters)}) external ${renderReturnParameters(
      returnParameters
    )};
  `
  )}
}

`;
}
function renderReturnParameters(returnParameters) {
  if (returnParameters.length > 0) {
    return `returns (${renderArguments(returnParameters)})`;
  } else {
    return "";
  }
}

// src/render-solidity/renderWorld.ts
function renderWorld(options) {
  const { interfaceName, storeImportPath, worldImportPath, imports } = options;
  return `${renderedSolidityHeader}

import { IStore } from "${storeImportPath}IStore.sol";

import { IWorldCore } from "${worldImportPath}interfaces/IWorldCore.sol";

${renderImports(imports)}

/**
 * The ${interfaceName} interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface ${interfaceName} is ${renderArguments(["IStore", "IWorldCore", ...imports.map(({ symbol }) => symbol)])} {

}

`;
}

// src/render-solidity/worldgen.ts
async function worldgen(config2, existingContracts, outputBaseDirectory) {
  const worldgenBaseDirectory = path9.join(outputBaseDirectory, config2.worldgenDirectory);
  const systems = existingContracts.filter(({ basename: basename3 }) => Object.keys(config2.systems).includes(basename3));
  const systemInterfaceImports = [];
  for (const system of systems) {
    const data = readFileSync3(system.path, "utf8");
    const { functions, symbols } = contractToInterface(data, system.basename);
    const imports = symbols.map((symbol) => ({
      symbol,
      fromPath: system.path,
      usedInPath: worldgenBaseDirectory
    }));
    const systemInterfaceName = `I${system.basename}`;
    const { fileSelector } = config2.systems[system.basename];
    const output2 = renderSystemInterface({
      name: systemInterfaceName,
      functionPrefix: config2.namespace === "" ? "" : `${config2.namespace}_${fileSelector}_`,
      functions,
      imports
    });
    const fullOutputPath2 = path9.join(worldgenBaseDirectory, systemInterfaceName + ".sol");
    await formatAndWrite2(output2, fullOutputPath2, "Generated system interface");
    systemInterfaceImports.push({
      symbol: systemInterfaceName,
      fromPath: `${systemInterfaceName}.sol`,
      usedInPath: "./"
    });
  }
  const worldInterfaceName = "IWorld";
  const output = renderWorld({
    interfaceName: worldInterfaceName,
    imports: systemInterfaceImports,
    storeImportPath: config2.storeImportPath,
    worldImportPath: config2.worldImportPath
  });
  const fullOutputPath = path9.join(worldgenBaseDirectory, worldInterfaceName + ".sol");
  await formatAndWrite2(output, fullOutputPath, "Generated system interface");
}

// src/commands/worldgen.ts
import { rmSync as rmSync3 } from "fs";
var commandModule15 = {
  command: "worldgen",
  describe: "Autogenerate interfaces for Systems and World based on existing contracts and the config file",
  builder(yargs2) {
    return yargs2.options({
      configPath: { type: "string", desc: "Path to the config file" },
      clean: { type: "boolean", desc: "Clear the worldgen directory before generating new interfaces" }
    });
  },
  async handler(args) {
    const { configPath, clean } = args;
    const srcDir = await getSrcDirectory();
    const existingContracts = glob2.sync(`${srcDir}/**/*.sol`).map((path12) => ({
      path: path12,
      basename: basename2(path12, ".sol")
    }));
    const worldConfig = await loadWorldConfig(
      configPath,
      existingContracts.map(({ basename: basename3 }) => basename3)
    );
    const storeConfig = await loadStoreConfig(configPath);
    const mudConfig = { ...worldConfig, ...storeConfig };
    if (clean)
      rmSync3(path10.join(srcDir, worldConfig.worldgenDirectory), { recursive: true, force: true });
    await worldgen(mudConfig, existingContracts, srcDir);
    process.exit(0);
  }
};
var worldgen_default = commandModule15;

// src/commands/set-version.ts
import { existsSync, readFileSync as readFileSync4, rmSync as rmSync4, writeFileSync as writeFileSync5 } from "fs";
import path11 from "path";
var BACKUP_FILE = ".mudbackup";
function getGitUrl(pkg, branch) {
  return `https://gitpkg.now.sh/latticexyz/mud/packages/${pkg}?${branch}`;
}
var commandModule16 = {
  command: "set-version",
  describe: "Install a custom MUD version (local or GitHub) and backup the previous version",
  builder(yargs2) {
    return yargs2.options({
      github: { type: "string", description: "The MUD GitHub branch to install from" },
      npm: { type: "string", description: "The MUD NPM version to install" },
      backup: { type: "boolean", description: "Back up the current MUD versions to `.mudinstall`" },
      force: {
        type: "boolean",
        description: "Backup fails if a .mudinstall file is found, unless --force is provided"
      },
      restore: { type: "boolean", description: "Restore the previous MUD versions from `.mudinstall`" }
    });
  },
  async handler(options) {
    const { github, npm, restore } = options;
    try {
      const sources = { github, npm };
      const numSources = Object.values(sources).filter((x) => x).length;
      if (numSources > 1) {
        throw new MUDError(`Options ${Object.keys(sources).join(", ")} are mutually exclusive`);
      }
      if (!restore && numSources === 0) {
        throw new MUDError(`No source provided. Choose one of (${Object.keys(sources).join(", ")}).`);
      }
      const rootPath = "./package.json";
      const { workspaces } = updatePackageJson(rootPath, options);
      if (workspaces) {
        for (const workspace of workspaces) {
          const filePath = path11.join(workspace, "/package.json");
          updatePackageJson(filePath, options);
        }
      }
    } catch (e) {
      logError(e);
    } finally {
      process.exit(0);
    }
  }
};
function updatePackageJson(filePath, options) {
  const { backup, restore, force } = options;
  const backupFilePath = path11.join(path11.dirname(filePath), BACKUP_FILE);
  if (backup && !force && existsSync(backupFilePath)) {
    throw new MUDError(
      `A backup file already exists at ${backupFilePath}.
Use --force to overwrite it or --restore to restore it.`
    );
  }
  console.log("Updating", filePath);
  const packageJson = readPackageJson(filePath);
  const backupJson = restore ? readPackageJson(backupFilePath) : void 0;
  const mudDependencies = {};
  for (const key in packageJson.dependencies) {
    if (key.startsWith("@latticexyz")) {
      mudDependencies[key] = packageJson.dependencies[key];
    }
  }
  const mudDevDependencies = {};
  for (const key in packageJson.devDependencies) {
    if (key.startsWith("@latticexyz")) {
      mudDevDependencies[key] = packageJson.devDependencies[key];
    }
  }
  console.log("Dependencies", mudDependencies);
  console.log("Dev Dependencies", mudDevDependencies);
  if (backup) {
    writeFileSync5(
      backupFilePath,
      JSON.stringify({ dependencies: mudDependencies, devDependencies: mudDevDependencies }, null, 2)
    );
  }
  for (const key in packageJson.dependencies) {
    if (key.startsWith("@latticexyz")) {
      packageJson.dependencies[key] = restore && backupJson ? backupJson.dependencies[key] : updatedPackageVersion(key, options);
    }
  }
  for (const key in packageJson.devDependencies) {
    if (key.startsWith("@latticexyz")) {
      packageJson.devDependencies[key] = restore && backupJson ? backupJson.devDependencies[key] : updatedPackageVersion(key, options);
    }
  }
  writeFileSync5(filePath, JSON.stringify(packageJson, null, 2) + "\n");
  if (restore && !backup)
    rmSync4(backupFilePath);
  return packageJson;
}
function readPackageJson(path12) {
  try {
    const jsonString = readFileSync4(path12, "utf8");
    return JSON.parse(jsonString);
  } catch {
    throw new MUDError("Could not read JSON at " + path12);
  }
}
function updatedPackageVersion(pkg, { npm, github }) {
  if (npm)
    return npm;
  if (github)
    return getGitUrl(pkg.replace("@latticexyz/", ""), github);
  return "";
}
var set_version_default = commandModule16;

// src/commands/index.ts
var commands = [
  bulkupload_default,
  call_system_default,
  codegen_libdeploy_default,
  deploy_contracts_default,
  deploy_v2_default,
  devnode_default,
  faucet_default,
  gas_report_default,
  hello_default,
  system_types_default,
  tablegen_default,
  test_default,
  trace_default,
  types_default,
  worldgen_default,
  set_version_default
];

// src/mud.ts
import * as dotenv from "dotenv";
dotenv.config();
yargs(hideBin(process.argv)).scriptName("mud").command(commands).strict().fail((msg, err) => {
  console.log("");
  logError(err);
  console.log("");
  process.exit(1);
}).alias({ h: "help" }).argv;
/*! Bundled license information:

long/index.js:
  (**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
