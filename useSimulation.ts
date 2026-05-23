import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Incident } from '../db';

export function useSimulation() {
  const settings = useLiveQuery(() => db.settings.get('core'));
  const isEnabled = settings?.simulationEnabled ?? false;
  const intervalSeconds = settings?.simulationInterval ?? 30;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isEnabled && intervalSeconds > 0) {
      intervalId = setInterval(async () => {
        const titles = ["Suspicious login", "Malware detected", "Port scan", "Data exfiltration attempt", "Privilege escalation", "Ransomware activity", "Phishing campaign"];
        
        // Severity based on weights: critical (15%), high (25%), medium (40%), low (20%)
        const rand = Math.random();
        let severity: 'critical' | 'high' | 'medium' | 'low';
        if (rand < 0.15) severity = 'critical';
        else if (rand < 0.40) severity = 'high';
        else if (rand < 0.80) severity = 'medium';
        else severity = 'low';

        const ips = [
          `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`
        ];

        const newIncident: Omit<Incident, 'id'> = {
          title: titles[Math.floor(Math.random() * titles.length)],
          severity,
          status: 'open',
          timestamp: new Date(),
          sourceIp: ips[Math.floor(Math.random() * ips.length)],
          description: "Auto-generated threat simulation event.",
        };

        await db.incidents.add(newIncident);
      }, intervalSeconds * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isEnabled, intervalSeconds]);

  return { isEnabled, intervalSeconds };
}
