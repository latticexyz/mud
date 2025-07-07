export class MessagePortTargetClosedBeforeReadyError extends Error {
  constructor() {
    super("MessagePort target closed before ready.");
    this.name = "MessagePortTargetClosedBeforeReadyError";
  }
}

export class MessagePortUnexpectedInitialMessageError extends Error {
  constructor() {
    super("Unexpected initial message from MessagePort.");
    this.name = "MessagePortUnexpectedInitialMessageError";
  }
}
