import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const ToolExecutionSchema = z.object({
  toolId: z.string(),
  input: z.string().min(1),
  context: z.object({
    userId: z.string(),
    bookId: z.string(),
    documentId: z.string().optional(),
    chapterIds: z.array(z.string()).optional(),
    characterIds: z.array(z.string()).optional(),
    genre: z.string().optional(),
    storyBibleId: z.string().optional(),
    voiceProfileId: z.string().optional(),
    previousContent: z.string().optional(),
    selectedText: z.string().optional(),
    workflowId: z.string().optional(),
    previousToolRuns: z.array(z.string()).optional()
  }),
  options: z.object({
    length: z.enum(['short', 'medium', 'long']).optional(),
    tone: z.string().optional(),
    style: z.string().optional(),
    intensity: z.number().optional(),
    focusAreas: z.array(z.string()).optional(),
    customInstructions: z.string().optional()
  }).optional(),
  scopeSelection: z.object({
    mode: z.enum(['this-scene', 'selected-chapters', 'whole-book']),
    sceneId: z.string().optional(),
    chapterIds: z.array(z.string()).optional(),
    bookId: z.string()
  }).optional()
});

// ============================================================================
// TOOL SCOPE DEFINITIONS
// ============================================================================

type ToolScope = 'SCENE' | 'BOOK' | 'HYBRID';

const TOOL_SCOPES: Record<string, ToolScope> = {
  // Scene scope
  'continue': 'SCENE',
  'dialogue': 'SCENE',
  'description': 'SCENE',
  'action': 'SCENE',
  'inner-monologue': 'SCENE',
  'improve': 'SCENE',
  'show-not-tell': 'SCENE',
  'deepen-emotion': 'SCENE',
  'add-tension': 'SCENE',
  'vary-sentences': 'SCENE',
  'sensory-details': 'SCENE',
  // Book scope
  'plot-holes': 'BOOK',
  'emotional-arc': 'BOOK',
  'plot-twists': 'BOOK',
  'character-ideas': 'BOOK',
  'world-building': 'BOOK',
  'conflict-generator': 'BOOK',
  'subplot-ideas': 'BOOK',
  // Hybrid scope
  'first-draft': 'HYBRID',
  'pacing': 'HYBRID',
  'character-voice': 'HYBRID',
  'readability': 'HYBRID',
  'word-frequency': 'HYBRID',
  'scene-ideas': 'HYBRID'
};

// ============================================================================
// SYSTEM PROMPTS BY TOOL
// ============================================================================

const TOOL_PROMPTS: Record<string, string> = {
  'continue': `You are a skilled fiction writer. Continue the story naturally from where it left off, matching the existing voice, style, and tone. Maintain consistency with established characters, settings, and plot elements.`,
  
  'first-draft': `You are a skilled fiction writer. Transform the provided outline, notes, or bullet points into polished prose. Create vivid scenes with dialogue, description, and narrative flow while maintaining the intended story direction.`,
  
  'dialogue': `You are an expert at writing authentic dialogue. Create conversations that reveal character, advance plot, and feel natural. Each character should have a distinct voice. Include appropriate dialogue tags and action beats.`,
  
  'description': `You are a master of descriptive writing. Create vivid, sensory-rich descriptions that immerse readers. Balance detail with pacing. Use specific, concrete imagery rather than abstract statements.`,
  
  'action': `You are skilled at writing dynamic action sequences. Create visceral, well-paced action that keeps readers engaged. Use short sentences for intensity, varied rhythm, and clear spatial awareness.`,
  
  'inner-monologue': `You are an expert at writing internal character thoughts. Create deep, psychologically authentic internal monologue that reveals character motivation, fears, desires, and complexity.`,
  
  'improve': `You are an expert prose editor. Improve the writing while preserving the author's voice. Focus on: stronger verbs, clearer sentences, better word choices, improved rhythm and flow. Do not change the content's meaning.`,
  
  'show-not-tell': `You are an expert at "show don't tell" techniques. Transform abstract telling into concrete showing through action, dialogue, sensory details, and specific imagery. Make readers experience rather than be told.`,
  
  'deepen-emotion': `You are skilled at deepening emotional resonance. Enhance the emotional impact through: physical sensations, specific details, internal reactions, subtext in dialogue, and meaningful imagery.`,
  
  'add-tension': `You are an expert at building tension and suspense. Increase stakes, add conflict, create uncertainty, and heighten anticipation. Use pacing, word choice, and structure to build tension.`,
  
  'vary-sentences': `You are an expert prose stylist. Improve rhythm and flow by varying sentence structure: mix short punchy sentences with longer flowing ones. Create natural reading rhythm without monotony.`,
  
  'sensory-details': `You are a master of sensory writing. Enrich the text with specific sensory details: sight, sound, smell, taste, and touch. Make readers experience the scene viscerally.`,
  
  'pacing': `You are a story structure expert. Analyze the pacing of this text. Identify: fast vs slow sections, tension curves, balance of action/dialogue/description, areas that drag or rush.`,
  
  'character-voice': `You are an expert on character voice. Analyze the consistency and authenticity of character voices in dialogue and POV. Identify: voice distinctiveness, consistency issues, authenticity.`,
  
  'plot-holes': `You are a continuity expert. Analyze this text for plot holes, logical inconsistencies, timeline issues, and contradictions. Identify specific problems and suggest fixes.`,
  
  'readability': `You are a readability expert. Analyze this text for: reading level, sentence complexity, vocabulary difficulty, and accessibility. Provide specific metrics and improvement suggestions.`,
  
  'word-frequency': `You are a prose analyst. Analyze word usage patterns: overused words, repetitive phrases, crutch words, and patterns that may fatigue readers. Provide specific examples and alternatives.`,
  
  'emotional-arc': `You are a story analyst. Map the emotional journey through this text: highs, lows, tension points, relief moments. Visualize the emotional arc and identify opportunities.`,
  
  'plot-twists': `You are a master storyteller. Generate unexpected but earned plot twists based on the story context. Each twist should: subvert expectations, be foreshadowable, raise stakes, and feel inevitable in hindsight.`,
  
  'character-ideas': `You are a character creation expert. Generate compelling character concepts: unique traits, believable flaws, interesting backstories, clear motivations, and potential for growth.`,
  
  'world-building': `You are a world-building expert. Develop rich world details: geography, culture, history, social systems, and rules. Create internally consistent details that enhance the story.`,
  
  'conflict-generator': `You are a conflict expert. Generate compelling conflicts: internal struggles, interpersonal tensions, external obstacles, moral dilemmas. Each conflict should be meaningful and advance character/plot.`,
  
  'subplot-ideas': `You are a plot expert. Generate B-plots that enhance the main story: thematic parallels, character development opportunities, tension additions, and world enrichment.`,
  
  'scene-ideas': `You are a scene architect. Generate scene concepts that serve story goals: character moments, plot advancement, tension building, world revelation. Each scene should have clear purpose.`
};

// ============================================================================
// LENGTH CONFIGURATIONS
// ============================================================================

const LENGTH_CONFIGS = {
  short: { maxTokens: 300, instruction: 'Keep the output concise, around 100-200 words.' },
  medium: { maxTokens: 800, instruction: 'Provide a moderate length output, around 300-500 words.' },
  long: { maxTokens: 1500, instruction: 'Provide a comprehensive output, around 600-1000 words.' }
};

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request
    const body = await request.json();
    const parsed = ToolExecutionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { toolId, input, context, options, scopeSelection } = parsed.data;

    // Get tool scope
    const scope = TOOL_SCOPES[toolId];
    if (!scope) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    // Validate scope requirements
    if (scope === 'SCENE' && !context.documentId) {
      return NextResponse.json(
        { error: 'Scene-scope tools require a document selection' },
        { status: 400 }
      );
    }

    if (scope === 'HYBRID' && !scopeSelection) {
      return NextResponse.json(
        { error: 'Hybrid-scope tools require a scope selection' },
        { status: 400 }
      );
    }

    // Get additional context based on scope
    let additionalContext = '';

    // Fetch book info
    const book = await prisma.book.findUnique({
      where: { id: context.bookId },
      include: {
        characters: true,
        chapters: {
          include: { scenes: true }
        }
      }
    });

    if (book) {
      additionalContext += `\n\nBook: "${book.title}" (${book.genre})`;
      if (book.description) additionalContext += `\nDescription: ${book.description}`;
    }

    // Fetch scene content for scene/hybrid scope
    if (context.documentId) {
      const scene = await prisma.scene.findUnique({
        where: { id: context.documentId },
        include: { chapter: true }
      });
      if (scene) {
        additionalContext += `\n\nCurrent Scene: "${scene.title || 'Untitled'}" (Chapter: ${scene.chapter.title})`;
      }
    }

    // Fetch character info if relevant
    if (context.characterIds?.length) {
      const characters = await prisma.character.findMany({
        where: { id: { in: context.characterIds } }
      });
      if (characters.length) {
        additionalContext += '\n\nCharacters:';
        characters.forEach(char => {
          additionalContext += `\n- ${char.name} (${char.role}): ${char.description}`;
        });
      }
    }

    // Build system prompt
    const systemPrompt = TOOL_PROMPTS[toolId] || 'You are a helpful writing assistant.';
    const lengthConfig = LENGTH_CONFIGS[options?.length || 'medium'];

    // Build user message
    let userMessage = input;
    if (additionalContext) {
      userMessage = `Context:${additionalContext}\n\n---\n\nInput:\n${input}`;
    }
    if (options?.customInstructions) {
      userMessage += `\n\nAdditional Instructions: ${options.customInstructions}`;
    }
    userMessage += `\n\n${lengthConfig.instruction}`;

    // Create tool run record
    const startTime = Date.now();
    const toolRun = await prisma.toolRun.create({
      data: {
        userId: user.id,
        bookId: context.bookId,
        documentId: context.documentId,
        toolId,
        scope,
        scopeSelection: scopeSelection || undefined,
        input,
        output: '',
        context: context as object,
        options: options as object || undefined,
        status: 'RUNNING',
        workflowId: context.workflowId,
        previousToolRunId: context.previousToolRuns?.[context.previousToolRuns.length - 1]
      }
    });

    // Call Claude API
    const anthropic = new Anthropic();
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: lengthConfig.maxTokens,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      system: systemPrompt
    });

    const processingTime = Date.now() - startTime;
    const outputContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // Update tool run with result
    await prisma.toolRun.update({
      where: { id: toolRun.id },
      data: {
        output: outputContent,
        tokensUsed,
        processingTime,
        status: 'COMPLETED'
      }
    });

    // Deduct AI credits
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiCreditsUsed: { increment: Math.ceil(tokensUsed / 100) }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'AI_USED',
        message: `Used ${toolId} AI tool`,
        metadata: {
          toolId,
          bookId: context.bookId,
          documentId: context.documentId,
          tokensUsed
        }
      }
    });

    return NextResponse.json({
      success: true,
      content: outputContent,
      metadata: {
        toolRunId: toolRun.id,
        tokensUsed,
        processingTime,
        scope,
        appliedTo: {
          bookId: context.bookId,
          documentId: context.documentId,
          chapterIds: scopeSelection?.chapterIds
        }
      }
    });

  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      { error: 'Tool execution failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

