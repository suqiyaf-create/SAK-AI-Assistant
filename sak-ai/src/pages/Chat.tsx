import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Plus, Trash2, Copy, Volume2, Loader2,
  Paperclip, Camera, Image as ImageIcon, FileDown, X, FileText, History,
  Mic, MicOff, Square, Check, FileSearch
} from 'lucide-react';
import jsPDF from 'jspdf';
import { GoogleGenAI } from "@google/genai";
import SakBadge from '../components/SakBadge';

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

function exportChatPdf(messages: any[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.setTextColor(14, 165, 233);
  doc.text('SAK AI — Conversation Export', margin, y);
  y += 24;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exported: ${new Date().toLocaleString()}`, margin, y);
  y += 24;

  messages.forEach((m, i) => {
    if (y > 780) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(m.role === 'user' ? 14 : 30);
    doc.text(m.role === 'user' ? 'You' : 'SAK AI', margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(m.content || '', pageWidth - margin * 2);
    lines.forEach((ln: string) => {
      if (y > 800) { doc.addPage(); y = margin; }
      doc.text(ln, margin, y); y += 14;
    });
    y += 8;
  });
  doc.save(`sak-ai-chat-${Date.now()}.pdf`);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: {
    kind: 'image' | 'file';
    url?: string;
    name: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updated_at: string;
}

function CodeBlock({ children, language }: { children: string, language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{language || 'code'}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:text-sky-700">
          {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={language ? `language-${language}` : ''}>{children}</code>
      </pre>
    </div>
  );
}

export default function Chat({ initialMessage }: { initialMessage?: string }) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([{ role: 'assistant', content: initialMessage }]);
    }
  }, [initialMessage]);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const loadHistory = () => {
    const stored = localStorage.getItem('sak_chats');
    if (stored) {
      const parsed = JSON.parse(stored);
      setChats(parsed);
    }
  };

  const loadChat = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    setActiveId(id);
    setMessages(chat.messages || []);
    setShowHistory(false);
  };

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const newChat = () => { setActiveId(null); setMessages([]); setInput(''); setAttachment(null); setShowHistory(false); };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat?')) return;
    const updated = chats.filter(c => c.id !== id);
    setChats(updated);
    localStorage.setItem('sak_chats', JSON.stringify(updated));
    if (activeId === id) newChat();
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'file' | 'image') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const att: any = { file, kind: isImage ? 'image' : 'file', name: file.name, size: file.size };
    if (isImage) {
      att.previewUrl = await fileToBase64(file);
    }
    setAttachment(att);
  };

  const clearAttachment = () => setAttachment(null);

  const toggleDictation = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    rec.start();
  };

  const saveCurrentChat = (updatedMessages: Message[]) => {
    const chatId = activeId || Math.random().toString(36).substr(2, 9);
    const existingChat = chats.find(c => c.id === chatId);
    const title = existingChat?.title || updatedMessages[0].content.slice(0, 50) || 'New Conversation';

    const newSession: ChatSession = {
      id: chatId,
      title,
      messages: updatedMessages,
      updated_at: new Date().toISOString()
    };

    const newChats = [newSession, ...chats.filter(c => c.id !== chatId)];
    setChats(newChats);
    localStorage.setItem('sak_chats', JSON.stringify(newChats));
    if (!activeId) setActiveId(chatId);
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (sending) return;
    const text = input.trim();
    if (!text && !attachment) return;

    const userMsg: Message = {
      role: 'user',
      content: text || (attachment?.kind === 'image' ? `📷 Image analysis` : `📎 File analysis`),
      attachment: attachment ? {
        kind: attachment.kind,
        name: attachment.name,
        url: attachment.previewUrl
      } : undefined
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);
    setSending(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        systemInstruction: "You are SAK AI, a highly advanced assistant created by Suqiya (a final year ECT student). You are intelligent, helpful, and creative. You can analyze images, PDFs, and code with precision. Always maintain a professional yet warm tone."
      });
      
      // Prepare history for Gemini API
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const chat = model.startChat({ history });

      const parts: any[] = [{ text: text || (attachment?.kind === 'image' ? "Describe this image." : "Summarize this file content.") }];

      if (attachment) {
        if (attachment.kind === 'image') {
           const b64 = (attachment.previewUrl as string).split(',')[1];
           parts.push({ inlineData: { data: b64, mimeType: attachment.file.type } });
        } else if (attachment.file.type === 'application/pdf') {
           const b64full = await fileToBase64(attachment.file);
           const b64 = b64full.split(',')[1];
           parts.push({ inlineData: { data: b64, mimeType: 'application/pdf' } });
        } else {
           const fileText = await attachment.file.text();
           parts[0].text += `\n\nFile content:\n${fileText.slice(0, 10000)}`;
        }
      }

      const result = await chat.sendMessageStream(parts);

      setIsThinking(false);
      let fullText = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const chunk of result.stream) {
        if (controller.signal.aborted) break;
        const chunkText = chunk.text();
        fullText += chunkText;
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1] = { role: 'assistant', content: fullText };
          return last;
        });
      }

      setAttachment(null);
      saveCurrentChat([...newMessages, { role: 'assistant', content: fullText }]);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages([...newMessages, { role: 'assistant', content: `**Error:** ${error.message}` }]);
      }
    } finally {
      setSending(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setSending(false);
      setAbortController(null);
    }
  };

  return (
    <div className="h-full flex relative" data-testid="chat-page">
      {/* History sidebar (desktop) + drawer (mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform lg:translate-x-0 lg:static lg:flex transition-transform duration-300 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${
          showHistory ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            data-testid="new-chat-btn"
            onClick={newChat}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
          <button onClick={() => setShowHistory(false)} className="lg:hidden h-10 w-10 grid place-items-center rounded-xl border border-slate-200 dark:border-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.length === 0 && <div className="text-xs text-slate-500 px-3 py-4">No conversations yet.</div>}
          {chats.map((c) => (
            <div
              key={c.id}
              onClick={() => loadChat(c.id)}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                activeId === c.id ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="truncate flex-1">{c.title}</span>
              <button
                onClick={(e) => deleteChat(c.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20"
                aria-label="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {showHistory && <div onClick={() => setShowHistory(false)} className="lg:hidden fixed inset-0 z-20 bg-black/40" />}

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile-only controls + actions) */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
          <button
            onClick={() => setShowHistory(true)}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-800"
          >
            <History className="h-4 w-4" /> History
          </button>
          <div className="text-xs text-slate-500 truncate ml-auto font-medium">
            {messages.length} message{messages.length === 1 ? '' : 's'}
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => exportChatPdf(messages)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
            >
              <FileDown className="h-4 w-4" /> Export PDF
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 scrollbar-thin bg-slate-50 dark:bg-slate-950">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-700" />
                <SakBadge size="lg" />
              </div>
              
              <div className="space-y-4">
                <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">How can I help today?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ask anything. Attach a PDF or photo for instant intelligence.</p>
                
                {initialMessage && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 px-4 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 ring-1 ring-sky-200 dark:ring-sky-500/30">
                    <FileSearch className="h-3 w-3" /> PDF Mode Enabled
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                {[
                  'Explain quantum computing simply',
                  'Plan a 3-day Tokyo trip',
                  'Summarize an attached PDF',
                  'Describe a photo I take',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 text-left text-sm transition-all hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/5 shadow-sm"
                  >
                    <span className="relative z-10 font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-sm relative ${
                      m.role === 'user'
                        ? 'bg-sky-600 text-white shadow-sky-500/10'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* User identifier dot or badge could go here if needed, but screenshot shows clean bubbles */}
                    
                    {/* Attachment preview */}
                    {m.attachment?.kind === 'image' && (
                      <img src={m.attachment.url} alt={m.attachment.name} className="mb-4 max-h-80 w-auto rounded-xl shadow-lg border border-white/10" />
                    )}
                    {m.attachment?.kind === 'file' && (
                      <div className={`mb-4 inline-flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold ring-1 transition-all ${
                        m.role === 'user'
                          ? 'bg-white/10 ring-white/20 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 ring-slate-100 dark:ring-slate-800 text-slate-700 dark:text-slate-200'
                      }`}>
                        <div className="h-10 w-10 rounded-lg bg-sky-500/20 flex items-center justify-center relative group">
                           <div className="absolute inset-0 bg-sky-500/10 scale-0 group-hover:scale-100 transition-transform rounded-lg" />
                           <FileText className="h-5 w-5 text-sky-500 relative z-10" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <span className="truncate max-w-[140px] uppercase tracking-tighter">{m.attachment.name}</span>
                           <span className="text-[9px] opacity-60 font-black tracking-widest uppercase">Document</span>
                        </div>
                        {m.attachment.url && (
                          <a 
                            href={m.attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
                            title="View Document"
                          >
                            <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                          </a>
                        )}
                      </div>
                    )}
                    {m.role === 'assistant' ? (
                      <>
                        <div className="markdown text-base leading-relaxed prose prose-slate dark:prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline ? (
                                  <CodeBlock language={match ? match[1] : ''}>
                                    {String(children).replace(/\n$/, '')}
                                  </CodeBlock>
                                ) : (
                                  <code className={`${className} bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-sky-600 dark:text-sky-400 font-mono text-sm`} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                        {m.content && (
                          <div className="mt-6 flex gap-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <button onClick={() => navigator.clipboard.writeText(m.content)} className="text-[10px] uppercase tracking-widest font-black inline-flex items-center gap-1.5 text-slate-400 hover:text-sky-500 transition-colors">
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </button>
                            <button onClick={() => speak(m.content)} className="text-[10px] uppercase tracking-widest font-black inline-flex items-center gap-1.5 text-slate-400 hover:text-sky-500 transition-colors">
                              <Volume2 className="h-3.5 w-3.5" /> Listen
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[15px] whitespace-pre-wrap leading-relaxed font-medium">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-4 self-start max-w-[85%]"
              >
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="h-4 w-4 bg-sky-500 rounded-full animate-ping absolute inset-0 opacity-20" />
                      <div className="h-4 w-4 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.6)]" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">SAK AI Processing</span>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-100 dark:border-slate-800/50 w-72 relative overflow-hidden group shadow-sm">
                   {/* Animated Sparkles */}
                   <motion.div 
                     animate={{ 
                       rotate: 360,
                       scale: [1, 1.2, 1],
                       opacity: [0.1, 0.3, 0.1]
                     }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute -top-10 -right-10 w-32 h-32 bg-sky-400 blur-3xl rounded-full"
                   />
                   <motion.div 
                     animate={{ 
                        y: [-10, 10, -10],
                        opacity: [0.2, 0.4, 0.2]
                     }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400 blur-3xl rounded-full"
                   />
                   
                   <div className="flex gap-2.5 relative z-10">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ 
                            y: [0, -6, 0],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{ 
                            duration: 0.8, 
                            repeat: Infinity, 
                            delay: i * 0.15 
                          }}
                          className="h-2 w-2 bg-sky-500 rounded-full"
                        />
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
            <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={send} className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 sm:px-6 py-6 transition-all">
          <div className="max-w-3xl mx-auto">
            {/* Attachment chip */}
            {attachment && (
              <div className="mb-4 flex items-center gap-4 rounded-2xl border border-sky-300/40 dark:border-sky-500/20 bg-sky-50/50 dark:bg-sky-500/5 p-4 animate-fade-up">
                {attachment.kind === 'image' ? (
                  <img src={attachment.previewUrl} alt="" className="h-14 w-14 object-cover rounded-xl shadow-sm" />
                ) : (
                  <div className="h-14 w-14 grid place-items-center rounded-xl bg-sky-100 dark:bg-sky-500/20">
                    <FileText className="h-7 w-7 text-sky-600 dark:text-sky-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{attachment.name}</div>
                  <div className="text-xs text-slate-500 font-medium">Ready to analyze · {Math.round(attachment.size / 1024)} KB</div>
                </div>
                <button type="button" onClick={clearAttachment} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Action toolbar */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar scroll-smooth">
              <button type="button" onClick={() => fileRef.current?.click()} className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-bold bg-slate-100/50 dark:bg-slate-900/50 hover:bg-sky-50 dark:hover:bg-sky-500/10 text-slate-700 dark:text-slate-300 transition-all whitespace-nowrap border border-transparent hover:border-sky-200 dark:hover:border-sky-500/30">
                <Paperclip className="h-4 w-4 text-slate-500 group-hover:text-sky-500" /> Attach file
              </button>
              <button type="button" onClick={() => photoRef.current?.click()} className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-bold bg-slate-100/50 dark:bg-slate-900/50 hover:bg-sky-50 dark:hover:bg-sky-500/10 text-slate-700 dark:text-slate-300 transition-all whitespace-nowrap border border-transparent hover:border-sky-200 dark:hover:border-sky-500/30">
                <Camera className="h-4 w-4 text-slate-500 group-hover:text-sky-500" /> Take photo
              </button>
              <button type="button" onClick={() => galleryRef.current?.click()} className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-bold bg-slate-100/50 dark:bg-slate-900/50 hover:bg-sky-50 dark:hover:bg-sky-500/10 text-slate-700 dark:text-slate-300 transition-all whitespace-nowrap border border-transparent hover:border-sky-200 dark:hover:border-sky-500/30">
                <ImageIcon className="h-4 w-4 text-slate-500 group-hover:text-sky-500" /> Add photo
              </button>
              <button
                type="button"
                onClick={toggleDictation}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-bold border transition-all whitespace-nowrap ${
                  isListening
                    ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/25'
                    : 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent hover:border-sky-200 dark:hover:border-sky-500/30 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-slate-500" />}
                {isListening ? 'Stop Listening' : 'Voice'}
              </button>

              <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.html,.xml,.log,.py,.js,.ts" onChange={(e) => onPickFile(e, 'file')} className="hidden" />
              <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={(e) => onPickFile(e, 'image')} className="hidden" />
              <input ref={galleryRef} type="file" accept="image/*" onChange={(e) => onPickFile(e, 'image')} className="hidden" />
            </div>

            {/* Input area */}
            <div className="relative group">
              {sending && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                   <button 
                     type="button"
                     onClick={stopGeneration}
                     className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                   >
                     <Square className="h-3 w-3 fill-current" /> Stop generating
                   </button>
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    data-testid="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    rows={1}
                    placeholder={attachment ? 'Add instructions for the attachment…' : `Message SAK AI...`}
                    className="w-full resize-none rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-6 py-5 pr-14 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 max-h-60 text-[15px] shadow-sm transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!input.trim() && !attachment) || sending}
                  className="h-[60px] w-[60px] shrink-0 inline-flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white disabled:opacity-50 shadow-xl shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 group-focus-within:ring-2 group-focus-within:ring-sky-500 ring-offset-2 dark:ring-offset-slate-950"
                >
                  {sending ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7" />}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
