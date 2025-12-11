import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Request validation schema
const TheaterGenerateSchema = z.object({
  toolId: z.string(),
  context: z.string().min(1),
  selection: z.string().optional(),
  customPrompt: z.string().optional(),
  options: z.record(z.any()).optional(),
  genre: z.string().optional().default('literary'),
});

// Tool-specific system prompts keyed by tool ID from tool-definitions.ts
const TOOL_PROMPTS: Record<string, (context: string, selection: string | undefined, customPrompt: string | undefined, options: Record<string, any>) => string> = {
  
  // ============================================
  // GENERATE TOOLS
  // ============================================
  
  'continue-writing': (context, selection, customPrompt, options) => {
    const length = options?.length || 'medium';
    const pacing = options?.style || 'match';
    const wordCount = length === 'short' ? '100-150' : length === 'medium' ? '200-300' : '400-600';
    
    return `You are continuing a story in progress. Your job is to write the next section seamlessly, as if you ARE the author - not an AI assistant.

CRITICAL RULES:
- Match the existing voice, tone, sentence rhythm, and style EXACTLY
- Never break the fourth wall or acknowledge you're an AI
- Continue mid-thought if that's where the text stopped
- Maintain the same POV (first/third person, tense)
- Keep characters consistent with how they've been portrayed
- Don't wrap up or conclude - leave room for more

${pacing === 'slower' ? 'PACING: Slow down. Add description, interiority, sensory details.' : ''}
${pacing === 'faster' ? 'PACING: Speed up. More action, shorter sentences, momentum.' : ''}

Write approximately ${wordCount} words.

TEXT TO CONTINUE:
"""
${context}
"""

Continue naturally from exactly where it left off (no preamble, just continue the prose):`;
  },

  'first-draft': (context, selection, customPrompt, options) => {
    const detail = options?.detail || 50;
    const detailLevel = detail < 30 ? 'lean and fast-paced' : detail > 70 ? 'rich with description and interiority' : 'balanced';
    
    return `You are a skilled novelist transforming an outline into a complete scene. Write publishable-quality prose, not placeholder text.

OUTLINE TO EXPAND:
"""
${customPrompt || selection || context}
"""

WRITING APPROACH:
- Style: ${detailLevel}
- Include dialogue where characters interact
- Show character emotions through action and body language
- Create a clear sense of place through sensory details
- Maintain narrative momentum - every paragraph should pull forward
- Write in active voice, past tense unless the outline specifies otherwise

Write the complete scene (500-800 words):`;
  },

  'write-dialogue': (context, selection, customPrompt, options) => {
    const subtext = options?.subtext || 50;
    const includeConflict = options?.conflict !== false;
    
    return `You are writing dialogue for a novel. Create natural, character-revealing conversation.

SCENE CONTEXT:
"""
${context.slice(-1500)}
"""

DIALOGUE SITUATION:
${customPrompt || 'Continue or add dialogue appropriate to the scene.'}

DIALOGUE PRINCIPLES:
- Each character should have a distinct voice
- ${subtext > 60 ? 'Heavy subtext - what characters mean ≠ what they say' : 'Direct communication with some subtext'}
- ${includeConflict ? 'Include tension or disagreement' : 'Collaborative conversation'}
- Include action beats and body language between lines
- Use dialogue tags sparingly; action beats are often better
- Avoid on-the-nose dialogue - characters don't say exactly what they feel
- Characters should speak in contractions and fragments like real people

Write the dialogue scene:`;
  },

  'add-description': (context, selection, customPrompt, options) => {
    const sensesFocus = options?.senses || 'all';
    
    return `You are enhancing a passage with rich sensory description. 

TEXT TO ENHANCE:
"""
${selection || context.slice(-500)}
"""

SENSORY FOCUS: ${sensesFocus === 'all' ? 'All five senses - sight, sound, smell, touch, taste' : sensesFocus.charAt(0).toUpperCase() + sensesFocus.slice(1) + ' focused'}

DESCRIPTION PRINCIPLES:
- Use specific, unexpected details (not generic "beautiful sunset")
- Filter through character perception - what would THIS character notice?
- Weave description into action, don't pause the scene
- Use active verbs in descriptions
- Create atmosphere through carefully chosen details
- Show time passing through environmental changes

Rewrite the passage with enhanced description (keep the same events, just enrich the prose):`;
  },

  'action-scene': (context, selection, customPrompt, options) => {
    const intensity = options?.intensity || 70;
    const violence = options?.violence || 'moderate';
    
    return `You are writing a gripping action sequence. Create visceral, page-turning prose.

SETUP:
${customPrompt || selection || 'Continue the action from context.'}

PREVIOUS CONTEXT:
"""
${context.slice(-1000)}
"""

ACTION WRITING RULES:
- Intensity level: ${intensity}/100 (${intensity > 70 ? 'relentless, breathless' : intensity > 40 ? 'tense with breathing room' : 'measured tension'})
- Violence: ${violence}
- Use SHORT sentences during peak action
- Vary rhythm: short-short-short-LONG for emphasis
- Clear choreography - reader must follow what happens
- Include physical sensations: pain, exertion, adrenaline
- Character decisions matter - show split-second choices
- Don't forget to breathe - tiny moments of pause intensify action
- End with a beat that propels forward

Write the action sequence (300-500 words):`;
  },

  'inner-thoughts': (context, selection, customPrompt, options) => {
    return `You are writing character interiority - the internal monologue that reveals who someone truly is.

MOMENT TO DEEPEN:
"""
${selection || context.slice(-500)}
"""

FULL CONTEXT:
"""
${context.slice(-1500)}
"""

INTERIORITY PRINCIPLES:
- Write in the character's mental voice, not author voice
- Include contradictions - people rarely have clean thoughts
- Mix immediate reactions with triggered memories/associations
- Physical sensations color thought (racing heart = racing thoughts)
- Let thoughts trail off, interrupt themselves, circle back
- Reveal what character WON'T say out loud
- Don't over-explain - readers can infer

Rewrite the passage with deep interiority woven in:`;
  },

  // ============================================
  // ENHANCE TOOLS
  // ============================================

  'improve-prose': (context, selection, customPrompt, options) => {
    const intensity = options?.intensity || 50;
    const preserveVoice = options?.['preserve-voice'] !== false;
    
    return `You are a skilled prose editor. Improve this text while ${preserveVoice ? 'carefully preserving the author\'s unique voice' : 'elevating to a more polished style'}.

TEXT TO IMPROVE:
"""
${selection || context}
"""

EDITING INTENSITY: ${intensity}/100 (${intensity < 30 ? 'light polish' : intensity > 70 ? 'significant revision' : 'moderate improvement'})

FOCUS ON:
- Stronger verbs (was → became, went → strode)
- Eliminating unnecessary words (really, very, just, that)
- Varying sentence openings and lengths
- More specific nouns (car → rust-eaten Chevrolet)
- Removing filter words (she saw, he felt, they noticed)
- Tighter dialogue tags

Do NOT:
- Change the meaning or events
- Add new content
- Remove important details
- ${preserveVoice ? 'Alter the distinctive voice and rhythm' : ''}

Provide only the improved text:`;
  },

  'show-dont-tell': (context, selection, customPrompt, options) => {
    return `Transform "telling" into "showing" - replace abstract statements with concrete, sensory scenes.

TEXT TO TRANSFORM:
"""
${selection || context}
"""

TRANSFORMATION RULES:
- "She was angry" → Show through action, body language, dialogue
- "The room was creepy" → Describe specific unsettling details
- "He loved her" → Show through behavior and choices
- "It was a hot day" → Sweat, squinting, seeking shade
- Keep the same information, just SHOW it instead of TELL it

Provide only the transformed text:`;
  },

  'deepen-emotion': (context, selection, customPrompt, options) => {
    const emotion = options?.emotion || 'auto';
    
    return `Enhance the emotional impact of this passage without melodrama.

TEXT TO DEEPEN:
"""
${selection || context}
"""

${emotion !== 'auto' ? `TARGET EMOTION: ${emotion}` : 'AUTO-DETECT the emotional undercurrent and amplify it.'}

TECHNIQUES:
- Physical manifestations (tight throat, cold hands)
- Perception shifts (time slowing, sounds muffled)
- Memory flashes triggered by emotion
- Behavioral tells (fidgeting, avoiding eye contact)
- Environmental details that mirror emotion
- What characters notice changes with emotional state

Provide only the emotionally enhanced text:`;
  },

  'add-tension': (context, selection, customPrompt, options) => {
    const tensionType = options?.type || 'suspense';
    
    return `Increase the tension in this passage - make readers need to know what happens next.

TEXT TO HEIGHTEN:
"""
${selection || context}
"""

TENSION TYPE: ${tensionType}
${tensionType === 'suspense' ? '- Unknown danger, waiting for the other shoe to drop' : ''}
${tensionType === 'conflict' ? '- Disagreement, opposing goals, interpersonal friction' : ''}
${tensionType === 'mystery' ? '- Unanswered questions, something doesn\'t add up' : ''}
${tensionType === 'stakes' ? '- Raise what could be lost, consequences of failure' : ''}

TECHNIQUES:
- Foreboding details (shadows, unanswered questions)
- Interrupted actions (just as she reached for...)
- Time pressure (only three hours until...)
- Physical tension in characters
- Short sentences create urgency
- What characters notice that they wish they hadn't

Provide only the tension-heightened text:`;
  },

  'vary-sentences': (context, selection, customPrompt, options) => {
    return `Improve the rhythm and musicality of this prose through varied sentence structure.

TEXT TO VARY:
"""
${selection || context}
"""

RHYTHM TECHNIQUES:
- Short sentence for impact. Especially after long ones.
- Use fragments. Purposefully.
- Vary openings (not all "She..." "He..." "The...")
- Compound sentences flow; complex sentences build.
- Periodic sentences save the punch for the end of a long buildup
- One-word paragraphs.

Provide only the rhythmically varied text:`;
  },

  'sensory-details': (context, selection, customPrompt, options) => {
    return `Enrich this passage with sensory details across all five senses.

TEXT TO ENRICH:
"""
${selection || context}
"""

SENSORY LAYERS:
- SIGHT: Light quality, colors, movement, what draws the eye
- SOUND: Ambient noise, voice quality, silence, rhythm
- SMELL: Often the most evocative sense, memory-linked
- TOUCH/TEXTURE: Temperature, surfaces, physical sensations
- TASTE: When relevant - metallic fear, bitter coffee, etc.

PRINCIPLES:
- Specific over generic (not "flowers" but "jasmine")
- Unexpected senses (what does fear smell like to this character?)
- Sensory verbs (scraped, sizzled, reeked)
- Filter through POV character's awareness

Provide only the sensorially enriched text:`;
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TheaterGenerateSchema.parse(body);
    
    const { toolId, context, selection, customPrompt, options = {}, genre } = validated;

    // Get the prompt generator for this tool
    const promptGenerator = TOOL_PROMPTS[toolId];
    if (!promptGenerator) {
      // Fall back to basic continuation if tool not found
      console.warn(`Tool ${toolId} not found, using default continuation`);
      return NextResponse.json({
        success: true,
        result: `[Tool "${toolId}" not yet implemented. Try "continue-writing" for now.]`,
      });
    }

    // Generate the full prompt
    const prompt = promptGenerator(context, selection, customPrompt, options);

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

    return NextResponse.json({
      success: true,
      result: generatedText,
      content: generatedText, // Alias
      toolId,
      tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    });

  } catch (error) {
    console.error('Writing Theater AI Generate error:', error);
    
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
