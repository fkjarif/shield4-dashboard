import { Link, Outlet, useLocation } from 'react-router-dom';
import { Settings, Shield, Activity, HardDrive, LayoutDashboard, Menu } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { Button } from './ui/button';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { isEnabled } = useSimulation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Incidents', path: '/incidents', icon: Activity },
    { name: 'Assets', path: '/assets', icon: HardDrive },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Shield className="w-6 h-6 mr-3 text-cyan-600 dark:text-cyan-400" />
          <span className="font-bold text-lg tracking-tight">SHIELD4</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link key={item.name} to={item.path}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start ${active ? "bg-slate-200/50 dark:bg-slate-800/50 text-cyan-700 dark:text-cyan-400" : ""}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Content */}
      <div className="flex-1 flex flex-col flex-wrap">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {navItems.find(i => i.path === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {isEnabled && (
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full border border-green-200 dark:border-green-800/50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 dark:bg-green-400"></span>
                </span>
                <span className="text-xs font-bold text-green-700 dark:text-green-400 tracking-wider">LIVE SIMULATION</span>
              </div>
            )}
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer menu (simple) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-slate-100 dark:bg-slate-900 h-full shadow-xl flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
              <Shield className="w-6 h-6 mr-3 text-cyan-500" />
              <span className="font-bold text-lg">SHIELD4</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;
                return (
                  <Link key={item.name} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={`w-full justify-start ${active ? "bg-cyan-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400" : ""}`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
