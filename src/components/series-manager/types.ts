// Series Support Types

export interface Series {
  id: string;
  userId: string;
  name: string;
  description?: string;
  genre: string;
  status: SeriesStatus;
  createdAt: Date;
  updatedAt: Date;
  books: SeriesBook[];
  characters: SeriesCharacter[];
  settings: SeriesSetting[];
  plotThreads: SeriesPlotThread[];
  storyBible?: SeriesStoryBible;
}

export type SeriesStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS';

export interface SeriesBook {
  id: string;
  title: string;
  seriesOrder: number;
  status: string;
  wordCount: number;
  coverUrl?: string;
}

export interface SeriesCharacter {
  id: string;
  seriesId: string;
  name: string;
  role: CharacterRole;
  description?: string;
  traits: string[];
  imageUrl?: string;
  // Track appearances
  appearsIn: string[]; // Book IDs
  introducedIn?: string; // Book ID
  // State tracking
  currentStatus: CharacterStatus;
  statusHistory: CharacterStatusEntry[];
  // Relationships
  relationships: CharacterRelationship[];
  createdAt: Date;
  updatedAt: Date;
}

export type CharacterRole = 
  | 'protagonist'
  | 'antagonist'
  | 'major'
  | 'supporting'
  | 'minor'
  | 'mentioned';

export type CharacterStatus = 
  | 'alive'
  | 'deceased'
  | 'missing'
  | 'unknown'
  | 'transformed';

export interface CharacterStatusEntry {
  status: CharacterStatus;
  asOfBook: string;
  asOfChapter?: string;
  notes?: string;
  timestamp: Date;
}

export interface CharacterRelationship {
  targetCharacterId: string;
  targetCharacterName: string;
  relationshipType: string; // ally, enemy, family, romantic, mentor, etc.
  description?: string;
  introducedIn?: string;
  currentState: string; // active, ended, strained, etc.
}

export interface SeriesSetting {
  id: string;
  seriesId: string;
  name: string;
  type: SettingType;
  description?: string;
  imageUrl?: string;
  usedIn: string[]; // Book IDs
  // World-building details
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingType = 
  | 'location'
  | 'organization'
  | 'magic_system'
  | 'technology'
  | 'culture'
  | 'religion'
  | 'item'
  | 'creature'
  | 'other';

export interface SeriesPlotThread {
  id: string;
  seriesId: string;
  name: string;
  description?: string;
  type: PlotThreadType;
  status: PlotThreadStatus;
  introducedInBook?: string;
  resolvedInBook?: string;
  booksInvolved: string[];
  // Key events in this thread
  keyEvents: PlotThreadEvent[];
  // Connections to characters
  involvedCharacters: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type PlotThreadType = 
  | 'main'
  | 'subplot'
  | 'mystery'
  | 'romance'
  | 'character_arc'
  | 'world_event';

export type PlotThreadStatus = 
  | 'planned'
  | 'active'
  | 'resolved'
  | 'abandoned';

export interface PlotThreadEvent {
  bookId: string;
  chapterId?: string;
  description: string;
  significance: 'minor' | 'moderate' | 'major' | 'climax';
}

export interface SeriesStoryBible {
  id: string;
  seriesId: string;
  premise?: string;
  themes: string[];
  tone?: string;
  worldRules: WorldRule[];
  timelineStart?: string;
  timelineSpan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldRule {
  category: string; // magic, technology, society, etc.
  name: string;
  description: string;
  exceptions?: string[];
  introducedIn?: string;
}

// Series Timeline
export interface SeriesTimeline {
  books: TimelineBook[];
  events: TimelineEvent[];
  characterArcs: CharacterArc[];
}

export interface TimelineBook {
  id: string;
  title: string;
  order: number;
  timeframe?: string; // "Years 1-2", "Summer 1847"
  majorEvents: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  bookId?: string;
  position: number; // Relative position in timeline
  characters: string[];
  significance: 'minor' | 'moderate' | 'major' | 'series_defining';
}

export interface CharacterArc {
  characterId: string;
  characterName: string;
  arcType: string; // growth, fall, redemption, etc.
  startState: string;
  endState: string;
  keyMoments: ArcMoment[];
}

export interface ArcMoment {
  bookId: string;
  chapterId?: string;
  description: string;
  arcProgress: number; // 0-100
}

// Import/Export
export interface SeriesExport {
  series: Omit<Series, 'books'>;
  characters: SeriesCharacter[];
  settings: SeriesSetting[];
  plotThreads: SeriesPlotThread[];
  storyBible?: SeriesStoryBible;
  exportedAt: Date;
  version: string;
}

// Sync operations
export interface SyncCharacterToBooks {
  seriesCharacterId: string;
  targetBookIds: string[];
  includeRelationships: boolean;
}

export interface CharacterSyncResult {
  bookId: string;
  bookCharacterId: string;
  status: 'created' | 'updated' | 'unchanged';
}
