import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Tool-specific system prompts
const toolPrompts: Record<string, string> = {
  // GENERATE TOOLS
  'continue': `You are a skilled fiction writer. Continue the story naturally from where it left off. 
Match the existing tone, style, and pacing. Write 150-300 words of new content that flows seamlessly.`,
  
  'firstdraft': `You are a prolific fiction writer known for getting words on the page quickly.
Write a rough first draft based on the context provided. Don't worry about perfection - focus on momentum and getting the story moving. Write 200-400 words.`,
  
  'dialogue': `You are a master of dialogue writing. Create natural, character-appropriate dialogue.
Each character should have a distinct voice. Include beats and action tags where appropriate. Make the dialogue reveal character and advance the story.`,
  
  'description': `You are a sensory-focused writer who brings scenes to life.
Add rich, evocative descriptions using specific sensory details. Avoid clichés. Show, don't tell. Make the reader feel present in the scene.`,
  
  'action': `You are an action scene specialist. Write dynamic, fast-paced sequences.
Use short sentences for intensity. Vary rhythm. Make every word count. Create visceral, immediate prose that puts readers in the moment.`,
  
  'thoughts': `You are skilled at writing internal monologue and character interiority.
Capture the character's unique thought patterns, concerns, and inner voice. Make thoughts feel authentic and revealing without being on-the-nose.`,

  // ENHANCE TOOLS
  'expand': `You are an editor who enriches prose with meaningful detail.
Expand the selected text by adding depth, nuance, and sensory details. Maintain the original voice while making it more immersive.`,
  
  'condense': `You are a ruthless editor who cuts to the bone.
Tighten this prose by removing unnecessary words, redundancies, and weak constructions. Keep the core meaning but make it sharper.`,
  
  'rewrite': `You are a versatile writer who can transform prose.
Rewrite this passage according to the specified direction while preserving the core meaning and story information.`,
  
  'polish': `You are a skilled prose stylist and line editor.
Polish this text by improving word choices, sentence flow, and rhythm. Fix awkward phrases. Elevate the writing quality while maintaining the author's voice.`,
  
  'strengthen-verbs': `You are an editor focused on verb power.
Replace weak verbs (was, were, had, got, etc.) with stronger, more specific action verbs. Transform passive constructions into active ones.`,
  
  'vary-sentences': `You are a prose rhythm specialist.
Improve sentence variety - mix short punchy sentences with longer flowing ones. Break up monotonous patterns. Create better reading rhythm.`,
  
  'fix-dialogue-tags': `You are a dialogue specialist focused on attribution.
Improve dialogue tags - reduce "said" overuse, add action beats, remove unnecessary tags. Make conversations flow more naturally.`,
  
  'show-dont-tell': `You are an expert at transforming telling into showing.
Convert abstract statements and telling into concrete scenes, actions, and sensory details that let readers experience rather than be told.`,

  // ANALYZE TOOLS
  'pacing': `You are a story structure analyst. Analyze the pacing of this chapter.
Identify fast and slow sections, tension build-up and release, and suggest where pacing could be improved. Be specific and constructive.`,
  
  'voice-check': `You are a narrative voice specialist.
Analyze the narrative voice for consistency. Note any shifts in POV, tense, or tone. Identify where the voice is strongest and weakest.`,
  
  'tension-map': `You are a dramatic tension analyst.
Map the tension levels throughout this passage. Identify peaks and valleys. Suggest where tension could be heightened or released.`,
  
  'character-voice': `You are a character voice analyst.
Analyze how distinctly this character speaks/thinks. Note speech patterns, vocabulary, and unique expressions. Suggest improvements.`,
  
  'repetition': `You are an editor focused on word repetition.
Find repeated words, phrases, and sentence structures. Note overused words. Suggest variations and alternatives.`,
  
  'adverb-hunter': `You are an adverb specialist editor.
Identify adverbs, especially those modifying dialogue tags or weakening strong verbs. Suggest stronger alternatives.`,
  
  'passive-voice': `You are a voice construction analyst.
Find passive voice constructions. Explain why each is passive and suggest active alternatives where appropriate.`,
  
  'readability': `You are a readability analyst.
Assess reading level, sentence complexity, and clarity. Note any confusing passages. Suggest improvements for flow.`,
  
  'emotional-arc': `You are an emotional journey analyst.
Track the emotional arc of this passage. What emotions should readers feel? Where are the emotional beats? What's missing?`,
  
  'chapter-summary': `You are a skilled summarizer.
Provide a concise summary of this chapter including: main events, character developments, plot advancement, and key revelations.`,

  // BRAINSTORM TOOLS
  'plot-ideas': `You are a creative story consultant.
Generate plot ideas that fit naturally with the existing story. Be creative but stay consistent with established elements.`,
  
  'character-moments': `You are a character development specialist.
Suggest meaningful character moments - revelations, growth opportunities, relationship beats that would deepen the story.`,
  
  'dialogue-options': `You are a dialogue brainstormer.
Generate multiple dialogue options for this situation. Vary tone, subtext, and approach. Show different ways the conversation could go.`,
  
  'scene-transitions': `You are a scene transition specialist.
Suggest smooth ways to transition between scenes. Consider time jumps, location changes, and mood shifts.`,
  
  'conflict-escalation': `You are a conflict specialist.
Suggest ways to escalate the conflict. Consider obstacles, complications, raised stakes, and unexpected turns.`,
  
  'twist-generator': `You are a plot twist specialist.
Generate surprising but logical plot twists that fit the story. Each twist should be both unexpected and inevitable in retrospect.`,
  
  'what-if': `You are a creative scenario explorer.
Explore this "what if" scenario thoroughly. Consider implications, character reactions, and story possibilities.`,
  
  'stuck-help': `You are a writer's block specialist.
Help the writer get unstuck. Analyze the situation, identify the block, and suggest concrete ways forward.`,
};

// Sub-option modifiers
const subOptionModifiers: Record<string, Record<string, string>> = {
  'description': {
    'setting': 'Focus on the environment and setting - architecture, landscape, atmosphere.',
    'character': 'Focus on character appearance - physical details, clothing, expressions, body language.',
    'action': 'Focus on movement and action - how things happen, physical sequences.',
    'emotion': 'Focus on emotional atmosphere - mood, tension, feeling in the air.',
    'sensory': 'Include all five senses - sight, sound, smell, touch, taste.',
  },
  'action': {
    'fight': 'Write an intense physical combat scene with clear choreography.',
    'chase': 'Write a fast-paced chase scene with mounting tension.',
    'escape': 'Write a desperate escape sequence with obstacles.',
    'disaster': 'Write a catastrophic event scene with chaos and urgency.',
    'sports': 'Write a competitive sports/game scene with stakes.',
  },
  'expand': {
    'detail': 'Add specific, concrete details to enrich the scene.',
    'emotion': 'Deepen the emotional content and character interiority.',
    'sensory': 'Add sensory details across multiple senses.',
    'backstory': 'Weave in relevant backstory and context.',
  },
  'condense': {
    'light': 'Trim 10-20% - remove obvious redundancies only.',
    'moderate': 'Cut 30-40% - tighten significantly while preserving key details.',
    'aggressive': 'Cut 50%+ - reduce to essential elements only.',
  },
  'rewrite': {
    'dramatic': 'Make it more dramatic, intense, and emotionally heightened.',
    'subtle': 'Make it more subtle, understated, and nuanced.',
    'pov': 'Rewrite from a different point of view.',
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
    'betrayal': 'Generate a betrayal twist - someone is not who they seem.',
    'revelation': 'Generate a hidden truth revelation.',
    'reversal': 'Generate a reversal of fortune or expectations.',
    'unexpected': 'Generate an unexpected ally or enemy.',
    'surprise': 'Generate any type of surprising twist.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    } = body;

    // Get base system prompt for tool
    let systemPrompt = toolPrompts[toolId] || 'You are a helpful fiction writing assistant.';

    // Add sub-option modifier if applicable
    if (subOptionId && subOptionModifiers[toolId]?.[subOptionId]) {
      systemPrompt += `\n\nSpecific direction: ${subOptionModifiers[toolId][subOptionId]}`;
    }

    // Add custom instruction if provided
    if (customInstruction) {
      systemPrompt += `\n\nUser's specific instruction: ${customInstruction}`;
    }

    // Add scene context if active
    if (sceneContext) {
      systemPrompt += `\n\n--- SCENE CONTEXT: ${sceneContext.name} ---
Sensory details to incorporate:
- Sight: ${sceneContext.sensory.sight}
- Sound: ${sceneContext.sensory.sound}
- Smell: ${sceneContext.sensory.smell}
- Touch: ${sceneContext.sensory.touch}
- Taste: ${sceneContext.sensory.taste}

Mood: ${sceneContext.mood.primary} with undertones of ${sceneContext.mood.secondary}

Available props: ${sceneContext.props.join(', ')}

Writing notes: ${sceneContext.aiNotes}`;
    }

    // Build the user message
    let userMessage = '';

    // For tools that work on selected text
    if (selectedText) {
      userMessage = `Here is the selected text to work with:\n\n"${selectedText}"`;
      
      // Add surrounding context for better continuity
      if (chapterContent) {
        const contextStart = Math.max(0, chapterContent.indexOf(selectedText) - 500);
        const contextEnd = Math.min(chapterContent.length, chapterContent.indexOf(selectedText) + selectedText.length + 500);
        const context = chapterContent.slice(contextStart, contextEnd);
        userMessage += `\n\nSurrounding context:\n${context}`;
      }
    } 
    // For tools that continue or generate
    else if (chapterContent) {
      // Get last 1500 characters for context
      const contextLength = Math.min(chapterContent.length, 1500);
      const context = chapterContent.slice(-contextLength);
      userMessage = `Here is the recent content from the chapter:\n\n${context}`;
      
      if (cursorPosition !== undefined && cursorPosition < chapterContent.length) {
        userMessage += `\n\n[Note: The cursor is positioned in the middle of the text, not at the end.]`;
      }
    }
    // For tools that analyze the whole chapter
    else {
      userMessage = 'Please provide analysis or suggestions based on the tool description.';
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
    });

    // Extract text from response
    const result = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('\n');

    return NextResponse.json({ result });

  } catch (error) {
    console.error('AI Theater error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
