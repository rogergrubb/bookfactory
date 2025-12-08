import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Request validation
const generateSchema = z.object({
  type: z.string().default('chat'),
  content: z.string().optional(),
  prompt: z.string().optional(),
  selectedText: z.string().optional(),
  genre: z.string().optional().default('literary'),
  bookTitle: z.string().optional(),
  bookContext: z.object({
    title: z.string().optional(),
    genre: z.string().optional(),
  }).optional(),
});

// Genre-specific writing guidance
const GENRE_GUIDANCE: Record<string, string> = {
  romance: `Focus on emotional tension, chemistry between characters, and romantic beats. Use sensory language to convey attraction and connection. Build anticipation through longing glances, near-misses, and meaningful dialogue.`,
  mystery: `Maintain suspense through strategic information reveals. Plant clues naturally, use red herrings effectively. Create atmosphere through setting details. Keep readers guessing while playing fair with evidence.`,
  thriller: `Maintain high stakes and constant tension. Use short, punchy sentences during action. Create urgency through time pressure. Build dread through foreshadowing. End scenes on hooks.`,
  fantasy: `Weave world-building naturally into narrative. Make magic systems feel consistent. Balance the fantastical with relatable human emotions. Use rich, evocative descriptions for settings.`,
  scifi: `Ground speculative elements in plausible science. Explore technology's impact on humanity. Balance exposition with action. Create immersive future/alternate worlds through sensory details.`,
  literary: `Prioritize prose style, thematic depth, and character interiority. Use metaphor and symbolism purposefully. Create layered meanings. Focus on the human condition and emotional truth.`,
  horror: `Build dread through atmosphere and pacing. Use the unknown and suggested threats. Create visceral, sensory descriptions. Play on primal fears. Balance tension with release.`,
  ya: `Capture authentic teen voice and concerns. Focus on identity, belonging, and coming-of-age themes. Use contemporary language naturally. Balance hope with realistic challenges.`,
};

// Comprehensive tool prompts
const TOOL_PROMPTS: Record<string, (content: string, genre: string) => string> = {
  // Generate tools
  'continue': (content, genre) => `Continue this story naturally, matching the existing voice and style. Write 2-3 paragraphs that flow seamlessly from where it left off.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Text to continue:
${content}

Continue the story:`,

  'first-draft': (content, genre) => `Transform this outline or notes into a complete, polished scene. Write with vivid details, natural dialogue, and engaging prose.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Outline/Notes:
${content}

Write the full scene:`,

  'dialogue': (content, genre) => `Write natural, character-revealing dialogue based on this context. Each character should have a distinct voice. Include subtext, tension, and beats between lines.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Context:
${content}

Write the dialogue:`,

  'description': (content, genre) => `Add rich, sensory description to bring this scene to life. Engage all five senses. Show the setting through character perception. Avoid purple prose—be evocative but purposeful.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Scene/context:
${content}

Enhanced description:`,

  'action': (content, genre) => `Write a dynamic, well-paced action sequence. Use varied sentence lengths—short and punchy during peak action. Make the choreography clear. Include visceral, physical details.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Setup:
${content}

Action sequence:`,

  'inner-monologue': (content, genre) => `Write deep internal monologue for the character. Show their thoughts, fears, desires, and contradictions. Make it feel authentic to their voice and situation.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Context:
${content}

Internal monologue:`,

  // Enhance tools
  'improve': (content, genre) => `Improve this prose while maintaining the author's voice. Strengthen word choices, vary sentence structures, and enhance rhythm. Don't change the meaning or events—elevate the execution.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Original:
${content}

Improved version:`,

  'show-not-tell': (content, genre) => `Transform any "telling" in this passage into vivid "showing." Replace abstract statements with concrete, sensory details and actions that convey the same meaning more powerfully.

Original:
${content}

Rewritten to show:`,

  'deepen-emotion': (content, genre) => `Deepen the emotional resonance of this passage. Add physical sensations, internal reactions, and subtle behavioral details that convey emotion without stating it directly.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Original:
${content}

Emotionally deepened:`,

  'add-tension': (content, genre) => `Increase the tension and conflict in this passage. Add stakes, obstacles, subtext, or underlying threats. Make the reader feel the urgency or unease.

${GENRE_GUIDANCE[genre] || GENRE_GUIDANCE.literary}

Original:
${content}

With added tension:`,

  'vary-sentences': (content, genre) => `Improve the rhythm and flow by varying sentence lengths and structures. Mix short, punchy sentences with longer, flowing ones. Create a musical quality to the prose.

Original:
${content}

With varied rhythm:`,

  'sensory-details': (content, genre) => `Enrich this passage with sensory details. Go beyond just visual—include sounds, smells, textures, and tastes where appropriate. Ground the reader in the physical world.

Original:
${content}

Sensorily enriched:`,

  // Analyze tools
  'pacing': (content, genre) => `Analyze the pacing of this passage. Identify:
1. Sections that move too fast or too slow
2. Places where beats are needed
3. Tension curve assessment
4. Recommendations for improvement

Text to analyze:
${content}

Pacing analysis:`,

  'character-voice': (content, genre) => `Analyze the character voice consistency in this passage. Identify:
1. Whether the voice feels authentic and distinct
2. Any lines that feel "off" for the character
3. Suggestions for strengthening voice
4. Patterns in speech/thought that could be enhanced

Text to analyze:
${content}

Voice analysis:`,

  'plot-holes': (content, genre) => `Examine this passage for potential plot holes or inconsistencies:
1. Logical problems
2. Character motivation issues
3. Timeline or continuity errors
4. Questions a reader might have
5. Suggestions to address each issue

Text to analyze:
${content}

Analysis:`,

  'readability': (content, genre) => `Analyze the readability of this passage:
1. Sentence length variety
2. Paragraph structure
3. Word choice complexity
4. Clarity of meaning
5. Specific suggestions for improvement

Text to analyze:
${content}

Readability analysis:`,

  'word-frequency': (content, genre) => `Analyze word usage patterns in this passage:
1. Overused words or phrases
2. Repeated sentence starters
3. Crutch words to eliminate
4. Suggestions for alternatives

Text to analyze:
${content}

Word frequency analysis:`,

  'emotional-arc': (content, genre) => `Map the emotional arc of this passage:
1. Identify the emotional beats
2. Track character emotional states
3. Note rises and falls in intensity
4. Suggest ways to strengthen the arc

Text to analyze:
${content}

Emotional arc analysis:`,

  // Brainstorm tools
  'plot-twist': (content, genre) => `Generate 5 unexpected but earned plot twists for this story situation. Each twist should:
- Surprise the reader
- Make sense in retrospect
- Deepen character or theme
- Be specific to this story

Context:
${content}

Plot twist ideas:`,

  'character-dev': (content, genre) => `Generate rich character development ideas:
1. Backstory elements that inform present behavior
2. Internal contradictions and flaws
3. Secret desires and fears
4. Relationships that reveal character
5. Character arc possibilities

Character/Context:
${content}

Character development ideas:`,

  'world-building': (content, genre) => `Generate world-building details that enrich this setting:
1. Sensory details unique to this world
2. Cultural elements (customs, beliefs, conflicts)
3. History that impacts the present
4. Small details that make it feel real
5. Rules or systems that create story possibilities

Setting/Context:
${content}

World-building ideas:`,

  'conflict': (content, genre) => `Generate conflict ideas at multiple levels:
1. Internal conflicts (within characters)
2. Interpersonal conflicts (between characters)
3. External conflicts (character vs. world)
4. Thematic conflicts (ideas in tension)
5. How these conflicts could intersect

Context:
${content}

Conflict ideas:`,

  'subplot': (content, genre) => `Generate subplot ideas that:
1. Complement and echo the main plot
2. Reveal different facets of characters
3. Provide pacing variation
4. Deepen themes
5. Could create complications or aid resolution

Main plot/Context:
${content}

Subplot ideas:`,

  'scene-ideas': (content, genre) => `Generate scene ideas for what could happen next:
1. High-tension options
2. Character-building moments
3. Plot-advancing scenes
4. Thematic deepening opportunities
5. Unexpected but fitting directions

Current situation:
${content}

Scene ideas:`,

  // Default chat
  'chat': (content, genre) => `You are an expert fiction writing assistant helping an author with their ${genre} story. Be specific, actionable, and encouraging. Draw on craft knowledge from masters of the genre.

${content ? `Context from their manuscript:\n${content}\n\n` : ''}`,
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, content, prompt, selectedText, genre, bookContext } = generateSchema.parse(body);

    const textToProcess = selectedText || content || '';
    const effectiveGenre = bookContext?.genre || genre || 'literary';
    
    // Get the appropriate prompt generator
    const promptGenerator = TOOL_PROMPTS[type] || TOOL_PROMPTS['chat'];
    
    let systemPrompt = `You are an expert fiction writing assistant with deep knowledge of storytelling craft, narrative techniques, and genre conventions. Your responses should be:
- Specific and actionable
- Written in the requested style/voice
- Creative and inspiring
- Respectful of the author's vision

${effectiveGenre !== 'literary' ? `Current writing mode: ${effectiveGenre}\n${GENRE_GUIDANCE[effectiveGenre] || ''}` : ''}`;

    let userPrompt: string;
    
    if (type === 'chat' && prompt) {
      // Free-form chat with optional context
      userPrompt = promptGenerator(textToProcess, effectiveGenre) + prompt;
    } else {
      // Tool-based generation
      userPrompt = promptGenerator(textToProcess, effectiveGenre);
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    const textContent = response.content.find(block => block.type === 'text');
    const generatedText = textContent?.type === 'text' ? textContent.text : '';

    // Track usage
    const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

    return NextResponse.json({
      content: generatedText,
      text: generatedText,
      tokensUsed,
      tool: type,
      genre: effectiveGenre,
    });

  } catch (error) {
    console.error('AI Generate error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
