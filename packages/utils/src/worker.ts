import { fromEvent, map, Observable } from "rxjs";

export interface DoWork<In, Out> {
  work(input$: Observable<In>): Observable<Out>;
}

export function fromWorker<I, O>(worker: Worker, input$: Observable<I>): Observable<O> {
  input$.subscribe((event) => worker.postMessage(event));
  return fromEvent<MessageEvent<O>>(worker, "message").pipe(map((e) => e.data));
}

export function runWorker<I, O>(worker: DoWork<I, O>) {
  const input$ = fromEvent<MessageEvent<I>>(self, "message");
  const output$ = worker.work(input$.pipe(map((event) => event.data)));
  output$.subscribe((event) => self.postMessage(event));
}
