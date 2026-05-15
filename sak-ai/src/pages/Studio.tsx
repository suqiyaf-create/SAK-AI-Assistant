import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Download, History, Send, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  created_at: string;
}

export default function Studio() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [activeImg, setActiveImg] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('sak_studio_images');
    if (stored) setImages(JSON.parse(stored));
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt.trim(),
      });

      let base64 = '';
      for (const part of response.candidates?.[0].content.parts || []) {
        if (part.inlineData) {
          base64 = part.inlineData.data;
          break;
        }
      }

      if (!base64) throw new Error('No image returned');

      const newImg: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: `data:image/png;base64,${base64}`,
        prompt: prompt.trim(),
        created_at: new Date().toISOString(),
      };

      const updated = [newImg, ...images];
      setImages(updated);
      localStorage.setItem('sak_studio_images', JSON.stringify(updated));
      setActiveImg(newImg);
      setPrompt('');
    } catch (e2: any) {
      alert(e2?.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const deleteImg = (id: string) => {
    const updated = images.filter(i => i.id !== id);
    setImages(updated);
    localStorage.setItem('sak_studio_images', JSON.stringify(updated));
    if (activeImg?.id === id) setActiveImg(null);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden" data-testid="studio-page">
      {/* Search Sidebar */}
      <aside className="w-full lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
           <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Image Studio</div>
           <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Create Visuals</h1>
           <p className="mt-1 text-sm text-slate-500">Convert your imagination to pixels.</p>

           <form onSubmit={generate} className="mt-8 space-y-4">
             <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with purple neon signs and flying cars, high resolution, cinematic lighting…"
                  className="w-full h-32 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">Gemini 2.5 Flash</div>
             </div>
             <button
               type="submit"
               disabled={!prompt.trim() || loading}
               className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
             >
               {loading ? (
                 <>
                   <Loader2 className="h-5 w-5 animate-spin" />
                   Generating Pixels…
                 </>
               ) : (
                 <>
                   <Sparkles className="h-5 w-5" />
                   Generate Image
                 </>
               )}
             </button>
           </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <History className="h-4 w-4" /> Recent Works
              </h3>
              <span className="text-xs text-slate-400">{images.length} works</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              {images.map(img => (
                <div
                  key={img.id}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    activeImg?.id === img.id ? 'border-sky-500 scale-[0.98]' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <img src={img.url} alt={img.prompt} className="h-full w-full object-cover" />
                </div>
              ))}
           </div>
           {images.length === 0 && (
             <div className="py-12 text-center">
                <ImageIcon className="h-10 w-10 mx-auto text-slate-200 dark:text-slate-800" />
                <p className="mt-2 text-xs text-slate-500">No images yet.</p>
             </div>
           )}
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-y-auto p-4 md:p-8 lg:p-12">
         {activeImg ? (
           <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800 bg-white dark:bg-slate-950">
                 <img src={activeImg.url} alt={activeImg.prompt} className="w-full h-auto" />
                 <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = activeImg.url;
                        a.download = `sak-ai-${activeImg.id}.png`;
                        a.click();
                      }}
                      className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    >
                       <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteImg(activeImg.id)}
                      className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-rose-400 flex items-center justify-center hover:bg-rose-500/80 hover:text-white transition-colors"
                    >
                       <Trash2 className="h-5 w-5" />
                    </button>
                 </div>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500 mb-2">Prompt used</h2>
                 <p className="text-lg font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">
                   "{activeImg.prompt}"
                 </p>
                 <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(activeImg.created_at).toLocaleString()}</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Gemini 2.5 Flash</span>
                 </div>
              </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="h-32 w-32 rounded-full bg-sky-500/10 flex items-center justify-center animate-pulse-slow mb-8">
                 <Sparkles className="h-16 w-16 text-sky-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-semibold tracking-tighter">Your ideas await.</h2>
              <p className="mt-4 max-w-md text-slate-500">Describe what you want to see, and watch SAK AI bring it to life with high-speed intelligence.</p>

              <div className="mt-12 grid grid-cols-2 gap-3 max-w-md">
                 {[
                   'Cyberpunk skyline with rain',
                   'Minimalist logo for tech startup',
                   'Vibrant garden with glass flowers',
                   'Astronaut floating in ocean'
                 ].map(s => (
                   <button
                     key={s}
                     onClick={() => setPrompt(s)}
                     className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                   >
                     {s}
                   </button>
                 ))}
              </div>
           </div>
         )}
      </main>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
