import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const SaveRequestSchema = z.object({
  action: z.enum(['save', 'save-and-send']),
  toolRunId: z.string(),
  content: z.string(),
  metadata: z.object({
    toolRunId: z.string(),
    tokensUsed: z.number(),
    processingTime: z.number(),
    scope: z.enum(['scene', 'book', 'hybrid']),
    appliedTo: z.object({
      bookId: z.string(),
      documentId: z.string().optional(),
      chapterIds: z.array(z.string()).optional()
    }),
    suggestions: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional()
  }),
  nextToolId: z.string().optional(),
  routingOptions: z.object({
    preserveInput: z.boolean().optional(),
    appendToExisting: z.boolean().optional(),
    targetScope: z.object({
      mode: z.enum(['this-scene', 'selected-chapters', 'whole-book']),
      sceneId: z.string().optional(),
      chapterIds: z.array(z.string()).optional(),
      bookId: z.string()
    }).optional()
  }).optional()
});

// ============================================================================
// TOOL SCOPE DEFINITIONS (for chaining validation)
// ============================================================================

type ToolScope = 'scene' | 'book' | 'hybrid';

const TOOL_SCOPES: Record<string, ToolScope> = {
  // Scene scope
  'continue': 'scene',
  'dialogue': 'scene',
  'description': 'scene',
  'action': 'scene',
  'inner-monologue': 'scene',
  'improve': 'scene',
  'show-not-tell': 'scene',
  'deepen-emotion': 'scene',
  'add-tension': 'scene',
  'vary-sentences': 'scene',
  'sensory-details': 'scene',
  // Book scope
  'plot-holes': 'book',
  'emotional-arc': 'book',
  'plot-twists': 'book',
  'character-ideas': 'book',
  'world-building': 'book',
  'conflict-generator': 'book',
  'subplot-ideas': 'book',
  // Hybrid scope
  'first-draft': 'hybrid',
  'pacing': 'hybrid',
  'character-voice': 'hybrid',
  'readability': 'hybrid',
  'word-frequency': 'hybrid',
  'scene-ideas': 'hybrid'
};

// ============================================================================
// CHAIN VALIDATION
// ============================================================================

function validateChain(sourceScope: ToolScope, targetToolId: string): { valid: boolean; error?: string } {
  const targetScope = TOOL_SCOPES[targetToolId];
  
  if (!targetScope) {
    return { valid: false, error: 'Unknown target tool' };
  }

  // Scene outputs can chain to scene or hybrid tools
  if (sourceScope === 'scene' && targetScope === 'book') {
    return { valid: false, error: 'Scene-level outputs cannot be sent to book-level tools. Choose a scene or hybrid tool.' };
  }

  // Book outputs can chain to book or hybrid tools
  if (sourceScope === 'book' && targetScope === 'scene') {
    return { valid: false, error: 'Book-level outputs cannot be sent to scene-level tools. Choose a book or hybrid tool.' };
  }

  return { valid: true };
}

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
    const parsed = SaveRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { action, toolRunId, content, metadata, nextToolId, routingOptions } = parsed.data;

    // Get the original tool run
    const toolRun = await prisma.toolRun.findUnique({
      where: { id: toolRunId }
    });

    if (!toolRun) {
      return NextResponse.json({ error: 'Tool run not found' }, { status: 404 });
    }

    // Verify ownership
    if (toolRun.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // ========================================================================
    // SAVE ACTION
    // ========================================================================
    
    if (action === 'save') {
      // Determine where to save based on scope
      let savedToId: string;
      let savedToType: 'document' | 'tool_run' | 'book';

      if (metadata.scope === 'scene' && metadata.appliedTo.documentId) {
        // Save to document (append or replace based on routingOptions)
        const document = await prisma.document.findUnique({
          where: { id: metadata.appliedTo.documentId }
        });

        if (document) {
          const newContent = routingOptions?.appendToExisting
            ? document.content + '\n\n' + content
            : content;

          await prisma.document.update({
            where: { id: document.id },
            data: {
              content: newContent,
              wordCount: newContent.split(/\s+/).filter(Boolean).length,
              updatedAt: new Date()
            }
          });

          savedToId = document.id;
          savedToType = 'document';
        } else {
          // Fallback to saving in tool run
          savedToId = toolRunId;
          savedToType = 'tool_run';
        }
      } else {
        // Book-scope or no specific document - save as tool run output
        savedToId = toolRunId;
        savedToType = 'tool_run';
      }

      // Update tool run with save info
      await prisma.toolRun.update({
        where: { id: toolRunId },
        data: {
          savedToDocumentId: savedToType === 'document' ? savedToId : null,
          appliedAt: new Date(),
          output: content
        }
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: 'tool_save',
          description: `Saved ${toolRun.toolId} output`,
          metadata: JSON.stringify({
            toolRunId,
            savedToId,
            savedToType,
            bookId: metadata.appliedTo.bookId
          })
        }
      });

      return NextResponse.json({
        success: true,
        savedToId,
        savedToType
      });
    }

    // ========================================================================
    // SAVE-AND-SEND ACTION
    // ========================================================================
    
    if (action === 'save-and-send') {
      if (!nextToolId) {
        return NextResponse.json(
          { error: 'nextToolId is required for save-and-send action' },
          { status: 400 }
        );
      }

      // Validate chain
      const chainValidation = validateChain(metadata.scope, nextToolId);
      if (!chainValidation.valid) {
        return NextResponse.json(
          { error: chainValidation.error },
          { status: 400 }
        );
      }

      // Save current output
      let savedToId: string = toolRunId;
      let savedToType: 'document' | 'tool_run' | 'book' = 'tool_run';

      if (metadata.scope === 'scene' && metadata.appliedTo.documentId) {
        const document = await prisma.document.findUnique({
          where: { id: metadata.appliedTo.documentId }
        });

        if (document) {
          const newContent = routingOptions?.appendToExisting
            ? document.content + '\n\n' + content
            : content;

          await prisma.document.update({
            where: { id: document.id },
            data: {
              content: newContent,
              wordCount: newContent.split(/\s+/).filter(Boolean).length,
              updatedAt: new Date()
            }
          });

          savedToId = document.id;
          savedToType = 'document';
        }
      }

      // Update current tool run
      await prisma.toolRun.update({
        where: { id: toolRunId },
        data: {
          savedToDocumentId: savedToType === 'document' ? savedToId : null,
          appliedAt: new Date(),
          output: content
        }
      });

      // Get or create workflow
      let workflowId = toolRun.workflowId;
      
      if (!workflowId) {
        const workflow = await prisma.workflow.create({
          data: {
            userId: user.id,
            bookId: metadata.appliedTo.bookId,
            name: `Workflow from ${toolRun.toolId}`,
            toolRunIds: [toolRunId],
            status: 'in-progress',
            startedAt: new Date()
          }
        });
        workflowId = workflow.id;

        // Update tool run with workflow ID
        await prisma.toolRun.update({
          where: { id: toolRunId },
          data: { workflowId }
        });
      } else {
        // Add to existing workflow
        await prisma.workflow.update({
          where: { id: workflowId },
          data: {
            toolRunIds: { push: toolRunId }
          }
        });
      }

      // Prepare context for next tool
      const targetScope = TOOL_SCOPES[nextToolId];
      let nextContext: {
        bookId: string;
        documentId?: string;
        workflowId: string;
        previousToolRuns: string[];
      } = {
        bookId: metadata.appliedTo.bookId,
        workflowId,
        previousToolRuns: [...(toolRun.workflowId ? await getWorkflowToolRuns(workflowId) : [toolRunId])]
      };

      // Determine document context based on target scope
      if (targetScope === 'scene') {
        // Scene tools need a document
        if (routingOptions?.targetScope?.sceneId) {
          nextContext.documentId = routingOptions.targetScope.sceneId;
        } else if (metadata.appliedTo.documentId) {
          nextContext.documentId = metadata.appliedTo.documentId;
        }
      } else if (targetScope === 'hybrid' && routingOptions?.targetScope) {
        // Hybrid tools use the provided scope selection
        if (routingOptions.targetScope.sceneId) {
          nextContext.documentId = routingOptions.targetScope.sceneId;
        }
      }
      // Book tools don't need documentId

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: 'tool_chain',
          description: `Chained ${toolRun.toolId} to ${nextToolId}`,
          metadata: JSON.stringify({
            fromToolRunId: toolRunId,
            nextToolId,
            workflowId,
            bookId: metadata.appliedTo.bookId
          })
        }
      });

      return NextResponse.json({
        success: true,
        savedToId,
        savedToType,
        nextToolState: {
          toolId: nextToolId,
          preloadedInput: routingOptions?.preserveInput ? content : '',
          context: {
            userId: user.id,
            ...nextContext
          }
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Save failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getWorkflowToolRuns(workflowId: string): Promise<string[]> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId }
  });
  return workflow?.toolRunIds || [];
}
