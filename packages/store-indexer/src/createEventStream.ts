import { PassThrough, Readable } from "node:stream";

export type Events = { readonly [eventName: string]: any };

export type CreateEventStreamResult<events extends Events = Events> = {
  stream: Readable;
  send: (eventName: keyof events & string, data: events[typeof eventName]) => void;
  end: () => void;
};

export function createEventStream<events extends Events = Events>(): CreateEventStreamResult<events> {
  const stream = new PassThrough();

  const result: CreateEventStreamResult<events> = {
    stream: Readable.from(stream),
    send(eventName, data) {
      stream.push(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    },
    end() {
      stream.push("event: close\ndata:\n\n:end\n\n");
      stream.end();
    },
  };

  return result;
}
