import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { useTheme } from '../hooks/useTheme';
import { Trash2, AlertTriangle, Moon, Sun } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('core'));
  const { theme, toggleTheme } = useTheme();

  if (!settings) {
    return <div className="p-8 text-center animate-pulse">Loading settings...</div>;
  }

  const toggleSimulation = async () => {
    await db.settings.update('core', { simulationEnabled: !settings.simulationEnabled });
  };

  const changeInterval = async (val: number[]) => {
    await db.settings.update('core', { simulationInterval: val[0] });
  };

  const clearData = async () => {
    await db.incidents.clear();
    // we keep assets to not break UI completely, or clear it if needed.
    // The instructions say "clear all data button".
    await db.assets.clear();
    localStorage.removeItem('shield4_seeded');
    window.location.reload(); 
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure simulation parameters and application preferences.</p>
      </div>

      <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Simulation Engine</CardTitle>
          <CardDescription>Control the automated generation of security incidents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Live Simulation
              </label>
              <p className="text-sm text-slate-500">Automatically inject random events into the datastore.</p>
            </div>
            <Switch checked={settings.simulationEnabled} onCheckedChange={toggleSimulation} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium leading-none">
                Injection Interval
              </label>
              <span className="text-sm text-slate-500">{settings.simulationInterval} seconds</span>
            </div>
            <Slider 
              value={[settings.simulationInterval]} 
              min={5} 
              max={120} 
              step={5}
              onValueChange={changeInterval}
              disabled={!settings.simulationEnabled}
              className={!settings.simulationEnabled ? 'opacity-50' : ''}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the application theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Dark Mode
              </label>
              <p className="text-sm text-slate-500">Toggle between light and dark color themes.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-slate-400" />
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <Moon className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect the local datastore.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Factory Reset DB
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-red-200 dark:border-red-900 dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle>Clear all data?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all incidents and assets from the local IndexedDB, and reload the application to re-seed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={clearData}>Yes, delete everything</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
