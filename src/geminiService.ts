import { GoogleGenerativeAI } from '@google/generative-ai';

// واجهة البيانات الناتجة من الذكاء الاصطناعي
export interface ShortClip {
  title: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  viralityScore: number;
  reasoning: string;
  suggestedCaption: string;
  hashtags: string[];
}

export interface AnalysisResult {
  videoTitle: string;
  clips: ShortClip[];
}

export async function analyzeTranscriptWithGemini(
  transcriptText: string,
  userApiKey?: string
): Promise<AnalysisResult> {
  // جلب المفتاح الممرر أو المفتاح المعرف في بيئة Vite
  const apiKey = userApiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please provide a key.');
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const prompt = `
You are an expert viral content editor and social media strategist specializing in TikTok, Instagram Reels, and YouTube Shorts.

Analyze the following video transcript with timestamps and identify the top 3-5 most engaging, insightful, or exciting moments that can be cut into viral standalone short clips (30 to 60 seconds duration each).

Transcript:
"""
${transcriptText}
"""

Return your output EXCLUSIVELY in JSON format matching this structure:
{
  "videoTitle": "Suggested engaging video title",
  "clips": [
    {
      "title": "Catchy Clip Title for Shorts",
      "startTime": "01:15",
      "endTime": "02:00",
      "durationSeconds": 45,
      "viralityScore": 92,
      "reasoning": "Brief explanation of why this segment is high-retention and compelling.",
      "suggestedCaption": "Engaging social media post caption with a strong hook.",
      "hashtags": ["#Shorts", "#Viral", "#Motivation"]
    }
  ]
}
`;

  const response = await model.generateContent(prompt);
  const text = response.response.text();
  return JSON.parse(text) as AnalysisResult;
}
