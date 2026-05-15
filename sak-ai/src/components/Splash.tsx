import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

export default function Splash({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const fullText = "SAK AI";

  useEffect(() => {
    // Typing effect
    let i = 0;
    const typingTimer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingTimer);
      }
    }, 120);

    // After 4 seconds total, start fading out
    const mainTimer = setTimeout(() => {
      setVisible(false);
      // Wait for exit animation to finish before calling onDone
      setTimeout(onDone, 900);
    }, 4000);

    return () => {
      clearInterval(typingTimer);
      clearTimeout(mainTimer);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute h-[800px] w-[800px] rounded-full bg-sky-500/5 blur-[120px]"
          />

          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(60)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full opacity-30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 1.5 + 0.5}px`,
                  height: `${Math.random() * 1.5 + 0.5}px`,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center">
            {/* Orbits Container */}
            <div className="relative h-72 w-72 flex items-center justify-center mb-16">
              {/* Central Logo with Glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="z-10 h-40 w-40 rounded-full bg-[#0B0F1A] border border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(14,165,233,0.4)] relative overflow-hidden group"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-purple-500/20"
                  animate={{ 
                    rotate: [0, 360],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative flex font-heading font-black text-6xl tracking-tighter text-white">
                  S<span className="text-sky-400">A</span>K
                </div>

                {/* Laser scan effect */}
                <motion.div 
                  animate={{ 
                    top: ['-20%', '120%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,1)] z-20"
                />
              </motion.div>

              {/* Orbit 1 (Primary) */}
              <div className="absolute h-56 w-56 rounded-full border border-white/10" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute h-56 w-56"
              >
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#fcd34d] shadow-[0_0_25px_rgba(252,211,77,0.9)] border-2 border-white/30" />
              </motion.div>

              {/* Orbit 2 (Secondary) */}
              <div className="absolute h-[320px] w-[320px] rounded-full border border-white/5 border-dashed" />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute h-[320px] w-[320px]"
              >
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#60a5fa] shadow-[0_0_20px_rgba(96,165,250,0.8)] border border-white/20" 
                />
              </motion.div>

              {/* Orbit 3 (Outer Shell) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute h-[450px] w-[450px] rounded-full border border-sky-400/20"
              />
            </div>

            {/* Typewriting Text */}
            <div className="flex flex-col items-center gap-10">
              <div className="relative flex items-center h-16">
                <span className="font-heading text-4xl md:text-6xl font-bold text-white tracking-[0.2em] uppercase text-center filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {displayText}
                </span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-[5px] h-12 md:h-16 bg-sky-400 ml-2"
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-sky-400/60 text-[10px] uppercase font-black tracking-[0.3em]"
              >
                Created by Suqiya · Final Year Student
              </motion.div>

              <div className="flex gap-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ 
                      opacity: [0.2, 0.6, 0.2],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    className="h-2.5 w-2.5 rounded-full bg-sky-400/40"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
