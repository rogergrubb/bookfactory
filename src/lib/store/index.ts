import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Book Store
interface BookState {
  currentBookId: string | null;
  currentChapterId: string | null;
  currentSceneId: string | null;
  isWriting: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  wordCountGoal: number;
  sessionWordCount: number;
  
  setCurrentBook: (id: string | null) => void;
  setCurrentChapter: (id: string | null) => void;
  setCurrentScene: (id: string | null) => void;
  setIsWriting: (writing: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  updateLastSaved: () => void;
  setWordCountGoal: (goal: number) => void;
  incrementSessionWordCount: (count: number) => void;
  resetSessionWordCount: () => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      currentBookId: null,
      currentChapterId: null,
      currentSceneId: null,
      isWriting: false,
      autoSaveEnabled: true,
      lastSaved: null,
      wordCountGoal: 1000,
      sessionWordCount: 0,

      setCurrentBook: (id) => set({ currentBookId: id }),
      setCurrentChapter: (id) => set({ currentChapterId: id }),
      setCurrentScene: (id) => set({ currentSceneId: id }),
      setIsWriting: (writing) => set({ isWriting: writing }),
      setAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),
      updateLastSaved: () => set({ lastSaved: new Date() }),
      setWordCountGoal: (goal) => set({ wordCountGoal: goal }),
      incrementSessionWordCount: (count) => 
        set((state) => ({ sessionWordCount: state.sessionWordCount + count })),
      resetSessionWordCount: () => set({ sessionWordCount: 0 }),
    }),
    {
      name: 'bookfactory-book-store',
    }
  )
);

// Editor Store
interface EditorState {
  theme: 'light' | 'dark' | 'sepia' | 'focus';
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  focusMode: boolean;
  showSidebar: boolean;
  showAIPanel: boolean;
  showOutline: boolean;
  typewriterMode: boolean;
  
  setTheme: (theme: 'light' | 'dark' | 'sepia' | 'focus') => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  toggleFocusMode: () => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  toggleOutline: () => void;
  toggleTypewriterMode: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontFamily: 'Georgia',
      fontSize: 18,
      lineHeight: 1.8,
      focusMode: false,
      showSidebar: true,
      showAIPanel: false,
      showOutline: true,
      typewriterMode: false,

      setTheme: (theme) => set({ theme }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setFontSize: (size) => set({ fontSize: size }),
      setLineHeight: (height) => set({ lineHeight: height }),
      toggleFocusMode: () => set((state) => ({ 
        focusMode: !state.focusMode,
        showSidebar: state.focusMode ? true : false,
        showAIPanel: false
      })),
      toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
      toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),
      toggleOutline: () => set((state) => ({ showOutline: !state.showOutline })),
      toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),
    }),
    {
      name: 'bookfactory-editor-store',
    }
  )
);

// AI Assistant Store
interface AIAssistantState {
  isGenerating: boolean;
  currentPrompt: string;
  lastResponse: string | null;
  history: Array<{ prompt: string; response: string; type: string; timestamp: Date }>;
  
  setIsGenerating: (generating: boolean) => void;
  setCurrentPrompt: (prompt: string) => void;
  setLastResponse: (response: string) => void;
  addToHistory: (entry: { prompt: string; response: string; type: string }) => void;
  clearHistory: () => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  isGenerating: false,
  currentPrompt: '',
  lastResponse: null,
  history: [],

  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setLastResponse: (response) => set({ lastResponse: response }),
  addToHistory: (entry) => set((state) => ({
    history: [...state.history, { ...entry, timestamp: new Date() }].slice(-50)
  })),
  clearHistory: () => set({ history: [] }),
}));

// Publishing Store
interface PublishingState {
  selectedPlatforms: string[];
  exportProgress: number;
  currentExportFormat: string | null;
  publishingStatus: Record<string, string>;
  
  setSelectedPlatforms: (platforms: string[]) => void;
  togglePlatform: (platform: string) => void;
  setExportProgress: (progress: number) => void;
  setCurrentExportFormat: (format: string | null) => void;
  updatePublishingStatus: (platform: string, status: string) => void;
}

export const usePublishingStore = create<PublishingState>((set) => ({
  selectedPlatforms: [],
  exportProgress: 0,
  currentExportFormat: null,
  publishingStatus: {},

  setSelectedPlatforms: (platforms) => set({ selectedPlatforms: platforms }),
  togglePlatform: (platform) => set((state) => ({
    selectedPlatforms: state.selectedPlatforms.includes(platform)
      ? state.selectedPlatforms.filter(p => p !== platform)
      : [...state.selectedPlatforms, platform]
  })),
  setExportProgress: (progress) => set({ exportProgress: progress }),
  setCurrentExportFormat: (format) => set({ currentExportFormat: format }),
  updatePublishingStatus: (platform, status) => set((state) => ({
    publishingStatus: { ...state.publishingStatus, [platform]: status }
  })),
}));

// Marketing Store
interface MarketingState {
  activeCampaigns: string[];
  scheduledPosts: Array<{ id: string; platform: string; scheduledFor: Date; content: string }>;
  emailDrafts: Array<{ id: string; subject: string; body: string }>;
  
  addCampaign: (id: string) => void;
  removeCampaign: (id: string) => void;
  addScheduledPost: (post: { platform: string; scheduledFor: Date; content: string }) => void;
  removeScheduledPost: (id: string) => void;
  addEmailDraft: (draft: { subject: string; body: string }) => void;
  removeEmailDraft: (id: string) => void;
}

export const useMarketingStore = create<MarketingState>((set) => ({
  activeCampaigns: [],
  scheduledPosts: [],
  emailDrafts: [],

  addCampaign: (id) => set((state) => ({
    activeCampaigns: [...state.activeCampaigns, id]
  })),
  removeCampaign: (id) => set((state) => ({
    activeCampaigns: state.activeCampaigns.filter(c => c !== id)
  })),
  addScheduledPost: (post) => set((state) => ({
    scheduledPosts: [...state.scheduledPosts, { ...post, id: crypto.randomUUID() }]
  })),
  removeScheduledPost: (id) => set((state) => ({
    scheduledPosts: state.scheduledPosts.filter(p => p.id !== id)
  })),
  addEmailDraft: (draft) => set((state) => ({
    emailDrafts: [...state.emailDrafts, { ...draft, id: crypto.randomUUID() }]
  })),
  removeEmailDraft: (id) => set((state) => ({
    emailDrafts: state.emailDrafts.filter(d => d.id !== id)
  })),
}));

// UI Store
interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>;
  
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: crypto.randomUUID() }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
