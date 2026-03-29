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
            IncognitoDAO
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-emerald-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</Link>
            <Link href="#fhenix" className="hover:text-emerald-600 transition-colors">Powered by Fhenix</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              Documentation
            </button>
            <Link href="/debug" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              Launch App
            </Link>
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu Collapse */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-64 border-t border-slate-100' : 'max-h-0'}`}>
          <nav className="flex flex-col px-4 py-4 space-y-4 text-sm font-medium text-slate-600 bg-white">
            <Link href="#features" className="hover:text-emerald-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="hover:text-emerald-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
            <Link href="#fhenix" className="hover:text-emerald-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Powered by Fhenix</Link>
            <div className="pt-4 flex flex-col gap-3 border-t border-slate-100">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-50 rounded-lg transition-colors w-full text-center">
                Documentation
              </button>
              <Link href="/debug" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all w-full text-center block" onClick={() => setIsMobileMenuOpen(false)}>
                Launch App
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-slate-50 to-slate-50 -z-10" />
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live on Base Sepolia
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Vote with conviction. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Reveal nothing.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The first DAO governance protocol where your vote is mathematically guaranteed to be private. Built on Fhenix using Fully Homomorphic Encryption (FHE).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/create-proposal"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 text-center"
              >
                Create a Proposal
              </Link>
              <Link
                href="/active-votes"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all text-center"
              >
                Explore Active Votes
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Why privacy matters for DAOs</h2>
              <p className="text-slate-600">Public ledgers created trust, but destroyed strategic voting. We're bringing game theory back to governance.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">No Bandwagon Effect</h3>
                <p className="text-slate-600 leading-relaxed">
                  When votes are public, early whales dictate the outcome. With encrypted tallies, voters decide based on conviction, not momentum.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Retaliation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Delegates and stakeholders shouldn't fear retribution for voting against popular sentiment. Protect your relationships and your treasury.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Anti-Bribery</h3>
                <p className="text-slate-600 leading-relaxed">
                  If you can't prove how you voted, you can't sell your vote. FHE breaks the proof-of-vote loop that enables malicious market manipulation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fhenix Tech Section */}
        <section id="how-it-works" className="py-24 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Powered by <span className="text-emerald-400">Fully Homomorphic Encryption</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Traditional privacy solutions require trusted off-chain servers or complex ZK circuits that don't easily support shared state.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Encrypted on the client</strong>
                    <span className="text-slate-400">Your vote is encrypted in your browser using `@cofhe/sdk` before hitting the RPC.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Tallied in ciphertext</strong>
                    <span className="text-slate-400">The Fhenix network adds up the votes using `FHE.add()` without ever seeing the plaintext amounts.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Revealed only when complete</strong>
                    <span className="text-slate-400">The final result is decrypted via threshold network only when the voting period expires. Individual votes remain hidden forever.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-2xl rounded-3xl" />
              <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl font-mono text-sm overflow-x-auto">
                <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-emerald-400 mb-2">// Vote processing on Fhenix</div>
                <div className="text-slate-300">
                  <span className="text-purple-400">function</span> <span className="text-blue-400">castVote</span>(
                  <br />&nbsp;&nbsp;inEuint32 calldata <span className="text-slate-100">encryptedVoteWeight</span>,
                  <br />&nbsp;&nbsp;inEbool calldata <span className="text-slate-100">isFor</span>
                  <br />) <span className="text-purple-400">external</span> {'{'}
                  <br />&nbsp;&nbsp;<span className="text-emerald-400">// Cast inputs to FHE types</span>
                  <br />&nbsp;&nbsp;euint32 weight = FHE.asEuint32(encryptedVoteWeight);
                  <br />&nbsp;&nbsp;ebool choice = FHE.asEbool(isFor);
                  <br />
                  <br />&nbsp;&nbsp;<span className="text-emerald-400">// Update tallies entirely in ciphertext</span>
                  <br />&nbsp;&nbsp;euint32 votesFor = FHE.select(choice, weight, FHE.asEuint32(0));
                  <br />&nbsp;&nbsp;euint32 votesAgainst = FHE.select(choice, FHE.asEuint32(0), weight);
                  <br />
                  <br />&nbsp;&nbsp;proposal.forVotes = FHE.add(proposal.forVotes, votesFor);
                  <br />&nbsp;&nbsp;proposal.againstVotes = FHE.add(proposal.againstVotes, votesAgainst);
                  <br />{'}'}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            IncognitoDAO
          </div>
          <p className="text-slate-500 text-sm">
            Built for the Private By Design dApp Buildathon. Powered by Fhenix.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              GitHub
            </Link>
            <Link href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}