import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink, Bookmark as BookmarkIcon, X } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  created_at: string;
}

export default function Bookmarks() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', description: '' });

  const load = () => {
    const stored = localStorage.getItem('sak_bookmarks');
    if (stored) setItems(JSON.parse(stored));
  };

  useEffect(() => { load(); }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      ...form,
      created_at: new Date().toISOString(),
    };
    const updated = [newBookmark, ...items];
    setItems(updated);
    localStorage.setItem('sak_bookmarks', JSON.stringify(updated));
    setForm({ title: '', url: '', description: '' });
    setOpen(false);
  };

  const del = (id: string) => {
    if (!window.confirm('Delete bookmark?')) return;
    const updated = items.filter(b => b.id !== id);
    setItems(updated);
    localStorage.setItem('sak_bookmarks', JSON.stringify(updated));
  };

  return (
    <div className="h-full overflow-y-auto" data-testid="bookmarks-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Bookmarks</div>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Your saved links</h1>
          </div>
          <button
            data-testid="add-bookmark-btn"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Link
          </button>
        </div>

        {open && (
          <form onSubmit={save} className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
               <h3 className="font-semibold text-lg">Add New Bookmark</h3>
               <button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <input
                data-testid="bookmark-title"
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <input
                data-testid="bookmark-url"
                required
                type="url"
                placeholder="https://…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <input
                data-testid="bookmark-desc"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button data-testid="bookmark-save-btn" type="submit" className="px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-md shadow-sky-500/10">Save Bookmark</button>
            </div>
          </form>
        )}

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 && !open && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
              <BookmarkIcon className="h-12 w-12 text-sky-400 opacity-50" />
              <div className="mt-4 font-medium">No bookmarks yet.</div>
              <p className="mt-1 text-sm text-slate-400">Save your favorite links here for quick access.</p>
            </div>
          )}
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 group transition-all hover:shadow-lg hover:border-sky-300/50 dark:hover:border-sky-500/30 flex flex-col h-full animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <a href={b.url} target="_blank" rel="noreferrer" className="flex-1 font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1.5 min-w-0 transition-colors">
                  <span className="truncate">{b.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
                <button onClick={() => del(b.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1.5 text-xs text-sky-600 dark:text-sky-400 truncate font-medium">{new URL(b.url).hostname}</div>
              {b.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1 grow">{b.description}</p>}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                 <span>Saved {new Date(b.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
