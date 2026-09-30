import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateMultilingualCopy, CopyRequest } from './generator/aiCopyEngine';

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

const SUPPORTED_LANGUAGES = [
  'English',
  'isiZulu',
  'isiXhosa',
  'Afrikaans',
  'Sepedi',
  'Setswana',
  'Sesotho',
  'Xitsonga',
  'Hindi',
  'French'
];

const CAMPAIGN_TYPES = [
  'Student Data Special',
  'Airport Travel Roaming Pass',
  'B2B Enterprise Dedicated Fiber',
  'Weekend Data Turbo Pass',
  'IoT Fleet Connectivity'
];

// Health endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'ai-content-service',
    port: PORT,
    languagesCount: SUPPORTED_LANGUAGES.length,
    campaignTypesCount: CAMPAIGN_TYPES.length,
    timestamp: new Date().toISOString()
  });
});

// GET /api/content/languages
app.get('/api/content/languages', (req: Request, res: Response) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

// GET /api/content/campaign-types
app.get('/api/content/campaign-types', (req: Request, res: Response) => {
  res.json({ campaignTypes: CAMPAIGN_TYPES });
});

// POST /api/content/generate - Generate multilingual copy variants
app.post('/api/content/generate', (req: Request, res: Response) => {
  const body: CopyRequest = req.body;

  const copyVariants = generateMultilingualCopy({
    campaignType: body.campaignType || 'Student Data Special',
    targetLanguage: body.targetLanguage || 'English',
    channel: body.channel || 'PUSH',
    tone: body.tone || 'URGENT',
    customLocation: body.customLocation,
    customPrice: body.customPrice,
    customProduct: body.customProduct
  });

  res.json({
    request: body,
    generatedAt: new Date().toISOString(),
    variantsCount: copyVariants.length,
    variants: copyVariants
  });
});

app.listen(PORT, () => {
  console.log(`🧠 [AI Multilingual Content Studio] Running on http://localhost:${PORT}`);
});
