import Dexie, { type EntityTable } from 'dexie';
import { subMinutes, subDays } from 'date-fns';

export interface Incident {
  id?: number;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  timestamp: Date;
  sourceIp: string;
  description: string;
  assignedTo?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'firewall' | 'endpoint';
  status: 'healthy' | 'warning' | 'compromised';
  lastSeen: Date;
  ip: string;
}

export interface Settings {
  id: string;
  simulationEnabled: boolean;
  simulationInterval: number; // in seconds
  theme: 'dark' | 'light';
}

const db = new Dexie('Shield4DB') as Dexie & {
  incidents: EntityTable<Incident, 'id'>;
  assets: EntityTable<Asset, 'id'>;
  settings: EntityTable<Settings, 'id'>;
};

// Schema declaration
db.version(1).stores({
  incidents: '++id, title, severity, status, timestamp, sourceIp',
  assets: 'id, name, type, status, lastSeen, ip',
  settings: 'id'
});

const INITIATED_FLAG = 'shield4_seeded';
let isSeeding = false;

// Seed Database
export const seedDatabase = async () => {
  if (localStorage.getItem(INITIATED_FLAG) || isSeeding) return;
  isSeeding = true;

  const incidentsCount = await db.incidents.count();
  const assetsCount = await db.assets.count();

  if (incidentsCount === 0 && assetsCount === 0) {
    const titles = ["Suspicious login", "Malware detected", "Port scan", "Data exfiltration attempt", "Privilege escalation", "Ransomware activity", "Phishing campaign"];
    const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
    const statuses: ('open' | 'investigating' | 'resolved')[] = ['open', 'investigating', 'resolved'];
    
    // Seed 20 Incidents
    const initialIncidents: Omit<Incident, 'id'>[] = Array.from({ length: 20 }, (_, i) => {
      const isRecent = i < 5;
      return {
        title: titles[Math.floor(Math.random() * titles.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: isRecent ? 'open' : statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: isRecent ? subMinutes(new Date(), Math.floor(Math.random() * 60)) : subDays(new Date(), Math.floor(Math.random() * 7)),
        sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        description: "Simulated security event detected across the network perimeter.",
      };
    });

    // Seed 12 Assets
    const initialAssets: Asset[] = Array.from({ length: 12 }, (_, i) => {
      const types: ('server' | 'workstation' | 'firewall' | 'endpoint')[] = ['server', 'workstation', 'firewall', 'endpoint'];
      const statuses: ('healthy' | 'warning' | 'compromised')[] = ['healthy', 'healthy', 'healthy', 'warning', 'compromised'];
      return {
        id: `asset-${i + 1}`,
        name: `SHIELD-${types[i % 4].toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
        type: types[i % 4],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastSeen: subMinutes(new Date(), Math.floor(Math.random() * 10)),
        ip: `10.0.1.${100 + i}`,
      };
    });

    await db.incidents.bulkPut(initialIncidents as Incident[]);
    await db.assets.bulkPut(initialAssets);

    // Initial settings
    await db.settings.put({
      id: 'core',
      simulationEnabled: false,
      simulationInterval: 30,
      theme: 'dark'
    });

    localStorage.setItem(INITIATED_FLAG, 'true');
  }
};

export { db };
