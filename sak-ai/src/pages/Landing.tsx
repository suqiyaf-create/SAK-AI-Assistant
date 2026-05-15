import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Shield, Globe, MessageSquare, Image, Languages, BookmarkPlus, ShieldCheck, Moon, FileSearch } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/auth"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse-slow" />
            <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <Sparkles className="h-3 w-3" /> Intelligent Workspace
            </div>
            <h1 className="mt-8 font-heading text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.9]">
              Your Mind,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-sky-500 to-sky-700">Amplified by Suqiya.</span>
            </h1>
            <p className="mt-8 mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              The all-in-one assistant for the modern creator. Chat with intelligence, generate stunning visuals, and manage your knowledge with SAK AI.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth?mode=register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/auth?mode=login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 text-lg font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative w-full max-w-2xl mx-auto"
          >
            <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F1A] shadow-2xl p-6 md:p-8 animate-fade-up">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  SAK <span className="mx-1 opacity-30">·</span> LIVE
                </div>
              </div>

              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="rounded-2xl bg-sky-500/10 border border-sky-500/20 p-5 max-w-[85%]"
                >
                  <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-1">You</p>
                  <p className="text-slate-900 dark:text-white text-base font-medium">¿Cómo se dice "good morning" en japonés?</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.5 }}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 ml-auto max-w-[85%]"
                >
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">SAK AI</p>
                  <p className="text-slate-900 dark:text-white text-base flex items-center gap-2 font-medium">
                    🌸 おはようございます
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    (Ohayō gozaimasu) — used in formal settings
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-[2px] h-4 bg-sky-500 ml-1 translate-y-0.5"
                    />
                  </p>
                </motion.div>
              </div>

              <div className="mt-8 relative">
                <div className="h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161B29] flex items-center px-6 text-slate-400 dark:text-slate-500 text-sm italic border-dashed">
                  Type a message...
                  <div className="ml-auto h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 bg-white dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-left md:text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading text-6xl md:text-7xl font-semibold tracking-tighter leading-none">Everything you need to <br/><span className="text-slate-400">think, create, and ship.</span></h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard icon={MessageSquare} title="Smart Chat" desc="Markdown-rich conversations with context awareness." />
              <FeatureCard icon={FileSearch} title="PDF Analysis" desc="Analyze documents, summarize PDFs, and extract insights." />
              <FeatureCard icon={Image} title="Image Studio" desc="Generate stunning visuals with Nano Banana." />
              <FeatureCard icon={Languages} title="Translate 15+" desc="High-quality translations powered by Claude." />
              <FeatureCard icon={BookmarkPlus} title="Notes & Bookmarks" desc="Save insights and links to revisit anytime." />
              <FeatureCard icon={ShieldCheck} title="Secure Auth" desc="JWT + bcrypt, your data stays yours." />
              <FeatureCard icon={Moon} title="Dark Mode" desc="A premium look in any light." />
            </div>
          </div>
        </section>
        {/* About the Creator */}
        <section className="px-6 py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-8">
              The Story
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight">Behind SAK AI</h2>
            <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed italic">
              "SAK AI is more than just an AI assistant. It's a vision of a simplified digital workspace, 
              meticulously designed and developed by <strong>Suqiya</strong>, a final year Computer Science (ECT) 
              student. This project represents the culmination of academic learning and a passion 
              for building intuitive technology for the next generation."
            </p>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
         <p>© 2026 SAK AI. Created by Suqiya.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 group">
      <div className="h-14 w-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        <Icon className="h-7 w-7 text-sky-500" />
      </div>
      <h3 className="font-heading text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
