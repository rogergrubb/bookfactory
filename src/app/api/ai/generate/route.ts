import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateContent } from '@/lib/ai';
import { prisma, logActivity, logAIUsage } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const generateSchema = z.object({
  type: z.enum(['continue', 'improve', 'dialogue', 'description', 'brainstorm', 'outline', 'chat']).optional().default('chat'),
  content: z.string().max(50000).optional(),
  prompt: z.string().max(5000).optional(),
  selectedText: z.string().max(10000).optional(),
  context: z.object({
    bookId: z.string().optional(),
    title: z.string().optional(),
    bookTitle: z.string().optional(),
    genre: z.string().optional(),
    characters: z.array(z.string()).optional(),
    chapterTitle: z.string().optional(),
    previousContent: z.string().optional(),
  }).optional(),
  style: z.enum(['formal', 'casual', 'literary', 'commercial']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

const typeLabels: Record<string, string> = {
  continue: 'Continue Writing',
  improve: 'Improve Text',
  dialogue: 'Generate Dialogue',
  description: 'Write Description',
  brainstorm: 'Brainstorm Ideas',
  outline: 'Create Outline',
  chat: 'AI Chat',
};

// System prompt for chat/custom requests
const CHAT_SYSTEM_PROMPT = `You are an expert fiction writing assistant helping an author with their book. You provide helpful, specific, and actionable writing advice. You can:

- Continue stories matching the author's style and voice
- Improve prose while preserving the author's intent
- Generate natural dialogue for characters
- Add vivid sensory description
- Brainstorm plot ideas and character development
- Analyze pacing, structure, and other craft elements
- Answer questions about writing craft

When given context about a story, incorporate that information naturally. Be encouraging but honest in your feedback. Keep responses focused and practical.`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = generateSchema.parse(body);

    // Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let result: string;

    // If it's a chat/custom prompt request
    if (data.prompt || data.type === 'chat') {
      const bookTitle = data.context?.title || data.context?.bookTitle || '';
      const genre = data.context?.genre || '';
      
      let contextInfo = '';
      if (bookTitle || genre) {
        contextInfo = `\n\n[Context: ${bookTitle ? `Writing "${bookTitle}"` : ''}${genre ? ` (${genre})` : ''}]`;
      }

      const userMessage = data.prompt || data.content || '';
      const storyContext = data.content ? `\n\nCurrent text from the manuscript:\n"""\n${data.content.slice(-2500)}\n"""` : '';
      const selectedContext = data.selectedText ? `\n\nSelected text:\n"""\n${data.selectedText}\n"""` : '';

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: CHAT_SYSTEM_PROMPT + contextInfo,
        messages: [{ 
          role: 'user', 
          content: `${userMessage}${storyContext}${selectedContext}` 
        }],
      });

      const textContent = response.content.find(c => c.type === 'text');
      result = textContent ? textContent.text : '';

      const inputTokens = response.usage?.input_tokens || Math.ceil((userMessage.length + (data.content?.length || 0)) / 4);
      const outputTokens = response.usage?.output_tokens || Math.ceil(result.length / 4);

      // Log AI usage
      await logAIUsage({
        userId,
        type: 'chat',
        inputTokens,
        outputTokens,
        bookId: data.context?.bookId,
      });

      // Log activity
      await logActivity({
        userId,
        type: 'AI_USED',
        message: `Used AI Chat`,
        bookId: data.context?.bookId,
        metadata: { type: 'chat', inputTokens, outputTokens } as Record<string, string | number>,
      });

    } else {
      // Use the structured generateContent function for typed requests
      result = await generateContent({
        type: data.type as 'continue' | 'improve' | 'dialogue' | 'description' | 'brainstorm' | 'outline',
        content: data.content || '',
        context: {
          bookTitle: data.context?.title || data.context?.bookTitle,
          genre: data.context?.genre,
          characters: data.context?.characters,
          chapterTitle: data.context?.chapterTitle,
          previousContent: data.context?.previousContent,
        },
        style: data.style,
        length: data.length,
      });

      const inputTokens = Math.ceil((data.content?.length || 0) / 4);
      const outputTokens = Math.ceil(result.length / 4);

      // Log AI usage
      await logAIUsage({
        userId,
        type: data.type,
        inputTokens,
        outputTokens,
        bookId: data.context?.bookId,
      });

      // Log activity
      await logActivity({
        userId,
        type: 'AI_USED',
        message: `Used AI: ${typeLabels[data.type] || data.type}`,
        bookId: data.context?.bookId,
        metadata: { type: data.type, inputTokens, outputTokens } as Record<string, string | number>,
      });
    }

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
