import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic();

// Tool-specific system prompts
const toolPrompts: Record<string, string> = {
  // GENERATE TOOLS
  'continue': `You are a skilled fiction writer. Continue the story naturally from where it left off. Match the existing tone, style, and pacing. Write 150-300 words of new content that flows seamlessly.`,
  'firstdraft': `You are a prolific fiction writer. Write a rough first draft based on the context. Focus on momentum. Write 200-400 words.`,
  'dialogue': `You are a master of dialogue. Create natural, character-appropriate dialogue with distinct voices. Include beats and action tags.`,
  'description': `You are a sensory-focused writer. Add rich, evocative descriptions using specific sensory details. Show, don't tell.`,
  'action': `You are an action scene specialist. Write dynamic, fast-paced sequences with short sentences and visceral prose.`,
  'thoughts': `You are skilled at internal monologue. Capture the character's unique thought patterns and inner voice authentically.`,

  // ENHANCE TOOLS
  'expand': `You are an editor who enriches prose. Expand the text by adding depth, nuance, and sensory details while maintaining voice.`,
  'condense': `You are a ruthless editor. Tighten prose by removing unnecessary words and redundancies. Keep core meaning but make it sharper.`,
  'rewrite': `You are a versatile writer. Rewrite this passage according to the specified direction while preserving core meaning.`,
  'polish': `You are a prose stylist. Polish text by improving word choices, sentence flow, and rhythm. Fix awkward phrases.`,
  'strengthen-verbs': `You are an editor focused on verb power. Replace weak verbs with stronger, more specific action verbs.`,
  'vary-sentences': `You are a prose rhythm specialist. Improve sentence variety - mix short and long sentences. Create better rhythm.`,
  'fix-dialogue-tags': `You are a dialogue specialist. Improve dialogue tags - add action beats, remove unnecessary tags.`,
  'show-dont-tell': `You are an expert at transforming telling into showing. Convert abstract statements into concrete scenes.`,

  // ANALYZE TOOLS
  'pacing': `Analyze the pacing. Identify fast/slow sections, tension build-up/release. Suggest improvements.`,
  'voice-check': `Analyze narrative voice for consistency. Note shifts in POV, tense, or tone.`,
  'tension-map': `Map tension levels throughout. Identify peaks and valleys. Suggest improvements.`,
  'character-voice': `Analyze how distinctly this character speaks/thinks. Note speech patterns and vocabulary.`,
  'repetition': `Find repeated words, phrases, and structures. Suggest variations and alternatives.`,
  'adverb-hunter': `Identify adverbs, especially those weakening strong verbs. Suggest stronger alternatives.`,
  'passive-voice': `Find passive voice constructions. Suggest active alternatives where appropriate.`,
  'readability': `Assess reading level, sentence complexity, and clarity. Suggest improvements.`,
  'emotional-arc': `Track the emotional arc. What emotions should readers feel? Where are the beats?`,
  'chapter-summary': `Provide a concise summary: main events, character developments, plot advancement.`,

  // BRAINSTORM TOOLS
  'plot-ideas': `Generate creative plot ideas that fit naturally with the existing story.`,
  'character-moments': `Suggest meaningful character moments - revelations, growth opportunities, relationship beats.`,
  'dialogue-options': `Generate multiple dialogue options for this situation. Vary tone, subtext, and approach.`,
  'scene-transitions': `Suggest smooth ways to transition between scenes. Consider time jumps and mood shifts.`,
  'conflict-escalation': `Suggest ways to escalate conflict. Consider obstacles, complications, raised stakes.`,
  'twist-generator': `Generate surprising but logical plot twists that fit the story.`,
  'what-if': `Explore this "what if" scenario thoroughly. Consider implications and possibilities.`,
  'stuck-help': `Help the writer get unstuck. Analyze the situation and suggest concrete ways forward.`,
};

// Sub-option modifiers
const subOptionModifiers: Record<string, Record<string, string>> = {
  'description': {
    'setting': 'Focus on environment and setting - architecture, landscape, atmosphere.',
    'character': 'Focus on character appearance - physical details, clothing, expressions.',
    'action': 'Focus on movement and action - how things happen physically.',
    'emotion': 'Focus on emotional atmosphere - mood, tension, feeling.',
    'sensory': 'Include all five senses - sight, sound, smell, touch, taste.',
  },
  'action': {
    'fight': 'Write intense physical combat with clear choreography.',
    'chase': 'Write a fast-paced chase with mounting tension.',
    'escape': 'Write a desperate escape sequence with obstacles.',
    'disaster': 'Write a catastrophic event with chaos and urgency.',
  },
  'expand': {
    'detail': 'Add specific, concrete details to enrich the scene.',
    'emotion': 'Deepen the emotional content and character interiority.',
    'sensory': 'Add sensory details across multiple senses.',
    'backstory': 'Weave in relevant backstory and context.',
  },
  'condense': {
    'light': 'Trim 10-20% - remove obvious redundancies only.',
    'moderate': 'Cut 30-40% - tighten significantly.',
    'aggressive': 'Cut 50%+ - reduce to essential elements only.',
  },
  'rewrite': {
    'dramatic': 'Make it more dramatic and emotionally heightened.',
    'subtle': 'Make it more subtle and nuanced.',
    'faster': 'Increase the pace - shorter sentences, more urgency.',
    'slower': 'Slow the pace - more detail, deeper moments.',
  },
  'plot-ideas': {
    'next': 'What should happen next in this story?',
    'conflict': 'How can conflict be introduced or heightened?',
    'complication': 'What complications could arise?',
    'resolution': 'How might this situation resolve?',
  },
  'twist-generator': {
    'betrayal': 'Generate a betrayal twist.',
    'revelation': 'Generate a revelation twist - hidden information comes to light.',
    'reversal': 'Generate a reversal twist - situation flips.',
    'surprise': 'Generate a surprise about the world or setting.',
  },
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
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
Sensory: Sight: ${sceneContext.sensory?.sight || 'N/A'} | Sound: ${sceneContext.sensory?.sound || 'N/A'} | Smell: ${sceneContext.sensory?.smell || 'N/A'}
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
        options: { subOptionId, customInstruction, sceneContextId: sceneContext?.id } as any,
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

    // Increment credits used
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
