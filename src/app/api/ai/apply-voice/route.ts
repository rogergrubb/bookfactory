// API Route: /api/ai/apply-voice/route.ts
// Rewrite content in a specific voice style

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { content, voiceId, bookId, chapterId, intensity = 'balanced' } = body;
    
    if (!content || !voiceId) {
      return NextResponse.json({ error: 'Content and voiceId required' }, { status: 400 });
    }
    
    // Get voice profile
    const voice = await prisma.voiceProfile.findFirst({
      where: { id: voiceId, userId },
      select: {
        id: true,
        systemPrompt: true,
        styleGuide: true,
        analysis: true,
      },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    // Adjust intensity
    const intensityGuides: Record<string, string> = {
      subtle: 'Make light adjustments to match the voice. Preserve most of the original phrasing while adding subtle stylistic touches.',
      balanced: 'Rewrite to match the voice style while preserving the meaning and key details. Balance between original content and voice characteristics.',
      strong: 'Fully transform the text to match this voice. Prioritize voice authenticity over preserving original phrasing.',
    };
    const intensityGuide = intensityGuides[intensity] || intensityGuides.balanced;
    
    // Build the prompt
    const systemPrompt = `You are an expert editor specializing in voice and style transformation. Your task is to rewrite content to match a specific author's voice.

${voice.systemPrompt}

INTENSITY LEVEL: ${intensity.toUpperCase()}
${intensityGuide}

IMPORTANT RULES:
1. Preserve all plot points, character actions, and dialogue meaning
2. Keep proper nouns, names, and specific details intact
3. Maintain the same POV and tense as the original
4. Transform style, sentence structure, and word choice to match the voice
5. Don't add new content or remove important information
6. The result should feel like the same scene written by the target voice`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Please rewrite the following text in the voice style described above:

"""
${content}
"""

Rewrite the text, preserving meaning while transforming style:`
      }]
    });
    
    const textBlock = response.content.find(block => block.type === 'text');
    const result = textBlock?.type === 'text' ? textBlock.text : '';
    
    // Log usage
    await prisma.voiceUsageLog.create({
      data: {
        voiceProfileId: voiceId,
        userId,
        toolId: 'apply-voice',
        chapterId,
        bookId,
        inputWordCount: content.split(/\s+/).length,
        outputWordCount: result.split(/\s+/).length,
      },
    });
    
    // Increment voice usage
    await prisma.voiceProfile.update({
      where: { id: voiceId },
      data: {
        timesUsed: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Apply voice error:', error);
    return NextResponse.json(
      { error: 'Failed to apply voice' },
      { status: 500 }
    );
  }
}
