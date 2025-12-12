import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic();

// Tool-specific system prompts
const toolPrompts: Record<string, string> = {
  // GENERATE TOOLS
  'continue': `You are a skilled fiction writer. Continue the story naturally from where it left off. Match the existing tone, style, and pacing. Write 150-300 words of new content that flows seamlessly.`,
  'firstdraft': `You are a prolific fiction writer. Write a rough first draft based on the context provided. Focus on momentum. Write 200-400 words.`,
  'dialogue': `You are a master of dialogue writing. Create natural, character-appropriate dialogue with distinct voices. Include beats and action tags.`,
  'description': `You are a sensory-focused writer. Add rich, evocative descriptions using specific sensory details. Show, don't tell.`,
  'action': `You are an action scene specialist. Write dynamic, fast-paced sequences with short sentences for intensity.`,
  'thoughts': `You are skilled at writing internal monologue. Capture the character's unique thought patterns and inner voice.`,
  // ENHANCE TOOLS
  'expand': `You are an editor who enriches prose. Expand the text by adding depth, nuance, and sensory details.`,
  'condense': `You are a ruthless editor. Tighten this prose by removing unnecessary words and redundancies.`,
  'rewrite': `You are a versatile writer. Rewrite this passage according to the specified direction.`,
  'polish': `You are a prose stylist. Polish this text by improving word choices, sentence flow, and rhythm.`,
  'strengthen-verbs': `You are an editor focused on verb power. Replace weak verbs with stronger, more specific action verbs.`,
  'vary-sentences': `You are a prose rhythm specialist. Improve sentence variety and reading rhythm.`,
  'fix-dialogue-tags': `You are a dialogue specialist. Improve dialogue tags with action beats. Make conversations flow naturally.`,
  'show-dont-tell': `You are an expert at transforming telling into showing. Convert abstract statements into concrete scenes.`,
  // ANALYZE TOOLS
  'pacing': `Analyze the pacing of this chapter. Identify fast and slow sections, tension build-up and release.`,
  'voice-check': `Analyze the narrative voice for consistency. Note any shifts in POV, tense, or tone.`,
  'tension-map': `Map the tension levels throughout this passage. Identify peaks and valleys.`,
  'character-voice': `Analyze how distinctly this character speaks/thinks. Note speech patterns and vocabulary.`,
  'repetition': `Find repeated words, phrases, and sentence structures. Suggest variations.`,
  'adverb-hunter': `Identify adverbs, especially those weakening strong verbs. Suggest alternatives.`,
  'passive-voice': `Find passive voice constructions. Suggest active alternatives.`,
  'readability': `Assess reading level, sentence complexity, and clarity.`,
  'emotional-arc': `Track the emotional arc. What emotions should readers feel? Where are the beats?`,
  'chapter-summary': `Provide a concise summary: main events, character developments, plot advancement.`,
  // BRAINSTORM TOOLS
  'plot-ideas': `Generate plot ideas that fit naturally with the existing story.`,
  'character-moments': `Suggest meaningful character moments - revelations, growth opportunities.`,
  'dialogue-options': `Generate multiple dialogue options for this situation. Vary tone and approach.`,
  'scene-transitions': `Suggest smooth ways to transition between scenes.`,
  'conflict-escalation': `Suggest ways to escalate the conflict. Consider obstacles and stakes.`,
  'twist-generator': `Generate surprising but logical plot twists.`,
  'what-if': `Explore this "what if" scenario thoroughly. Consider implications.`,
  'stuck-help': `Help the writer get unstuck. Identify the block and suggest concrete ways forward.`,
};

// Sub-option modifiers
const subOptionModifiers: Record<string, Record<string, string>> = {
  'description': {
    'setting': 'Focus on environment and setting.',
    'character': 'Focus on character appearance.',
    'action': 'Focus on movement and action.',
    'emotion': 'Focus on emotional atmosphere.',
    'sensory': 'Include all five senses.',
  },
  'action': {
    'fight': 'Write intense physical combat.',
    'chase': 'Write a fast-paced chase scene.',
    'escape': 'Write a desperate escape sequence.',
    'disaster': 'Write a catastrophic event scene.',
  },
  'expand': {
    'detail': 'Add specific, concrete details.',
    'emotion': 'Deepen the emotional content.',
    'sensory': 'Add sensory details.',
    'backstory': 'Weave in relevant backstory.',
  },
  'condense': {
    'light': 'Trim 10-20%.',
    'moderate': 'Cut 30-40%.',
    'aggressive': 'Cut 50%+.',
  },
  'rewrite': {
    'dramatic': 'Make it more dramatic.',
    'subtle': 'Make it more subtle.',
    'faster': 'Increase the pace.',
    'slower': 'Slow the pace.',
  },
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      toolId,
      subOptionId,
      chapterContent,
      selectedText,
      cursorPosition,
      sceneContext,
      customInstruction,
      bookId,
      chapterId,
    } = body;

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }

    const basePrompt = toolPrompts[toolId];
    if (!basePrompt) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    // Build system prompt
    let systemPrompt = basePrompt;

    if (subOptionId && subOptionModifiers[toolId]?.[subOptionId]) {
      systemPrompt += `\n\nSpecific focus: ${subOptionModifiers[toolId][subOptionId]}`;
    }

    if (customInstruction) {
      systemPrompt += `\n\nAdditional instructions: ${customInstruction}`;
    }

    if (sceneContext) {
      systemPrompt += `\n\n--- SCENE CONTEXT ---
Setting: ${sceneContext.name}
Mood: ${sceneContext.mood?.primary || ''} ${sceneContext.mood?.secondary ? `/ ${sceneContext.mood.secondary}` : ''}
Sensory: Sight: ${sceneContext.sensory?.sight || '-'}, Sound: ${sceneContext.sensory?.sound || '-'}, Smell: ${sceneContext.sensory?.smell || '-'}
Props: ${sceneContext.props?.join(', ') || 'None'}
${sceneContext.aiNotes ? `Notes: ${sceneContext.aiNotes}` : ''}`;
    }

    // Build user message
    let userMessage = '';

    if (selectedText) {
      const contextBefore = chapterContent?.slice(Math.max(0, cursorPosition - 500), cursorPosition) || '';
      const contextAfter = chapterContent?.slice(cursorPosition + selectedText.length, cursorPosition + selectedText.length + 500) || '';
      userMessage = `Selected text:\n---\n${selectedText}\n---\n\nContext before:\n${contextBefore}\n\nContext after:\n${contextAfter}`;
    } else if (toolId === 'continue' || toolId === 'firstdraft') {
      const contextBefore = chapterContent?.slice(Math.max(0, cursorPosition - 1500), cursorPosition) || '';
      userMessage = `Continue from here:\n\n${contextBefore}`;
    } else if (['pacing', 'voice-check', 'tension-map', 'repetition', 'adverb-hunter', 'passive-voice', 'readability', 'emotional-arc', 'chapter-summary'].includes(toolId)) {
      userMessage = `Analyze this chapter:\n\n${chapterContent || 'No content provided'}`;
    } else {
      const contextBefore = chapterContent?.slice(Math.max(0, cursorPosition - 800), cursorPosition) || '';
      const contextAfter = chapterContent?.slice(cursorPosition, cursorPosition + 400) || '';
      userMessage = `Current context:\n\n${contextBefore}[CURSOR]${contextAfter}`;
    }

    // Create tool run record
    const toolRun = await prisma.toolRun.create({
      data: {
        userId: user.id,
        bookId: bookId || '',
        documentId: chapterId,
        toolId,
        scope: selectedText ? 'selection' : 'chapter',
        input: userMessage.slice(0, 10000),
        status: 'running',
        options: { subOptionId, customInstruction, sceneContextId: sceneContext?.id },
      },
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const result = response.content[0].type === 'text' ? response.content[0].text : '';
    const processingTime = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Update tool run with result
    await prisma.toolRun.update({
      where: { id: toolRun.id },
      data: { output: result, status: 'completed', processingTime, tokensUsed },
    });

    // Track AI usage
    await prisma.aIUsage.create({
      data: {
        userId: user.id,
        type: toolId,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        bookId,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({ result, toolRunId: toolRun.id, tokensUsed, processingTime });
  } catch (error) {
    console.error('Theater API error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
