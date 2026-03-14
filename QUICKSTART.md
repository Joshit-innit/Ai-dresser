# Quick Start Guide

## Getting Started

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## What's Included

### ✅ Complete UI Components
- **ImageUpload**: Drag-and-drop garment and model image uploads
- **ProgressTracker**: Visual progress through all 5 AI pipeline stages
- **ResultViewer**: Before/after comparison slider with download/share
- **OutfitComparison**: Timeline of previous try-on results

### ✅ Backend API Structure
- **`/api/try-on`**: Main endpoint orchestrating the AI pipeline
- **`/api/placeholder-result`**: Placeholder for result images

### ✅ AI Pipeline Framework
The pipeline is structured with 5 stages:
1. **Garment Extraction** (NanoBanana) - Placeholder ready
2. **Body Analysis** - Placeholder ready
3. **Virtual Try-On** (Z-Image Turbo) - Placeholder ready
4. **Refinement** - Placeholder ready
5. **Quality Assurance** (Gatekeeper) - Placeholder ready

## Next Steps: AI Service Integration

All placeholder functions are in `app/api/try-on/route.ts`. See `INTEGRATION.md` for detailed integration instructions.

Key functions to replace:
- `processGarmentExtraction()` - Connect to NanoBanana API
- `processBodyAnalysis()` - Connect to Body Analysis API
- `processVirtualTryOn()` - Connect to Z-Image Turbo API
- `processRefinement()` - Connect to Refinement API
- `assessQuality()` - Connect to Quality Assurance API
- `saveResultImage()` - Connect to image storage (S3/Cloudinary)

## Environment Variables

Create `.env.local` when ready to integrate:

```env
# AI Service API Keys
NANOBANANA_API_KEY=your_key_here
Z_IMAGE_TURBO_API_KEY=your_key_here

# Image Storage (example)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing Without AI Services

The UI is fully functional and will show:
- Image uploads and previews
- Progress tracking through all stages
- Placeholder result image
- Before/after comparison (when model image is provided)

## Production Build

```bash
npm run build
npm start
```

## Features

- ✅ Premium fashion UI with luxury color palette
- ✅ Smooth animations and transitions
- ✅ Drag-and-drop file uploads
- ✅ Real-time progress tracking
- ✅ Before/after comparison slider
- ✅ Outfit history timeline
- ✅ Download and share functionality
- ✅ Error handling and validation
- ✅ Quality assurance framework
- ✅ Automatic regeneration on low quality

## Project Structure

```
ai-dresser/
├── app/
│   ├── api/
│   │   ├── try-on/route.ts       # AI pipeline endpoint
│   │   └── placeholder-result/   # Result image placeholder
│   ├── page.tsx                   # Main application
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── ImageUpload.tsx           # File upload component
│   ├── ProgressTracker.tsx       # Progress visualization
│   ├── ResultViewer.tsx          # Result display
│   └── OutfitComparison.tsx      # History viewer
└── lib/
    └── api.ts                     # API client functions
```

## Support

For integration help, see `INTEGRATION.md`.
For architecture details, see `README.md`.

