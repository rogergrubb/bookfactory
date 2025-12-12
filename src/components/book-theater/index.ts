// Components
export { WritingCanvas } from './WritingCanvas';
export { ToolTray } from './ToolTray';
export { ToolPanel } from './ToolPanel';
export { ChapterTimeline } from './ChapterTimeline';
export { UndoStack } from './UndoStack';
export { SceneContextPanel } from './SceneContextPanel';
export { CommandPalette } from './CommandPalette';
export { GenerationProgressBar, InlineProgress, FullScreenProgress } from './GenerationProgress';
export { InsertPopup, ConfettiOverlay, TextHighlight, WordCountDelta, PulseRing, TypingCursor, SuccessCheck } from './InsertAnimations';

// Hooks
export {
  useGenerationProgress,
  useInsertAnimation,
  useSuccessCelebration,
  useTypewriter,
  useFeedback,
  useWordCountAnimation,
} from './hooks/useMicroInteractions';

// Types from hooks
export type {
  GenerationPhase,
  GenerationProgress,
  InsertAnimation,
  Confetti,
} from './hooks/useMicroInteractions';

// Tool definitions
export { tools, categoryMeta, getToolsByCategory, getToolById } from './tool-definitions';

// Types
export type {
  Book,
  Chapter,
  Character,
  Tool,
  SubOption,
  ToolCategory,
  CategoryMeta,
  Selection,
  UndoItem,
  SceneContext,
  SensoryPalette,
  Mood,
  ToolRunRecord,
} from './types';
