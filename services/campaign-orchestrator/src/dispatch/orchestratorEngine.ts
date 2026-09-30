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

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-2026-001',
    title: 'Pretoria Campus Student Data Burst',
    category: 'STUDENT_HYPERLOCAL',
    channel: 'PUSH',
    targetLanguage: 'isiZulu',
    targetGeofenceId: 'zone-student-01',
    headline: '🎓 Isipesheli Sabafundi: 10GB ngo-R29 Nje!',
    body: 'Jabulela inthanethi yesivinini se-5G khona manje khamphasini yakho.',
    totalTargetUsers: 15000,
    sentCount: 14850,
    deliveredCount: 14200,
    clickedCount: 2840,
    convertedCount: 1420,
    conversionRatePercent: 10.0,
    revenueGeneratedZar: 41180,
    status: 'ACTIVE',
    launchedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'cmp-2026-002',
    title: 'OR Tambo Inbound Roaming Push',
    category: 'AIRPORT_ROAMING',
    channel: 'SMS',
    targetLanguage: 'English',
    targetGeofenceId: 'zone-roaming-02',
    headline: '✈️ Welcome to South Africa! 5GB Travel Pass',
    body: 'Stay connected nationwide with seamless 5G coverage across SA.',
    totalTargetUsers: 8500,
    sentCount: 8400,
    deliveredCount: 8100,
    clickedCount: 1944,
    convertedCount: 890,
    conversionRatePercent: 11.0,
    revenueGeneratedZar: 133500,
    status: 'ACTIVE',
    launchedAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'cmp-2026-003',
    title: 'Sandton CBD B2B Fiber Upgrade',
    category: 'B2B_ENTERPRISE_FIBER',
    channel: 'WHATSAPP',
    targetLanguage: 'English',
    targetGeofenceId: 'zone-enterprise-03',
    headline: '🏢 Upgrade Your Business to 10Gbps Dedicated Optical Ring',
    body: 'Zero install cost for Sandton CBD enterprises this month.',
    totalTargetUsers: 1200,
    sentCount: 1180,
    deliveredCount: 1150,
    clickedCount: 345,
    convertedCount: 48,
    conversionRatePercent: 4.17,
    revenueGeneratedZar: 576000,
    status: 'ACTIVE',
    launchedAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

export function dispatchCampaign(params: {
  title: string;
  category: Campaign['category'];
  channel: Campaign['channel'];
  targetLanguage: string;
  headline: string;
  body: string;
  targetCount?: number;
  targetGeofenceId?: string;
}): Campaign {
  const totalTargetUsers = params.targetCount || Math.floor(Math.random() * 5000 + 5000);
  const sentCount = Math.floor(totalTargetUsers * 0.98);
  const deliveredCount = Math.floor(sentCount * 0.95);
  const clickedCount = Math.floor(deliveredCount * 0.22);
  const convertedCount = Math.floor(clickedCount * 0.45);
  const conversionRatePercent = Number(((convertedCount / (deliveredCount || 1)) * 100).toFixed(2));
  const averageTicketZar = params.category === 'B2B_ENTERPRISE_FIBER' ? 12000 : 49;
  const revenueGeneratedZar = convertedCount * averageTicketZar;

  return {
    id: `cmp-2026-${Math.floor(Math.random() * 899 + 100)}`,
    title: params.title || 'New Hyperlocal Campaign',
    category: params.category || 'STUDENT_HYPERLOCAL',
    channel: params.channel || 'PUSH',
    targetLanguage: params.targetLanguage || 'English',
    targetGeofenceId: params.targetGeofenceId,
    headline: params.headline,
    body: params.body,
    totalTargetUsers,
    sentCount,
    deliveredCount,
    clickedCount,
    convertedCount,
    conversionRatePercent,
    revenueGeneratedZar,
    status: 'ACTIVE',
    launchedAt: new Date().toISOString()
  };
}
