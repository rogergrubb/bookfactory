// My Voice System - Main Export
// Train AI to write in your unique voice

// Types
export * from './types';

// Components
export { VoiceTraining } from './VoiceTraining';
export { VoiceProfileDisplay } from './VoiceProfileDisplay';
export { VoiceSelector, VoiceIntensity } from './VoiceSelector';

// Analyzer (for server-side use)
// export { analyzeVoice, generateVoicePrompt } from './voice-analyzer';

/*
 * MY VOICE SYSTEM
 * ===============
 * 
 * A comprehensive voice training and analysis system that goes far beyond
 * competitors like Sudowrite's "My Voice" feature.
 * 
 * KEY DIFFERENTIATORS:
 * 
 * 1. DEEP ANALYSIS (vs Sudowrite's surface-level)
 *    - 8 Style Dimensions (formality, density, directness, etc.)
 *    - Sentence structure patterns with variance analysis
 *    - Punctuation style profiling
 *    - Vocabulary sophistication metrics
 *    - Rhythm and pacing analysis
 *    - Tone and emotional range profiling
 *    - Dialogue style detection
 *    - Narrative voice characteristics
 *    - Unique signature detection
 * 
 * 2. QUANTITATIVE + QUALITATIVE
 *    - Local fast analysis for metrics (no API calls)
 *    - AI deep analysis for nuanced characteristics
 *    - Combined confidence scoring
 * 
 * 3. TRANSPARENT RESULTS
 *    - Users can SEE what was learned about their voice
 *    - Visual dimension bars and metrics
 *    - Similar author comparisons
 *    - Editable style guide
 * 
 * 4. ADJUSTABLE INTENSITY
 *    - Subtle: Light touch, more AI creativity
 *    - Balanced: Best of both worlds
 *    - Strong: Closely match trained voice
 * 
 * 5. CONTEXT-AWARE APPLICATION
 *    - Can adjust for scene type (action vs reflection)
 *    - Preserves meaning while transforming style
 *    - Optional POV/tense matching
 * 
 * USAGE:
 * 
 * 1. Training a new voice:
 *    <VoiceTraining 
 *      onTrainingComplete={(voiceId) => { ... }}
 *      existingChapters={chapters}
 *    />
 * 
 * 2. Viewing a trained voice:
 *    <VoiceProfileDisplay
 *      profile={voiceProfile}
 *      onUseVoice={(id) => setSelectedVoice(id)}
 *      onDelete={(id) => deleteVoice(id)}
 *    />
 * 
 * 3. Selecting a voice for writing:
 *    <VoiceSelector
 *      voices={myVoices}
 *      selectedVoiceId={currentVoice}
 *      onSelectVoice={setCurrentVoice}
 *      onCreateNew={() => setShowTraining(true)}
 *    />
 * 
 * 4. Adjusting voice intensity:
 *    <VoiceIntensity
 *      intensity={intensity}
 *      onChange={setIntensity}
 *    />
 * 
 * API ENDPOINTS:
 * 
 * POST /api/voice/train
 *   - Train a new voice from writing samples
 *   - Returns: { voiceId, name, confidence }
 * 
 * GET /api/voice
 *   - List all user's voice profiles
 *   - Returns: { voices: VoiceProfile[] }
 * 
 * GET /api/voice/[id]
 *   - Get single voice profile with samples
 * 
 * GET /api/voice/[id]/prompt
 *   - Get system prompt for AI generation
 * 
 * POST /api/voice/[id]/use
 *   - Log voice usage (increments counter)
 * 
 * DELETE /api/voice?id=xxx
 *   - Delete a voice profile
 * 
 * DATABASE:
 * 
 * VoiceProfile
 *   - Stores analysis results, prompts, usage stats
 * 
 * TrainingSample
 *   - Individual writing samples for a voice
 * 
 * VoiceUsageLog
 *   - Tracks when voices are used
 */
