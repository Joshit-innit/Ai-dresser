# AI Service Integration Guide

This document outlines how to integrate actual AI services into the AI Dresser platform.

## Current Status

The application structure is complete with placeholder functions for all AI services. The UI, API routes, and pipeline orchestration are ready. You need to replace the placeholder functions with actual AI service integrations.

## Integration Points

All integration points are in `app/api/try-on/route.ts`. Replace the following placeholder functions with actual AI service calls:

### 1. Garment Intelligence AI (NanoBanana)

**Function**: `processGarmentExtraction(garments: File[])`

**Required Tasks**:
- Remove background from garment images
- Precisely segment garments with RGBA masks
- Detect garment category (top, bottom, dress, jacket, footwear)
- Determine correct layering order
- Preserve logos, prints, embroidery, seams, and proportions
- Extract fabric metadata (type, stiffness, thickness)

**Instruction for AI**:
```
"Extract the garment exactly as provided. Preserve original color, texture, 
thickness, logos, prints, stitching, seams, and proportions. Output a clean 
RGBA garment mask with zero background bleed."
```

**Expected Return**:
```typescript
{
  id: string;
  category: 'top' | 'bottom' | 'dress' | 'jacket' | 'footwear';
  mask: Uint8Array | Buffer; // RGBA mask
  metadata: {
    fabricType: string;
    stiffness: number;
    thickness: number;
  };
}
```

### 2. Body & Pose Analysis AI

**Function**: `processBodyAnalysis(modelImage: File)`

**Required Tasks**:
- Detect body proportions and posture
- Extract pose keypoints
- Identify skin tone
- Detect body boundaries
- Validate pose compatibility with garments

**Expected Return**:
```typescript
{
  isCompatible: boolean;
  pose: {
    keypoints: Array<{x: number, y: number, confidence: number}>;
    proportions: Record<string, number>;
  };
  skinTone: string;
  boundaries: {
    bodyMask: Uint8Array;
    occlusions: Array<{x: number, y: number, type: string}>;
  };
}
```

### 3. Core Virtual Try-On AI (Z-Image Turbo)

**Function**: `processVirtualTryOn(extractedGarments, bodyAnalysis, modelImage)`

**Required Tasks**:
- Apply garments naturally onto detected body
- Respect correct layering (inner → outer)
- Match lighting, shadows, and depth
- Maintain exact garment dimensions and fit
- Implement accurate cloth-to-body interaction
- Apply natural gravity-based folds and drape

**Instruction for AI**:
```
"Place the extracted garment onto the detected body naturally. Match lighting, 
shadows, depth, and fabric behavior. Maintain original garment proportions and 
fit. Output must look like a real fashion studio photoshoot."
```

**Expected Return**:
```typescript
{
  imageData: Buffer | Uint8Array; // Final rendered image
  metadata: {
    lighting: Record<string, any>;
    shadows: Record<string, any>;
    layering: string[];
  };
}
```

### 4. Refinement & Realism AI

**Function**: `processRefinement(tryOnResult)`

**Required Tasks**:
- Remove warping, blur, and edge artifacts
- Improve fabric realism (not stylization)
- Fix lighting inconsistencies
- Clean skin-fabric boundaries

**Expected Return**: Same structure as input, with enhanced image data

### 5. Quality Assurance AI (Gatekeeper)

**Function**: `assessQuality(tryOnResult, originalGarments)`

**Required Tasks**:
- Score realism (0-1)
- Validate garment fidelity
- Detect artifacts, distortion, or mismatch
- Return confidence score and issues list

**Expected Return**:
```typescript
{
  confidence: number; // 0-1, should be > 0.85 for production
  issues: string[]; // List of detected issues
}
```

### 6. Image Storage

**Function**: `saveResultImage(tryOnResult)`

**Required Tasks**:
- Save processed image to cloud storage (S3, Cloudinary, etc.)
- Return publicly accessible URL

**Expected Return**: `string` (image URL)

## Service Provider Options

### NanoBanana (Garment Extraction)
- API documentation needed
- Background removal service
- Image segmentation service

### Z-Image Turbo (Virtual Try-On)
- API documentation needed
- Virtual try-on processing service

### Alternative Services to Consider
- **Replicate API**: For running AI models (VITON, HR-VITON)
- **Stability AI**: For image generation and processing
- **Runway ML**: For video/image processing
- **Custom Models**: Deploy your own trained models

## Implementation Example

Here's an example of how to integrate with a hypothetical AI service:

```typescript
async function processGarmentExtraction(garments: File[]): Promise<any[]> {
  const results = [];
  
  for (const garment of garments) {
    const formData = new FormData();
    formData.append('image', garment);
    
    const response = await fetch('https://api.nanobanana.com/extract', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NANOBANANA_API_KEY}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    results.push({
      id: garment.name,
      category: data.category,
      mask: Buffer.from(data.mask, 'base64'),
      metadata: {
        fabricType: data.fabricType,
        stiffness: data.stiffness,
        thickness: data.thickness,
      },
    });
  }
  
  return results;
}
```

## Environment Variables

Add the following to your `.env.local`:

```env
# AI Service API Keys
NANOBANANA_API_KEY=your_api_key_here
Z_IMAGE_TURBO_API_KEY=your_api_key_here
BODY_ANALYSIS_API_KEY=your_api_key_here
REFINEMENT_API_KEY=your_api_key_here
QA_API_KEY=your_api_key_here

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Or AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region
```

## Testing

After integrating AI services:

1. Test with high-quality garment images
2. Test with various garment types
3. Verify garment fidelity (colors, logos, prints)
4. Check pose compatibility validation
5. Test quality assurance regeneration logic
6. Verify error handling for low-quality inputs

## Performance Considerations

- Implement caching for repeated garment processing
- Use image compression before API calls
- Batch process multiple garments when possible
- Implement request queuing for high traffic
- Monitor API rate limits and implement backoff

## Next Steps

1. Obtain API keys for AI services
2. Replace placeholder functions with actual API calls
3. Implement proper error handling for API failures
4. Add image storage integration
5. Test end-to-end pipeline
6. Optimize for production deployment

