// API Route: /api/voice/train
// Handles voice profile training

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const ANALYSIS_VERSION = '1.0.0';

interface TrainingSampleInput {
  source: 'paste' | 'upload' | 'chapter';
  sourceName: string;
  text: string;
}

// Quantitative analysis functions
function analyzeTextMetrics(text: string) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentenceRegex = /[^.!?]+[.!?]+(?=\s+[A-Z]|\s*$)/g;
  const sentences = text.match(sentenceRegex) || [];
  const words = text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || [];
  
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length 
    : 0;
    
  const avgParagraphLength = paragraphs.length > 0
    ? paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length
    : 0;
    
  const avgWordLength = words.length > 0
    ? words.reduce((sum, w) => sum + w.length, 0) / words.length
    : 0;
  
  const punctuationCounts = {
    dash: (text.match(/—|--/g) || []).length,
    ellipsis: (text.match(/\.\.\./g) || []).length,
    semicolon: (text.match(/;/g) || []).length,
    exclamation: (text.match(/!/g) || []).length,
    question: (text.match(/\?/g) || []).length,
  };
  
  return {
    sentences,
    paragraphs,
    words,
    avgSentenceLength,
    avgParagraphLength,
    avgWordLength,
    punctuationCounts,
  };
}

function calculateSentenceLengthVariance(sentences: string[]): number {
  if (sentences.length < 2) return 0;
  
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
  
  return Math.sqrt(variance);
}

function detectPOV(text: string): string {
  const firstPersonCount = (text.match(/\b(I|me|my|mine|myself|we|us|our|ours)\b/gi) || []).length;
  const secondPersonCount = (text.match(/\b(you|your|yours|yourself)\b/gi) || []).length;
  const thirdPersonCount = (text.match(/\b(he|she|him|her|his|hers|they|them|their)\b/gi) || []).length;
  
  const total = firstPersonCount + secondPersonCount + thirdPersonCount || 1;
  
  if (firstPersonCount / total > 0.5) return 'first';
  if (secondPersonCount / total > 0.3) return 'second';
  if (thirdPersonCount / total > 0.5) return 'third-limited';
  
  return 'mixed';
}

function detectTense(text: string) {
  const pastIndicators = (text.match(/\b(was|were|had|did|went|came|said|thought|felt|saw|heard|knew|made|took|got)\b/gi) || []).length;
  const presentIndicators = (text.match(/\b(am|is|are|do|does|go|goes|come|comes|say|says|think|thinks|feel|feels)\b/gi) || []).length;
  const futureIndicators = (text.match(/\b(will|shall|going to|gonna|'ll)\b/gi) || []).length;
  
  const total = pastIndicators + presentIndicators + futureIndicators || 1;
  
  return {
    past: Math.round((pastIndicators / total) * 100),
    present: Math.round((presentIndicators / total) * 100),
    future: Math.round((futureIndicators / total) * 100),
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateReadability(text: string): number {
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (words.length === 0 || sentences.length === 0) return 50;
  
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllableCount / words.length;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// AI-powered deep analysis
async function performDeepAnalysis(
  combinedText: string,
  quantMetrics: ReturnType<typeof analyzeTextMetrics>
) {
  const client = new Anthropic();
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are an expert literary analyst specializing in author voice and style. Analyze the following writing samples and provide a detailed JSON analysis.

<writing_samples>
${combinedText.slice(0, 15000)} 
</writing_samples>

<quantitative_context>
- Average sentence length: ${quantMetrics.avgSentenceLength.toFixed(1)} words
- Average paragraph length: ${quantMetrics.avgParagraphLength.toFixed(1)} words
- Average word length: ${quantMetrics.avgWordLength.toFixed(1)} characters
- Total words analyzed: ${quantMetrics.words.length}
</quantitative_context>

Analyze the writing style and respond with ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "dimensions": {
    "formality": <1-10>,
    "density": <1-10>,
    "directness": <1-10>,
    "seriousness": <1-10>,
    "emotionality": <1-10>,
    "concreteness": <1-10>,
    "pacing": <1-10>,
    "complexity": <1-10>
  },
  "toneProfile": {
    "primaryTones": [
      {"tone": "<tone name>", "strength": <1-10>}
    ],
    "emotionalRange": {
      "positive": <0-100>,
      "negative": <0-100>,
      "neutral": <0-100>
    },
    "humorStyle": "<dry|witty|slapstick|dark|absurd|none>",
    "tensionBuildMethod": "<gradual|sudden|oscillating>",
    "readerRelationship": "<intimate|friendly|professional|distant>"
  },
  "dialogueStyle": {
    "tagStyle": "<minimal|balanced|descriptive>",
    "saidPercentage": <0-100>,
    "actionBeatFrequency": <0-5>,
    "avgExchangeLength": <number>,
    "subTextHeaviness": <1-10>,
    "voiceDifferentiation": "<strong|moderate|subtle>",
    "usesDialect": <true|false>
  },
  "narrativeStyle": {
    "preferredPOV": "<first|third-limited|third-omniscient|second|mixed>",
    "narrativeDistance": "<close|medium|distant>",
    "interiorityLevel": "<deep|moderate|surface>",
    "descriptionStyle": "<woven|blocked|minimal>",
    "temporalFlow": "<linear|nonlinear|mixed>",
    "flashbackUsage": "<frequent|occasional|rare>"
  },
  "signatures": {
    "signaturePhrases": ["<phrase>"],
    "recurringStructures": [
      {
        "pattern": "<pattern name>",
        "description": "<description>",
        "examples": ["<example>"]
      }
    ],
    "distinguishingFeatures": ["<feature>"],
    "notableAbsences": ["<what this author avoids>"]
  },
  "similarAuthors": [
    {
      "authorName": "<author>",
      "similarityScore": <0-100>,
      "sharedTraits": ["<trait>"]
    }
  ]
}`
    }]
  });
  
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }
  
  try {
    return JSON.parse(content.text);
  } catch (e) {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse analysis response');
  }
}

// Generate the system prompt for AI use
function generateVoicePrompts(analysis: any, quantMetrics: ReturnType<typeof analyzeTextMetrics>) {
  const dim = analysis.dimensions;
  const sent = quantMetrics;
  const tone = analysis.toneProfile;
  const narr = analysis.narrativeStyle;
  const sig = analysis.signatures;
  
  const styleDescriptors: string[] = [];
  
  if (dim.formality <= 3) styleDescriptors.push('casual and conversational');
  else if (dim.formality >= 7) styleDescriptors.push('formal and polished');
  
  if (dim.density <= 3) styleDescriptors.push('spare and minimalist');
  else if (dim.density >= 7) styleDescriptors.push('rich and ornate');
  
  if (dim.pacing <= 3) styleDescriptors.push('contemplative and unhurried');
  else if (dim.pacing >= 7) styleDescriptors.push('brisk and propulsive');
  
  if (dim.emotionality >= 7) styleDescriptors.push('emotionally expressive');
  else if (dim.emotionality <= 3) styleDescriptors.push('emotionally restrained');
  
  const sentenceVariance = calculateSentenceLengthVariance(sent.sentences);
  
  const styleGuide = `## Voice Style Guide

### Overall Impression
This writing voice is ${styleDescriptors.join(', ')}.

### Sentence Structure
- Average sentence length: ${sent.avgSentenceLength.toFixed(0)} words
- Sentence variety: ${sentenceVariance > 8 ? 'High (mix of short and long)' : sentenceVariance > 4 ? 'Moderate' : 'Consistent lengths'}

### Tone
Primary tones: ${tone.primaryTones.map((t: any) => t.tone).join(', ')}
${tone.humorStyle !== 'none' ? `Humor style: ${tone.humorStyle}` : 'Minimal humor'}
Reader relationship: ${tone.readerRelationship}

### Narrative Approach
- POV: ${narr.preferredPOV}
- Narrative distance: ${narr.narrativeDistance}
- Access to character thoughts: ${narr.interiorityLevel}
- Description style: ${narr.descriptionStyle}

### Signature Elements
${sig.distinguishingFeatures.map((f: string) => `- ${f}`).join('\n')}

### What This Voice Avoids
${sig.notableAbsences.map((a: string) => `- ${a}`).join('\n')}
`;

  const systemPrompt = `You are writing in a specific author's voice. Follow these style guidelines precisely:

VOICE CHARACTERISTICS:
- Formality: ${dim.formality}/10 (${dim.formality <= 3 ? 'casual' : dim.formality >= 7 ? 'formal' : 'balanced'})
- Prose density: ${dim.density}/10 (${dim.density <= 3 ? 'minimalist' : dim.density >= 7 ? 'rich/ornate' : 'balanced'})
- Directness: ${dim.directness}/10
- Emotional expression: ${dim.emotionality}/10
- Pacing: ${dim.pacing}/10 (${dim.pacing <= 3 ? 'slow' : dim.pacing >= 7 ? 'fast' : 'moderate'})

SENTENCE CONSTRUCTION:
- Target average: ${sent.avgSentenceLength.toFixed(0)} words per sentence
- Vary length: ${sentenceVariance > 6 ? 'Mix short punchy sentences with longer flowing ones' : 'Keep fairly consistent lengths'}

TONE:
- Primary tone: ${tone.primaryTones[0]?.tone || 'neutral'}
- Reader relationship: ${tone.readerRelationship}
- Tension building: ${tone.tensionBuildMethod}

NARRATIVE VOICE:
- POV: ${narr.preferredPOV}
- Narrative distance: ${narr.narrativeDistance}
- Interiority: ${narr.interiorityLevel} access to thoughts

SIGNATURE ELEMENTS:
${sig.signaturePhrases.slice(0, 3).map((p: string) => `- "${p}"`).join('\n')}

MUST AVOID:
${sig.notableAbsences.slice(0, 3).map((a: string) => `- ${a}`).join('\n')}

Write naturally in this voice. Don't force elements - let them emerge organically while staying true to the style.`;

  return { systemPrompt, styleGuide };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, samples } = body as { name: string; samples: TrainingSampleInput[] };
    
    if (!name || !samples || samples.length === 0) {
      return NextResponse.json({ error: 'Name and samples required' }, { status: 400 });
    }
    
    // Combine all sample text
    const combinedText = samples.map(s => s.text).join('\n\n---\n\n');
    const totalWordCount = combinedText.split(/\s+/).filter(w => w.length > 0).length;
    
    if (totalWordCount < 1000) {
      return NextResponse.json({ error: 'Minimum 1000 words required' }, { status: 400 });
    }
    
    // Step 1: Quantitative analysis
    const quantMetrics = analyzeTextMetrics(combinedText);
    const sentenceVariance = calculateSentenceLengthVariance(quantMetrics.sentences);
    const pov = detectPOV(combinedText);
    const tense = detectTense(combinedText);
    const readability = calculateReadability(combinedText);
    
    // Build sentence patterns
    const sentenceLengths = quantMetrics.sentences.map(s => s.split(/\s+/).length);
    const shortSentences = sentenceLengths.filter(l => l <= 8).length;
    const longSentences = sentenceLengths.filter(l => l > 20).length;
    const totalSentences = quantMetrics.sentences.length || 1;
    
    const paragraphLengths = quantMetrics.paragraphs.map(p => p.split(/[.!?]+/).filter(s => s.trim()).length);
    const shortParagraphs = paragraphLengths.filter(l => l <= 2).length;
    const mediumParagraphs = paragraphLengths.filter(l => l > 2 && l <= 5).length;
    const longParagraphs = paragraphLengths.filter(l => l > 5).length;
    const totalParagraphs = paragraphLengths.length || 1;
    
    // Step 2: AI deep analysis
    const deepAnalysis = await performDeepAnalysis(combinedText, quantMetrics);
    
    // Build the complete analysis object
    const analysis = {
      dimensions: deepAnalysis.dimensions,
      sentencePatterns: {
        avgSentenceLength: quantMetrics.avgSentenceLength,
        avgParagraphLength: quantMetrics.avgParagraphLength,
        avgParagraphSentences: quantMetrics.paragraphs.length > 0 
          ? quantMetrics.sentences.length / quantMetrics.paragraphs.length 
          : 0,
        sentenceLengthVariance: sentenceVariance,
        simplePercentage: Math.round((shortSentences / totalSentences) * 100),
        compoundPercentage: 0,
        complexPercentage: Math.round((longSentences / totalSentences) * 100),
        fragmentPercentage: 0,
        commonOpenings: [],
        punctuationStyle: {
          dashFrequency: (quantMetrics.punctuationCounts.dash / quantMetrics.words.length) * 1000,
          ellipsisFrequency: (quantMetrics.punctuationCounts.ellipsis / quantMetrics.words.length) * 1000,
          semicolonFrequency: (quantMetrics.punctuationCounts.semicolon / quantMetrics.words.length) * 1000,
          exclamationFrequency: (quantMetrics.punctuationCounts.exclamation / quantMetrics.words.length) * 1000,
          questionFrequency: (quantMetrics.punctuationCounts.question / quantMetrics.words.length) * 1000,
        },
      },
      vocabularyProfile: {
        avgWordLength: quantMetrics.avgWordLength,
        uniqueWordsRatio: new Set(quantMetrics.words.map(w => w.toLowerCase())).size / quantMetrics.words.length,
        readabilityScore: readability,
        favoredWords: [],
        avoidedPatterns: [],
        activeVoicePercentage: 75,
        verbTenseDistribution: tense,
        adjectiveFrequency: 0,
        adverbFrequency: 0,
        sensoryFrequency: { visual: 0, auditory: 0, tactile: 0, olfactory: 0, gustatory: 0 },
        figurativeUsage: { simileFrequency: 0, metaphorFrequency: 0, personificationFrequency: 0 },
      },
      rhythmProfile: {
        avgBeatsPerSentence: quantMetrics.avgSentenceLength * 1.5,
        rhythmVariation: sentenceVariance,
        actionScenePace: sentenceVariance > 8 ? 'fast' : 'medium',
        reflectionScenePace: quantMetrics.avgSentenceLength > 20 ? 'slow' : 'medium',
        dialogueScenePace: 'medium',
        shortParagraphPercentage: Math.round((shortParagraphs / totalParagraphs) * 100),
        mediumParagraphPercentage: Math.round((mediumParagraphs / totalParagraphs) * 100),
        longParagraphPercentage: Math.round((longParagraphs / totalParagraphs) * 100),
        buildsToClimax: false,
        usesRhythmicBeats: false,
      },
      toneProfile: deepAnalysis.toneProfile,
      dialogueStyle: deepAnalysis.dialogueStyle,
      narrativeStyle: {
        ...deepAnalysis.narrativeStyle,
        preferredPOV: pov,
      },
      signatures: deepAnalysis.signatures,
      similarAuthors: deepAnalysis.similarAuthors,
      confidence: Math.min(100, Math.round(50 + (samples.length * 5) + (totalWordCount / 100))),
      analysisVersion: ANALYSIS_VERSION,
    };
    
    // Generate prompts
    const { systemPrompt, styleGuide } = generateVoicePrompts(deepAnalysis, quantMetrics);
    
    // Save to database
    const voiceProfile = await prisma.voiceProfile.create({
      data: {
        userId,
        name,
        totalWordCount,
        sampleCount: samples.length,
        analysis: analysis as any,
        systemPrompt,
        styleGuide,
        status: 'ready',
        trainingSamples: {
          create: samples.map(s => ({
            source: s.source,
            sourceName: s.sourceName,
            text: s.text,
            wordCount: s.text.split(/\s+/).filter(w => w.length > 0).length,
          })),
        },
      },
    });
    
    return NextResponse.json({
      voiceId: voiceProfile.id,
      name: voiceProfile.name,
      confidence: analysis.confidence,
    });
  } catch (error) {
    console.error('Voice training error:', error);
    return NextResponse.json(
      { error: 'Training failed' },
      { status: 500 }
    );
  }
}
