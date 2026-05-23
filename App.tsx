/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import IncidentsPage from './pages/IncidentsPage';
import AssetsPage from './pages/AssetsPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './hooks/useTheme';
import { seedDatabase } from './db';

export default function App() {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setSeeded(true));
  }, []);

  if (!seeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-mono text-sm tracking-widest">INITIALIZING SECURE DATACENTER...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
