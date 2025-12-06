import Anthropic from '@anthropic-ai/sdk';

// Initialize with fallback for demo mode
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export type AIServiceType = 
  | 'plot_development'
  | 'character_creation'
  | 'dialogue_generation'
  | 'scene_writing'
  | 'pacing_analysis'
  | 'structure_suggestion'
  | 'grammar_check'
  | 'style_analysis'
  | 'blurb_generation'
  | 'keyword_research'
  | 'cover_prompt'
  | 'social_post'
  | 'email_content';

interface AIContext {
  bookTitle?: string;
  genre?: string;
  targetAudience?: string;
  existingContent?: string;
  characters?: { name: string; description: string }[];
  plotPoints?: string[];
  authorVoice?: string;
}

const SYSTEM_PROMPTS: Record<AIServiceType, string> = {
  plot_development: `You are an expert story architect specializing in plot development. 
    Analyze narrative structure, suggest plot points, identify pacing issues, and help create compelling story arcs.
    Consider genre conventions while encouraging creative innovation.`,
  
  character_creation: `You are a character development specialist. 
    Help create multi-dimensional characters with clear motivations, flaws, and growth arcs.
    Consider character relationships, voice, and role in the narrative.`,
  
  dialogue_generation: `You are a dialogue expert who crafts authentic, character-specific conversations.
    Each character should have a distinct voice reflecting their background, personality, and emotional state.
    Balance subtext with clarity and ensure dialogue advances plot or reveals character.`,
  
  scene_writing: `You are a scene composition specialist.
    Help write vivid, engaging scenes with strong sensory details, emotional resonance, and narrative purpose.
    Balance action, dialogue, and description. Maintain consistent POV and pacing.`,
  
  pacing_analysis: `You are a pacing and rhythm analyst for fiction.
    Evaluate scene length, tension curves, chapter breaks, and narrative momentum.
    Identify areas that drag or rush, suggesting structural improvements.`,
  
  structure_suggestion: `You are a story structure consultant familiar with multiple frameworks 
    (three-act, hero's journey, save the cat, etc.). Analyze manuscripts for structural integrity 
    and suggest improvements while respecting the author's vision.`,
  
  grammar_check: `You are a professional editor specializing in grammar, punctuation, and style consistency.
    Identify errors while preserving the author's voice. Explain corrections when helpful.`,
  
  style_analysis: `You are a writing style analyst.
    Evaluate prose quality, voice consistency, readability, and stylistic patterns.
    Provide actionable suggestions for improvement.`,
  
  blurb_generation: `You are a book marketing copywriter specializing in compelling blurbs.
    Create hook-driven descriptions that capture the essence of the story without spoilers.
    Match tone to genre expectations while standing out.`,
  
  keyword_research: `You are a book metadata specialist for discoverability optimization.
    Suggest relevant keywords, categories, and BISAC codes to maximize visibility.
    Consider both broad appeal and niche targeting.`,
  
  cover_prompt: `You are an art director for book covers.
    Create detailed image generation prompts that capture genre conventions, mood, and market appeal.
    Consider typography space and thumbnail visibility.`,
  
  social_post: `You are a book marketing social media specialist.
    Create engaging, platform-appropriate posts that build author brand and drive book interest.
    Balance promotion with value and authenticity.`,
  
  email_content: `You are an email marketing specialist for authors.
    Write engaging newsletters, launch announcements, and reader communications.
    Focus on connection, value, and clear calls to action.`
};

export interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function generateAIContent(
  type: AIServiceType,
  prompt: string,
  context?: AIContext,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AIResponse> {
  // Demo mode fallback
  if (!anthropic) {
    return getDemoResponse(type, prompt, context);
  }

  const systemPrompt = buildSystemPrompt(type, context);
  const userPrompt = buildUserPrompt(type, prompt, context);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = message.content.find(block => block.type === 'text');
    
    return {
      content: textContent?.type === 'text' ? textContent.text : '',
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens
      }
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI content');
  }
}

function buildSystemPrompt(type: AIServiceType, context?: AIContext): string {
  let prompt = SYSTEM_PROMPTS[type];
  
  if (context?.authorVoice) {
    prompt += `\n\nAuthor's preferred writing style: ${context.authorVoice}`;
  }
  
  if (context?.genre) {
    prompt += `\n\nGenre context: ${context.genre}`;
  }
  
  return prompt;
}

function buildUserPrompt(type: AIServiceType, prompt: string, context?: AIContext): string {
  let fullPrompt = prompt;
  
  if (context?.bookTitle) {
    fullPrompt = `Book: "${context.bookTitle}"\n\n${fullPrompt}`;
  }
  
  if (context?.characters && context.characters.length > 0) {
    const charList = context.characters
      .map(c => `- ${c.name}: ${c.description}`)
      .join('\n');
    fullPrompt += `\n\nRelevant characters:\n${charList}`;
  }
  
  if (context?.existingContent) {
    fullPrompt += `\n\nExisting content for reference:\n${context.existingContent.slice(0, 2000)}`;
  }
  
  return fullPrompt;
}

// Demo responses for when API key is not configured
function getDemoResponse(type: AIServiceType, prompt: string, context?: AIContext): AIResponse {
  const demoResponses: Record<AIServiceType, string> = {
    plot_development: `## Plot Analysis & Suggestions

Based on your story concept, here are some structural recommendations:

**Inciting Incident**: Consider introducing your main conflict earlier - ideally within the first 10% of your narrative. This hooks readers immediately.

**Rising Action Suggestions**:
1. Add a false victory around the 25% mark to raise stakes
2. Include a midpoint revelation that changes the protagonist's understanding
3. Build toward a "dark night of the soul" moment before the climax

**Character Arc Integration**: Your protagonist's internal journey should mirror the external plot beats. Each plot point should force internal growth.

Would you like me to elaborate on any of these elements?`,

    character_creation: `## Character Profile: New Character

**Core Identity**
- Name: [Awaiting your input]
- Role: Supporting character with potential for deeper development
- Age: Consider how age affects their worldview and relationships

**Psychological Profile**
- Primary motivation: What do they want more than anything?
- Deep fear: What keeps them up at night?
- Fatal flaw: What will potentially be their undoing?
- Strength: What makes them indispensable to the story?

**Background Elements**
- Formative experience: One event that shaped who they are
- Secret: Something they haven't told anyone
- Contradiction: How they surprise readers

**Voice Notes**
- Speaking style: Education level, regional influences, unique phrases
- Body language: How they physically express emotions

This character framework ensures dimensional, memorable characters. Share more details and I'll refine this profile.`,

    dialogue_generation: `Here's a dialogue sample based on your scene context:

---

"You can't be serious." Sarah's voice cracked on the last word.

Marcus didn't look up from the files spread across his desk. "I've never been more serious about anything."

"After everything we—" She stopped herself, pressed her palm flat against the doorframe. Steadying. "After everything."

"That's exactly why." Now he met her eyes, and she wished he hadn't. "Some things are worth protecting. Even from ourselves."

---

This dialogue balances subtext with forward momentum. Notice how the physical actions (not looking up, pressing the doorframe) reveal emotional states without stating them directly. Shall I adjust the tone or explore different character dynamics?`,

    scene_writing: `## Scene Draft

The coffee shop hummed with the particular energy of 3 PM—past the lunch rush, before the after-work crowd. Emma chose the corner booth, back to the wall, facing the door. Old habits.

Sunlight caught the dust motes suspended above her untouched latte. She'd ordered it fifteen minutes ago and hadn't taken a single sip. Couldn't. Not until she knew.

The bell above the door chimed.

She didn't need to look up to know it was him. The way conversations paused, the subtle shift in the room's attention—Michael had always pulled focus without trying. It was one of the things she'd loved about him. One of the things she'd grown to resent.

"You came," he said, sliding into the seat across from her.

"You said it was important."

"I said it was about Lily."

Emma's hand found the edge of the table. Gripped. "Then you should probably start talking."

---

This scene establishes setting, character dynamics, and tension while leaving room for development. The sensory details ground the reader while the dialogue moves the plot forward.`,

    pacing_analysis: `## Pacing Analysis Report

**Overall Assessment**: Your manuscript shows strong pacing in action sequences but tends to slow significantly during transitional scenes.

**Detailed Findings**:

📈 **Strong Sections** (Chapters 3, 7, 12):
- Excellent tension escalation
- Dialogue moves briskly
- Scene-sequel pattern well executed

📉 **Areas for Attention** (Chapters 5, 9, 14):
- Exposition-heavy passages exceeding 500 words without action
- Repetitive internal monologue
- Scene transitions that could be condensed

**Specific Recommendations**:

1. **Chapter 5**: The backstory reveal can be cut by 40%. Weave historical details through action instead.

2. **Chapter 9**: Consider combining the two conversation scenes into one with higher stakes.

3. **Chapter 14**: The travel sequence can become a chapter break—readers don't need to see every mile.

**Readability Metrics**:
- Average scene length: 2,400 words (slightly high for your genre)
- Dialogue-to-prose ratio: 35% (appropriate)
- Chapter length variance: High (consider standardizing)`,

    structure_suggestion: `## Structural Analysis

Your manuscript follows a modified three-act structure with some areas that could benefit from refinement:

**Act One (Currently 28% of manuscript)**
- Recommendation: Trim to 25%
- Your setup is thorough but delays the inciting incident
- Consider opening with your current Chapter 2 for immediate engagement

**Act Two (Currently 48% of manuscript)**  
- Recommendation: Expand to 50%
- Midpoint is well-placed but could hit harder
- The "fun and games" section needs more variety in obstacles

**Act Three (Currently 24% of manuscript)**
- Recommendation: Adjust to 25%
- Climax arrives slightly late—page 280 should be around page 260
- Resolution feels rushed; give readers more denouement

**Key Structural Beats**:
✅ Hook - Strong opening line
⚠️ Inciting Incident - Arrives at 15%, aim for 10%
✅ First Plot Point - Well positioned
⚠️ Midpoint - Present but could be more impactful
✅ All Is Lost - Effectively devastating
✅ Climax - Satisfying payoff`,

    grammar_check: `## Grammar & Style Review

**Issues Found**: 12 items requiring attention

**Critical**:
1. Line 47: "Their going to regret this" → "They're going to regret this"
2. Line 156: Run-on sentence (47 words). Split at "however"
3. Line 203: Dangling modifier - "Walking through the door, the room felt cold"

**Style Consistency**:
- Oxford comma usage: Inconsistent (used in 60% of lists)
- Dialogue attribution: Mix of "said" and creative tags—recommend 80% "said"
- Tense: Two instances of present tense in past-tense narrative (lines 89, 234)

**Recommendations**:
- Your prose is clean overall with strong voice
- Consider reducing adverb usage in dialogue tags (currently 23%)
- Em-dash usage is excellent for your style

All corrections maintain your authorial voice while improving clarity.`,

    style_analysis: `## Writing Style Analysis

**Voice Assessment**: Distinctive and consistent

Your writing demonstrates a strong authorial presence with these characteristics:

**Strengths**:
- Crisp, economical sentences that build rhythm
- Effective use of fragments for emphasis
- Strong sensory grounding in scenes
- Dialogue that reveals character efficiently

**Style Fingerprint**:
- Average sentence length: 14 words (punchy, readable)
- Paragraph length: 3-4 sentences (appropriate pacing)
- Vocabulary level: Upper mainstream (accessible but sophisticated)
- Tone: Noir-adjacent with moments of dry humor

**Areas for Development**:
- Transition phrases between scenes occasionally feel abrupt
- Some secondary characters' voices blur together
- Physical descriptions cluster at character introductions—consider dispersing

**Comparable Authors**: Your style echoes elements of Tana French's atmospheric tension with Dennis Lehane's dialogue sensibility.

**Readability Score**: 72 (Flesch-Kincaid) - Perfect for adult fiction`,

    blurb_generation: `## Book Blurb Options

**Option 1 - Mystery/Thriller Style**:

She thought she knew what happened that night. She was wrong.

When forensic accountant Maya Chen discovers a discrepancy in her firm's biggest client, she expects corporate fraud. What she uncovers instead is a trail of secrets leading back twenty years—to a crime everyone thought was solved. Including her.

Now someone will do anything to keep the past buried. And Maya has just put herself directly in their path.

*A twisting thriller about the lies we tell ourselves and the truths that refuse to stay hidden.*

---

**Option 2 - Character-Driven Hook**:

Maya Chen built her career on finding numbers that don't add up. But when the numbers lead to her own past, she'll have to decide: How much truth can one person survive?

---

**Option 3 - High Concept**:

One discrepancy. Twenty years of lies. A truth that could destroy everything.

Select your preferred style and I'll refine further.`,

    keyword_research: `## Keyword & Metadata Optimization

**Primary Keywords** (High Search Volume):
1. psychological thriller
2. female protagonist thriller
3. corporate conspiracy fiction
4. buried secrets novel
5. forensic accountant fiction

**Long-tail Keywords** (Lower Competition):
- "unreliable narrator thriller 2024"
- "financial thriller with twist"
- "women investigators fiction"
- "corporate crime mystery novel"

**BISAC Codes Recommended**:
- FIC031010 - FICTION / Thrillers / Psychological
- FIC022020 - FICTION / Mystery & Detective / Women Sleuths
- FIC031080 - FICTION / Thrillers / Financial

**Amazon Categories**:
1. Kindle Store > Kindle eBooks > Mystery, Thriller & Suspense > Thrillers > Financial
2. Books > Mystery, Thriller & Suspense > Thrillers > Psychological
3. Kindle Store > Kindle eBooks > Mystery, Thriller & Suspense > Mystery > Women Sleuths

**Comparable Titles for Also-Boughts**:
- The Silent Patient
- Gone Girl  
- The Last Thing He Told Me`,

    cover_prompt: `## AI Cover Generation Prompt

**Mood Board Direction**: Atmospheric psychological thriller

**Image Prompt**:
"A woman's silhouette standing at a rain-streaked window of a modern glass office building at twilight. The city lights create bokeh effects in the water droplets. Cool blue and teal color palette with one warm amber light source suggesting hidden truth. Cinematic lighting, noir atmosphere, photorealistic style. The figure is slightly transparent, suggesting unreliable reality. Corporate aesthetic meets suspense. Space at top third for title text."

**Typography Suggestions**:
- Title: Bold sans-serif, slightly condensed (similar to Trade Gothic Bold)
- Author name: Light weight version of title font
- Color: White or pale gold for contrast

**Format Variations Needed**:
- eBook: 1600 x 2560px
- Print 6x9: 2775 x 4350px (300 DPI with bleed)
- Audiobook: 3200 x 3200px square

**Thumbnail Test**: Ensure title readable at 80px height`,

    social_post: `## Social Media Content Package

**Twitter/X Thread (Book Launch)**:

1/5 🧵 Three years ago, I quit my corporate job to write "the book." Today, THE SILENT NUMBERS releases into the world. Here's what this journey taught me:

2/5 Writing a thriller about financial fraud while having worked in finance = therapy I didn't know I needed. Every villain is someone I've met. (Legally, they're all fictional.)

3/5 The hardest part wasn't the writing. It was trusting that the story I wanted to tell was worth telling. Spoiler: It always is.

4/5 To everyone who read early drafts, listened to me spiral, and told me to keep going—this book exists because of you.

5/5 THE SILENT NUMBERS is out now. If you like unreliable narrators, corporate conspiracies, and twists you won't see coming: [link]

---

**Instagram Caption**:

She thought she knew what happened that night.
She was wrong.

THE SILENT NUMBERS is officially out in the world! 📚✨

This book started as a "what if" during a particularly boring budget meeting and became a story about truth, memory, and the numbers that never quite add up.

Link in bio for all formats!

#BookRelease #ThrillerNovel #NewBook #DebutAuthor`,

    email_content: `## Newsletter Content

**Subject Line Options**:
A) It's here. The book that changed everything.
B) 🎉 THE SILENT NUMBERS releases today
C) Three years in the making...

---

**Email Body**:

Dear Reader,

Today is the day.

After three years of writing, rewriting, and approximately 847 cups of coffee, THE SILENT NUMBERS is officially out in the world.

This book started as a question I couldn't stop asking: What happens when the person uncovering the truth discovers they're part of it?

Maya Chen became my answer. She's flawed, determined, and refuses to let sleeping lies stay buried—even when she should.

**Here's where you can find it:**
- Amazon (Kindle & Paperback): [link]
- Apple Books: [link]
- Barnes & Noble: [link]
- Your local indie bookstore: [link to Bookshop.org]

**If you read and enjoy it**, the most helpful thing you can do is leave a review. Even a sentence or two helps other readers discover the book.

Thank you for being here on this journey. It means everything.

Happy reading,
[Author Name]

P.S. - Reply to this email and tell me: What's your favorite thriller of all time? I'm always looking for my next read.`
  };

  return {
    content: demoResponses[type] || 'Demo content generated. Connect your Anthropic API key for full functionality.',
    usage: {
      inputTokens: 0,
      outputTokens: 0
    }
  };
}

// Streaming support for real-time writing
export async function* streamAIContent(
  type: AIServiceType,
  prompt: string,
  context?: AIContext
): AsyncGenerator<string> {
  if (!anthropic) {
    // Demo mode: simulate streaming
    const response = getDemoResponse(type, prompt, context);
    const words = response.content.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    return;
  }

  const systemPrompt = buildSystemPrompt(type, context);
  const userPrompt = buildUserPrompt(type, prompt, context);

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

// Content analysis functions
export async function analyzeContent(content: string): Promise<{
  wordCount: number;
  readabilityScore: number;
  pacingScore: number;
  dialogueRatio: number;
  suggestions: string[];
}> {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // Calculate dialogue ratio
  const dialogueMatches = content.match(/"[^"]*"/g) || [];
  const dialogueWords = dialogueMatches.join(' ').split(/\s+/).length;
  const dialogueRatio = wordCount > 0 ? dialogueWords / wordCount : 0;
  
  // Simple readability calculation (Flesch-Kincaid approximation)
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
  const syllables = estimateSyllables(content);
  const avgSyllablesPerWord = syllables / Math.max(wordCount, 1);
  const readabilityScore = Math.max(0, Math.min(100, 
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  ));

  // Pacing score based on paragraph and sentence variation
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length);
  const lengthVariance = calculateVariance(paragraphLengths);
  const pacingScore = Math.min(100, 50 + lengthVariance * 0.5);

  const suggestions: string[] = [];
  if (avgSentenceLength > 25) {
    suggestions.push('Consider breaking up some longer sentences for better readability');
  }
  if (dialogueRatio < 0.2 && content.length > 500) {
    suggestions.push('Consider adding more dialogue to increase engagement');
  }
  if (dialogueRatio > 0.6) {
    suggestions.push('Balance dialogue with more narrative description');
  }

  return {
    wordCount,
    readabilityScore: Math.round(readabilityScore),
    pacingScore: Math.round(pacingScore),
    dialogueRatio: Math.round(dialogueRatio * 100) / 100,
    suggestions
  };
}

function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.reduce((total, word) => {
    const matches = word.match(/[aeiouy]+/g);
    return total + (matches ? matches.length : 1);
  }, 0);
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / numbers.length);
}
