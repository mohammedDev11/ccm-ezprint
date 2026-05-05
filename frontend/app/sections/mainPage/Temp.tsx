// import Spline from "@splinetool/react-spline/next";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-[#090909] flex items-center justify-center overflow-hidden">
//       <div className="w-[900px] h-[600px] pointer-events-none">
//         {/* <Spline scene="https://prod.spline.design/FHTIF0RO-Dc-36py/scene.splinecode" /> */}
//       </div>
//     </main>
//   );
// }

import Link from "next/link";

export default function Temp() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:grid-cols-2">
          {/* Left Side */}
          <section className="flex flex-col justify-center px-8 py-12 sm:px-12">
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/60">
                EzPrint
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Welcome back
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                Sign in to continue to your dashboard. This is a temporary main
                page until the real authentication flow is connected.
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-white/30 focus:bg-white/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-white/30 focus:bg-white/10"
                />
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Login
              </button>
            </form>
          </section>

          {/* Right Side */}
          <section className="flex flex-col justify-center border-t border-white/10 bg-white/5 px-8 py-12 md:border-l md:border-t-0 sm:px-12">
            <div className="mx-auto w-full max-w-md">
              <h2 className="text-2xl font-semibold">
                Temporary dashboard access
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Use these buttons for now to move directly to each dashboard
                during development.
              </p>

              <div className="mt-8 space-y-4">
                <Link
                  href="/sections/admin/dashboard"
                  className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-semibold transition hover:bg-white/15"
                >
                  Go to Admin Dashboard
                </Link>

                <Link
                  href="/sections/user/dashboard"
                  className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-semibold transition hover:bg-white/15"
                >
                  Go to User Dashboard
                </Link>
              </div>

              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/55">
                Temporary only — replace these buttons later with real
                role-based login routing.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
