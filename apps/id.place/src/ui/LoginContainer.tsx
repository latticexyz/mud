import { Logo } from "./icons/Logo";

export function LoginContainer() {
  return (
    <div className="min-h-full bg-slate-200 grid">
      <div className="grid place-items-center">
        <div className="text-center bg-radial from-white via-slate-200 via-40% to-sky-700 to-80% aspect-square rounded-full p-80 -m-80 flex flex-col items-center justify-center">
          <Logo className="text-5xl" />
          <h1 className="text-2xl font-bold">id.place</h1>
          <p className="text-xs">a place for your internet identity</p>
        </div>
      </div>
      <div className="bg-white rounded-t-3xl mx-8 p-8 justify-center flex flex-col items-center">
        <div className="flex flex-col gap-2">
          <button className="py-3 px-6 leading-none bg-sky-600 hover:bg-sky-500 rounded text-white cursor-pointer">
            Create account
          </button>
          <button className="py-3 px-6 leading-none bg-sky-600 hover:bg-sky-500 rounded text-white cursor-pointer">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
