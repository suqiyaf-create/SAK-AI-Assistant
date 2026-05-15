import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import Splash from './components/Splash';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <span className="text-sm font-medium animate-pulse">Establishing secure connection...</span>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/auth" replace />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/app" replace /> : children;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const finishSplash = () => {
    setSplashDone(true);
  };

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {!splashDone ? (
          <Splash key="splash" onDone={finishSplash} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<PublicOnly><Auth /></PublicOnly>} />
                  <Route path="/app/*" element={<Protected><Dashboard /></Protected>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

