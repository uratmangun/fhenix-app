"use client";

import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-emerald-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            PrivateLaunch
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-emerald-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</Link>
            <Link href="#privacy" className="hover:text-emerald-600 transition-colors">Privacy Stack</Link>
          </nav>

          <div className="hidden sm:flex items-center gap-4">
            <Link href="/leaderboard" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              Leaderboard
            </Link>
            <Link href="/submit-product" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              Submit Product
            </Link>
          </div>

          <button
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-64 border-t border-slate-100" : "max-h-0"}`}>
          <nav className="flex flex-col px-4 py-4 space-y-4 text-sm font-medium text-slate-600 bg-white">
            <Link href="#features" className="hover:text-emerald-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="hover:text-emerald-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
            <Link href="#privacy" className="hover:text-emerald-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Privacy Stack</Link>
            <div className="pt-4 flex flex-col gap-3 border-t border-slate-100">
              <Link href="/leaderboard" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-50 rounded-lg transition-colors w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Leaderboard
              </Link>
              <Link href="/submit-product" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all w-full text-center block" onClick={() => setIsMobileMenuOpen(false)}>
                Submit Product
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="pt-24 pb-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-slate-50 to-slate-50 -z-10" />
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Weekly Launch Board
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Launch products.<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Rank privately.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A Product Hunt style board where anyone can submit a product, everyone can vote, and rankings are computed from private encrypted votes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/submit-product"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 text-center"
              >
                Submit Your Product
              </Link>
              <Link
                href="/leaderboard"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all text-center"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Simple product voting, stronger privacy</h2>
              <p className="text-slate-600">No governance complexity. Just launches, encrypted votes, and a trusted leaderboard.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Open submissions</h3>
                <p className="text-slate-600 leading-relaxed">Any builder can submit a product name, URL, and one-line pitch for the active voting window.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Private upvotes</h3>
                <p className="text-slate-600 leading-relaxed">Votes are encrypted client-side and tallied in ciphertext. Nobody can inspect individual choices.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Clear leaderboard</h3>
                <p className="text-slate-600 leading-relaxed">After the window closes, aggregate totals are revealed and products are ranked by real vote count.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Product board meets <span className="text-emerald-400">encrypted voting</span>
              </h2>
              <ul className="space-y-6 text-slate-300">
                <li>1) Submit product metadata for the current round.</li>
                <li>2) Users cast encrypted upvotes on Arbitrum Sepolia.</li>
                <li>3) End round, decrypt aggregate upvote totals only.</li>
                <li>4) Publish leaderboard by vote count.</li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-2xl rounded-3xl" />
              <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl font-mono text-sm overflow-x-auto">
                <div className="text-emerald-400 mb-2">// Product upvote flow</div>
                <div className="text-slate-300">
                  submitProduct(name, url, tagline, deadline)
                  <br />voteProduct(productId, encryptedUpvote)
                  <br />finalizeProduct(productId)
                  <br />decryptProductVotes(productId)
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-bold text-lg text-slate-800">PrivateLaunch</div>
          <p className="text-slate-500 text-sm">Private product leaderboard powered by Fhenix.</p>
        </div>
      </footer>
    </div>
  );
}
