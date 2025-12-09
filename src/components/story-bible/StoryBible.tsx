'use client';

import React, { useState } from 'react';
import { 
  Users, Map, Clock, Scroll, BookOpen, Search, Plus, 
  Filter, ChevronRight, User, MapPin, Calendar, Sparkles,
  Eye, Edit2, Trash2, X, Link2, Tag, FileText
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type StoryBibleTab = 'characters' | 'locations' | 'timeline' | 'world' | 'themes' | 'research';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  appearsIn: number[];
  avatar?: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  appearsIn: number[];
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  chapter?: number;
  storyDate?: string;
  type: 'backstory' | 'plot-point' | 'character-moment' | 'world-event';
}

interface WorldRule {
  id: string;
  name: string;
  category: string;
  description: string;
  limitations?: string[];
  costs?: string[];
}

interface StoryBibleProps {
  bookId: string;
  bookTitle: string;
  characters: Character[];
  locations: Location[];
  timeline: TimelineEvent[];
  worldRules: WorldRule[];
}

// ============================================================================
// TAB CONFIG
// ============================================================================

const tabs: { id: StoryBibleTab; label: string; icon: typeof Users }[] = [
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'locations', label: 'Locations', icon: Map },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'world', label: 'World Rules', icon: Scroll },
  { id: 'themes', label: 'Themes', icon: Tag },
  { id: 'research', label: 'Research', icon: FileText },
];

// ============================================================================
// CHARACTER CARD
// ============================================================================

function CharacterCard({ character, onClick }: { character: Character; onClick: () => void }) {
  const roleColors: Record<string, string> = {
    protagonist: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    antagonist: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    supporting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    minor: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  };
  
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 text-left group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-600 flex items-center justify-center flex-shrink-0">
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <User className="w-6 h-6 text-stone-500" />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {character.name}
            </h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[character.role] || roleColors.minor}`}>
              {character.role}
            </span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
            {character.description}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
            <BookOpen className="w-3 h-3" />
            <span>Appears in {character.appearsIn.length} chapters</span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 transition-colors" />
      </div>
    </button>
  );
}

// ============================================================================
// LOCATION CARD
// ============================================================================

function LocationCard({ location, onClick }: { location: Location; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 text-left group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {location.name}
            </h4>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {location.type}
            </span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
            {location.description}
          </p>
        </div>
        
        <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 transition-colors" />
      </div>
    </button>
  );
}

// ============================================================================
// TIMELINE EVENT
// ============================================================================

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const typeColors: Record<string, string> = {
    backstory: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    'plot-point': 'border-teal-500 bg-teal-50 dark:bg-teal-900/20',
    'character-moment': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    'world-event': 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
  };
  
  return (
    <div className={`relative pl-8 pb-8 border-l-2 ${event.type === 'backstory' ? 'border-purple-300' : 'border-stone-300'} dark:border-stone-700`}>
      {/* Dot */}
      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 ${typeColors[event.type]} border-current`} />
      
      {/* Content */}
      <div className={`p-4 rounded-xl ${typeColors[event.type]}`}>
        <div className="flex items-center gap-2 mb-2">
          {event.chapter && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white dark:bg-stone-800">
              Chapter {event.chapter}
            </span>
          )}
          {event.storyDate && (
            <span className="text-xs text-stone-500">
              {event.storyDate}
            </span>
          )}
        </div>
        <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
          {event.title}
        </h4>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {event.description}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// WORLD RULE CARD
// ============================================================================

function WorldRuleCard({ rule }: { rule: WorldRule }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-stone-900 dark:text-stone-100">
              {rule.name}
            </h4>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              {rule.category}
            </span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {rule.description}
          </p>
        </div>
        
        <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          {rule.limitations && rule.limitations.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                Limitations
              </h5>
              <ul className="space-y-1">
                {rule.limitations.map((lim, i) => (
                  <li key={i} className="text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {rule.costs && rule.costs.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                Costs
              </h5>
              <ul className="space-y-1">
                {rule.costs.map((cost, i) => (
                  <li key={i} className="text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚡</span>
                    {cost}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StoryBible({
  bookId,
  bookTitle,
  characters,
  locations,
  timeline,
  worldRules
}: StoryBibleProps) {
  const [activeTab, setActiveTab] = useState<StoryBibleTab>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // Filter data based on search
  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="flex-shrink-0 p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Story Bible
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {bookTitle}
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      
      {/* Search */}
      <div className="flex-shrink-0 p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-3">
            {filteredCharacters.length > 0 ? (
              filteredCharacters.map((character) => (
                <CharacterCard 
                  key={character.id} 
                  character={character}
                  onClick={() => setSelectedCharacter(character)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  No characters yet
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  Start building your cast of characters
                </p>
                <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
                  Add First Character
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-3">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <LocationCard 
                  key={location.id} 
                  location={location}
                  onClick={() => setSelectedLocation(location)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Map className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  No locations yet
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  Define the world your story takes place in
                </p>
                <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
                  Add First Location
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="max-w-2xl">
            {timeline.length > 0 ? (
              timeline.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  No timeline events yet
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  Track the chronology of your story
                </p>
                <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
                  Add First Event
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* World Rules Tab */}
        {activeTab === 'world' && (
          <div className="space-y-3">
            {worldRules.length > 0 ? (
              worldRules.map((rule) => (
                <WorldRuleCard key={rule.id} rule={rule} />
              ))
            ) : (
              <div className="text-center py-12">
                <Scroll className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  No world rules yet
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  Define the rules of your world — magic systems, technology, society
                </p>
                <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
                  Add First Rule
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
              Track your themes
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Identify and track the themes running through your story
            </p>
            <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
              Add Theme
            </button>
          </div>
        )}
        
        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
              Research notes
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Store research, references, and source material
            </p>
            <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
              Add Research Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
