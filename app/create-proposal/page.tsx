import Link from "next/link";

export default function CreateProposalPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_55%)]" />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to landing page
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Mock flow
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Encrypted governance composer</p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Draft a proposal without sacrificing the privacy model.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              This mock page shows how proposal creation could feel in IncognitoDAO: clear enough for delegates,
              expressive enough for operators, and opinionated about privacy from the first field.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Voting model", "Encrypted tally"],
              ["Network", "Base Sepolia"],
              ["Execution", "Manual reveal"],
              ["Eligibility", "Token + delegate"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Proposal composer</h2>
                <p className="mt-1 text-sm text-slate-400">A governance-first flow with encrypted voting baked into the defaults.</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Draft autosaved
              </div>
            </div>

            <div className="space-y-6">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Proposal title</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  defaultValue="Allocate 250,000 USDC to the privacy incentives treasury"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Context and rationale</span>
                <textarea
                  className="min-h-40 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  defaultValue="This proposal funds three months of delegate and contributor rewards for privacy-native governance participation. The budget is held in treasury, execution remains manual, and final tally is revealed only after the encrypted voting window closes."
                />
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Voting window</span>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    Start: Apr 03, 2026 18:00 UTC<br />
                    End: Apr 06, 2026 18:00 UTC
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Eligibility rule</span>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    Token holders snapshot + approved delegates
                  </div>
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  ["Quorum target", "18%"],
                  ["Pass threshold", "60% yes"],
                  ["Reveal mode", "Delayed threshold decrypt"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-200">Vote options</span>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Approve", "Release funds and queue treasury action."],
                    ["Reject", "Keep capital in treasury and revisit later."],
                    ["Abstain", "Count participation without taking a side."],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5">
                      <div className="mb-3 inline-flex rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        Encrypted choice
                      </div>
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm font-semibold text-emerald-200">Privacy controls</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    "Hide individual delegate choices forever",
                    "Reveal aggregate tally only after deadline",
                    "Allow encrypted turnout checks during voting",
                    "Manual threshold decrypt controlled by proposal finalizer",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
                <button className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
                  Save draft
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/active-votes"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white"
                  >
                    Preview active votes
                  </Link>
                  <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                    Create encrypted proposal
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Live preview</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Treasury Incentives Q2</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                If published now, token holders and delegates would see the proposal details immediately, but the vote
                distribution would remain encrypted until finalization.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  ["Status", "Draft / not published"],
                  ["Voting style", "Single choice, weighted"],
                  ["Execution", "Manual treasury multisig"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Reveal lifecycle</p>
              <div className="mt-5 space-y-4">
                {[
                  ["1", "Proposal published", "Metadata becomes public, ballots remain encrypted."],
                  ["2", "Voting period closes", "No further encrypted votes can be submitted."],
                  ["3", "Threshold decrypt", "Aggregate totals are revealed without exposing individuals."],
                  ["4", "Queue execution", "Treasury action can be manually confirmed onchain."],
                ].map(([step, title, body]) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-bold text-emerald-300">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
