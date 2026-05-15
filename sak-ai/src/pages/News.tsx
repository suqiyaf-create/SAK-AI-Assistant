import React, { useEffect, useState } from 'react';
import { Newspaper, Loader2, ExternalLink, Globe } from 'lucide-react';
import api from '../lib/api';

const CATEGORIES = ['World', 'Business', 'Technology', 'Science', 'Health', 'Entertainment', 'Sports'];

export default function News() {
  const [news, setNews] = useState<any>(null);
  const [category, setCategory] = useState('World');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchNews = async () => {
    setLoading(true); setErr('');
    try {
      const r = await api.get('/news');
      setNews(r.data);
    } catch (e: any) {
      setErr('Failed to load news headlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const articles = news ? news[category] : [];

  return (
    <div className="h-full overflow-y-auto" data-testid="news-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Global News</div>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Newspaper className="h-7 w-7 text-sky-500" /> Latest Headlines
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Curated world news updated in real-time.</p>

        {/* Categories */}
        <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
            <p className="text-sm font-medium">Fetching global headlines…</p>
          </div>
        ) : err ? (
          <div className="mt-8 p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-center border border-rose-100 dark:border-rose-500/20">
            {err}
            <button onClick={fetchNews} className="block mx-auto mt-3 text-sky-500 font-bold hover:underline">Retry</button>
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
            {articles?.map((item: any, i: number) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-xl hover:translate-y-[-4px] hover:border-sky-300 dark:hover:border-sky-500/30"
              >
                <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                   <img 
                    src={item.og || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400'} 
                    alt="" 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400'}
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold text-white flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {item.source}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                       News Source
                    </span>
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
