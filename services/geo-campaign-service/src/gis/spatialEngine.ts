import { CELL_TOWERS, GEOFENCE_ZONES, GeofenceZone, TelemetryPing } from '../data/mockGeoData';

// Distance calculation using Haversine formula
export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate realistic live device pings around active towers
export function generateLiveTelemetryPings(count: number = 25): TelemetryPing[] {
  const simTypes: ('PREPAID' | 'POSTPAID' | 'ROAMING_INTL' | 'ENTERPRISE')[] = [
    'PREPAID', 'PREPAID', 'POSTPAID', 'ROAMING_INTL', 'ENTERPRISE'
  ];

  const pings: TelemetryPing[] = [];

  for (let i = 0; i < count; i++) {
    const tower = CELL_TOWERS[i % CELL_TOWERS.length];
    
    // Slight random offset in lat/lng within tower radius
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;
    const pLat = tower.lat + latOffset;
    const pLng = tower.lng + lngOffset;

    // Check matching zone
    let matchedZoneId: string | undefined = undefined;
    for (const zone of GEOFENCE_ZONES) {
      const dist = haversineDistanceMeters(pLat, pLng, zone.lat, zone.lng);
      if (dist <= zone.radiusMeters) {
        matchedZoneId = zone.id;
        break;
      }
    }

    pings.push({
      id: `ping-${Date.now()}-${i}`,
      deviceHash: `dev_${Math.floor(Math.random() * 899999 + 100000)}`,
      lat: Number(pLat.toFixed(5)),
      lng: Number(pLng.toFixed(5)),
      connectedTowerId: tower.id,
      matchedZoneId,
      simType: simTypes[Math.floor(Math.random() * simTypes.length)],
      timestamp: new Date().toISOString()
    });
  }

  return pings;
}

// Evaluate geofence zone trigger states
export function evaluateGeofenceTriggers(zones: GeofenceZone[]): {
  updatedZones: GeofenceZone[];
  triggeredAlerts: { zoneId: string; zoneName: string; headline: string; pingsCount: number }[];
} {
  const triggeredAlerts: { zoneId: string; zoneName: string; headline: string; pingsCount: number }[] = [];

  const updatedZones = zones.map(zone => {
    const isNowTriggered = zone.currentPingsCount >= zone.triggerThresholdPings;
    
    if (isNowTriggered && (!zone.isTriggered || !zone.lastTriggeredAt)) {
      triggeredAlerts.push({
        zoneId: zone.id,
        zoneName: zone.name,
        headline: zone.offerHeadline,
        pingsCount: zone.currentPingsCount
      });
    }

    return {
      ...zone,
      isTriggered: isNowTriggered,
      lastTriggeredAt: isNowTriggered ? (zone.lastTriggeredAt || new Date().toISOString()) : undefined
    };
  });

  return { updatedZones, triggeredAlerts };
}
