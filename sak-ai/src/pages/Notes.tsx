import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, NotebookPen, X, Save, Clock, Tag } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updated_at: string;
}

export default function Notes() {
  const [items, setItems] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [q, setQ] = useState('');

  const load = () => {
    const stored = localStorage.getItem('sak_notes');
    if (stored) setItems(JSON.parse(stored));
  };

  useEffect(() => { load(); }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const newNote = { ...editing, updated_at: new Date().toISOString() };
    let updated;
    if (items.some(n => n.id === editing.id)) {
      updated = items.map(n => n.id === editing.id ? newNote : n);
    } else {
      updated = [newNote, ...items];
    }
    setItems(updated);
    localStorage.setItem('sak_notes', JSON.stringify(updated));
    setEditing(null);
  };

  const del = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete note?')) return;
    const updated = items.filter(n => n.id !== id);
    setItems(updated);
    localStorage.setItem('sak_notes', JSON.stringify(updated));
    if (editing?.id === id) setEditing(null);
  };

  const create = () => {
    setEditing({
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      content: '',
      tags: [],
      updated_at: new Date().toISOString()
    });
  };

  const filtered = items.filter(n =>
    n.title.toLowerCase().includes(q.toLowerCase()) ||
    n.content.toLowerCase().includes(q.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden" data-testid="notes-page">
      {/* List Sidebar */}
      <aside className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all ${editing ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Notes</h1>
            <button
              onClick={create}
              className="h-9 w-9 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notes…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400">
               <NotebookPen className="h-10 w-10 mx-auto opacity-20" />
               <p className="mt-3 text-sm">No notes found.</p>
            </div>
          )}
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => setEditing(n)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                editing?.id === n.id
                  ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent'
              }`}
            >
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{n.title || 'Untitled Note'}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{n.content || 'No content'}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(n.updated_at).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => del(n.id, e)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className={`flex-1 flex flex-col bg-white dark:bg-slate-950 ${!editing ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!editing ? (
          <div className="text-center max-w-sm px-6">
             <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6">
                <NotebookPen className="h-10 w-10 text-slate-300" />
             </div>
             <h2 className="text-xl font-heading font-semibold">Select a note to view</h2>
             <p className="mt-2 text-slate-500 text-sm">Or create a new one to start capturing your brilliant ideas.</p>
             <button onClick={create} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20">
               <Plus className="h-4 w-4" /> Create New Note
             </button>
          </div>
        ) : (
          <form onSubmit={save} className="flex-1 flex flex-col p-4 md:p-8 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={() => setEditing(null)} className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800">
                <X className="h-5 w-5" />
              </button>
              <div className="ml-auto flex gap-2">
                 <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">Cancel</button>
                 <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20">
                   <Save className="h-4 w-4" /> Save
                 </button>
              </div>
            </div>

            <input
              autoFocus
              placeholder="Note Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="text-4xl md:text-5xl font-heading font-bold bg-transparent outline-none border-none placeholder:text-slate-200 dark:placeholder:text-slate-800 tracking-tighter"
            />

            <div className="mt-4 flex flex-wrap gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Tag className="h-3.5 w-3.5 text-sky-500" />
                  <input
                    placeholder="Add tags…"
                    className="bg-transparent text-xs outline-none w-24"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !editing.tags.includes(val)) {
                          setEditing({ ...editing, tags: [...editing.tags, val] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
               </div>
               {editing.tags.map(t => (
                 <span key={t} className="px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-xs font-medium text-sky-600 flex items-center gap-2">
                   {t}
                   <button onClick={() => setEditing({ ...editing, tags: editing.tags.filter(tag => tag !== t) })} className="hover:text-sky-800"><X className="h-3 w-3" /></button>
                 </span>
               ))}
            </div>

            <textarea
              placeholder="Start writing…"
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              className="flex-1 mt-8 w-full resize-none bg-transparent outline-none text-lg leading-relaxed font-sans placeholder:text-slate-200 dark:placeholder:text-slate-800"
            />
          </form>
        )}
      </main>
    </div>
  );
}
