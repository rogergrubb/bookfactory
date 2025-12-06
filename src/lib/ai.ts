import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIGenerateOptions {
  type: 'continue' | 'improve' | 'dialogue' | 'description' | 'brainstorm' | 'outline' | 'analyze';
  content: string;
  context?: {
    bookTitle?: string;
    genre?: string;
    characters?: string[];
    chapterTitle?: string;
    previousContent?: string;
  };
  style?: 'formal' | 'casual' | 'literary' | 'commercial';
  length?: 'short' | 'medium' | 'long';
}

export interface AIAnalysisOptions {
  type: 'pacing' | 'character' | 'plot' | 'style' | 'readability' | 'continuity';
  content: string;
  bookContext?: {
    genre?: string;
    targetAudience?: string;
    existingCharacters?: { name: string; description: string }[];
    plotPoints?: string[];
  };
}

// System prompts for different AI tasks
const SYSTEM_PROMPTS = {
  continue: `You are an expert fiction writer helping to continue a story. Match the existing style, tone, and voice. Keep characters consistent. Write engaging prose that flows naturally from the provided content.`,
  
  improve: `You are an expert editor helping to improve writing. Enhance clarity, flow, and impact while preserving the author's voice. Fix awkward phrasing, strengthen weak verbs, and add sensory details where appropriate.`,
  
  dialogue: `You are an expert at writing natural, character-driven dialogue. Create conversations that reveal character, advance plot, and sound authentic. Include appropriate dialogue tags and beats.`,
  
  description: `You are an expert at vivid, sensory description. Paint scenes that immerse readers using specific details, strong verbs, and varied sentence structure. Engage multiple senses.`,
  
  brainstorm: `You are a creative writing consultant helping brainstorm ideas. Generate fresh, unexpected possibilities that fit the story's genre and tone. Consider character motivations, thematic resonance, and plot potential.`,
  
  outline: `You are a story structure expert. Create clear, compelling outlines that balance setup, confrontation, and resolution. Ensure each beat serves the overall narrative.`,
  
  analyze: `You are a professional manuscript editor. Provide constructive, specific feedback on craft elements like pacing, character development, dialogue, and prose style. Be encouraging but honest.`,
};

const ANALYSIS_PROMPTS = {
  pacing: `Analyze the pacing of this text. Identify areas that drag or rush. Consider scene length, tension buildup, and reader engagement. Provide specific suggestions for improvement.`,
  
  character: `Analyze character voice and consistency. Check if dialogue sounds authentic to each character. Identify opportunities to deepen characterization through action, thought, and speech.`,
  
  plot: `Analyze plot structure and identify potential issues: plot holes, unmotivated character actions, unresolved threads, or pacing problems. Suggest fixes.`,
  
  style: `Analyze writing style: prose rhythm, word choice, sentence variety, use of literary devices. Compare to genre conventions and suggest improvements.`,
  
  readability: `Analyze readability: sentence complexity, paragraph length, vocabulary level. Provide Flesch-Kincaid score estimate and suggestions for the target audience.`,
  
  continuity: `Check for continuity errors: timeline inconsistencies, character description changes, setting details that contradict earlier passages. List all issues found.`,
};

export async function generateContent(options: AIGenerateOptions): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[options.type] || SYSTEM_PROMPTS.continue;
  
  let userPrompt = '';
  
  switch (options.type) {
    case 'continue':
      userPrompt = `Continue the following story naturally. Write approximately ${options.length === 'short' ? '150-250' : options.length === 'long' ? '500-750' : '300-400'} words.

${options.context?.bookTitle ? `Book: ${options.context.bookTitle}` : ''}
${options.context?.genre ? `Genre: ${options.context.genre}` : ''}
${options.context?.chapterTitle ? `Current Chapter: ${options.context.chapterTitle}` : ''}

Story so far:
${options.content}

Continue from here:`;
      break;
      
    case 'improve':
      userPrompt = `Improve the following text while maintaining the author's voice. Focus on ${options.style === 'literary' ? 'prose quality and literary merit' : 'clarity and engagement'}.

Original text:
${options.content}

Improved version:`;
      break;
      
    case 'dialogue':
      userPrompt = `Write natural dialogue for the following scene. Characters should have distinct voices.

${options.context?.characters ? `Characters involved: ${options.context.characters.join(', ')}` : ''}

Scene context:
${options.content}

Dialogue:`;
      break;
      
    case 'description':
      userPrompt = `Add vivid sensory description to the following scene. Use specific details and strong verbs.

Scene:
${options.content}

Enhanced description:`;
      break;
      
    case 'brainstorm':
      userPrompt = `Generate creative ideas for the following:

${options.context?.genre ? `Genre: ${options.context.genre}` : ''}
${options.context?.bookTitle ? `Story: ${options.context.bookTitle}` : ''}

Request:
${options.content}

Ideas (provide 3-5 distinct possibilities):`;
      break;
      
    case 'outline':
      userPrompt = `Create a detailed outline based on the following:

${options.context?.genre ? `Genre: ${options.context.genre}` : ''}

Concept:
${options.content}

Outline:`;
      break;
      
    default:
      userPrompt = options.content;
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.length === 'short' ? 500 : options.length === 'long' ? 1500 : 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  return textContent ? textContent.text : '';
}

export async function analyzeContent(options: AIAnalysisOptions): Promise<{
  analysis: string;
  score?: number;
  suggestions: string[];
  issues?: { type: string; location: string; description: string }[];
}> {
  const systemPrompt = `You are an expert manuscript editor providing detailed analysis. Be constructive and specific. Format your response as JSON with the following structure:
{
  "analysis": "Overall analysis summary",
  "score": 0-100,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "issues": [{"type": "issue type", "location": "where in text", "description": "what's wrong"}]
}`;

  const userPrompt = `${ANALYSIS_PROMPTS[options.type]}

${options.bookContext?.genre ? `Genre: ${options.bookContext.genre}` : ''}
${options.bookContext?.targetAudience ? `Target Audience: ${options.bookContext.targetAudience}` : ''}

Text to analyze:
${options.content}

Provide your analysis as JSON:`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent) {
    return { analysis: 'Analysis failed', suggestions: [] };
  }

  try {
    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If JSON parsing fails, return raw text
  }

  return {
    analysis: textContent.text,
    suggestions: [],
  };
}

export async function generateBookDescription(options: {
  title: string;
  genre: string;
  synopsis: string;
  keywords?: string[];
  style: 'blurb' | 'amazon' | 'pitch' | 'social';
}): Promise<string> {
  const lengthGuide = {
    blurb: '150-200 words for back cover',
    amazon: '200-300 words with bullet points for Amazon product page',
    pitch: '50-75 words elevator pitch',
    social: '100-150 words for social media with hashtags',
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `You are an expert book marketer who writes compelling book descriptions that drive sales. Match the tone to the genre.`,
    messages: [{
      role: 'user',
      content: `Write a ${options.style} description (${lengthGuide[options.style]}) for:

Title: ${options.title}
Genre: ${options.genre}
Synopsis: ${options.synopsis}
${options.keywords ? `Keywords to include: ${options.keywords.join(', ')}` : ''}

${options.style === 'amazon' ? 'Include a hook, key plot points (no spoilers), and end with a call to action.' : ''}
${options.style === 'social' ? 'Make it shareable with relevant hashtags.' : ''}`,
    }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  return textContent ? textContent.text : '';
}

export async function generateKeywords(options: {
  title: string;
  genre: string;
  description: string;
  count?: number;
}): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `You are an Amazon KDP keyword optimization expert. Generate keywords that readers actually search for.`,
    messages: [{
      role: 'user',
      content: `Generate ${options.count || 7} Amazon search keywords for:

Title: ${options.title}
Genre: ${options.genre}
Description: ${options.description}

Return as a JSON array of strings. Focus on:
- Genre-specific terms readers search
- Comparable author names (if applicable)
- Trope keywords
- Setting/theme keywords
- Emotional promises`,
    }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent) return [];

  try {
    const match = textContent.text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {}

  return textContent.text.split('\n').filter(k => k.trim()).slice(0, options.count || 7);
}

export default { generateContent, analyzeContent, generateBookDescription, generateKeywords };
