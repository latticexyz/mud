function encodePacked(inputs: i32[]): ArrayBuffer {
  const buffer = new ArrayBuffer(8 * inputs.length);
  return buffer;
}
