import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Request validation schema
const GenerateRequestSchema = z.object({
  type: z.string(),
  content: z.string().min(1),
  genre: z.string().optional().default('literary'),
  bookId: z.string().optional(),
  chapterId: z.string().optional(),
  characterIds: z.array(z.string()).optional(),
  options: z.object({
    length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
    intensity: z.number().min(1).max(10).optional().default(5),
    customInstructions: z.string().optional(),
    context: z.any().optional()
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

  'inner-monologue': (content, genre, options) => `You are an expert at writing character interiority. Create deep internal monologue that reveals this character's thoughts, fears, desires, and contradictions. Make it feel authentic to their voice and situation—not generic introspection.

Include:
- Stream of consciousness elements
- Emotional and physical sensations
- Memory fragments if relevant
- Self-doubt or internal conflicts
- Character-specific thought patterns

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${LENGTH_GUIDANCE[options?.length || 'medium']}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Context:
"""
${content}
"""

Write the internal monologue:`,

  // ============================================
  // ENHANCE TOOLS
  // ============================================

  'improve': (content, genre, options) => `You are an expert prose editor. Improve this text while maintaining the author's voice. Strengthen word choices, vary sentence structures, enhance rhythm, and elevate the prose quality.

Focus on:
- Replacing weak verbs with stronger ones
- Eliminating unnecessary words
- Improving sentence variety
- Enhancing imagery and specificity
- Maintaining the original meaning and tone

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original text:
"""
${content}
"""

Provide the improved version only (no explanations):`,

  'show-not-tell': (content, genre, options) => `You are an expert at "show, don't tell" transformation. Rewrite this passage to replace abstract statements with concrete, sensory details and actions that convey the same meaning more powerfully.

Transform:
- Emotions into physical manifestations
- Character traits into revealing actions
- Atmospheres into specific sensory details
- Statements into demonstrated scenes

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original (with "telling"):
"""
${content}
"""

Rewritten to "show" (provide the transformed text only):`,

  'deepen-emotion': (content, genre, options) => `You are an expert at emotional writing. Enhance this passage with deeper emotional resonance. Add physical sensations, internal reactions, and subtle behavioral details that convey emotion without stating it directly.

Layer in:
- Somatic responses (heart rate, breathing, tension)
- Micro-expressions and body language
- Sensory shifts in perception
- Internal contradictions and conflicts
- Emotional beats between actions

Intensity level: ${options?.intensity || 5}/10

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original:
"""
${content}
"""

Emotionally deepened version:`,

  'add-tension': (content, genre, options) => `You are an expert at creating narrative tension. Increase the tension, conflict, and stakes in this passage without changing the fundamental events.

Add:
- Underlying threats or pressures
- Subtext and unspoken conflicts
- Time pressure or urgency
- Obstacles or complications
- Foreboding details
- Character uncertainty or fear

Intensity level: ${options?.intensity || 5}/10

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original:
"""
${content}
"""

Version with heightened tension:`,

  'vary-sentences': (content, genre, options) => `You are an expert prose stylist. Improve the rhythm and flow of this passage by varying sentence lengths and structures. Create a musical quality through the interplay of short, punchy sentences and longer, flowing ones.

Techniques:
- Fragment sentences for impact
- Compound sentences for flow
- Vary openings (don't start every sentence the same way)
- Use periodic and loose sentences
- Create rhythmic patterns

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original:
"""
${content}
"""

With varied rhythm (provide the rewritten text only):`,

  'sensory-details': (content, genre, options) => `You are an expert at sensory writing. Enrich this passage with vivid sensory details across all five senses. Go beyond just visual—include sounds, smells, textures, and tastes where appropriate.

For each sense, use:
- Specific, unexpected details
- Sensory verbs
- Comparative imagery
- Character-filtered perception

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Original:
"""
${content}
"""

Sensorially enriched version:`,

  // ============================================
  // BRAINSTORM TOOLS  
  // ============================================

  'plot-twists': (content, genre, options) => `You are a master storyteller specializing in plot construction. Generate 4-5 unexpected but satisfying plot twists for this story situation. Each twist should:

- Be surprising yet feel inevitable in hindsight
- Create new story possibilities
- Deepen character or thematic elements
- Be achievable with proper setup

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Current story situation:
"""
${content}
"""

Generate plot twist ideas in this format:
**Twist Title**
Description of the twist and how it could work in the story.
---`,

  'character-ideas': (content, genre, options) => `You are an expert character designer. Generate 3-4 compelling character concepts based on these requirements. Each character should be:

- Unique and memorable
- Psychologically complex
- Suitable for the genre
- Driven by clear wants and needs
- Flawed in interesting ways

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Requirements:
"""
${content}
"""

Generate characters in this format:
**Character Name**
*Role/Archetype*
Brief description, key traits, motivation, and what makes them interesting.
---`,

  'world-building': (content, genre, options) => `You are an expert world-builder. Develop rich, detailed world-building elements based on these requirements. Create elements that:

- Feel original and specific
- Have internal consistency
- Offer story possibilities
- Engage the senses
- Connect to themes

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Requirements:
"""
${content}
"""

Generate world-building elements in this format:
**Element Name**
*Category (e.g., Culture, Technology, Magic, Geography)*
Detailed description and how it affects the world/story.
---`,

  'conflict-generator': (content, genre, options) => `You are an expert at dramatic conflict. Generate 4-5 compelling conflicts or obstacles for this story situation. Each conflict should:

- Create meaningful stakes
- Challenge the protagonist meaningfully  
- Offer no easy solutions
- Reveal character through response
- Drive the story forward

Types to consider: Internal, Interpersonal, Societal, Environmental, Supernatural

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Context:
"""
${content}
"""

Generate conflicts in this format:
**Conflict Title**
*Type: Internal/External/etc.*
Description of the conflict and its potential impact.
---`,

  'subplot-ideas': (content, genre, options) => `You are an expert at story structure. Generate 3-4 subplot ideas that would enrich this main plot. Each subplot should:

- Complement or contrast the main theme
- Involve existing or new characters
- Have its own arc (beginning, middle, end)
- Intersect meaningfully with the main plot
- Add depth without distraction

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Main plot:
"""
${content}
"""

Generate subplots in this format:
**Subplot Title**
*Theme/Purpose*
Brief description of the subplot arc and how it connects to the main story.
---`,

  'scene-ideas': (content, genre, options) => `You are an expert scene designer. Generate 4-5 scene ideas based on these requirements. Each scene should:

- Serve a clear story purpose
- Offer dramatic potential
- Advance plot or character
- Suggest vivid settings/moments
- Create opportunities for conflict

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

${options?.customInstructions ? `Additional instructions: ${options.customInstructions}\n` : ''}

Requirements:
"""
${content}
"""

Generate scenes in this format:
**Scene Title**
*Purpose: Plot/Character/Theme*
Setting, key moments, and what the scene accomplishes.
---`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateRequestSchema.parse(body);
    
    const { type, content, genre, options } = validated;
    const effectiveGenre = genre || 'literary';

    // Get the prompt generator for this tool
    const promptGenerator = TOOL_PROMPTS[type];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: `Unknown tool type: ${type}` },
        { status: 400 }
      );
    }

    // Generate the prompt
    const prompt = promptGenerator(content, effectiveGenre, options);

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the generated text
    const textContent = response.content.find(block => block.type === 'text');
    const generatedText = textContent?.type === 'text' ? textContent.text : '';

    // Calculate tokens used
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return NextResponse.json({
      success: true,
      content: generatedText,
      text: generatedText, // Alias for compatibility
      tokensUsed,
      tool: type,
      genre: effectiveGenre,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens
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
