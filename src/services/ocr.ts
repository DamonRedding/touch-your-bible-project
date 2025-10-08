// OCR Service for Bible Text Verification
// Uses Google Cloud Vision API for text detection
// Owner: Alex (Lead Engineer)
// Created: October 8, 2025

import { Platform } from 'react-native';

// Bible-related keywords to validate against
const BIBLE_KEYWORDS = [
  // Common words
  'god', 'lord', 'jesus', 'christ', 'holy', 'spirit', 'amen',
  'bible', 'scripture', 'verse', 'chapter', 'testament',
  'heaven', 'faith', 'grace', 'love', 'pray', 'prayer',
  'blessed', 'bless', 'saint', 'angel', 'gospel', 'apostle',

  // Book names (common abbreviations)
  'genesis', 'exodus', 'matthew', 'mark', 'luke', 'john',
  'acts', 'romans', 'corinthians', 'revelation', 'psalms',
  'proverbs', 'isaiah', 'jeremiah', 'kings', 'chronicles',

  // Common phrases
  'thy', 'thou', 'thee', 'thine', 'unto', 'begat', 'saith',
  'verily', 'behold', 'righteousness', 'covenant', 'salvation'
];

// Book number patterns (e.g., "John 3:16", "1 Corinthians 13:4")
const VERSE_PATTERN = /\b\d*\s*[A-Z][a-z]+\s+\d+:\d+/;

export interface OCRResult {
  success: boolean;
  confidence: number;
  text: string;
  isBibleText: boolean;
  matchedKeywords: string[];
  error?: string;
}

/**
 * Analyze text using Google Cloud Vision API
 * For MVP: Uses local keyword matching (no API key required)
 * Production: Integrate Google Cloud Vision API
 */
export async function verifyBibleText(imageUri: string): Promise<OCRResult> {
  try {
    // MVP Implementation: Simulate OCR with keyword matching
    // In production, this would call Google Cloud Vision API

    // For now, we'll simulate a successful detection
    // with realistic Bible text
    const simulatedText = await simulateOCR(imageUri);

    // Analyze the text for Bible-related content
    const analysis = analyzeBibleText(simulatedText);

    return analysis;
  } catch (error) {
    console.error('OCR verification error:', error);
    return {
      success: false,
      confidence: 0,
      text: '',
      isBibleText: false,
      matchedKeywords: [],
      error: error instanceof Error ? error.message : 'OCR failed',
    };
  }
}

/**
 * Simulate OCR text extraction (MVP)
 * In production, replace with actual Google Cloud Vision API call
 */
async function simulateOCR(imageUri: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // For MVP, we'll check if the image URI exists and return success
  // This simulates the camera capturing a Bible page
  if (imageUri && imageUri.length > 0) {
    // Return realistic Bible text for testing
    return `
      In the beginning God created the heavens and the earth.
      Now the earth was formless and empty, darkness was over
      the surface of the deep, and the Spirit of God was hovering
      over the waters. Genesis 1:1-2
    `;
  }

  throw new Error('Invalid image');
}

/**
 * Analyze extracted text for Bible content
 * Uses keyword matching and verse pattern detection
 */
function analyzeBibleText(text: string): OCRResult {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);

  // Find matching Bible keywords
  const matchedKeywords = BIBLE_KEYWORDS.filter(keyword =>
    normalizedText.includes(keyword)
  );

  // Check for verse pattern (e.g., "John 3:16")
  const hasVersePattern = VERSE_PATTERN.test(text);

  // Calculate confidence score
  const keywordScore = Math.min(matchedKeywords.length / 3, 1.0); // Max at 3+ keywords
  const verseScore = hasVersePattern ? 0.3 : 0;
  const confidence = Math.min((keywordScore * 0.7) + verseScore, 1.0);

  // Determine if it's Bible text
  const isBibleText = confidence >= 0.3; // 30% confidence threshold

  return {
    success: true,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    text: text.trim(),
    isBibleText,
    matchedKeywords,
  };
}

/**
 * Production-ready Google Cloud Vision API integration
 * Uncomment and configure when ready to use actual OCR
 */
/*
async function callGoogleVisionAPI(imageUri: string): Promise<string> {
  const GOOGLE_CLOUD_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

  if (!GOOGLE_CLOUD_VISION_API_KEY) {
    throw new Error('Google Cloud Vision API key not configured');
  }

  // Convert image to base64
  const base64Image = await convertImageToBase64(imageUri);

  // Call Google Cloud Vision API
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const textAnnotations = data.responses[0]?.textAnnotations;

  if (!textAnnotations || textAnnotations.length === 0) {
    throw new Error('No text detected in image');
  }

  // Return the full text (first annotation contains all text)
  return textAnnotations[0].description;
}

async function convertImageToBase64(imageUri: string): Promise<string> {
  // For Expo, use FileSystem
  const { readAsStringAsync } = await import('expo-file-system');
  return await readAsStringAsync(imageUri, { encoding: 'base64' });
}
*/

/**
 * Validate OCR result for UI feedback
 */
export function getOCRFeedbackMessage(result: OCRResult): {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error';
} {
  if (!result.success) {
    return {
      title: 'Verification Failed',
      message: result.error || 'Could not analyze the image. Please try again.',
      type: 'error',
    };
  }

  if (result.isBibleText) {
    return {
      title: '✅ Bible Text Detected!',
      message: `Detected ${result.matchedKeywords.length} Bible keyword${result.matchedKeywords.length === 1 ? '' : 's'} (${Math.round(result.confidence * 100)}% confidence)`,
      type: 'success',
    };
  }

  // Low confidence - offer manual override
  return {
    title: '⚠️ Unable to Confirm',
    message: `We couldn't clearly detect Bible text (${Math.round(result.confidence * 100)}% confidence). You can verify manually instead.`,
    type: 'warning',
  };
}
