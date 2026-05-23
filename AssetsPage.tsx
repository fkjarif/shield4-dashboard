import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Asset } from '../db';
import { AssetGrid } from '../components/AssetGrid';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Shield, Smartphone, Server, Monitor } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function AssetsPage() {
  const assets = useLiveQuery(() => db.assets.toArray());

  if (!assets) {
    return <div className="p-8 text-center animate-pulse">Loading assets...</div>;
  }

  const updateAssetStatus = async (id: string, status: Asset['status']) => {
    await db.assets.update(id, { status });
  };

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'server': return <Server className="w-4 h-4" />;
      case 'workstation': return <Monitor className="w-4 h-4" />;
      case 'firewall': return <Shield className="w-4 h-4" />;
      case 'endpoint': return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Asset Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monitor and manage network assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AssetGrid assets={assets} />
        </div>
        
        <div className="space-y-6">
          <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Asset Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {assets.map(asset => (
                  <div key={asset.id} className="flex flex-col space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                         {getAssetIcon(asset.type)}
                         <span className="font-medium text-sm">{asset.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">{asset.ip}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status override:</span>
                      <Select defaultValue={asset.status} onValueChange={(v) => updateAssetStatus(asset.id, v as Asset['status'])}>
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthy">Healthy</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="compromised">Compromised</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
