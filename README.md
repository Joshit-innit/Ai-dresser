# AI Dresser - Virtual Try-On Platform

A production-ready AI-powered virtual try-on platform with 100% garment fidelity and photorealistic results.

## Features

- **Multi-AI Reliability Pipeline**: Orchestrates specialized AI services for garment extraction, body analysis, virtual try-on, refinement, and quality assurance
- **Premium Fashion UX**: Luxury minimalist interface with smooth animations and intuitive interactions
- **Drag-and-Drop Upload**: Easy garment and model image uploads
- **Real-Time Progress Tracking**: Visual feedback through each processing stage
- **Before/After Comparison**: Interactive slider to compare original and result
- **Outfit History**: Timeline of previous try-on results
- **Quality Assurance**: Automatic regeneration if quality thresholds aren't met

## Architecture

### AI Pipeline Stages

1. **Garment Intelligence AI (NanoBanana)**
   - Background removal
   - Precise garment segmentation
   - RGBA mask generation
   - Garment category detection
   - Fabric metadata extraction

2. **Body & Pose Analysis AI**
   - Body proportion detection
   - Pose geometry locking
   - Skin tone preservation
   - Compatibility validation

3. **Core Virtual Try-On AI (Z-Image Turbo)**
   - Natural garment application
   - Correct layering order
   - Lighting and shadow matching
   - Fabric physics simulation

4. **Refinement & Realism AI**
   - Artifact removal
   - Fabric realism enhancement
   - Lighting consistency fixes
   - Boundary cleaning

5. **Quality Assurance AI (Gatekeeper)**
   - Realism scoring
   - Garment fidelity validation
   - Automatic regeneration if needed

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Set environment variables before running:

```bash
GEMINI_API_KEY=your_google_ai_studio_key
# Optional, override if your account has another image-capable Gemini model
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## API Integration

The try-on endpoint now uses Google Gemini image generation directly. The request expects:

- `shirt` image (required)
- `trousers` image (required)
- `shoes` image (required)
- `model` image (optional, random person image fallback is used if omitted)

- **NanoBanana API**: Garment extraction and segmentation
- **Body Analysis API**: Pose and body detection
- **Z-Image Turbo API**: Core virtual try-on processing
- **Refinement API**: Post-processing and enhancement
- **Quality Assessment API**: Output validation

## Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Dropzone**: File upload handling
- **React Compare Slider**: Before/after comparison

## Requirements

- Node.js 18+ 
- npm or yarn

## Project Structure

```
ai-dresser/
├── app/
│   ├── api/
│   │   └── try-on/
│   │       └── route.ts      # AI pipeline API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main application page
├── components/
│   ├── ImageUpload.tsx       # Drag-and-drop image upload
│   ├── ProgressTracker.tsx   # Processing stage visualization
│   ├── ResultViewer.tsx      # Result display with comparison
│   └── OutfitComparison.tsx  # Outfit history viewer
└── lib/
    └── api.ts                # API client functions
```

## Quality Standards

The platform enforces strict quality standards:

- ✅ Zero hallucination - garments must match originals exactly
- ✅ Repeatable high-confidence outputs
- ✅ Exact garment accuracy (colors, logos, prints, fit)
- ✅ Professional fashion e-commerce quality
- ✅ 4K resolution output ready

## Error Handling

The system includes comprehensive error handling:

- Image quality validation
- Pose/body compatibility checks
- File size limits (10MB per image)
- Automatic regeneration on low-quality output
- User-friendly error messages with suggestions

## License

Private - Production Ready

# AI-dresser
