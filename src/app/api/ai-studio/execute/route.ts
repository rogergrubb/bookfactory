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
  // === GENERATE TOOLS (Scene scope) ===
  'continue-writing': 'SCENE',
  'first-draft': 'SCENE',
  'write-dialogue': 'SCENE',
  'add-description': 'SCENE',
  'action-scene': 'SCENE',
  'inner-thoughts': 'SCENE',
  
  // === ENHANCE TOOLS (Scene scope) ===
  'improve-prose': 'SCENE',
  'show-dont-tell': 'SCENE',
  'deepen-emotion': 'SCENE',
  'add-tension': 'SCENE',
  'vary-sentences': 'SCENE',
  'sensory-details': 'SCENE',
  
  // === ANALYZE TOOLS (Hybrid/Book scope) ===
  'pacing-analysis': 'HYBRID',
  'character-voice-check': 'HYBRID',
  'plot-hole-finder': 'BOOK',
  'readability-score': 'HYBRID',
  'word-frequency': 'HYBRID',
  'emotional-arc': 'BOOK',
  'hook-checker': 'SCENE',
  'darling-detector': 'HYBRID',
  
  // === BRAINSTORM TOOLS (Book scope) ===
  'plot-twists': 'BOOK',
  'character-ideas': 'BOOK',
  'world-building': 'BOOK',
  'conflict-generator': 'BOOK',
  'subplot-ideas': 'BOOK',
  'scene-ideas': 'HYBRID',
  'constraint-creator': 'BOOK',
  'character-death-planner': 'BOOK',
  
  // === CRAFT TOOLS (Various scopes) ===
  'story-structure': 'BOOK',
  'act-balance': 'BOOK',
  'beat-markers': 'HYBRID',
  'chapter-matrix': 'BOOK',
  'deep-outline': 'BOOK',
  'clue-tracker': 'BOOK',
  'timeline-visualizer': 'BOOK',
  'magic-system-builder': 'BOOK',
  'series-bible': 'BOOK',
  'chapter-length-advisor': 'BOOK',
  'cliffhanger-reminder': 'HYBRID',
  'multi-track': 'BOOK',
  'reader-avatar': 'BOOK',
  'session-warmup': 'SCENE',
  'daily-word-goal': 'SCENE',
  'handwriting-mode': 'SCENE',
};

// ============================================================================
// COMPREHENSIVE TOOL PROMPTS - ALL 44 TOOLS
// ============================================================================

const TOOL_PROMPTS: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE TOOLS (6)
  // ═══════════════════════════════════════════════════════════════════════════
  'continue-writing': `You are a skilled fiction writer. Continue the story naturally from where it left off, matching the existing voice, style, and tone exactly. Maintain consistency with established characters, settings, and plot elements. Write seamlessly as if you were the original author.`,
  
  'first-draft': `You are a prolific fiction writer. Transform the provided outline, notes, or bullet points into polished prose. Create vivid scenes with dialogue, description, and narrative flow. Focus on momentum over perfection - get the story down. Write with confidence and energy.`,
  
  'write-dialogue': `You are a master of authentic dialogue. Create conversations that:
- Reveal character through distinct voices
- Advance plot naturally
- Include subtext and what's NOT said
- Use appropriate tags and action beats
- Feel natural and speakable
Each character should sound unique and recognizable.`,
  
  'add-description': `You are a master of descriptive writing. Create vivid, sensory-rich descriptions that immerse readers in the scene. Use:
- Specific, concrete imagery
- Multiple senses (sight, sound, smell, touch, taste)
- Meaningful details that do double duty
- Balance of detail with pacing
Show, don't tell. Make readers feel present.`,
  
  'action-scene': `You are an action sequence specialist. Write dynamic, visceral action that keeps readers on edge. Use:
- Short, punchy sentences for intensity
- Varied rhythm and pacing
- Clear spatial awareness
- Physicality and consequences
- Stakes and danger
Create scenes that make readers' hearts race.`,
  
  'inner-thoughts': `You are an expert at deep POV and internal monologue. Capture the character's:
- Unique thought patterns and voice
- Fears, hopes, and contradictions
- Immediate reactions to events
- Stream of consciousness when appropriate
Make the internal life as vivid as the external.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // ENHANCE TOOLS (6)
  // ═══════════════════════════════════════════════════════════════════════════
  'improve-prose': `You are an expert prose editor. Improve the writing while preserving the author's voice. Focus on:
- Stronger, more specific verbs
- Clearer sentence construction
- Better word choices
- Improved rhythm and flow
- Eliminating redundancy
Do not change the content's meaning or the author's style.`,
  
  'show-dont-tell': `You are a "show don't tell" specialist. Transform abstract telling into concrete showing through:
- Action and behavior
- Dialogue and subtext
- Sensory details
- Specific, revealing imagery
- Physical manifestations of emotion
Make readers experience rather than be told.`,
  
  'deepen-emotion': `You are an emotional depth specialist. Enhance emotional resonance through:
- Physical sensations and reactions
- Specific, evocative details
- Internal thoughts and conflicts
- Subtext in dialogue
- Meaningful imagery and metaphor
Make readers FEEL what characters feel.`,
  
  'add-tension': `You are a tension and suspense expert. Increase stakes and urgency through:
- Conflict and obstacles
- Uncertainty and questions
- Time pressure
- Character wants vs. barriers
- Pacing and structure
Build tension that keeps readers turning pages.`,
  
  'vary-sentences': `You are a prose rhythm expert. Improve reading flow by:
- Mixing short punchy sentences with longer flowing ones
- Varying sentence openings
- Creating intentional rhythm
- Breaking monotonous patterns
- Matching rhythm to content (fast for action, flowing for reflection)`,
  
  'sensory-details': `You are a sensory writing master. Enrich the text with specific sensory details:
- Sight: colors, shapes, light, movement
- Sound: ambient noise, voices, silence
- Smell: scents that evoke memory and place
- Touch: textures, temperature, physical sensations
- Taste: when relevant and evocative
Make readers experience the scene viscerally.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYZE TOOLS (8)
  // ═══════════════════════════════════════════════════════════════════════════
  'pacing-analysis': `You are a story pacing expert. Analyze the text for:
- Fast vs. slow sections and their effectiveness
- Tension curves and release points
- Balance of action, dialogue, and description
- Areas that drag or rush
- Scene and chapter rhythm
Provide specific, actionable feedback with line references.`,
  
  'character-voice-check': `You are a character voice analyst. Examine:
- Voice distinctiveness for each character
- Consistency across scenes
- Authenticity of speech patterns
- Dialogue that could be anyone vs. unique
- POV voice if applicable
Identify specific issues and suggest improvements.`,
  
  'plot-hole-finder': `You are a continuity expert. Analyze for:
- Timeline inconsistencies
- Character knowledge errors
- Setting contradictions
- Logic gaps
- Broken cause and effect
Identify specific problems with page/paragraph references and suggest fixes.`,
  
  'readability-score': `You are a readability analyst. Assess:
- Reading level and grade
- Sentence complexity
- Vocabulary difficulty
- Paragraph density
- Accessibility for target audience
Provide metrics and specific improvement suggestions.`,
  
  'word-frequency': `You are a prose analyst. Identify:
- Overused words and phrases
- Crutch words (just, that, really, very)
- Repetitive sentence starters
- Repeated imagery or metaphors
- Patterns that fatigue readers
Provide specific examples with alternatives.`,
  
  'emotional-arc': `You are a story analyst. Map the emotional journey:
- Highs and lows
- Tension points and releases
- Character emotional beats
- Reader engagement curve
- Missed opportunities for impact
Visualize the arc and identify improvements.`,
  
  'hook-checker': `You are a hook and engagement specialist. Analyze:
- Opening line effectiveness
- Chapter opening hooks
- Scene opening engagement
- Paragraph-level pull
- Questions raised vs. answered
Rate hooks and suggest improvements.`,
  
  'darling-detector': `You are an editorial "kill your darlings" specialist. Identify:
- Purple prose that doesn't serve the story
- Overwritten descriptions
- Clever phrases that slow the narrative
- Self-indulgent passages
- Beautiful writing that should go
Flag passages for reconsideration with explanation.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAINSTORM TOOLS (8)
  // ═══════════════════════════════════════════════════════════════════════════
  'plot-twists': `You are a master storyteller. Generate unexpected but EARNED plot twists that:
- Subvert expectations while feeling inevitable
- Can be foreshadowed naturally
- Raise stakes significantly
- Emerge from character/situation logically
- Change the story's direction meaningfully
For each twist, explain the setup needed.`,
  
  'character-ideas': `You are a character creation expert. Generate compelling characters with:
- Unique, memorable traits
- Believable flaws and contradictions
- Interesting backstory hooks
- Clear motivations and fears
- Potential for growth or change
Make them feel real and story-ready.`,
  
  'world-building': `You are a world-building master. Develop rich details for:
- Geography and climate
- Culture and customs
- History and legends
- Social structures and power
- Rules (magic, technology, society)
Ensure internal consistency and story relevance.`,
  
  'conflict-generator': `You are a conflict expert. Generate compelling conflicts:
- Internal struggles (want vs. need, belief vs. action)
- Interpersonal tensions (relationships, loyalties)
- External obstacles (environment, society, antagonists)
- Moral dilemmas (no good choices)
Each conflict should be meaningful and advance character/plot.`,
  
  'subplot-ideas': `You are a plot architecture expert. Generate B-plots that:
- Echo or contrast the main theme
- Provide character development opportunities
- Add tension and complications
- Enrich the world
- Converge meaningfully with the main plot
Show how each subplot connects to the core story.`,
  
  'scene-ideas': `You are a scene architect. Generate scene concepts that:
- Serve clear story purposes
- Create memorable moments
- Advance character and plot
- Build or release tension
- Reveal world naturally
Each scene should have a clear goal and conflict.`,
  
  'constraint-creator': `You are a creative constraint specialist. Generate writing challenges:
- POV or voice constraints
- Structural limitations
- Thematic requirements
- Style challenges
- Genre-bending prompts
Constraints that spark creativity and push boundaries.`,
  
  'character-death-planner': `You are a narrative impact specialist. When considering character deaths:
- Assess story necessity and impact
- Plan emotional setup and payoff
- Consider reader attachment
- Evaluate timing and method
- Plan ripple effects on other characters
Make deaths meaningful, not gratuitous.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAFT TOOLS (16)
  // ═══════════════════════════════════════════════════════════════════════════
  'story-structure': `You are a story structure expert. Analyze and advise on:
- Three-act structure adherence
- Key plot points and their placement
- Midpoint mirror and reversal
- Rising action effectiveness
- Climax and resolution setup
Map the structure and identify gaps.`,
  
  'act-balance': `You are a structural balance analyst. Examine:
- Act length proportions
- Pacing across acts
- Setup vs. payoff balance
- Momentum distribution
- Character arc alignment with structure
Provide specific rebalancing suggestions.`,
  
  'beat-markers': `You are a story beat specialist. Identify and analyze:
- Key story beats and their timing
- Missing or weak beats
- Beat spacing and rhythm
- Genre-expected beats
- Emotional beat patterns
Map beats and suggest adjustments.`,
  
  'chapter-matrix': `You are a chapter structure analyst. Create a matrix showing:
- Chapter purposes and what each accomplishes
- POV distribution
- Timeline coverage
- Subplot presence
- Tension levels
Identify structural patterns and gaps.`,
  
  'deep-outline': `You are an outlining specialist. Create detailed outlines including:
- Scene-by-scene breakdown
- Character goals per scene
- Conflict and tension points
- Information revealed
- Emotional beats
Make outlines that serve as writing roadmaps.`,
  
  'clue-tracker': `You are a mystery/clue specialist. Track and analyze:
- Clues planted and their timing
- Red herrings and misdirection
- Information given to readers vs. characters
- Revelation timing
- Fair play adherence
Ensure mysteries are solvable but surprising.`,
  
  'timeline-visualizer': `You are a timeline specialist. Create and analyze:
- Story chronology
- Character timelines
- Parallel events
- Time skips and their impact
- Backstory integration
Identify and fix timeline inconsistencies.`,
  
  'magic-system-builder': `You are a magic/technology system designer. Develop:
- Clear rules and limitations
- Costs and consequences
- Internal consistency
- Story integration
- Wonder preservation
Create systems that enable story without breaking it.`,
  
  'series-bible': `You are a series continuity expert. Create and maintain:
- Character details across books
- World rules and facts
- Timeline of events
- Relationship maps
- Open threads and promises
Ensure series-level consistency.`,
  
  'chapter-length-advisor': `You are a chapter pacing expert. Analyze and advise on:
- Chapter length consistency
- Length vs. content alignment
- Pacing impact of length
- Genre expectations
- Reader experience
Suggest optimal chapter breaks and lengths.`,
  
  'cliffhanger-reminder': `You are a chapter ending specialist. For chapter endings:
- Assess current ending effectiveness
- Suggest cliffhanger options
- Balance resolution and tension
- Consider reader experience
- Track promises made
Make readers unable to stop reading.`,
  
  'multi-track': `You are a multi-POV specialist. Manage:
- POV balance and distribution
- Character arc tracking across POVs
- Information asymmetry
- Reader knowledge management
- Convergence planning
Keep all storylines engaging and connected.`,
  
  'reader-avatar': `You are a reader experience analyst. Simulate:
- First-time reader experience
- Questions readers are asking
- Confusion or clarity points
- Engagement level predictions
- Satisfcation assessment
Identify where readers might struggle or disengage.`,
  
  'session-warmup': `You are a writing coach. Generate warmup exercises:
- Quick prompts related to current project
- Voice exercises to match the manuscript
- Scene sketches for upcoming chapters
- Character voice practice
- Descriptive warm-ups
Get the writer into their story's headspace.`,
  
  'daily-word-goal': `You are a productivity coach. Help with:
- Setting realistic daily word goals
- Tracking progress encouragement
- Streak maintenance
- Adjusting goals based on schedule
- Celebrating milestones
Keep writers motivated and consistent.`,
  
  'handwriting-mode': `You are a drafting assistant. Support freewriting mode:
- Disable editing impulse
- Encourage forward momentum
- Track output without judgment
- Celebrate volume over quality
- Save everything for later revision
Help writers get drafts done.`,
};

// ============================================================================
// LENGTH CONFIGURATIONS
// ============================================================================

const LENGTH_CONFIGS = {
  short: { maxTokens: 400, instruction: 'Keep the output concise, around 100-200 words.' },
  medium: { maxTokens: 1000, instruction: 'Provide a moderate length output, around 300-500 words.' },
  long: { maxTokens: 2000, instruction: 'Provide a comprehensive output, around 600-1200 words.' }
};

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

const anthropic = new Anthropic();

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
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

    // Get tool prompt
    const systemPrompt = TOOL_PROMPTS[toolId];
    if (!systemPrompt) {
      return NextResponse.json({ error: `Unknown tool: ${toolId}` }, { status: 400 });
    }

    // Get tool scope
    const scope = TOOL_SCOPES[toolId] || 'SCENE';

    // Build the full system prompt with options
    let fullSystemPrompt = systemPrompt;
    
    // Add length instruction
    const length = options?.length || 'medium';
    const lengthConfig = LENGTH_CONFIGS[length];
    fullSystemPrompt += `\n\n${lengthConfig.instruction}`;
    
    // Add custom instructions
    if (options?.customInstructions) {
      fullSystemPrompt += `\n\nAdditional instructions: ${options.customInstructions}`;
    }
    
    // Add intensity modifier for applicable tools
    if (options?.intensity !== undefined && ['action-scene', 'add-tension', 'deepen-emotion'].includes(toolId)) {
      const intensityLevel = options.intensity > 70 ? 'high' : options.intensity > 40 ? 'moderate' : 'subtle';
      fullSystemPrompt += `\n\nIntensity level: ${intensityLevel} (${options.intensity}%)`;
    }

    // Add genre context if provided
    if (context.genre) {
      fullSystemPrompt += `\n\nGenre context: ${context.genre}`;
    }

    // Build user message with context
    let userMessage = input;
    
    if (context.previousContent) {
      userMessage = `**Previous Context:**\n${context.previousContent}\n\n**Current Input:**\n${input}`;
    }
    
    if (context.selectedText) {
      userMessage = `**Selected Text to Work With:**\n${context.selectedText}\n\n**Full Context:**\n${input}`;
    }

    // Create tool run record
    const toolRun = await prisma.toolRun.create({
      data: {
        userId: user.id,
        bookId: context.bookId,
        documentId: context.documentId,
        toolId,
        scope: scope.toLowerCase(),
        input: userMessage.slice(0, 10000),
        status: 'running',
        options: options || {},
      },
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: lengthConfig.maxTokens,
      system: fullSystemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const result = response.content[0].type === 'text' ? response.content[0].text : '';
    const processingTime = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Update tool run with result
    await prisma.toolRun.update({
      where: { id: toolRun.id },
      data: {
        output: result,
        status: 'completed',
        processingTime,
        tokensUsed,
      },
    });

    // Track AI usage
    await prisma.aIUsage.create({
      data: {
        userId: user.id,
        type: `ai-studio:${toolId}`,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        bookId: context.bookId,
      },
    });

    // Update user credits
    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      result,
      toolRunId: toolRun.id,
      tokensUsed,
      processingTime,
      toolId,
    });

  } catch (error) {
    console.error('AI Studio execute error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute tool', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
