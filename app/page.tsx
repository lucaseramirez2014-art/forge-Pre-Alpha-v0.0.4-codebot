import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-8">
        <header className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-orange-500 font-black text-stone-950">F</span><span className="text-sm font-bold tracking-[0.22em]">FORGE</span></div>
          <Link href="/dashboard" className="rounded-xl border border-white/12 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-orange-300/40 hover:text-white">Enter beta</Link>
        </header>
        <section className="flex flex-1 flex-col justify-center py-20 lg:py-28">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300"><span className="size-1.5 rounded-full bg-orange-400 ember-pulse" /> Pre Alpha v0.0.4</p>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-white sm:text-7xl lg:text-8xl">Turn intention into <span className="text-orange-400">momentum.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-400 sm:text-xl">FORGE turns meaningful goals into clear campaigns, focused work sessions, and visible progress—one quest at a time.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-orange-400">Begin your campaign <span aria-hidden="true">→</span></Link>
              <Link href="/campaign" className="rounded-xl border border-white/12 bg-white/3 px-5 py-3.5 text-sm font-semibold text-stone-200 transition hover:bg-white/7">Explore Python Developer</Link>
            </div>
          </div>
          <div className="mt-16 grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:mt-24">
            {[['01', 'Choose a quest'], ['02', 'Focus deeply'], ['03', 'Bank your XP']].map(([number, label]) => <div key={number} className="bg-[#0d0d0d] p-4 sm:p-5"><p className="text-xs font-mono text-orange-400">{number}</p><p className="mt-2 text-sm font-medium text-stone-200">{label}</p></div>)}
          </div>
        </section>
        <footer className="py-6 text-xs text-stone-600">FORGE Pre Alpha v0.0.4 · a focused productivity beta</footer>
      </div>
    </main>
  );
}
