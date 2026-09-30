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

export interface LeadKpis {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  totalPipelineZar: number;
  weightedPipelineZar: number;
  avgScore: number;
  topProduct: string;
}

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

export interface GeneratedVariant {
  variantId: string;
  headline: string;
  body: string;
  ctaText: string;
  estimatedClickRate: number;
  characterCount: number;
  language: string;
  channel: string;
  tone: string;
}

export interface Campaign {
  id: string;
  title: string;
  category: 'STUDENT_HYPERLOCAL' | 'AIRPORT_ROAMING' | 'B2B_ENTERPRISE_FIBER' | 'TOURIST_WEEKEND';
  channel: 'SMS' | 'PUSH' | 'WHATSAPP' | 'EMAIL';
  targetLanguage: string;
  targetGeofenceId?: string;
  headline: string;
  body: string;
  totalTargetUsers: number;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  convertedCount: number;
  conversionRatePercent: number;
  revenueGeneratedZar: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'PAUSED';
  launchedAt: string;
}

export interface MicroserviceStatus {
  name: string;
  status: 'ONLINE' | 'OFFLINE';
  error?: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  companyName: string;
  contactPerson: string;
  assignedRep: string;
  productTarget: string;
  bandwidthNeedGbps: number;
  distanceToFiberNodeMeters: number;
  contractExpiryMonths: number;
  estimatedDealValueZar: number;
  annualSavingsZar: number;
  paybackPeriodMonths: number;
  slaGuaranteePercent: number;
  generatedAt: string;
  executiveSummary: string;
  technicalArchitecture: string[];
  financialBreakdown: {
    monthlyRecurringZar: number;
    annualContractZar: number;
    installationWaivedZar: number;
    estimatedThreeYearRoiPercent: number;
  };
}
