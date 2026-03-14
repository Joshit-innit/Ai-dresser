import { NextResponse } from 'next/server';

// Placeholder endpoint for result images
// In production, replace with actual image serving logic
export async function GET() {
  // Return a placeholder SVG image
  const svg = `
    <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1000" fill="#faf9f7"/>
      <text x="400" y="500" font-family="Arial" font-size="24" fill="#73716d" text-anchor="middle">
        Virtual Try-On Result
      </text>
      <text x="400" y="530" font-family="Arial" font-size="16" fill="#a8a6a1" text-anchor="middle">
        AI processing result will appear here
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}

