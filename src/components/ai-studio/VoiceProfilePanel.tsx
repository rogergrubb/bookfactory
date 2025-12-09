// VoiceProfilePanel - Train AI to match your writing style
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Target, Loader2, Upload, Check, RefreshCw, 
  BookOpen, Mic, Sparkles, Copy, ChevronDown, ChevronUp,
  AlertCircle, FileText, Wand2
} from 'lucide-react';

interface VoiceProfile {
  sentenceStructure: {
    averageLength: string;
    complexity: string;
    patterns: string[];
  };
  vocabulary: {
    level: string;
    preferences: string[];
    avoidances: string[];
    uniqueTerms: string[];
  };
  rhythm: {
    pacing: string;
    paragraphLength: string;
    punctuationStyle: string;
  };
  tone: {
    overall: string;
    emotionalRange: string[];
    formality: string;
  };
  narrativeStyle: {
    pov: string;
    tense: string;
    showVsTell: string;
    dialogueStyle: string;
  };
  distinctiveFeatures: string[];
  stylePrompt: string;
}

interface VoiceProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
}

export function VoiceProfilePanel({ isOpen, onClose, bookId }: VoiceProfilePanelProps) {
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sample, setSample] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['structure', 'vocabulary', 'distinctive']));
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookId) {
      fetchProfile();
    }
  }, [isOpen, bookId]);

  const fetchProfile = async () => {
    if (!bookId) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/voice-profile?bookId=' + bookId);
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setUpdatedAt(data.updatedAt);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWriting = async () => {
    if (sample.length < 500) {
      setError('Please provide at least 500 characters of your writing.');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/voice-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          sample,
          bookId
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.profile) {
        setProfile(data.profile);
        setUpdatedAt(new Date().toISOString());
        setSample('');
      }
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateInVoice = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    
    if (!profile) {
      setError('Please analyze a writing sample first to create a voice profile.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedText('');
    
    try {
      const res = await fetch('/api/ai/voice-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          voiceProfile: profile,
          bookId
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.content) {
        setGeneratedText(data.content);
      }
    } catch (err) {
      setError('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-[1200px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Voice Profile</h2>
                <p className="text-sm text-gray-500">Train AI to match your unique writing style</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 py-3 border-b border-gray-100 flex gap-4 flex-shrink-0">
            <button
              onClick={() => setActiveTab('analyze')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (
                activeTab === 'analyze'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Analyze Sample
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (
                activeTab === 'generate'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Generate in Voice
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Input */}
            <div className="w-1/2 border-r border-gray-100 flex flex-col">
              {activeTab === 'analyze' ? (
                <>
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-medium text-gray-900">Writing Sample</h3>
                    <p className="text-xs text-gray-500 mt-1">Paste at least 500 characters of your writing</p>
                  </div>
                  <div className="flex-1 p-4">
                    <textarea
                      value={sample}
                      onChange={(e) => setSample(e.target.value)}
                      placeholder="Paste your writing sample here... The more text you provide, the better the analysis will be."
                      className="w-full h-full resize-none bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed"
                    />
                  </div>
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{sample.length} characters (min 500)</span>
                    <button
                      onClick={analyzeWriting}
                      disabled={sample.length < 500 || isAnalyzing}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ' + (
                        isAnalyzing
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                      )}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze Voice
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-medium text-gray-900">What to Write</h3>
                    <p className="text-xs text-gray-500 mt-1">Describe what you want AI to write in your voice</p>
                  </div>
                  <div className="flex-1 p-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: Write the opening paragraph of a mystery novel set in Victorian London..."
                      className="w-full h-1/3 resize-none bg-gray-50 rounded-lg p-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm leading-relaxed mb-4"
                    />
                    <div className="bg-gray-50 rounded-lg p-4 h-2/3 overflow-y-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Generated Text</span>
                        {generatedText && (
                          <button
                            onClick={() => copyToClipboard(generatedText)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        )}
                      </div>
                      {generatedText ? (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{generatedText}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Generated text will appear here...</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    {!profile && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Analyze a sample first
                      </span>
                    )}
                    <button
                      onClick={generateInVoice}
                      disabled={!prompt.trim() || !profile || isGenerating}
                      className={'ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ' + (
                        isGenerating || !profile
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right Panel - Profile */}
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Your Voice Profile</h3>
                  {updatedAt && (
                    <p className="text-xs text-gray-500">Last updated: {new Date(updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
                {profile && (
                  <button
                    onClick={() => { setSample(''); setProfile(null); }}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : profile ? (
                  <div className="space-y-3">
                    {/* Style Prompt */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Style Prompt</span>
                      </div>
                      <p className="text-sm text-blue-800">{profile.stylePrompt}</p>
                    </div>

                    {/* Sentence Structure */}
                    <ProfileSection
                      title="Sentence Structure"
                      isExpanded={expandedSections.has('structure')}
                      onToggle={() => toggleSection('structure')}
                    >
                      <ProfileDetail label="Average Length" value={profile.sentenceStructure.averageLength} />
                      <ProfileDetail label="Complexity" value={profile.sentenceStructure.complexity} />
                      <ProfileTags label="Patterns" tags={profile.sentenceStructure.patterns} />
                    </ProfileSection>

                    {/* Vocabulary */}
                    <ProfileSection
                      title="Vocabulary"
                      isExpanded={expandedSections.has('vocabulary')}
                      onToggle={() => toggleSection('vocabulary')}
                    >
                      <ProfileDetail label="Level" value={profile.vocabulary.level} />
                      <ProfileTags label="Preferences" tags={profile.vocabulary.preferences} color="green" />
                      <ProfileTags label="Avoids" tags={profile.vocabulary.avoidances} color="red" />
                      <ProfileTags label="Unique Terms" tags={profile.vocabulary.uniqueTerms} color="blue" />
                    </ProfileSection>

                    {/* Rhythm */}
                    <ProfileSection
                      title="Rhythm & Pacing"
                      isExpanded={expandedSections.has('rhythm')}
                      onToggle={() => toggleSection('rhythm')}
                    >
                      <ProfileDetail label="Pacing" value={profile.rhythm.pacing} />
                      <ProfileDetail label="Paragraphs" value={profile.rhythm.paragraphLength} />
                      <ProfileDetail label="Punctuation" value={profile.rhythm.punctuationStyle} />
                    </ProfileSection>

                    {/* Tone */}
                    <ProfileSection
                      title="Tone"
                      isExpanded={expandedSections.has('tone')}
                      onToggle={() => toggleSection('tone')}
                    >
                      <ProfileDetail label="Overall" value={profile.tone.overall} />
                      <ProfileDetail label="Formality" value={profile.tone.formality} />
                      <ProfileTags label="Emotions" tags={profile.tone.emotionalRange} color="purple" />
                    </ProfileSection>

                    {/* Narrative Style */}
                    <ProfileSection
                      title="Narrative Style"
                      isExpanded={expandedSections.has('narrative')}
                      onToggle={() => toggleSection('narrative')}
                    >
                      <ProfileDetail label="POV" value={profile.narrativeStyle.pov} />
                      <ProfileDetail label="Tense" value={profile.narrativeStyle.tense} />
                      <ProfileDetail label="Show vs Tell" value={profile.narrativeStyle.showVsTell} />
                      <ProfileDetail label="Dialogue" value={profile.narrativeStyle.dialogueStyle} />
                    </ProfileSection>

                    {/* Distinctive Features */}
                    <ProfileSection
                      title="Distinctive Features"
                      isExpanded={expandedSections.has('distinctive')}
                      onToggle={() => toggleSection('distinctive')}
                    >
                      <ul className="space-y-2">
                        {profile.distinctiveFeatures.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </ProfileSection>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="p-4 rounded-2xl bg-gray-50 w-fit mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">No Voice Profile Yet</h4>
                      <p className="text-sm text-gray-500 max-w-xs">
                        Paste a sample of your writing to create a voice profile that AI can use to match your style.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ProfileSection({ 
  title, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  title: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm">{title}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isExpanded && (
        <div className="p-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium capitalize">{value}</span>
    </div>
  );
}

function ProfileTags({ 
  label, 
  tags, 
  color = 'gray' 
}: { 
  label: string; 
  tags: string[]; 
  color?: 'gray' | 'green' | 'red' | 'blue' | 'purple';
}) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700'
  };

  return (
    <div>
      <span className="text-xs text-gray-500 block mb-1">{label}</span>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, i) => (
          <span key={i} className={'px-2 py-0.5 rounded-full text-xs ' + colorClasses[color]}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default VoiceProfilePanel;
