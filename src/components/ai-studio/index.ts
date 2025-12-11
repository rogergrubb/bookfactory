// AI Studio Components - Export all components
export * from './types';

// Export types and utilities from tool-definitions
export { 
  TOOL_CATEGORIES, 
  AI_TOOLS, 
  getToolById, 
  getToolsByCategory, 
  getChainableTools,
  GENRES,
  // Also export types that were removed from types.ts to avoid duplicates
  type ToolCategory,
  type ToolScope,
  type AuthorInspiration,
  type AITool
} from './tool-definitions';

// Export from hooks
export * from './hooks';

// Component exports - using named exports where available
export { default as AIStudioPage } from './AIStudioPage';
export { AIStudioWorkspace } from './AIStudioWorkspace';
export { ToolPanel } from './ToolPanel';
export { ToolExecutionPanel } from './ToolExecutionPanel';
export { CommandPalette } from './CommandPalette';
export { AnalysisPanel } from './AnalysisPanel';
export { BrainstormPanel } from './BrainstormPanel';
export { VoiceProfilePanel } from './VoiceProfilePanel';
export { StoryBiblePanel } from './StoryBiblePanel';

