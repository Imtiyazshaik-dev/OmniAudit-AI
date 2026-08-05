import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardView from './pages/DashboardView';
import UploadView from './pages/UploadView';
import GstrSummaryView from './pages/GstrSummaryView';
import HistoryView from './pages/HistoryView';
import LoginView from './pages/LoginView';
import RegisterView from './pages/RegisterView';
import { AuthProvider } from './context/AuthContext';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col bg-grid-pattern selection:bg-indigo-500 selection:text-white">
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/upload" element={<UploadView />} />
            <Route path="/gstr-summary" element={<GstrSummaryView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-6 text-xs text-zinc-500 text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>OmniAudit AI © 2026 — Intelligent IDP & Automated GST Compliance Engine</span>
            </div>
            <div className="text-zinc-400 text-[11px] font-sans">
              Built with React, Vite, Express, Tailwind CSS & Google Gemini 3.6 Flash
            </div>
          </div>
        </footer>

      </div>
    </AuthProvider>
  );
}
