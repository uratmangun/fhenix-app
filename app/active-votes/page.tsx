import Link from "next/link";

const proposals = [
  {
    title: "Treasury Diversification into Privacy Yield Vaults",
    status: "Voting live",
    endsIn: "4h 12m",
    turnout: "64 encrypted ballots",
    quorum: "14.8% of 18% target",
    description:
      "Route 12% of idle treasury capital into low-risk privacy yield strategies. Tally remains encrypted until the deadline closes.",
    tags: ["Treasury", "Core Ops", "Encrypted tally"],
  },
  {
    title: "Retroactive Grants for Delegate Research",
    status: "Reveal pending",
    endsIn: "Closed 18m ago",
    turnout: "92 encrypted ballots",
    quorum: "22.1% reached",
    description:
      "Reward delegates and contributors who produced governance research during the previous quarter. Final aggregate reveal is awaiting threshold decryption.",
    tags: ["Grants", "Delegates", "Reveal queue"],
  },
  {
    title: "Emergency Security Budget for Guardian Review",
    status: "Finalized",
    endsIn: "Passed",
    turnout: "41 encrypted ballots",
    quorum: "19.2% reached",
    description:
      "Allocate rapid-response budget for a private external review after a governance process change. Individual choices remain permanently hidden.",
    tags: ["Security", "Budget", "Executed"],
  },
];

export default function ActiveVotesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%)]" />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Active Votes</span>
          </div>
          <Link
            href="/create-proposal"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            New proposal
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Encrypted proposal board</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Monitor live governance without exposing how anyone voted.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              This mock dashboard shows what a privacy-native governance surface looks like when turnout, reveal state,
              and treasury relevance matter more than public vote theater.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Open", "2 proposals"],
              ["Reveal queue", "1 pending"],
              ["Encrypted ballots", "197 total"],
              ["Network", "Base Sepolia"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-5">
            {proposals.map((proposal) => (
              <article key={proposal.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/40 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {proposal.status}
                      </span>
                      {proposal.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{proposal.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{proposal.description}</p>
                  </div>

                  <div className="min-w-[17rem] rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">Window</span>
                        <span className="font-semibold text-slate-900">{proposal.endsIn}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">Participation</span>
                        <span className="font-semibold text-slate-900">{proposal.turnout}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">Quorum</span>
                        <span className="font-semibold text-slate-900">{proposal.quorum}</span>
                      </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: proposal.status === "Finalized" ? "100%" : proposal.status === "Reveal pending" ? "88%" : "67%" }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Individual votes are encrypted at submission time and remain hidden even after aggregate reveal.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      View details
                    </button>
                    <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                      Cast encrypted vote
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">How reveals work</p>
              <div className="mt-5 space-y-5">
                {[
                  ["Encrypted submissions", "Ballots arrive as ciphertext and cannot be inspected by delegates, explorers, or proposal authors."],
                  ["Close & freeze", "Once the deadline passes, vote submission stops and the aggregate state is finalized for decryption."],
                  ["Threshold reveal", "Only aggregate totals are revealed. Individual selections remain sealed permanently."],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Fast actions</p>
              <div className="mt-5 space-y-3">
                <Link
                  href="/create-proposal"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                >
                  Draft a new proposal
                  <span>→</span>
                </Link>
                <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                  Connect delegate wallet
                  <span>→</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                  Review reveal queue
                  <span>→</span>
                </button>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
