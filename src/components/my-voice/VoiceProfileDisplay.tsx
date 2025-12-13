'use client';

import React, { useState } from 'react';
import {
  Mic, BarChart3, Type, Zap, Heart, Eye, MessageSquare,
  BookOpen, Sparkles, ChevronDown, ChevronRight, User,
  TrendingUp, Clock, RefreshCw, Trash2, Edit2, Copy, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceProfile, VoiceAnalysis, StyleDimensions } from './types';

interface VoiceProfileDisplayProps {
  profile: VoiceProfile;
  onUseVoice: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
  onRetrain?: (profileId: string) => void;
  className?: string;
}

export function VoiceProfileDisplay({
  profile,
  onUseVoice,
  onDelete,
  onRetrain,
  className
}: VoiceProfileDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [copied, setCopied] = useState(false);

  const { analysis } = profile;
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCopyStyleGuide = async () => {
    await navigator.clipboard.writeText(profile.styleGuide);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format dimension as a visual bar
  const DimensionBar = ({ 
    label, 
    value, 
    leftLabel, 
    rightLabel 
  }: { 
    label: string; 
    value: number; 
    leftLabel: string; 
    rightLabel: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-400">{label}</span>
        <span className="text-stone-500 font-mono">{value}/10</span>
      </div>
      <div className="relative h-2 bg-stone-800 rounded-full">
        <div 
          className="absolute h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
          style={{ width: `${value * 10}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-violet-500"
          style={{ left: `calc(${value * 10}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-stone-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <div className="border border-stone-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 flex items-center justify-between bg-stone-800/30 hover:bg-stone-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-stone-200">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-500" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 bg-stone-900/50">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <Mic className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-100">{profile.name}</h2>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>{profile.totalWordCount.toLocaleString()} words trained</span>
                <span>•</span>
                <span>Used {profile.timesUsed} times</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              profile.status === 'ready' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : profile.status === 'training'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
            )}>
              {profile.status === 'ready' ? 'Ready' : profile.status === 'training' ? 'Training' : 'Error'}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="px-6 py-3 border-b border-stone-800 bg-stone-800/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">Voice Match Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-stone-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full',
                  analysis.confidence >= 80 ? 'bg-emerald-500' :
                  analysis.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
            <span className="text-sm font-mono text-stone-300">{analysis.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Style Dimensions */}
        <Section id="overview" title="Style Dimensions" icon={BarChart3}>
          <div className="grid gap-4">
            <DimensionBar 
              label="Formality" 
              value={analysis.dimensions.formality}
              leftLabel="Casual"
              rightLabel="Formal"
            />
            <DimensionBar 
              label="Prose Density" 
              value={analysis.dimensions.density}
              leftLabel="Sparse"
              rightLabel="Ornate"
            />
            <DimensionBar 
              label="Directness" 
              value={analysis.dimensions.directness}
              leftLabel="Meandering"
              rightLabel="Direct"
            />
            <DimensionBar 
              label="Emotionality" 
              value={analysis.dimensions.emotionality}
              leftLabel="Reserved"
              rightLabel="Expressive"
            />
            <DimensionBar 
              label="Pacing" 
              value={analysis.dimensions.pacing}
              leftLabel="Slow"
              rightLabel="Fast"
            />
            <DimensionBar 
              label="Complexity" 
              value={analysis.dimensions.complexity}
              leftLabel="Simple"
              rightLabel="Complex"
            />
          </div>
        </Section>

        {/* Sentence Patterns */}
        <Section id="sentences" title="Sentence Structure" icon={Type}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-2xl font-bold text-stone-100">
                  {analysis.sentencePatterns.avgSentenceLength.toFixed(0)}
                </p>
                <p className="text-xs text-stone-500">Avg words/sentence</p>
              </div>
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-2xl font-bold text-stone-100">
                  {analysis.sentencePatterns.avgParagraphSentences.toFixed(1)}
                </p>
                <p className="text-xs text-stone-500">Sentences/paragraph</p>
              </div>
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-2xl font-bold text-stone-100">
                  {analysis.sentencePatterns.sentenceLengthVariance.toFixed(1)}
                </p>
                <p className="text-xs text-stone-500">Length variance</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-stone-400 font-medium">Sentence Mix</p>
              <div className="flex gap-2 h-4">
                <div 
                  className="bg-violet-500 rounded"
                  style={{ width: `${analysis.sentencePatterns.simplePercentage}%` }}
                  title={`Short: ${analysis.sentencePatterns.simplePercentage}%`}
                />
                <div 
                  className="bg-purple-500 rounded"
                  style={{ width: `${100 - analysis.sentencePatterns.simplePercentage - analysis.sentencePatterns.complexPercentage}%` }}
                  title="Medium"
                />
                <div 
                  className="bg-pink-500 rounded"
                  style={{ width: `${analysis.sentencePatterns.complexPercentage}%` }}
                  title={`Long: ${analysis.sentencePatterns.complexPercentage}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Short ({analysis.sentencePatterns.simplePercentage}%)</span>
                <span>Medium</span>
                <span>Long ({analysis.sentencePatterns.complexPercentage}%)</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-stone-400 font-medium">Punctuation Style</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-stone-800/30 rounded">
                  <span className="text-stone-500">Em dashes</span>
                  <span className="text-stone-300">{analysis.sentencePatterns.punctuationStyle.dashFrequency.toFixed(1)}/1k</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-800/30 rounded">
                  <span className="text-stone-500">Ellipses</span>
                  <span className="text-stone-300">{analysis.sentencePatterns.punctuationStyle.ellipsisFrequency.toFixed(1)}/1k</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-800/30 rounded">
                  <span className="text-stone-500">Semicolons</span>
                  <span className="text-stone-300">{analysis.sentencePatterns.punctuationStyle.semicolonFrequency.toFixed(1)}/1k</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-800/30 rounded">
                  <span className="text-stone-500">Questions</span>
                  <span className="text-stone-300">{analysis.sentencePatterns.punctuationStyle.questionFrequency.toFixed(1)}/1k</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Tone Profile */}
        <Section id="tone" title="Tone & Emotion" icon={Heart}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-400 font-medium mb-2">Primary Tones</p>
              <div className="flex flex-wrap gap-2">
                {analysis.toneProfile.primaryTones.map((tone, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full"
                  >
                    {tone.tone} ({tone.strength}/10)
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Humor Style</p>
                <p className="text-sm text-stone-200 capitalize">{analysis.toneProfile.humorStyle || 'None'}</p>
              </div>
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Reader Relationship</p>
                <p className="text-sm text-stone-200 capitalize">{analysis.toneProfile.readerRelationship}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-stone-400 font-medium mb-2">Emotional Range</p>
              <div className="flex gap-1 h-6">
                <div 
                  className="bg-emerald-500/50 rounded-l flex items-center justify-center text-[10px] text-white"
                  style={{ width: `${analysis.toneProfile.emotionalRange.positive}%` }}
                >
                  {analysis.toneProfile.emotionalRange.positive > 15 && 'Positive'}
                </div>
                <div 
                  className="bg-stone-600 flex items-center justify-center text-[10px] text-white"
                  style={{ width: `${analysis.toneProfile.emotionalRange.neutral}%` }}
                >
                  {analysis.toneProfile.emotionalRange.neutral > 15 && 'Neutral'}
                </div>
                <div 
                  className="bg-red-500/50 rounded-r flex items-center justify-center text-[10px] text-white"
                  style={{ width: `${analysis.toneProfile.emotionalRange.negative}%` }}
                >
                  {analysis.toneProfile.emotionalRange.negative > 15 && 'Negative'}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Narrative Style */}
        <Section id="narrative" title="Narrative Voice" icon={Eye}>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-stone-800/50 rounded-lg">
              <p className="text-xs text-stone-500 mb-1">POV</p>
              <p className="text-sm text-stone-200 capitalize">{analysis.narrativeStyle.preferredPOV.replace('-', ' ')}</p>
            </div>
            <div className="p-3 bg-stone-800/50 rounded-lg">
              <p className="text-xs text-stone-500 mb-1">Narrative Distance</p>
              <p className="text-sm text-stone-200 capitalize">{analysis.narrativeStyle.narrativeDistance}</p>
            </div>
            <div className="p-3 bg-stone-800/50 rounded-lg">
              <p className="text-xs text-stone-500 mb-1">Interiority</p>
              <p className="text-sm text-stone-200 capitalize">{analysis.narrativeStyle.interiorityLevel}</p>
            </div>
            <div className="p-3 bg-stone-800/50 rounded-lg">
              <p className="text-xs text-stone-500 mb-1">Description Style</p>
              <p className="text-sm text-stone-200 capitalize">{analysis.narrativeStyle.descriptionStyle}</p>
            </div>
          </div>
        </Section>

        {/* Dialogue Style */}
        {analysis.dialogueStyle && (
          <Section id="dialogue" title="Dialogue Style" icon={MessageSquare}>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Tag Style</p>
                <p className="text-sm text-stone-200 capitalize">{analysis.dialogueStyle.tagStyle}</p>
              </div>
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">"Said" Usage</p>
                <p className="text-sm text-stone-200">{analysis.dialogueStyle.saidPercentage}%</p>
              </div>
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Voice Differentiation</p>
                <p className="text-sm text-stone-200 capitalize">{analysis.dialogueStyle.voiceDifferentiation}</p>
              </div>
              <div className="p-3 bg-stone-800/50 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Subtext Level</p>
                <p className="text-sm text-stone-200">{analysis.dialogueStyle.subTextHeaviness}/10</p>
              </div>
            </div>
          </Section>
        )}

        {/* Signatures */}
        <Section id="signatures" title="Unique Signatures" icon={Sparkles}>
          <div className="space-y-4">
            {analysis.signatures.distinguishingFeatures.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 font-medium mb-2">Distinguishing Features</p>
                <ul className="space-y-1">
                  {analysis.signatures.distinguishingFeatures.map((feature, i) => (
                    <li key={i} className="text-sm text-stone-300 flex items-start gap-2">
                      <span className="text-violet-400 mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.signatures.signaturePhrases.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 font-medium mb-2">Signature Phrases</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.signatures.signaturePhrases.map((phrase, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded italic"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.signatures.notableAbsences.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 font-medium mb-2">What You Avoid</p>
                <ul className="space-y-1">
                  {analysis.signatures.notableAbsences.map((absence, i) => (
                    <li key={i} className="text-sm text-stone-400 flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      {absence}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>

        {/* Similar Authors */}
        {analysis.similarAuthors && analysis.similarAuthors.length > 0 && (
          <Section id="similar" title="Similar Authors" icon={User}>
            <div className="space-y-3">
              {analysis.similarAuthors.map((author, i) => (
                <div key={i} className="p-3 bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-200">{author.authorName}</span>
                    <span className="text-xs font-mono text-violet-400">{author.similarityScore}% match</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {author.sharedTraits.map((trait, j) => (
                      <span key={j} className="px-2 py-0.5 bg-stone-700/50 text-stone-400 text-xs rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-stone-800 space-y-3">
        <button
          onClick={() => onUseVoice(profile.id)}
          className="w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Write with This Voice
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopyStyleGuide}
            className="flex-1 py-2 px-3 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Style Guide'}
          </button>
          
          {onRetrain && (
            <button
              onClick={() => onRetrain(profile.id)}
              className="py-2 px-3 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(profile.id)}
              className="py-2 px-3 rounded-lg text-sm text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
