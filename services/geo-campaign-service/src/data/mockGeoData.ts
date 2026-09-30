export interface CellTower {
  id: string;
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  coverageRadiusKm: number;
  band: '5G Sub-6' | '5G mmWave' | 'LTE-A' | '4G';
  connectedUsers: number;
  activePingsPerSec: number;
  status: 'OPTIMAL' | 'HIGH_DENSITY' | 'MAINTENANCE';
}

export interface GeofenceZone {
  id: string;
  name: string;
  category: 'University Campus' | 'International Airport' | 'Commercial Business Hub' | 'Transit Hub / Station' | 'Residential Suburb';
  lat: number;
  lng: number;
  radiusMeters: number;
  associatedTowerId: string;
  targetDemographic: string;
  recommendedCampaign: string;
  triggerThresholdPings: number;
  currentPingsCount: number;
  isTriggered: boolean;
  lastTriggeredAt?: string;
  offerHeadline: string;
  offerBody: string;
}

export interface TelemetryPing {
  id: string;
  deviceHash: string;
  lat: number;
  lng: number;
  connectedTowerId: string;
  matchedZoneId?: string;
  simType: 'PREPAID' | 'POSTPAID' | 'ROAMING_INTL' | 'ENTERPRISE';
  timestamp: string;
}

export const CELL_TOWERS: CellTower[] = [
  {
    id: 'tower-pta-01',
    name: 'Pretoria Campus 5G Node Alpha',
    locationName: 'University of Pretoria Hatfield',
    lat: -25.7545,
    lng: 28.2314,
    coverageRadiusKm: 1.5,
    band: '5G mmWave',
    connectedUsers: 14200,
    activePingsPerSec: 420,
    status: 'HIGH_DENSITY'
  },
  {
    id: 'tower-jnb-02',
    name: 'Sandton Financial Tower 04',
    locationName: 'Sandton CBD Commercial Zone',
    lat: -26.1076,
    lng: 28.0567,
    coverageRadiusKm: 2.0,
    band: '5G Sub-6',
    connectedUsers: 22800,
    activePingsPerSec: 680,
    status: 'OPTIMAL'
  },
  {
    id: 'tower-cpt-03',
    name: 'OR Tambo Intl Terminal Sector 1',
    locationName: 'International Arrivals Hall',
    lat: -26.1367,
    lng: 28.2411,
    coverageRadiusKm: 1.2,
    band: '5G Sub-6',
    connectedUsers: 18900,
    activePingsPerSec: 510,
    status: 'HIGH_DENSITY'
  },
  {
    id: 'tower-dbn-04',
    name: 'Durban Port Logistics Hub',
    locationName: 'Maydon Wharf Maritime Terminal',
    lat: -29.8711,
    lng: 31.0189,
    coverageRadiusKm: 3.5,
    band: 'LTE-A',
    connectedUsers: 8400,
    activePingsPerSec: 190,
    status: 'OPTIMAL'
  },
  {
    id: 'tower-cpt-05',
    name: 'V&A Waterfront Tourist Tower',
    locationName: 'V&A Waterfront Cape Town',
    lat: -33.9036,
    lng: 18.4205,
    coverageRadiusKm: 1.8,
    band: '5G Sub-6',
    connectedUsers: 16500,
    activePingsPerSec: 490,
    status: 'OPTIMAL'
  }
];

export const GEOFENCE_ZONES: GeofenceZone[] = [
  {
    id: 'zone-student-01',
    name: 'UP Hatfield Student Zone',
    category: 'University Campus',
    lat: -25.7545,
    lng: 28.2314,
    radiusMeters: 800,
    associatedTowerId: 'tower-pta-01',
    targetDemographic: 'Gen-Z Students (Ages 18-24)',
    recommendedCampaign: 'Hyperlocal Student Data Special',
    triggerThresholdPings: 350,
    currentPingsCount: 420,
    isTriggered: true,
    lastTriggeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
    offerHeadline: '🎓 Campus Special: 10GB Student Pass @ R29!',
    offerBody: 'Enjoy ultra-fast 5G speeds around UP Hatfield campus. Valid for 7 days.'
  },
  {
    id: 'zone-roaming-02',
    name: 'OR Tambo Intl Arrivals Terminal',
    category: 'International Airport',
    lat: -26.1367,
    lng: 28.2411,
    radiusMeters: 600,
    associatedTowerId: 'tower-cpt-03',
    targetDemographic: 'Inbound Travelers & Roaming Subscribers',
    recommendedCampaign: 'Instant Welcome Travel Roaming Pass',
    triggerThresholdPings: 200,
    currentPingsCount: 310,
    isTriggered: true,
    lastTriggeredAt: new Date(Date.now() - 5 * 60000).toISOString(),
    offerHeadline: '✈️ Welcome to South Africa! 5GB eSIM / Travel Data Pass',
    offerBody: 'Stay connected nationwide with seamless 5G coverage across SA.'
  },
  {
    id: 'zone-enterprise-03',
    name: 'Sandton Corporate Fiber Radius',
    category: 'Commercial Business Hub',
    lat: -26.1076,
    lng: 28.0567,
    radiusMeters: 1200,
    associatedTowerId: 'tower-jnb-02',
    targetDemographic: 'C-Suite Executives & Enterprise IT Procurement',
    recommendedCampaign: 'B2B Dedicated Fiber Upgrade Promo',
    triggerThresholdPings: 500,
    currentPingsCount: 480,
    isTriggered: false,
    offerHeadline: '🏢 Upgrade Your Business to 10Gbps Dedicated Optical Ring',
    offerBody: 'Zero install cost for Sandton CBD enterprises this month.'
  },
  {
    id: 'zone-tourist-04',
    name: 'Cape Town V&A Tourist Sector',
    category: 'Transit Hub / Station',
    lat: -33.9036,
    lng: 18.4205,
    radiusMeters: 1000,
    associatedTowerId: 'tower-cpt-05',
    targetDemographic: 'Domestic & International Tourists',
    recommendedCampaign: 'Weekend Unlimited 5G Tourist Pass',
    triggerThresholdPings: 300,
    currentPingsCount: 340,
    isTriggered: true,
    lastTriggeredAt: new Date(Date.now() - 40 * 60000).toISOString(),
    offerHeadline: '🌊 Stream & Share Cape Town: 15GB Weekend Pass @ R79',
    offerBody: 'Share every moment with unthrottled 5G speeds at the Waterfront.'
  }
];
