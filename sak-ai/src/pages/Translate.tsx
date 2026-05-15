import React, { useEffect, useState } from 'react';
import { Languages, Loader2, Copy, ArrowRightLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SUPPORTED_LANGS = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian",
  "Turkish", "Dutch", "Swedish", "Urdu",
];

export default function Translate() {
  const [langs] = useState(SUPPORTED_LANGS);
  const [target, setTarget] = useState('Spanish');
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const translate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true); setErr('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `You are a professional translator. Return ONLY the translated text, no explanations, no quotes, preserve formatting.
Translate the following text to ${target}.
Text:
${text.trim()}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setOut(response.text || '');
    } catch (e2: any) {
      setErr(e2?.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto" data-testid="translate-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Translation</div>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight flex items-center gap-3">
          <Languages className="h-7 w-7 text-sky-500" /> Translate anything
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">15+ languages, fast and accurate.</p>

        <form onSubmit={translate} className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Source</span>
              <span className="text-xs text-slate-400">Auto-detect</span>
            </div>
            <textarea
              data-testid="translate-source"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to translate…"
              className="mt-2 w-full resize-none rounded-lg bg-transparent outline-none text-sm focus:ring-0"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Target</span>
              <select
                data-testid="translate-target-select"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="text-sm bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-sky-500"
              >
                {langs.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <textarea
              data-testid="translate-output"
              rows={8}
              readOnly
              value={out}
              placeholder="Translation will appear here…"
              className="mt-2 w-full resize-none rounded-lg bg-transparent outline-none text-sm focus:ring-0"
            />
            {out && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(out)}
                className="text-xs text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 mt-2"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            )}
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {err && <div className="text-sm text-rose-500" data-testid="translate-error">{err}</div>}
            <div className="ml-auto">
              <button
                data-testid="translate-submit-btn"
                type="submit"
                disabled={!text.trim() || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                Translate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
