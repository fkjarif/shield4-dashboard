import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { IncidentTable } from '../components/IncidentTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Filter } from 'lucide-react';

export default function IncidentsPage() {
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  
  const incidents = useLiveQuery(() => {
    let query = db.incidents.orderBy('timestamp').reverse();
    return query.toArray();
  });

  if (!incidents) {
    return <div className="p-8 text-center animate-pulse">Loading incidents...</div>;
  }

  const filteredIncidents = filterSeverity 
    ? incidents.filter(i => i.severity === filterSeverity) 
    : incidents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Incident Response</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage security events.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilterSeverity(null)}
            className={`h-7 text-xs ${!filterSeverity ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
          >
            All
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilterSeverity('critical')}
            className={`h-7 text-xs text-red-600 dark:text-red-400 ${filterSeverity === 'critical' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
          >
            Critical
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilterSeverity('high')}
            className={`h-7 text-xs text-orange-600 dark:text-orange-400 ${filterSeverity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
          >
            High
          </Button>
        </div>
      </div>

      <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>All Incidents</span>
            <Badge variant="secondary">{filteredIncidents.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <IncidentTable 
            incidents={filteredIncidents} 
            compact={false}
            onInvestigate={async (id) => await db.incidents.update(id, { status: 'investigating' })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
