export interface CopyRequest {
  campaignType: string;
  targetLanguage: string;
  channel: 'SMS' | 'PUSH' | 'WHATSAPP' | 'SOCIAL_AD';
  tone: 'URGENT' | 'EXCLUSIVE' | 'CASUAL' | 'PROFESSIONAL';
  customLocation?: string;
  customPrice?: string;
  customProduct?: string;
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

const MULTILINGUAL_DICTIONARY: Record<string, Record<string, { headline: string; body: string; cta: string }>> = {
  'isiZulu': {
    'Student Data Special': {
      headline: '🎓 Isipesheli Sabafundi: 10GB ngo-R29 Nje!',
      body: 'Jabulela inthanethi yesivinini se-5G khona manje khamphasini yakho. Ishesha ngendlela emangalisayo!',
      cta: 'Yenza kusebenze manje *135#'
    },
    'Airport Travel Roaming Pass': {
      headline: '✈️ Siyakwamukela eNingizimu Afrika! 5GB eSIM Travel Data',
      body: 'Hlala uxhumeke izwe lonke ngenethiwekhi ye-5G eshesha kunazo zonke.',
      cta: 'Thola i-eSIM Yakho Manje'
    },
    'B2B Enterprise Dedicated Fiber': {
      headline: '🏢 Thuthukisa Inethiwekhi Yebhizinisi Lakho ngo-10Gbps Fiber',
      body: 'Inthanethi ye-Fiber ezinzile, enesithembiso se-99.999% uptime yamabhizinisi ethu.',
      cta: 'Xhumana Nomeluleki Wethu'
    },
    'Weekend Data Turbo Pass': {
      headline: '🌊 Impelasonto Ye-5G Engenamkhawulo ngo-R79',
      body: 'Bukela amavidiyo nemidlalo ngaphandle kokunqamuka. Isipesheli salempelasonto kuphela!',
      cta: 'Bhalisa Manje'
    }
  },
  'isiXhosa': {
    'Student Data Special': {
      headline: '🎓 Isipesheli Sabafundi: 10GB nge-R29 Qha!',
      body: 'Yonwabela i-intanethi ekhawulezayo ye-5G kwi-khampasi yakho namhlanje. Inyusa isantya sokufunda!',
      cta: 'Yenza isebenze ku-*135#'
    },
    'Airport Travel Roaming Pass': {
      headline: '✈️ Wamkelekile eMzantsi Afrika! 5GB Travel Pass',
      body: 'Hlala uqhagamshele kwilizwe lonke ngenethiwekhi yethu ye-5G.',
      cta: 'Fumana i-eSIM Yakho'
    },
    'B2B Enterprise Dedicated Fiber': {
      headline: '🏢 Phucula Ishishini Lakho nge-10Gbps Dedicated Fiber',
      body: 'Uxhulumaniso oluthembekileyo olukhawulezayo kwi-intanethi kumashishini asekhasini.',
      cta: 'Cela Ucaphulo Namhlanje'
    }
  },
  'Afrikaans': {
    'Student Data Special': {
      headline: '🎓 Studente Spesial: 10GB Data vir slegs R29!',
      body: 'Geniet blitsvinnige 5G-spoed op jou kampus. Geldig vir 7 dae.',
      cta: 'Aktiveer Nou *135#'
    },
    'Airport Travel Roaming Pass': {
      headline: '✈️ Welkom in Suid-Afrika! 5GB eSIM Reis Data-Pas',
      body: 'Bly oral landwyd verbind met ons bekroonde 5G-netwerk.',
      cta: 'Kry Jou eSIM Nou'
    },
    'B2B Enterprise Dedicated Fiber': {
      headline: '🏢 Opgrader Jou Besigheid na 10Gbps Dedicated Fiber',
      body: 'Geen installasie fooie hierdie maand vir besighede in die CBD.',
      cta: 'Praat met Bestuurder'
    }
  },
  'Sepedi': {
    'Student Data Special': {
      headline: '🎓 Khutšo ya Baithuti: 10GB ka R29 fela!',
      body: 'Iphshine ka lebelo la 5G khamphaseng ya gago lehono. E dula matsatsi a 7.',
      cta: 'Kgotla *135# le me'
    }
  },
  'Setswana': {
    'Student Data Special': {
      headline: '🎓 Kgethego ya Baithuti: 10GB ka R29 fela!',
      body: 'Ithute mme o tlhame ka lebelo la 5G mo khamphaseng ya gago.',
      cta: 'Dira gompieno *135#'
    }
  },
  'Hindi': {
    'Student Data Special': {
      headline: '🎓 स्टूडेंट स्पेशल डेटा पैक: 10GB सिर्फ R29 में!',
      body: 'अपने कैंपस में 5G स्पीड का आनंद लें। 7 दिनों के लिए वैध।',
      cta: 'अभी एक्टिवेट करें *135#'
    },
    'Airport Travel Roaming Pass': {
      headline: '✈️ साउथ अफ्रीका में आपका स्वागत है! 5GB ट्रैवल डेटा पास',
      body: 'पूरे देश में निर्बाध 5G कनेक्टिविटी का अनुभव करें।',
      cta: 'eSIM प्राप्त करें'
    }
  }
};

export function generateMultilingualCopy(req: CopyRequest): GeneratedVariant[] {
  const lang = req.targetLanguage || 'English';
  const type = req.campaignType || 'Student Data Special';
  const price = req.customPrice || 'R29';
  const loc = req.customLocation || 'Campus';

  // Check language matrix fallback
  const langEntry = MULTILINGUAL_DICTIONARY[lang]?.[type];

  let baseHeadline = langEntry?.headline || `🎓 ${type}: 10GB Data Pack @ ${price}!`;
  let baseBody = langEntry?.body || `Enjoy high-speed 5G network connectivity at ${loc}. Instant activation for a limited time.`;
  let baseCta = langEntry?.cta || `Activate Now *135#`;

  // Apply tone modifier
  if (req.tone === 'URGENT') {
    baseHeadline = `🔥 LAST CHANCE: ${baseHeadline}`;
    baseBody += ' Offer expires in 2 hours!';
  } else if (req.tone === 'EXCLUSIVE') {
    baseHeadline = `👑 VIP EXCLUSIVE: ${baseHeadline}`;
  } else if (req.tone === 'PROFESSIONAL') {
    baseHeadline = `💼 Enterprise Solution: ${baseHeadline.replace(/[🎓✈️🌊👑🔥]/g, '')}`;
  }

  // Create 3 variants (A/B testing optimization)
  const variants: GeneratedVariant[] = [
    {
      variantId: `var-${Date.now()}-A`,
      headline: baseHeadline,
      body: baseBody,
      ctaText: baseCta,
      estimatedClickRate: 4.8,
      characterCount: baseBody.length,
      language: lang,
      channel: req.channel,
      tone: req.tone
    },
    {
      variantId: `var-${Date.now()}-B`,
      headline: `⚡ Instant Unlock: ${baseHeadline.split(':')[1] || baseHeadline}`,
      body: `${baseBody} Tap below to claim your bonus 2GB extra rollover data.`,
      ctaText: `Get Claim Link`,
      estimatedClickRate: 6.2,
      characterCount: (baseBody + ' Bonus 2GB').length,
      language: lang,
      channel: req.channel,
      tone: req.tone
    },
    {
      variantId: `var-${Date.now()}-C`,
      headline: `⭐ Recommended for You: ${type}`,
      body: `Stay ahead with 5G speed in ${loc}. ${price} for 10GB continuous streaming.`,
      ctaText: `Buy with 1-Click`,
      estimatedClickRate: 5.4,
      characterCount: 95,
      language: lang,
      channel: req.channel,
      tone: req.tone
    }
  ];

  return variants;
}
