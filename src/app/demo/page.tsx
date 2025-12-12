'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Sparkles, ArrowRight, Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import { ToolTray } from '@/components/book-theater/ToolTray';
import { ChapterTimeline } from '@/components/book-theater/ChapterTimeline';
import { WritingCanvas } from '@/components/book-theater/WritingCanvas';
import { ToolPanel } from '@/components/book-theater/ToolPanel';
import { UndoStack } from '@/components/book-theater/UndoStack';
import { CommandPalette } from '@/components/book-theater/CommandPalette';

// Types
import { 
  Tool, SubOption, Selection, UndoItem, SceneContext, Chapter
} from '@/components/book-theater/types';

// ============================================================================
// DEMO DATA
// ============================================================================

const demoChapters: Chapter[] = [
  {
    id: 'demo-ch-1',
    title: 'The Storm Arrives',
    content: `The wind howled through the narrow streets of Ashwick, carrying with it the promise of something far worse than rain. Maya pressed her back against the cold stone wall, her heart pounding in rhythm with the thunder.

She had been warned about nights like this. Her grandmother's stories echoed in her mind—tales of the Veil thinning, of creatures that slipped through when the storms grew fierce enough to tear holes in reality itself.

A flash of lightning illuminated the alley, and Maya saw it: a shadow that moved against the light, independent of anything that could cast it. It pooled at the far end of the passage, darker than the darkness around it, and began to rise.

"Not tonight," she whispered, reaching for the pendant at her throat. The metal was warm—too warm—and pulsing with a light that matched her racing heartbeat.`,
    order: 1,
    bookId: 'demo-book',
    wordCount: 156,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-ch-2',
    title: 'Secrets in the Library',
    content: `The Ashwick Library had stood for three hundred years, its halls filled with knowledge both mundane and forbidden. Maya had spent countless hours here as a child, but she had never ventured into the Restricted Archives—until now.

The door groaned as she pushed it open, revealing shelves that stretched into shadows no lantern could fully dispel. The air smelled of old paper and something else, something that made her skin prickle with awareness.

"You shouldn't be here."

Maya spun, her pendant flaring. An old man stood in the doorway, his eyes reflecting the blue light of her charm.

"Neither should you," she replied, recognizing the symbol embroidered on his coat. "Not anymore."`,
    order: 2,
    bookId: 'demo-book',
    wordCount: 112,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-ch-3',
    title: 'The Gathering Dark',
    content: `Start writing your next chapter here...`,
    order: 3,
    bookId: 'demo-book',
    wordCount: 6,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const demoCharacters = [
  { id: 'char-1', name: 'Maya', role: 'protagonist' },
  { id: 'char-2', name: 'The Archivist', role: 'mentor' },
  { id: 'char-3', name: 'The Shadow', role: 'antagonist' },
];

const demoSceneContexts: SceneContext[] = [
  {
    id: 'scene-1',
    name: 'Storm Night',
    icon: '⛈️',
    mood: { primary: 'tense', secondary: 'mysterious' },
    sensoryPalette: {
      sight: 'Lightning flashes, deep shadows, rain-slicked cobblestones',
      sound: 'Thunder, howling wind, rain on stone',
      smell: 'Ozone, wet earth, old stone',
      touch: 'Cold rain, rough wall, warm pendant',
      taste: 'Metallic fear',
    },
    props: ['pendant', 'stone walls', 'shadow creature'],
    aiNotes: 'High tension, supernatural threat emerging',
  },
];

// ============================================================================
// DEMO PAGE COMPONENT
// ============================================================================

export default function DemoTheaterPage() {
  // State
  const [chapters, setChapters] = useState<Chapter[]>(demoChapters);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState(demoChapters[0].content);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [activeSubOption, setActiveSubOption] = useState<SubOption | null>(null);
  const [activeSceneContext, setActiveSceneContext] = useState<SceneContext | null>(demoSceneContexts[0]);
  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);
  const [redoStack, setRedoStack] = useState<UndoItem[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentChapter = chapters[activeChapterIndex];

  // Word count
  const wordCount = chapterContent.split(/\s+/).filter(w => w.length > 0).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle chapter change
  const handleChapterChange = useCallback((index: number) => {
    setChapters(prev => prev.map((ch, i) => 
      i === activeChapterIndex ? { ...ch, content: chapterContent } : ch
    ));
    setActiveChapterIndex(index);
    setChapterContent(chapters[index].content);
    setSelection(null);
    setHasUnsavedChanges(false);
  }, [activeChapterIndex, chapterContent, chapters]);

  // Handle content change
  const handleContentChange = useCallback((content: string) => {
    setChapterContent(content);
    setHasUnsavedChanges(true);
  }, []);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: Tool, subOption?: SubOption) => {
    setActiveTool(tool);
    setActiveSubOption(subOption || null);
    setRecentToolIds(prev => {
      const filtered = prev.filter(id => id !== tool.id);
      return [tool.id, ...filtered].slice(0, 5);
    });
  }, []);

  // Mock AI generation
  const handleGenerate = useCallback(async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const mockResponses: Record<string, string[]> = {
      continue: [
        `The shadow lunged. Maya raised her pendant, and light erupted from it like a small sun, casting the creature back with a shriek that seemed to come from everywhere and nowhere at once.

"You cannot hide forever, child of the Veil," it hissed, its voice like wind through dead leaves. "We know what you carry. We know what you are."

Maya's grandmother had never mentioned this. She had never said the shadows could speak.`,
        `She ran. There was no shame in it—only survival instinct honed by years of her grandmother's training. The creature gave chase, flowing over walls and through cracks like liquid darkness.

The library. If she could reach the library before dawn, she might find answers. She might find weapons. She might find out why her pendant chose tonight, of all nights, to awaken.`,
      ],
      expand: [
        `The wind howled through the narrow streets of Ashwick like a living thing, hungry and searching. It carried with it not just the promise of rain, but something else—a charge in the air that made Maya's teeth ache and her pendant grow warm against her chest. The cobblestones beneath her feet were already slick with the storm's first offerings, and somewhere in the distance, a church bell tolled a warning that no one else seemed to hear.`,
      ],
      dialogue: [
        `"You're one of them," Maya said, her voice steadier than she felt. "The Keepers. My grandmother told me you were all gone."

The old man's laugh was dry as autumn leaves. "Gone? No, child. Merely... waiting. As we have waited for three hundred years." He stepped closer, and the shadows seemed to part for him. "As we have waited for you."`,
      ],
    };

    const toolResponses = mockResponses[activeTool?.id || 'continue'] || mockResponses.continue;
    return toolResponses[Math.floor(Math.random() * toolResponses.length)];
  }, [activeTool]);

  // Insert handlers
  const handleInsertAfter = useCallback((text: string) => {
    const insertPoint = selection ? selection.end : cursorPosition;
    const newContent = chapterContent.slice(0, insertPoint) + '\n\n' + text + chapterContent.slice(insertPoint);
    
    setUndoStack(prev => [...prev, {
      id: Date.now().toString(),
      toolId: activeTool?.id || 'manual',
      toolName: activeTool?.name || 'Insert',
      previousContent: chapterContent,
      newContent,
      timestamp: new Date().toISOString(),
      wordCountDelta: text.split(/\s+/).length,
    }]);
    
    setChapterContent(newContent);
    setActiveTool(null);
    setSelection(null);
    setHasUnsavedChanges(true);
  }, [chapterContent, selection, cursorPosition, activeTool]);

  const handleReplace = useCallback((text: string) => {
    if (!selection) return;
    const newContent = chapterContent.slice(0, selection.start) + text + chapterContent.slice(selection.end);
    
    setUndoStack(prev => [...prev, {
      id: Date.now().toString(),
      toolId: activeTool?.id || 'manual',
      toolName: activeTool?.name || 'Replace',
      previousContent: chapterContent,
      newContent,
      timestamp: new Date().toISOString(),
      wordCountDelta: text.split(/\s+/).length - selection.text.split(/\s+/).length,
    }]);
    
    setChapterContent(newContent);
    setActiveTool(null);
    setSelection(null);
    setHasUnsavedChanges(true);
  }, [chapterContent, selection, activeTool]);

  const handleInsertAtCursor = useCallback((text: string) => {
    const newContent = chapterContent.slice(0, cursorPosition) + text + chapterContent.slice(cursorPosition);
    
    setUndoStack(prev => [...prev, {
      id: Date.now().toString(),
      toolId: activeTool?.id || 'manual',
      toolName: activeTool?.name || 'Insert',
      previousContent: chapterContent,
      newContent,
      timestamp: new Date().toISOString(),
      wordCountDelta: text.split(/\s+/).length,
    }]);
    
    setChapterContent(newContent);
    setActiveTool(null);
    setHasUnsavedChanges(true);
  }, [chapterContent, cursorPosition, activeTool]);

  // Undo/Redo
  const undo = useCallback((index?: number) => {
    const itemIndex = index ?? undoStack.length - 1;
    if (itemIndex < 0 || itemIndex >= undoStack.length) return;
    
    const item = undoStack[itemIndex];
    setRedoStack(prev => [...prev, {
      ...item,
      previousContent: chapterContent,
      newContent: item.previousContent,
    }]);
    setChapterContent(item.previousContent);
    setUndoStack(prev => prev.slice(0, itemIndex));
    setHasUnsavedChanges(true);
  }, [undoStack, chapterContent]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const item = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, item]);
    setChapterContent(item.newContent);
    setRedoStack(prev => prev.slice(0, -1));
    setHasUnsavedChanges(true);
  }, [redoStack]);

  return (
    <div className="flex h-screen flex-col bg-stone-950 text-stone-100">
      {/* Demo Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            You&apos;re exploring the Book Operating Theater demo
          </span>
          <span className="hidden text-sm opacity-75 sm:inline">
            · Press <kbd className="mx-1 rounded bg-white/20 px-1.5 py-0.5 text-xs">⌘K</kbd> to open command palette
          </span>
        </div>
        <Link 
          href="/sign-up"
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-stone-100"
        >
          Sign Up Free
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-4 py-2">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-stone-100">The Shadow&apos;s Edge</h1>
            <p className="text-xs text-stone-500">Demo Book · {wordCount.toLocaleString()} words</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-2 rounded-lg bg-stone-800 px-3 py-1.5 text-sm text-stone-400 hover:bg-stone-700 hover:text-stone-200 transition-colors"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Command</span>
            <kbd className="rounded bg-stone-700 px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button>
        </div>
      </header>

      {/* Chapter Timeline */}
      <ChapterTimeline
        chapters={chapters}
        activeChapterIndex={activeChapterIndex}
        onChapterSelect={handleChapterChange}
        onChapterCreate={() => {}}
        onChapterDelete={() => {}}
        onChapterRename={() => {}}
        onChapterReorder={() => {}}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tool Tray */}
        <ToolTray
          onSelectTool={handleToolSelect}
          activeTool={activeTool}
          hasSelection={!!selection}
          characters={demoCharacters}
          sceneContexts={demoSceneContexts}
          activeSceneContext={activeSceneContext}
          onSceneContextChange={setActiveSceneContext}
        />

        {/* Writing Canvas */}
        <div className="flex-1 overflow-hidden">
          <WritingCanvas
            chapter={currentChapter}
            content={chapterContent}
            onChange={handleContentChange}
            onSelect={setSelection}
            onCursorChange={setCursorPosition}
            sceneContext={activeSceneContext}
            isSaving={false}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={() => setHasUnsavedChanges(false)}
            wordCount={wordCount}
            isFirstChapter={activeChapterIndex === 0}
            hasNextChapter={activeChapterIndex < chapters.length - 1}
            onCreateNextChapter={() => {}}
            onGoToNextChapter={() => handleChapterChange(activeChapterIndex + 1)}
          />
        </div>

        {/* Tool Panel */}
        {activeTool && (
          <ToolPanel
            tool={activeTool}
            subOption={activeSubOption}
            selection={selection}
            sceneContext={activeSceneContext}
            chapterContent={chapterContent}
            cursorPosition={cursorPosition}
            onClose={() => setActiveTool(null)}
            onGenerate={handleGenerate}
            onInsertAfter={handleInsertAfter}
            onReplace={handleReplace}
            onInsertAtCursor={handleInsertAtCursor}
          />
        )}
      </div>

      {/* Undo Stack */}
      <UndoStack
        items={undoStack}
        onUndo={undo}
        onUndoLatest={() => undo()}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onRedo={redo}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTool={(tool, subOption) => {
          handleToolSelect(tool, subOption);
          setShowCommandPalette(false);
        }}
        hasSelection={!!selection}
        recentTools={recentToolIds}
      />
    </div>
  );
}
