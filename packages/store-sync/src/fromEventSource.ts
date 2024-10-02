import { Observable } from "rxjs";

export function fromEventSource<T>(url: string | URL): Observable<MessageEvent<T>> {
  return new Observable<MessageEvent>((subscriber) => {
    const eventSource = new EventSource(url);
    eventSource.onmessage = (ev): void => subscriber.next(ev);
    eventSource.onerror = (): void => subscriber.error(new Error("Event source closed: " + url));
    return () => eventSource.close();
  });
}
