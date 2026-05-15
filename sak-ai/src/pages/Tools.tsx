import React, { useState, useEffect, useRef } from 'react';
import { 
  Puzzle, QrCode, ArrowRightLeft, Quote, Download, 
  RefreshCcw, Scale, Thermometer, Ruler, Zap, Loader2,
  Clock, Play, Pause, RotateCcw, FileText, FileUp, FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../lib/api';

export default function Tools() {
  const [activeTool, setActiveTool] = useState<'qr' | 'convert' | 'quote' | 'timer' | 'pass' | 'pdf'>('qr');

  return (
    <div className="h-full overflow-y-auto" data-testid="tools-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Utilities</div>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Puzzle className="h-7 w-7 text-sky-500" /> Essential Tools
        </h1>
        <p className="mt-1 text-sm text-slate-500">Handy utilities for your daily workflow.</p>

        {/* Tool Selector */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <ToolTab 
            icon={QrCode} 
            label="QR Gen" 
            active={activeTool === 'qr'} 
            onClick={() => setActiveTool('qr')} 
          />
          <ToolTab 
            icon={ArrowRightLeft} 
            label="Convert" 
            active={activeTool === 'convert'} 
            onClick={() => setActiveTool('convert')} 
          />
          <ToolTab 
            icon={Quote} 
            label="Quotes" 
            active={activeTool === 'quote'} 
            onClick={() => setActiveTool('quote')} 
          />
          <ToolTab 
            icon={Clock} 
            label="Focus" 
            active={activeTool === 'timer'} 
            onClick={() => setActiveTool('timer')} 
          />
          <ToolTab 
            icon={Zap} 
            label="Pass Gen" 
            active={activeTool === 'pass'} 
            onClick={() => setActiveTool('pass')} 
          />
          <ToolTab 
            icon={FileText} 
            label="PDF Tools" 
            active={activeTool === 'pdf'} 
            onClick={() => setActiveTool('pdf')} 
          />
        </div>

        <div className="mt-8">
          {activeTool === 'qr' && <QrGenerator />}
          {activeTool === 'convert' && <UnitConverter />}
          {activeTool === 'quote' && <QuoteBox />}
          {activeTool === 'timer' && <PomodoroTimer />}
          {activeTool === 'pass' && <PasswordGenerator />}
          {activeTool === 'pdf' && <PdfConverter />}
        </div>
      </div>
    </div>
  );
}

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Switch mode
          setIsActive(false);
          const nextMode = mode === 'work' ? 'break' : 'work';
          setMode(nextMode);
          setMinutes(nextMode === 'work' ? 25 : 5);
          setSeconds(0);
          alert(`Time for ${nextMode}!`);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, minutes, seconds, mode]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-10 animate-fade-up text-center">
      <h2 className="text-2xl font-heading font-semibold">Focus Timer</h2>
      <p className="mt-2 text-slate-500 text-sm">Boost productivity with the Pomodoro technique.</p>
      
      <div className="mt-10 flex flex-col items-center">
         <div className="flex gap-4 mb-8">
            <button 
              onClick={() => { setMode('work'); reset(); }}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'work' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
            >
              Work
            </button>
            <button 
              onClick={() => { setMode('break'); reset(); }}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'break' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
            >
              Break
            </button>
         </div>

         <div className="text-8xl md:text-[10rem] font-heading font-black tracking-tighter text-slate-900 dark:text-white leading-none">
            {String(minutes).padStart(2, '0')}<span className="text-sky-500 animate-pulse">:</span>{String(seconds).padStart(2, '0')}
         </div>

         <div className="mt-12 flex gap-4">
            <button 
              onClick={toggle}
              className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-rose-500 shadow-rose-500/20' : 'bg-sky-500 shadow-sky-500/20'} text-white shadow-xl hover:scale-105 active:scale-95`}
            >
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </button>
            <button 
              onClick={reset}
              className="h-16 w-16 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:rotate-[-45deg]"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
         </div>
      </div>
    </div>
  );
}

function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [pass, setPass] = useState('');
  const [copied, setCopied] = useState(false);

  const gen = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let p = '';
    for (let i = 0; i < length; i++) {
      p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPass(p);
  };

  useEffect(() => { gen(); }, [length]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-10 animate-fade-up">
       <h2 className="text-2xl font-heading font-semibold">Secure Password Generator</h2>
       <p className="mt-2 text-slate-500 text-sm">Create strong, random passwords instantly.</p>
       
       <div className="mt-10 max-w-xl mx-auto">
          <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 text-center relative overflow-hidden group">
             <div className="font-mono text-3xl md:text-4xl break-all line-clamp-1 text-slate-900 dark:text-white">
                {pass}
             </div>
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(pass);
                 setCopied(true);
                 setTimeout(() => setCopied(false), 2000);
               }}
               className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-sky-500 hover:text-sky-600 uppercase tracking-widest transition-all"
             >
                {copied ? 'Copied Successfully!' : 'Click to Copy Password'}
             </button>
          </div>

          <div className="mt-8 space-y-6">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-slate-400">Length: {length}</label>
                <button onClick={gen} className="text-sky-500 hover:rotate-90 transition-transform">
                   <RefreshCcw className="h-4 w-4" />
                </button>
             </div>
             <input 
               type="range" min="8" max="64" value={length} 
               onChange={(e) => setLength(parseInt(e.target.value))}
               className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
             />
          </div>
       </div>
    </div>
  );
}

function ToolTab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
        active 
          ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
      }`}
    >
      <Icon className={`h-6 w-6 ${active ? 'text-sky-500' : 'text-slate-400'}`} />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function QrGenerator() {
  const [val, setVal] = useState('https://sak-ai.assistant');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(val)}`;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-10 animate-fade-up">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-heading font-semibold">QR Code Generator</h2>
          <p className="mt-2 text-slate-500 text-sm">Enter a URL or text to generate a clean, scannable QR code.</p>
          
          <div className="mt-6 space-y-4">
            <label className="block text-xs font-bold uppercase text-slate-400">Content</label>
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full h-32 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="https://example.com…"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl">
             <img src={qrUrl} alt="QR Code" className="h-48 w-48" />
          </div>
          <button 
            onClick={() => {
               const a = document.createElement('a');
               a.href = qrUrl;
               a.download = 'sak-qr.png';
               a.target = '_blank';
               a.click();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 text-sm font-bold shadow-lg shadow-sky-500/20"
          >
            <Download className="h-4 w-4" /> Download QR
          </button>
        </div>
      </div>
    </div>
  );
}

function UnitConverter() {
  const [val, setVal] = useState<number>(1);
  const [type, setType] = useState<'len' | 'temp' | 'weight' | 'energy'>('len');
  
  const CONVERSIONS = {
    len: [
      { label: 'Metres to Feet', calc: (v: number) => v * 3.28084, unit: 'ft' },
      { label: 'Km to Miles', calc: (v: number) => v * 0.621371, unit: 'mi' },
      { label: 'Miles to Km', calc: (v: number) => v / 0.621371, unit: 'km' },
    ],
    temp: [
      { label: 'Celsius to Fahrenheit', calc: (v: number) => (v * 9/5) + 32, unit: '°F' },
      { label: 'Fahrenheit to Celsius', calc: (v: number) => (v - 32) * 5/9, unit: '°C' },
    ],
    weight: [
      { label: 'Kg to Pounds', calc: (v: number) => v * 2.20462, unit: 'lbs' },
      { label: 'Pounds to Kg', calc: (v: number) => v / 2.20462, unit: 'kg' },
    ],
    energy: [
      { label: 'Joules to Calories', calc: (v: number) => v * 0.239006, unit: 'cal' },
      { label: 'Kj to Kcal', calc: (v: number) => v * 0.239006, unit: 'kcal' },
    ]
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-10 animate-fade-up">
      <h2 className="text-2xl font-heading font-semibold">Unit Converter</h2>
      <p className="mt-2 text-slate-500 text-sm">Quickly convert between common units of measurement.</p>
      
      <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar">
        <UnitTypeBtn icon={Ruler} label="Length" active={type === 'len'} onClick={() => setType('len')} />
        <UnitTypeBtn icon={Thermometer} label="Temp" active={type === 'temp'} onClick={() => setType('temp')} />
        <UnitTypeBtn icon={Scale} label="Weight" active={type === 'weight'} onClick={() => setType('weight')} />
        <UnitTypeBtn icon={Zap} label="Energy" active={type === 'energy'} onClick={() => setType('energy')} />
      </div>

      <div className="mt-8 grid gap-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
           <input
             type="number"
             value={val}
             onChange={(e) => setVal(Number(e.target.value))}
             className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4 text-2xl font-bold outline-none focus:ring-2 focus:ring-sky-500"
           />
           <RefreshCcw className="h-6 w-6 text-slate-300" />
        </div>
        
        <div className="grid gap-3">
          {CONVERSIONS[type].map((c, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-500">{c.label}</span>
              <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                {c.calc(val).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                <span className="ml-2 text-sm text-slate-400">{c.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UnitTypeBtn({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
        active 
          ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function QuoteBox() {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const r = await api.get('/quotes/random');
      setQuote(r.data[0]);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuote(); }, []);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-10 animate-fade-up min-h-[300px] flex flex-col justify-center">
       {loading ? (
         <Loader2 className="h-10 w-10 animate-spin mx-auto text-sky-500" />
       ) : (
         <div className="max-w-2xl mx-auto text-center space-y-6">
            <Quote className="h-12 w-12 text-sky-500/20 mx-auto" />
            <p className="text-2xl md:text-3xl font-heading font-semibold tracking-tight italic">
               "{quote?.q}"
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="h-[1px] w-12 bg-slate-200 dark:border-slate-800" />
              <div className="font-bold text-sky-500 uppercase tracking-widest text-xs">{quote?.a}</div>
            </div>
            <button 
              onClick={fetchQuote}
              className="mt-8 text-xs font-bold text-slate-400 hover:text-sky-500 flex items-center gap-2 mx-auto transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Next Quote
            </button>
         </div>
       )}
    </div>
  );
}

function PdfConverter() {
  const [text, setText] = useState('');
  const [converting, setConverting] = useState(false);

  const generatePdf = async () => {
    if (!text.trim()) return;
    setConverting(true);
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 15, 15);
      doc.save('sak-converted.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-10 animate-fade-up">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-heading font-semibold">Text to PDF</h2>
          <p className="mt-2 text-slate-500 text-sm">Convert your documents or text into high-quality PDF files instantly.</p>
          
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
               <label className="text-xs font-bold uppercase text-slate-400 font-mono">Input Content</label>
               <button onClick={() => setText('')} className="text-xs font-bold text-rose-500 hover:underline">Clear</button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-6 text-sm outline-none focus:ring-2 focus:ring-sky-500 resize-none font-sans dark:text-white"
              placeholder="Paste your text here to convert it to PDF..."
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
           <div className="h-20 w-16 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-4 w-4 bg-sky-500/20 rounded-bl-lg border-b border-l border-slate-200 dark:border-slate-800" />
              <FileText className="h-8 w-8 text-sky-500" />
           </div>
           <div className="mt-6 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Generate PDF</p>
              <p className="text-xs text-slate-500 mt-1">Ready to create your document</p>
           </div>
           
           <button 
             onClick={generatePdf}
             disabled={!text.trim() || converting}
             className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-8 py-4 text-sm font-bold shadow-xl shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
           >
             {converting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
             Download as PDF
           </button>

           <button 
             onClick={() => window.location.hash = '#/app/pdf'}
             className="mt-4 w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-8 py-4 text-sm font-bold transition-all"
           >
             Analyze Existing PDF
           </button>

           <div className="mt-10 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-[10px] uppercase font-bold text-slate-400">Pages</p>
                 <p className="text-lg font-black text-slate-900 dark:text-white">Auto</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-[10px] uppercase font-bold text-slate-400">Format</p>
                 <p className="text-lg font-black text-slate-900 dark:text-white">A4</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
