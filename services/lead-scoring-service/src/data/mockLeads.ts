export interface FeatureImpact {
  feature: string;
  weight: number;
  description: string;
  isPositive: boolean;
}

export interface EnterpriseLead {
  id: string;
  companyName: string;
  industry: string;
  employees: number;
  annualRevenueUsd: number;
  productTarget: 'Leased Line Fiber' | 'Enterprise 5G Private Net' | 'Cloud Direct Connect' | 'IoT Fleet Connectivity';
  contractExpiryMonths: number;
  bandwidthNeedGbps: number;
  distanceToFiberNodeMeters: number;
  digitalPortalPingsLast30Days: number;
  estimatedDealValueZar: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  assignedRep: string;
  status: 'HOT' | 'WARM' | 'COLD';
  score: number;
  conversionProbability: number;
  featureImpacts: FeatureImpact[];
  updatedAt: string;
}

export const INITIAL_LEADS: EnterpriseLead[] = [
  {
    id: 'lead-ent-101',
    companyName: 'Standard Bank HQ Johannesburg',
    industry: 'Financial Services & Banking',
    employees: 14500,
    annualRevenueUsd: 850000000,
    productTarget: 'Cloud Direct Connect',
    contractExpiryMonths: 2,
    bandwidthNeedGbps: 100,
    distanceToFiberNodeMeters: 80,
    digitalPortalPingsLast30Days: 48,
    estimatedDealValueZar: 4800000,
    contactPerson: 'Siyabonga Ndlovu (Head of Infra)',
    contactEmail: 's.ndlovu@standardbank.co.za',
    contactPhone: '+27 11 636 9111',
    assignedRep: 'David Miller (Enterprise Lead)',
    status: 'HOT',
    score: 94,
    conversionProbability: 0.92,
    featureImpacts: [
      { feature: 'Contract Expiry Window', weight: 35, description: 'Contract expires in < 60 days', isPositive: true },
      { feature: 'Fiber Proximity', weight: 25, description: '80m from primary backbone ring', isPositive: true },
      { feature: 'Bandwidth Demand', weight: 20, description: 'Requires 100Gbps Dedicated Pipe', isPositive: true },
      { feature: 'Portal Engagement', weight: 14, description: '48 queries for AWS/Azure DirectConnect', isPositive: true }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead-ent-102',
    companyName: 'Anglo American Platinum Operations',
    industry: 'Mining & Resources',
    employees: 28000,
    annualRevenueUsd: 2100000000,
    productTarget: 'Enterprise 5G Private Net',
    contractExpiryMonths: 4,
    bandwidthNeedGbps: 40,
    distanceToFiberNodeMeters: 450,
    digitalPortalPingsLast30Days: 35,
    estimatedDealValueZar: 12500000,
    contactPerson: 'Kobus van der Merwe (CTO)',
    contactEmail: 'kobus.vdm@angloamerican.com',
    contactPhone: '+27 11 373 6111',
    assignedRep: 'Sarah Jenkins (Industrial Accounts)',
    status: 'HOT',
    score: 89,
    conversionProbability: 0.86,
    featureImpacts: [
      { feature: '5G Fleet Demand', weight: 30, description: 'Private 5G needed for autonomous haulers', isPositive: true },
      { feature: 'High Annual Budget', weight: 25, description: 'Tier 1 Enterprise Capital spend', isPositive: true },
      { feature: 'Portal Queries', weight: 20, description: '35 searches for low-latency Private APN', isPositive: true },
      { feature: 'Remote Distance', weight: -14, description: '450m from sub-station backbone', isPositive: false }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead-ent-103',
    companyName: 'Shoprite Checkers Supply Chain',
    industry: 'Retail & Logistics',
    employees: 160000,
    annualRevenueUsd: 950000000,
    productTarget: 'IoT Fleet Connectivity',
    contractExpiryMonths: 1,
    bandwidthNeedGbps: 10,
    distanceToFiberNodeMeters: 120,
    digitalPortalPingsLast30Days: 62,
    estimatedDealValueZar: 7200000,
    contactPerson: 'Thabo Mokoena (Logistics VP)',
    contactEmail: 'tmokoena@shoprite.co.za',
    contactPhone: '+27 21 980 4000',
    assignedRep: 'Nomvula Zulu (Retail Sector)',
    status: 'HOT',
    score: 91,
    conversionProbability: 0.89,
    featureImpacts: [
      { feature: 'Fleet Tracking Urgency', weight: 35, description: 'Needs 4,500 IoT telemetry SIMs', isPositive: true },
      { feature: 'Contract Immediate Renewal', weight: 28, description: 'Legacy vendor contract expires in 30 days', isPositive: true },
      { feature: 'Frequent Portal Sessions', weight: 18, description: '62 telemetry API documentation downloads', isPositive: true },
      { feature: 'Price Sensitivity', weight: -10, description: 'Requires volume tiered pricing discount', isPositive: false }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead-ent-104',
    companyName: 'Discovery Health Sandton HQ',
    industry: 'Healthcare & Insurance Tech',
    employees: 12000,
    annualRevenueUsd: 680000000,
    productTarget: 'Leased Line Fiber',
    contractExpiryMonths: 8,
    bandwidthNeedGbps: 20,
    distanceToFiberNodeMeters: 50,
    digitalPortalPingsLast30Days: 19,
    estimatedDealValueZar: 3200000,
    contactPerson: 'Anish Sharma (Network Architect)',
    contactEmail: 'asharma@discovery.co.za',
    contactPhone: '+27 11 529 2888',
    assignedRep: 'David Miller (Enterprise Lead)',
    status: 'WARM',
    score: 72,
    conversionProbability: 0.68,
    featureImpacts: [
      { feature: 'Ultra Fiber Proximity', weight: 25, description: '50m from redundant optical node', isPositive: true },
      { feature: 'High SLA Requirements', weight: 20, description: '99.999% Uptime required for health data', isPositive: true },
      { feature: 'Contract Window', weight: -12, description: '8 months remaining on incumbent contract', isPositive: false },
      { feature: 'Moderate Activity', weight: 11, description: '19 portal views this month', isPositive: true }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead-ent-105',
    companyName: 'Nando’s Central Restaurant Tech',
    industry: 'Hospitality & FMCG',
    employees: 8500,
    annualRevenueUsd: 310000000,
    productTarget: 'Leased Line Fiber',
    contractExpiryMonths: 14,
    bandwidthNeedGbps: 5,
    distanceToFiberNodeMeters: 300,
    digitalPortalPingsLast30Days: 8,
    estimatedDealValueZar: 1100000,
    contactPerson: 'Pieter Cloete (IT Procurement)',
    contactEmail: 'pcloete@nandos.co.za',
    contactPhone: '+27 11 217 2100',
    assignedRep: 'Sarah Jenkins (Industrial Accounts)',
    status: 'COLD',
    score: 42,
    conversionProbability: 0.35,
    featureImpacts: [
      { feature: 'Distant Contract Expiry', weight: -25, description: '14 months remaining on existing telco deal', isPositive: false },
      { feature: 'Low Bandwidth Query', weight: -15, description: 'Only 5Gbps required across HQ', isPositive: false },
      { feature: 'Proximity Match', weight: 12, description: '300m from node', isPositive: true },
      { feature: 'Low Portal Usage', weight: -10, description: 'Only 8 portal visits in 30 days', isPositive: false }
    ],
    updatedAt: new Date().toISOString()
  }
];
