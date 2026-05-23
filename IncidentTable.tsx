import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { type Incident } from '../db';
import { ShieldAlert, ShieldCheck, Search } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onInvestigate?: (id: number) => void;
  compact?: boolean;
}

export function IncidentTable({ incidents, onInvestigate, compact = false }: IncidentTableProps) {
  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: Incident['status']) => {
    if (status === 'resolved') return <ShieldCheck className="w-4 h-4 text-green-500" />;
    if (status === 'investigating') return <Search className="w-4 h-4 text-amber-500" />;
    return <ShieldAlert className="w-4 h-4 text-red-500" />;
  };

  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500">
        <ShieldCheck className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
        <p>No incidents found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Severity</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Time (Local)</th>
            {!compact && <th className="px-4 py-3 font-medium">Source IP</th>}
            {onInvestigate && <th className="px-4 py-3 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {incidents.map((incident) => (
            <tr key={incident.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="px-4 py-3">
                <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </Badge>
              </td>
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                {incident.title}
                {!compact && (
                  <p className="text-xs font-normal text-slate-500 mt-1 truncate max-w-[250px]">
                    {incident.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(incident.status)}
                  <span className="capitalize">{incident.status}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                {format(incident.timestamp, 'MMM dd, HH:mm:ss')}
              </td>
              {!compact && (
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                  {incident.sourceIp}
                </td>
              )}
              {onInvestigate && (
                <td className="px-4 py-3 text-right">
                  {incident.status === 'open' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs bg-transparent border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => incident.id && onInvestigate(incident.id)}
                    >
                      Investigate
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
