"use client";

export function DevconBanner() {
  if (Date.now() > 1731603600000) return null;
  return (
    <div className="bg-mud/20 text-white p-4 text-center">
      Hello Devcon! Come learn about MUD at{" "}
      <a href="https://mud.dev/day" className="underline font-semibold">
        MUD Day
      </a>{" "}
      on Thursday in Classroom A.
    </div>
  );
}
