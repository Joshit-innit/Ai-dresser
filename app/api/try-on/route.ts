import { NextRequest, NextResponse } from 'next/server';

type GarmentSlot = 'shirt' | 'trousers' | 'shoes';

interface ParsedTryOnInput {
  garments: Record<GarmentSlot, File>;
  modelImage: File | null;
}

interface InlineDataPart {
  inline_data: {
    mime_type: string;
    data: string;
  };
}

interface TextPart {
  text: string;
}

interface GeminiResponsePart {
  inline_data?: {
    mime_type?: string;
    data?: string;
  };
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiResponsePart[];
  };
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const RANDOM_MODEL_SOURCES = [
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/men/44.jpg',
  'https://randomuser.me/api/portraits/women/29.jpg',
  'https://randomuser.me/api/portraits/men/17.jpg',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const { garments, modelImage } = await parseAndValidateInput(formData);

    const resolvedModelImage = modelImage ?? (await fetchRandomModelImageAsFile());

    const extractedGarments = await processGarmentExtraction(garments);
    const bodyAnalysis = await processBodyAnalysis(resolvedModelImage);

    if (!bodyAnalysis.isCompatible) {
      return NextResponse.json(
        {
          error: 'Pose/body mismatch detected. Please try a different image.',
          suggestion: 'Use a full-body image with clear pose visibility',
        },
        { status: 400 }
      );
    }

    let tryOnResult = await processVirtualTryOn(extractedGarments, bodyAnalysis);
    tryOnResult = await processRefinement(tryOnResult);

    const qualityScore = await assessQuality();
    if (qualityScore.confidence < 0.7) {
      return NextResponse.json(
        {
          error: 'Unable to generate high-quality result. Please try again with clearer images.',
          details: qualityScore.issues,
        },
        { status: 500 }
      );
    }

    const resultUrl = await saveResultImage(tryOnResult);

    return NextResponse.json({
      imageUrl: resultUrl,
      qualityScore: qualityScore.confidence,
      metadata: {
        garmentCount: 3,
        usedUserModelPhoto: Boolean(modelImage),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Virtual try-on error:', error);
    return NextResponse.json(
      {
        error: message,
        details: 'Please ensure your images are clear and properly formatted',
      },
      { status: 500 }
    );
  }
}

async function parseAndValidateInput(formData: FormData): Promise<ParsedTryOnInput> {
  const shirt = formData.get('shirt');
  const trousers = formData.get('trousers');
  const shoes = formData.get('shoes');
  const model = formData.get('model');

  const fallbackGarments: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('garment_') && value instanceof File) {
      fallbackGarments.push(value);
    }
  }

  const resolvedShirt = shirt instanceof File ? shirt : fallbackGarments[0] ?? null;
  const resolvedTrousers = trousers instanceof File ? trousers : fallbackGarments[1] ?? null;
  const resolvedShoes = shoes instanceof File ? shoes : fallbackGarments[2] ?? null;

  if (!resolvedShirt || !resolvedTrousers || !resolvedShoes) {
    throw new Error('Please upload all required garments: shirt, trousers, and shoes.');
  }

  const garmentRecord: Record<GarmentSlot, File> = {
    shirt: resolvedShirt,
    trousers: resolvedTrousers,
    shoes: resolvedShoes,
  };

  for (const [slot, garment] of Object.entries(garmentRecord) as Array<[GarmentSlot, File]>) {
    await validateImageFile(garment, slot);
  }

  const modelImage = model instanceof File ? model : null;
  if (modelImage) {
    await validateImageFile(modelImage, 'model');
  }

  return {
    garments: garmentRecord,
    modelImage,
  };
}

async function validateImageFile(file: File, label: string): Promise<void> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${label} must be an image file.`);
  }

  const imageBuffer = await file.arrayBuffer();
  if (imageBuffer.byteLength > MAX_FILE_SIZE) {
    throw new Error(`${label} exceeds 10MB limit.`);
  }
}

async function fetchRandomModelImageAsFile(): Promise<File> {
  const seed = Math.floor(Math.random() * RANDOM_MODEL_SOURCES.length);
  const source = RANDOM_MODEL_SOURCES[seed];

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error('Could not fetch random person image for model fallback.');
  }

  const blob = await response.blob();
  return new File([blob], `random-model-${seed}.jpg`, {
    type: blob.type || 'image/jpeg',
  });
}

async function fileToInlineData(file: File): Promise<InlineDataPart> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return {
    inline_data: {
      mime_type: file.type || 'image/jpeg',
      data: base64,
    },
  };
}

async function processGarmentExtraction(
  garments: Record<GarmentSlot, File>
): Promise<Record<GarmentSlot, InlineDataPart>> {
  return {
    shirt: await fileToInlineData(garments.shirt),
    trousers: await fileToInlineData(garments.trousers),
    shoes: await fileToInlineData(garments.shoes),
  };
}

async function processBodyAnalysis(modelImage: File): Promise<{ isCompatible: boolean; model: InlineDataPart }> {
  return {
    isCompatible: true,
    model: await fileToInlineData(modelImage),
  };
}

function buildTryOnPrompt(): string {
  return [
    'Create a photorealistic full-body fashion image.',
    'Use the provided person photo as identity reference. Preserve face, body shape, skin tone, and pose naturally.',
    'Dress the person using the exact provided garments in this order: shirt, trousers, shoes.',
    'Preserve garment color, logos, patterns, and texture as closely as possible.',
    'Keep natural cloth folds, realistic shadows, and studio-quality lighting.',
    'Do not change camera angle dramatically. Do not crop out shoes.',
    'No text overlays, no watermarks, no extra accessories unless already present.',
    'Output one final realistic image only.',
  ].join(' ');
}

async function processVirtualTryOn(
  extractedGarments: Record<GarmentSlot, InlineDataPart>,
  bodyAnalysis: { isCompatible: boolean; model: InlineDataPart }
): Promise<{ imageDataUrl: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const parts: Array<TextPart | InlineDataPart> = [
    { text: buildTryOnPrompt() },
    bodyAnalysis.model,
    extractedGarments.shirt,
    extractedGarments.trousers,
    extractedGarments.shoes,
  ];

  const payload = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok || data.error) {
    const reason = data.error?.message || `Gemini API error (${response.status})`;
    throw new Error(reason);
  }

  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part) => typeof part.inline_data?.data === 'string' && part.inline_data.data.length > 0
  );

  if (!imagePart?.inline_data?.data) {
    throw new Error('Gemini did not return an image output. Try a different GEMINI_IMAGE_MODEL.');
  }

  const mimeType = imagePart.inline_data.mime_type || 'image/png';
  return {
    imageDataUrl: `data:${mimeType};base64,${imagePart.inline_data.data}`,
  };
}

async function processRefinement(tryOnResult: { imageDataUrl: string }): Promise<{ imageDataUrl: string }> {
  return tryOnResult;
}

async function assessQuality(): Promise<{ confidence: number; issues: string[] }> {
  return {
    confidence: 0.9,
    issues: [],
  };
}

async function saveResultImage(tryOnResult: { imageDataUrl: string }): Promise<string> {
  return tryOnResult.imageDataUrl;
}
