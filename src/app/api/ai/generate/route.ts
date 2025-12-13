import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Request validation schema - Updated to include voiceId
const GenerateRequestSchema = z.object({
  type: z.string(),
  content: z.string().min(1),
  genre: z.string().optional().default('literary'),
  bookId: z.string().optional(),
  chapterId: z.string().optional(),
  characterIds: z.array(z.string()).optional(),
  voiceId: z.string().optional(), // NEW: Voice profile ID
  options: z.object({
    length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
    intensity: z.number().min(1).max(10).optional().default(5),
    customInstructions: z.string().optional(),
    context: z.any().optional(),
    voiceIntensity: z.enum(['subtle', 'balanced', 'strong']).optional().default('balanced'), // NEW
  }).optional()
});

// Genre-specific guidance
const GENRE_GUIDANCE: Record<string, string> = {
  romance: `Write with emotional depth and romantic tension. Focus on the chemistry between characters, their internal conflicts about love, and the push-pull dynamic. Use sensory details to create intimacy. Pace romantic moments thoughtfully—let tension build.`,
  
  mystery: `Build intrigue through strategic information reveals. Plant clues naturally within scenes. Create atmosphere through setting and mood. Keep readers guessing while playing fair with evidence. Maintain tension through pacing and red herrings.`,
  
  thriller: `Maintain relentless forward momentum. Use short, punchy sentences during high-tension moments. Create visceral stakes—make the danger feel real and immediate. End scenes on hooks. Keep the protagonist under constant pressure.`,
  
  fantasy: `Weave world-building naturally into narrative. Make magic systems feel consistent. Balance the fantastical with relatable human emotions. Use rich, evocative descriptions for settings. Ground the extraordinary in sensory details.`,
  
  scifi: `Ground speculative elements in plausible science. Explore technology's impact on humanity. Balance exposition with action. Create immersive future/alternate worlds through sensory details. Make the unfamiliar feel tangible.`,
  
  literary: `Prioritize prose style, thematic depth, and character interiority. Use metaphor and symbolism purposefully. Create layered meanings. Focus on the human condition and emotional truth. Every word should earn its place.`,
  
  horror: `Build dread through atmosphere and pacing. Use the unknown and suggested threats. Create visceral, sensory descriptions. Play on primal fears. Balance tension with release. What you don't show is often scarier than what you do.`,
  
  ya: `Capture authentic teen voice and concerns. Focus on identity, belonging, and coming-of-age themes. Use contemporary language naturally. Balance hope with realistic challenges. Make emotions feel immediate and important.`,
  
  historical: `Ground scenes in period-accurate details without overwhelming the narrative. Use language that evokes the era while remaining accessible. Weave historical context naturally into character experiences.`,
  
  contemporary: `Create authentic modern settings and dialogue. Address current social dynamics naturally. Ground characters in recognizable experiences while finding the universal in the specific.`
};

// Length guidance
const LENGTH_GUIDANCE: Record<string, string> = {
  short: 'Write approximately 150-250 words. Be concise but complete.',
  medium: 'Write approximately 300-500 words. Provide good detail and development.',
  long: 'Write approximately 600-900 words. Be comprehensive with rich detail.'
};

// Voice intensity modifiers
const VOICE_INTENSITY_GUIDANCE: Record<string, string> = {
  subtle: 'Lightly incorporate the voice characteristics. Prioritize the specific task while adding subtle stylistic touches.',
  balanced: 'Balance the task requirements with voice characteristics. Match the voice style while fully addressing the prompt.',
  strong: 'Strongly emphasize the voice characteristics. The voice style should be clearly evident throughout.'
};

// Comprehensive tool prompts
const TOOL_PROMPTS: Record<string, (content: string, genre: string, options: any) => string> = {
  // ============================================
  // GENERATE TOOLS
  // ============================================
  
  'continue': (content, genre, options) => `You are an expert creative writer. Continue this story naturally, matching the existing voice, style, and tone. Write seamlessly from where it left off, as if the same author is continuing.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Text to continue from:
"""
${content}
"""

Continue the story naturally:`,

  'first-draft': (content, genre, options) => `You are an expert creative writer. Transform these notes, outlines, or bullet points into a complete, polished scene. Write with vivid details, natural dialogue, and engaging prose. Don't just expand the notes—bring them to life with the craft of a skilled novelist.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Outline/Notes to transform:
"""
${content}
"""

Write the full scene:`,

  'dialogue': (content, genre, options) => `You are an expert dialogue writer. Create natural, character-revealing dialogue based on this context. Each character should have a distinct voice that reflects their personality, background, and current emotional state.

Include:
- Subtext (what characters mean vs. what they say)
- Natural beats and pauses
- Character-specific speech patterns
- Tension or emotional undercurrents
- Actions and reactions between lines

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Context for dialogue:
"""
${content}
"""

Write the dialogue:`,

  'description': (content, genre, options) => `You are an expert at descriptive writing. Create rich, sensory description that brings this scene/character/setting to life. Engage all five senses where appropriate. Show the subject through specific, evocative details rather than generic statements.

Avoid:
- Purple prose (over-elaborate descriptions)
- Clichéd imagery
- Passive observation ("there was...")
- Information dumps

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Subject to describe:
"""
${content}
"""

Write the description:`,

  'action': (content, genre, options) => `You are an expert action writer. Create a dynamic, visceral action sequence. Use varied sentence lengths—short and punchy during peak intensity, longer for breathers. Make the choreography clear so readers can follow what's happening.

Include:
- Physical sensations and visceral details
- Clear spatial awareness
- Character reactions and decisions
- Pacing variation (tension, release, escalation)
- Stakes and consequences

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Setup for action:
"""
${content}
"""

Write the action sequence:`,

  'thoughts': (content, genre, options) => `You are an expert at writing internal monologue. Create deep, authentic character interiority that reveals their inner world—their fears, desires, conflicts, and realizations.

Techniques to use:
- Stream of consciousness where appropriate
- Sensory triggers for memories/emotions
- Self-deception vs. truth
- Layered thoughts (surface and deeper)
- Physical sensations tied to emotions

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Context for internal thoughts:
"""
${content}
"""

Write the internal monologue:`,

  // ============================================
  // ENHANCE TOOLS
  // ============================================

  'expand': (content, genre, options) => `You are an expert editor. Expand this passage with richer details, deeper character moments, and more sensory engagement. Add what's missing to bring the scene fully to life.

Add:
- Sensory details (sights, sounds, smells, textures)
- Character interiority and reactions
- Environmental atmosphere
- Subtle beats between actions/dialogue

Keep the same voice and maintain the original meaning.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Text to expand:
"""
${content}
"""

Write the expanded version:`,

  'condense': (content, genre, options) => `You are an expert editor. Tighten this passage while preserving its impact. Remove redundancy, weak phrasing, and anything that doesn't earn its place. Every word should count.

Remove:
- Unnecessary adverbs and adjectives
- Redundant phrases
- Weak verbs (replace with stronger ones)
- Filter words and distancing language

Preserve: The core meaning, voice, and strongest images.

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Text to condense:
"""
${content}
"""

Write the tightened version:`,

  'rewrite': (content, genre, options) => `You are an expert creative writer. Completely rewrite this passage with fresh language and approach while preserving the core meaning and story beats. Create something that feels new while staying true to the intent.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original text:
"""
${content}
"""

Write a fresh version:`,

  'polish': (content, genre, options) => `You are an expert prose stylist. Polish this passage to publication quality. Improve word choice, rhythm, and flow while preserving the author's voice. Fix any awkward phrasing.

Focus on:
- Stronger verb choices
- More precise nouns
- Better sentence rhythm
- Smoother transitions
- Eliminating clichés

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Text to polish:
"""
${content}
"""

Write the polished version:`
};

// Helper function to get voice system prompt
async function getVoiceSystemPrompt(voiceId: string, userId: string): Promise<string | null> {
  try {
    const voice = await prisma.voiceProfile.findFirst({
      where: { id: voiceId, userId },
      select: { systemPrompt: true },
    });
    return voice?.systemPrompt || null;
  } catch (error) {
    console.error('Failed to fetch voice profile:', error);
    return null;
  }
}

// Helper function to track voice usage
async function trackVoiceUsage(
  voiceId: string,
  userId: string,
  toolId: string,
  bookId?: string,
  chapterId?: string,
  inputWordCount: number = 0,
  outputWordCount: number = 0
) {
  try {
    await Promise.all([
      prisma.voiceProfile.update({
        where: { id: voiceId },
        data: {
          timesUsed: { increment: 1 },
          lastUsedAt: new Date(),
        },
      }),
      prisma.voiceUsageLog.create({
        data: {
          voiceProfileId: voiceId,
          userId,
          toolId,
          bookId,
          chapterId,
          inputWordCount,
          outputWordCount,
        },
      }),
    ]);
  } catch (error) {
    console.error('Failed to track voice usage:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const validated = GenerateRequestSchema.parse(body);
    
    const { type, content, genre, voiceId, bookId, chapterId, options } = validated;
    const effectiveGenre = genre || 'literary';

    // Get the prompt generator for this tool
    const promptGenerator = TOOL_PROMPTS[type];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: `Unknown tool type: ${type}` },
        { status: 400 }
      );
    }

    // Generate the base prompt
    const basePrompt = promptGenerator(content, effectiveGenre, options);

    // Build system prompt with voice if provided
    let systemPrompt: string | undefined;
    
    if (voiceId && userId) {
      const voiceSystemPrompt = await getVoiceSystemPrompt(voiceId, userId);
      
      if (voiceSystemPrompt) {
        const voiceIntensity = options?.voiceIntensity || 'balanced';
        const intensityGuide = VOICE_INTENSITY_GUIDANCE[voiceIntensity];
        
        systemPrompt = `${voiceSystemPrompt}

VOICE APPLICATION:
${intensityGuide}

You are completing a specific writing task. Apply the voice characteristics above while addressing the task requirements below.`;
      }
    }

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      ...(systemPrompt && { system: systemPrompt }),
      messages: [
        {
          role: 'user',
          content: basePrompt
        }
      ]
    });

    // Extract the generated text
    const textContent = response.content.find(block => block.type === 'text');
    const generatedText = textContent?.type === 'text' ? textContent.text : '';

    // Calculate tokens used
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
    
    // Track voice usage if voice was used
    if (voiceId && userId && generatedText) {
      const inputWordCount = content.split(/\s+/).length;
      const outputWordCount = generatedText.split(/\s+/).length;
      trackVoiceUsage(voiceId, userId, type, bookId, chapterId, inputWordCount, outputWordCount);
    }

    return NextResponse.json({
      success: true,
      content: generatedText,
      text: generatedText, // Alias for compatibility
      tokensUsed,
      tool: type,
      genre: effectiveGenre,
      voiceApplied: !!voiceId,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
        voiceId: voiceId || null
      }
    });

  } catch (error) {
    console.error('AI Generate error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
