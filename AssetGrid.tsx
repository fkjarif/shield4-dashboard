import { type Asset } from '../db';
import { Card, CardContent } from './ui/card';
import { Server, Monitor, Shield, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';

interface AssetGridProps {
  assets: Asset[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'server': return <Server className="w-5 h-5" />;
      case 'workstation': return <Monitor className="w-5 h-5" />;
      case 'firewall': return <Shield className="w-5 h-5" />;
      case 'endpoint': return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'compromised': return 'bg-red-500 animate-pulse';
    }
  };

  if (!assets || assets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <Card key={asset.id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                {getAssetIcon(asset.type)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 capitalize">{asset.status}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`} />
              </div>
            </div>
            
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{asset.name}</h4>
            <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono">{asset.ip}</span>
              <span>{formatDistanceToNow(asset.lastSeen, { addSuffix: true })}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
