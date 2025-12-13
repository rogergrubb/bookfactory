// AI Feedback Analysis Service
// Uses Claude to analyze manuscripts and provide detailed feedback

import Anthropic from '@anthropic-ai/sdk';
import {
  ManuscriptAnalysis,
  CategoryScores,
  FeedbackItem,
  SpecificIssue,
  PriorityAction,
  GenreFitAnalysis,
  SimilarWork,
  FeedbackCategory,
  AnalysisRequest,
  CATEGORY_INFO
} from './types';

const anthropic = new Anthropic();

// Main analysis function
export async function analyzeManuscript(
  content: string,
  request: AnalysisRequest,
  metadata?: {
    title?: string;
    genre?: string;
    targetAudience?: string;
    authorGoals?: string[];
  }
): Promise<Omit<ManuscriptAnalysis, 'id' | 'userId' | 'bookId' | 'createdAt'>> {
  
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  // Truncate if too long (keep beginning, middle sample, and end)
  const maxTokens = 50000;
  let analysisContent = content;
  if (content.length > maxTokens * 4) {
    const chunkSize = Math.floor(maxTokens * 4 / 3);
    const beginning = content.slice(0, chunkSize);
    const middle = content.slice(
      Math.floor(content.length / 2) - chunkSize / 2,
      Math.floor(content.length / 2) + chunkSize / 2
    );
    const end = content.slice(-chunkSize);
    analysisContent = `[BEGINNING]\n${beginning}\n\n[MIDDLE SAMPLE]\n${middle}\n\n[ENDING]\n${end}`;
  }

  // Build the analysis prompt
  const prompt = buildAnalysisPrompt(analysisContent, metadata, request.focusAreas);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = response.content[0];
  if (responseText.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse the JSON response
  let analysis: any;
  try {
    // Extract JSON from response
    const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (e) {
    console.error('Failed to parse analysis response:', e);
    throw new Error('Failed to parse analysis');
  }

  // Build the result
  const result: Omit<ManuscriptAnalysis, 'id' | 'userId' | 'bookId' | 'createdAt'> = {
    scope: request.scope,
    chapterId: request.chapterId,
    overallScore: analysis.overallScore || 70,
    scores: normalizeScores(analysis.scores || {}),
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    opportunities: analysis.opportunities || [],
    issues: (analysis.issues || []).map((issue: any, index: number) => ({
      id: `issue-${index}`,
      ...issue
    })),
    executiveSummary: analysis.executiveSummary || '',
    priorityActions: analysis.priorityActions || [],
    wordCountAnalyzed: wordCount,
    analysisVersion: '1.0.0',
  };

  // Add genre analysis if requested
  if (request.compareToGenre && metadata?.genre) {
    result.genreFit = analysis.genreFit;
  }

  // Add similar works if requested
  if (request.findSimilarWorks) {
    result.similarWorks = analysis.similarWorks;
  }

  return result;
}

// Build the analysis prompt
function buildAnalysisPrompt(
  content: string,
  metadata?: {
    title?: string;
    genre?: string;
    targetAudience?: string;
    authorGoals?: string[];
  },
  focusAreas?: FeedbackCategory[]
): string {
  const categoryList = Object.entries(CATEGORY_INFO)
    .map(([key, info]) => `- ${key}: ${info.description}`)
    .join('\n');

  const focusNote = focusAreas?.length 
    ? `\nPay special attention to these areas: ${focusAreas.join(', ')}`
    : '';

  return `You are an expert manuscript editor and literary critic. Analyze the following manuscript and provide detailed, actionable feedback.

${metadata?.title ? `Title: ${metadata.title}` : ''}
${metadata?.genre ? `Genre: ${metadata.genre}` : ''}
${metadata?.targetAudience ? `Target Audience: ${metadata.targetAudience}` : ''}
${metadata?.authorGoals?.length ? `Author Goals: ${metadata.authorGoals.join(', ')}` : ''}
${focusNote}

<manuscript>
${content}
</manuscript>

Analyze the manuscript across these categories:
${categoryList}

Provide your analysis as a JSON object with this structure:
{
  "overallScore": <0-100>,
  "scores": {
    "pacing": <0-100>,
    "dialogue": <0-100>,
    "prose_quality": <0-100>,
    "character_development": <0-100>,
    "plot_structure": <0-100>,
    "world_building": <0-100>,
    "tension": <0-100>,
    "emotional_impact": <0-100>,
    "voice_consistency": <0-100>,
    "show_dont_tell": <0-100>
  },
  "strengths": [
    {
      "category": "<category>",
      "title": "<brief title>",
      "description": "<detailed description>",
      "examples": [{"text": "<quote from manuscript>", "location": "<where>"}]
    }
  ],
  "weaknesses": [
    {
      "category": "<category>",
      "title": "<brief title>",
      "description": "<detailed description>",
      "examples": [{"text": "<quote>", "location": "<where>"}],
      "suggestions": ["<how to improve>"]
    }
  ],
  "opportunities": [
    {
      "category": "<category>",
      "title": "<what could be enhanced>",
      "description": "<how it could be better>"
    }
  ],
  "issues": [
    {
      "type": "<issue_type>",
      "severity": "<suggestion|minor|moderate|significant|critical>",
      "category": "<category>",
      "title": "<brief title>",
      "description": "<what's wrong>",
      "excerpt": "<problematic text>",
      "suggestion": "<how to fix>"
    }
  ],
  "executiveSummary": "<2-3 paragraph summary of the manuscript's current state, main strengths, and top priorities for improvement>",
  "priorityActions": [
    {
      "priority": <1-5>,
      "category": "<category>",
      "action": "<specific action to take>",
      "impact": "<low|medium|high>",
      "effort": "<low|medium|high>",
      "affectedAreas": ["<what parts of the manuscript>"]
    }
  ]${metadata?.genre ? `,
  "genreFit": {
    "genre": "${metadata.genre}",
    "fitScore": <0-100>,
    "expectations": [
      {"element": "<genre element>", "expected": "<what's typical>", "found": "<what's in manuscript>", "met": <true|false>}
    ],
    "gaps": ["<missing genre elements>"],
    "recommendations": ["<how to better fit the genre>"]
  }` : ''}
}

Be specific, constructive, and actionable. Quote directly from the text when possible. Prioritize the most impactful feedback.`;
}

// Normalize scores to ensure all categories have values
function normalizeScores(scores: Partial<CategoryScores>): CategoryScores {
  const defaultScore = 70;
  const categories: FeedbackCategory[] = [
    'pacing', 'dialogue', 'prose_quality', 'character_development',
    'plot_structure', 'world_building', 'tension', 'emotional_impact',
    'voice_consistency', 'show_dont_tell', 'opening_hook', 'chapter_endings',
    'scene_structure', 'description_balance', 'readability'
  ];

  const normalized: CategoryScores = {} as CategoryScores;
  for (const cat of categories) {
    normalized[cat] = scores[cat] ?? defaultScore;
  }
  return normalized;
}

// Quick analysis for a single aspect
export async function quickAnalysis(
  content: string,
  aspect: FeedbackCategory
): Promise<{
  score: number;
  feedback: string;
  suggestions: string[];
}> {
  const info = CATEGORY_INFO[aspect];
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Analyze this text for ${info.name} (${info.description}):

<text>
${content.slice(0, 5000)}
</text>

Respond with JSON only:
{
  "score": <0-100>,
  "feedback": "<2-3 sentence assessment>",
  "suggestions": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}`
    }]
  });

  const responseText = response.content[0];
  if (responseText.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse quick analysis:', e);
  }

  return {
    score: 70,
    feedback: 'Analysis could not be completed.',
    suggestions: []
  };
}

// Generate improvement suggestions for specific issues
export async function generateFixSuggestions(
  originalText: string,
  issue: SpecificIssue
): Promise<{
  rewriteOptions: string[];
  explanation: string;
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You found this issue in a manuscript:

Issue Type: ${issue.type}
Title: ${issue.title}
Description: ${issue.description}

Original text:
"${issue.excerpt || originalText.slice(0, 500)}"

Provide 3 different rewrite options that fix this issue while maintaining the author's voice.

Respond with JSON only:
{
  "rewriteOptions": [
    "<rewrite option 1>",
    "<rewrite option 2>",
    "<rewrite option 3>"
  ],
  "explanation": "<why these rewrites address the issue>"
}`
    }]
  });

  const responseText = response.content[0];
  if (responseText.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse fix suggestions:', e);
  }

  return {
    rewriteOptions: [],
    explanation: 'Could not generate suggestions.'
  };
}

// Compare two versions of text
export async function compareVersions(
  originalText: string,
  revisedText: string
): Promise<{
  improvement: number; // -100 to +100
  changedAspects: { aspect: string; change: number; note: string }[];
  summary: string;
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Compare these two versions of text and assess the improvement:

ORIGINAL:
"${originalText.slice(0, 3000)}"

REVISED:
"${revisedText.slice(0, 3000)}"

Respond with JSON only:
{
  "improvement": <-100 to +100, where positive means improved>,
  "changedAspects": [
    {"aspect": "<what changed>", "change": <-10 to +10>, "note": "<brief explanation>"}
  ],
  "summary": "<overall assessment of the revision>"
}`
    }]
  });

  const responseText = response.content[0];
  if (responseText.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse version comparison:', e);
  }

  return {
    improvement: 0,
    changedAspects: [],
    summary: 'Could not compare versions.'
  };
}
