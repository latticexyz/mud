import { Middleware } from "koa";
import { Readable, Stream } from "node:stream";
import accepts from "accepts";
import { Zlib, createBrotliCompress, createDeflate, createGzip } from "node:zlib";
import { includes } from "@latticexyz/common/utils";

// Loosely based on https://github.com/holic/koa-compress/blob/master/lib/index.js
// with better handling of streams better with occasional flushing

const encodings = {
  br: createBrotliCompress,
  gzip: createGzip,
  deflate: createDeflate,
} as const;

const encodingNames = Object.keys(encodings) as (keyof typeof encodings)[];

function flushEvery<stream extends Zlib & Readable>(stream: stream, bytesThreshold: number): stream {
  let bytesSinceFlush = 0;
  stream.on("data", (data) => {
    bytesSinceFlush += data.length;
    if (bytesSinceFlush > bytesThreshold) {
      bytesSinceFlush = 0;
      stream.flush();
    }
  });
  return stream;
}

type CompressOptions = {
  flushThreshold?: number;
};

export function compress({ flushThreshold = 1024 * 4 }: CompressOptions = {}): Middleware {
  return async function compressMiddleware(ctx, next) {
    ctx.vary("Accept-Encoding");

    await next();

    const encoding = accepts(ctx.req).encoding(encodingNames);
    if (!includes(encodingNames, encoding)) return;

    const compressed = flushEvery(encodings[encoding](), flushThreshold);

    ctx.set("Content-Encoding", encoding);
    ctx.body = ctx.body instanceof Stream ? ctx.body.pipe(compressed) : compressed.end(ctx.body);
  };
}
