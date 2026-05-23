import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ThreatGauge } from '../components/ThreatGauge';
import { IncidentTable } from '../components/IncidentTable';
import { AssetGrid } from '../components/AssetGrid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldAlert, Server, Activity, Clock, Zap, Download } from 'lucide-react';
import { subDays, format, startOfDay } from 'date-fns';

export default function Dashboard() {
  const incidents = useLiveQuery(() => db.incidents.orderBy('timestamp').reverse().toArray());
  const assets = useLiveQuery(() => db.assets.toArray());

  // Calculations
  const openIncidents = incidents?.filter(i => i.status === 'open') || [];
  const activeIncidents = incidents?.filter(i => i.status === 'open' || i.status === 'investigating') || [];
  
  const openCritical = openIncidents.filter(i => i.severity === 'critical').length;
  const openHigh = openIncidents.filter(i => i.severity === 'high').length;
  const threatLevel = Math.min(10, openCritical * 3 + openHigh * 1.5);

  // Line Chart Data (Last 7 days)
  const currentDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return startOfDay(d).getTime();
  });
  
  const lineChartData = currentDays.map(timestamp => {
    const dayIncidents = incidents?.filter(i => startOfDay(i.timestamp).getTime() === timestamp) || [];
    return {
      name: format(timestamp, 'MMM dd'),
      count: dayIncidents.length
    };
  });

  // Donut Chart Data
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  incidents?.forEach(i => {
    severityCounts[i.severity]++;
  });
  
  const pieData = Object.entries(severityCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#3b82f6'
  };

  const generateIncident = async () => {
    const severities: ('critical'|'high'|'medium'|'low')[] = ['critical', 'high', 'medium', 'low', 'low'];
    await db.incidents.add({
      title: "Manual Simulation Triggered",
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: 'open',
      timestamp: new Date(),
      sourceIp: "10.0.99.1",
      description: "User triggered threat simulation.",
    });
  };

  const resolveOldest = async () => {
    if (openIncidents.length > 0) {
      const oldest = openIncidents[openIncidents.length - 1];
      if (oldest.id) {
        await db.incidents.update(oldest.id, { status: 'resolved' });
      }
    }
  };

  const exportLogs = () => {
    if (!incidents) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incidents));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "shield4_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!incidents || !assets) {
    return <div className="p-8 text-center animate-pulse">Loading simulation database...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Security posture and simulation status.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={resolveOldest} disabled={openIncidents.length === 0} className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Resolve Oldest
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs} className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={generateIncident} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Zap className="w-4 h-4 mr-2" />
            Trigger Alarm
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Protected endpoints</CardTitle>
            <Server className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-slate-500 mt-1">{assets.filter(a => a.status === 'healthy').length} healthy</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Threat Level</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{threatLevel.toFixed(1)}</div>
              <p className="text-xs text-slate-500 mt-1">out of 10.0</p>
            </div>
            <div className="-mt-8 -mr-4">
               <ThreatGauge level={threatLevel} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Incidents</CardTitle>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{activeIncidents.length}</div>
            <p className="text-xs text-slate-500 mt-1">{openIncidents.length} unassigned</p>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Mean Time to Respond</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2m</div>
            <p className="text-xs text-green-500 mt-1 font-medium">-12% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Incident Volume (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Table */}
        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hidden lg:flex">
          <CardHeader>
            <CardTitle className="text-lg">Real-time alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
             <IncidentTable 
               incidents={incidents.slice(0, 5)} 
               compact 
               onInvestigate={async (id) => await db.incidents.update(id, { status: 'investigating' })} 
             />
          </CardContent>
        </Card>
        
        <Card className="lg:hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Real-time alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
             <IncidentTable 
               incidents={incidents.slice(0, 5)} 
               compact={false}
               onInvestigate={async (id) => await db.incidents.update(id, { status: 'investigating' })} 
             />
          </CardContent>
        </Card>

        {/* Asset Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Vulnerable Assets</h3>
          <AssetGrid assets={assets.filter(a => a.status !== 'healthy').slice(0, 4)} />
          {assets.filter(a => a.status !== 'healthy').length === 0 && (
             <div className="p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center text-slate-500">
               All monitored assets are healthy.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
