import { Observable } from "rxjs";

export function eventSource<T>(url: string | URL): Observable<MessageEvent<T>> {
  return new Observable<MessageEvent>((subscriber) => {
    const eventSource = new EventSource(url);
    eventSource.onmessage = (ev): void => subscriber.next(ev);
    eventSource.onerror = (ev): void => subscriber.error(ev);
    return () => eventSource.close();
  });
}
