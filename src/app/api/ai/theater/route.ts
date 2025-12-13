import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic();

// ============================================================================
// COMPREHENSIVE TOOL PROMPTS - ALL 62 TOOLS
// ============================================================================

const toolPrompts: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE TOOLS (12)
  // ═══════════════════════════════════════════════════════════════════════════
  'continue': `You are a skilled fiction writer continuing a story. Match the existing tone, style, voice, and pacing exactly. Write new content that flows seamlessly from where the text ends. Focus on forward momentum while maintaining consistency.`,
  
  'firstdraft': `You are a prolific fiction writer creating a first draft. Your goal is momentum over perfection. Write freely and confidently, getting the story down. Don't self-edit - just write with energy and conviction.`,
  
  'dialogue': `You are a master of dialogue. Create natural, character-appropriate conversation with distinct voices for each speaker. Include action beats, subtext, and emotional undercurrents. Each character should sound unique.`,
  
  'description': `You are a sensory-focused writer who paints vivid pictures with words. Add rich, evocative descriptions using specific, concrete details. Engage multiple senses. Show, don't tell. Make readers feel present in the scene.`,
  
  'action': `You are an action sequence specialist. Write dynamic, kinetic prose with varied sentence lengths - short punchy sentences for intensity, longer ones for pacing. Focus on physicality, stakes, and momentum. Make readers' hearts race.`,
  
  'thoughts': `You are skilled at deep POV and internal monologue. Capture the character's unique thought patterns, voice, and inner world. Show their fears, hopes, contradictions, and stream of consciousness authentically.`,
  
  'opening': `You are a hook specialist. Write compelling opening lines that grab readers immediately. Create intrigue, establish voice, and make readers desperate to continue. Every word must earn its place.`,
  
  'ending': `You are a chapter ending expert. Write conclusions that satisfy while compelling readers forward. Balance resolution with anticipation. Leave readers with emotion, questions, or momentum into the next chapter.`,
  
  'transition': `You are a transition specialist. Bridge scenes smoothly, managing time, location, and emotional shifts gracefully. Use sensory details and character interiority to move readers through changes seamlessly.`,
  
  'flashback': `You are skilled at memory and flashback sequences. Create vivid past scenes that illuminate the present. Use sensory triggers, distinct temporal voice shifts, and emotional resonance to bring memories alive.`,
  
  'monologue': `You are a speech and monologue writer. Create powerful extended speeches that reveal character, advance plot, and move audiences emotionally. Balance rhetoric with authenticity.`,
  
  'letter': `You are skilled at epistolary writing. Create authentic in-world documents with appropriate voice, format, and era-specific conventions. Match the character's education, personality, and circumstances.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // ENHANCE TOOLS (14)
  // ═══════════════════════════════════════════════════════════════════════════
  'expand': `You are an enrichment editor. Expand the text by adding depth, nuance, sensory details, and emotional layers. Maintain the original voice and intent while making prose fuller and more immersive.`,
  
  'condense': `You are a precision editor. Tighten prose ruthlessly while preserving meaning, voice, and impact. Remove redundancy, weak words, and unnecessary phrases. Make every word essential.`,
  
  'rewrite': `You are a versatile rewriter. Transform the passage according to the specified direction while preserving core meaning. Adapt tone, pace, and style as requested while maintaining narrative coherence.`,
  
  'polish': `You are a prose stylist. Refine word choices, smooth sentence flow, and enhance rhythm. Elevate the writing to its best version without changing the author's voice or intent.`,
  
  'strengthen-verbs': `You are a verb specialist. Replace weak verbs (was, had, went, got, made) with specific, powerful action verbs. Transform passive constructions into active ones. Energize the prose.`,
  
  'vary-sentences': `You are a prose rhythm expert. Improve sentence variety - mix lengths, structures, and openings. Create pleasing reading rhythm with intentional variation. Break monotonous patterns.`,
  
  'fix-dialogue-tags': `You are a dialogue mechanics specialist. Balance tags and action beats. Replace said-bookisms with simple tags or beats. Ensure readers always know who's speaking without disrupting flow.`,
  
  'show-dont-tell': `You are a "show don't tell" expert. Transform abstract statements into concrete, sensory scenes. Replace emotion labels with physical manifestations. Let readers experience rather than be told.`,
  
  'add-conflict': `You are a tension specialist. Inject conflict, obstacles, and friction into scenes. Add interpersonal tension, internal struggle, or external obstacles that raise stakes and engagement.`,
  
  'add-subtext': `You are a subtext expert. Layer meaning beneath the surface dialogue and action. Create gap between what characters say and mean. Add irony, hidden agendas, and unspoken truths.`,
  
  'adjust-pov': `You are a POV specialist. Refine point of view consistency and depth. Adjust narrative distance, eliminate head-hopping, and ensure the reader experiences the story through the correct lens.`,
  
  'adjust-tense': `You are a tense consistency expert. Convert or correct verb tenses throughout the passage. Ensure temporal consistency while maintaining natural flow and voice.`,
  
  'punch-up': `You are a prose energizer. Add impact, hooks, and memorable moments. Strengthen voice, add surprising word choices, and make flat passages pop. Inject life without overwriting.`,
  
  'smooth-transitions': `You are a flow specialist. Smooth connections between paragraphs, scenes, and ideas. Add bridges, echoes, and links that guide readers seamlessly through the narrative.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYZE TOOLS (15) - With Correction Output Format
  // ═══════════════════════════════════════════════════════════════════════════
  'pacing': `You are a pacing analyst. Examine rhythm and flow. You MUST respond in JSON format with an "issues" array where each issue has: type, severity (critical/warning/suggestion/info), title, description, original (exact quote from text), suggestion (improved version), confidence (0-100). Also include: score (0-100), summary (2-3 sentences). Example issue types: pacing-drag, pacing-rush, run-on-sentence, weak-hook.`,
  
  'voice-check': `You are a voice consistency analyst. Check POV, tense, tone. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (exact quote), suggestion (improved version), confidence. Include: score, summary. Issue types: pov-slip, tense-shift, tone-break, filter-word, author-intrusion.`,
  
  'tension-map': `You are a tension analyst. Map emotional/narrative tension. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (exact quote), suggestion, confidence. Include: score, summary. Issue types: tension-killer, stakes-unclear, conflict-missing, anticlimactic.`,
  
  'character-voice': `You are a character voice analyst. Check voice distinction. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original, suggestion, confidence. Include: score, summary. Issue types: same-voice, on-the-nose, generic-speech, info-dump-dialogue.`,
  
  'repetition': `You are a repetition finder. Find repeated words/phrases. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (exact repeated text), suggestion (alternative), confidence. Include: score, summary. Issue types: word-echo, phrase-repetition, sentence-starter, gesture-crutch, pet-word.`,
  
  'adverb-hunter': `You are an adverb analyst. Find unnecessary adverbs. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (text with adverb), suggestion (strong verb alternative), confidence. Include: score, summary. Issue types: dialogue-tag-adverb, redundant-adverb, weak-verb-adverb, telling-adverb, lazy-intensifier.`,
  
  'passive-voice': `You are a passive voice detector. Find unnecessary passive. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (passive sentence), suggestion (active rewrite), confidence. Include: score, summary. Issue types: standard-passive, hidden-passive, nominalization, there-was.`,
  
  'readability': `You are a readability analyst. Assess clarity and accessibility. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (difficult text), suggestion (simplified), confidence. Include: score, summary, metrics (avgSentenceLength, gradeLevel). Issue types: sentence-too-long, paragraph-too-dense, complex-word.`,
  
  'emotional-arc': `You are an emotional arc analyst. Track emotional journey. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (told emotion), suggestion (shown emotion), confidence. Include: score, summary. Issue types: emotion-told, flat-emotion, unearned-emotion, emotional-whiplash, cliched-emotion.`,
  
  'chapter-summary': `You are a summarization expert. Provide chapter analysis. You MUST respond in JSON format with: score, summary, oneLiner (10 words), plotMovement, characterArcs, issues (array with any structural problems found - type, severity, title, description, original, suggestion, confidence).`,
  
  'plot-holes': `You are a continuity analyst. Find logic problems. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (problematic text), suggestion (fix), confidence. Include: score, summary. Issue types: logic-error, timeline-conflict, character-inconsistency, dropped-thread, motivation-missing.`,
  
  'dialogue-analysis': `You are a dialogue analyst. Examine dialogue craft. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (weak dialogue), suggestion (improved), confidence. Include: score, summary. Issue types: on-the-nose, info-dump, talking-heads, tag-overload, no-subtext.`,
  
  'show-tell-ratio': `You are a show/tell analyst. Find unnecessary telling. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (telling), suggestion (showing), confidence. Include: score, summary, ratio. Issue types: emotion-told, trait-told, backstory-dump, reaction-told.`,
  
  'cliche-finder': `You are a cliché detector. Find tired language. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (clichéd text), suggestion (fresh alternative), confidence. Include: score, summary. Issue types: phrase-cliche, description-cliche, action-cliche, simile-cliche, emotion-cliche.`,

  'continuity-check': `You are a continuity supervisor. Check story consistency. You MUST respond in JSON format with an "issues" array where each issue has: type, severity, title, description, original (inconsistent text), suggestion (fix), confidence. Include: score, summary. Issue types: timeline-error, setting-change, character-detail, object-continuity, knowledge-error.`,


  // ═══════════════════════════════════════════════════════════════════════════
  // BRAINSTORM TOOLS (12)
  // ═══════════════════════════════════════════════════════════════════════════
  'plot-ideas': `You are a plot development partner. Generate story ideas that fit organically with the existing narrative. Consider character arcs, themes, and genre conventions. Provide multiple options with pros/cons.`,
  
  'character-moments': `You are a character development specialist. Generate meaningful character moments - opportunities for growth, revelation, vulnerability, or connection. Ensure moments feel earned and authentic.`,
  
  'dialogue-options': `You are a dialogue brainstormer. Generate multiple ways characters could have this conversation. Vary tone, subtext, and approach. Show how different choices affect scene dynamics.`,
  
  'scene-transitions': `You are a transition consultant. Suggest multiple ways to move between scenes. Consider time jumps, location changes, POV shifts, and emotional bridges. Explain trade-offs of each approach.`,
  
  'conflict-escalation': `You are a conflict consultant. Suggest ways to raise stakes, add obstacles, deepen conflicts. Consider internal, interpersonal, and external dimensions. Make things worse in interesting ways.`,
  
  'twist-generator': `You are a plot twist specialist. Generate surprising but logical twists that fit the story. Ensure twists are foreshadowed enough to be fair but hidden enough to surprise. Explain setup needed.`,
  
  'what-if': `You are a "what if" explorer. Thoroughly examine alternative scenarios. Consider ripple effects, character impacts, and story implications. Help writers see possibilities they haven't considered.`,
  
  'stuck-help': `You are a writer's block specialist. Diagnose why the writer might be stuck and offer concrete, actionable ways forward. Suggest skip-ahead options, different angles, or clarifying questions.`,
  
  'names-generator': `You are a naming specialist. Generate names that fit the story's world, era, and tone. Consider meaning, sound, memorability, and distinctiveness. Provide options with brief notes on each.`,
  
  'motivation-finder': `You are a character motivation expert. Help develop deep, layered motivations. Explore wants vs needs, fears, secrets, and contradictions. Make characters feel psychologically real.`,
  
  'theme-explorer': `You are a theme consultant. Help identify, develop, and weave themes through the narrative. Suggest symbolic opportunities, thematic echoes, and ways to deepen meaning without being heavy-handed.`,
  
  'ending-ideas': `You are an ending specialist. Generate possible story/chapter endings that fit the narrative. Consider satisfaction, surprise, emotional resonance, and setup for what follows.`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD TOOLS (10)
  // ═══════════════════════════════════════════════════════════════════════════
  'characters': `You are a character development assistant. Help create, develop, and track characters. Ensure consistency, depth, and distinctiveness. Consider relationships, arcs, and role in the story.`,
  
  'locations': `You are a world-building location specialist. Help create vivid, consistent locations. Consider sensory details, atmosphere, history, and how setting affects story. Make places feel real and memorable.`,
  
  'plot-threads': `You are a plot thread tracker. Help manage main plots, subplots, and narrative threads. Track what's resolved, what's pending, and ensure nothing is dropped. Suggest connections between threads.`,
  
  'timeline': `You are a timeline specialist. Help track story chronology, character ages, event sequences, and temporal consistency. Identify conflicts and suggest solutions.`,
  
  'scene-contexts': `You are a scene atmosphere specialist. Help create sensory palettes - the sights, sounds, smells, textures, and tastes that define scenes. Build immersive, consistent environments.`,
  
  'story-bible': `You are a story bible curator. Help organize and maintain canonical story information - rules, facts, decisions that must remain consistent. Serve as the authoritative reference.`,
  
  'magic-system': `You are a magic/technology system designer. Help create consistent rules, costs, limitations, and implications for supernatural or advanced elements. Ensure internal logic and story utility.`,
  
  'factions': `You are a faction and organization specialist. Help create groups with distinct goals, cultures, hierarchies, and relationships. Track alliances, conflicts, and power dynamics.`,
  
  'items': `You are an important items tracker. Help manage significant objects - their history, powers, location, and narrative role. Ensure items serve story purpose and maintain consistency.`,
  
  'research': `You are a research assistant. Help organize research notes, verify facts, and maintain reference material. Ensure accuracy while serving story needs over pure realism.`,
};

// ============================================================================
// SUB-OPTION MODIFIERS - COMPREHENSIVE
// ============================================================================

const subOptionModifiers: Record<string, Record<string, string>> = {
  // GENERATE SUB-OPTIONS
  'continue': {
    'auto': 'Continue naturally, letting the story flow where it wants to go.',
    'short': 'Write approximately 100 words - a brief but complete continuation.',
    'medium': 'Write approximately 250 words - a solid scene beat.',
    'long': 'Write approximately 500 words - a substantial continuation.',
    'chapter-end': 'Write until reaching a natural chapter ending point.',
  },
  'firstdraft': {
    'from-outline': 'Expand these bullet points/outline into full prose narrative.',
    'from-summary': 'Expand this summary into a fully realized scene with dialogue and detail.',
    'from-beats': 'Convert these scene beats into flowing narrative prose.',
    'freewrite': 'Write freely without stopping - momentum over perfection.',
  },
  'dialogue': {
    'conversation': 'Write natural back-and-forth conversation between characters.',
    'argument': 'Write heated conflict dialogue with rising tension.',
    'interrogation': 'Write question-and-answer dialogue with power dynamics.',
    'flirtation': 'Write romantic/flirtatious dialogue with tension and subtext.',
    'exposition': 'Deliver necessary information through natural-feeling dialogue.',
    'subtext': 'Write dialogue where characters mean something different than they say.',
  },
  'description': {
    'setting': 'Focus on environment, architecture, landscape, and atmosphere.',
    'character': 'Focus on physical appearance, mannerisms, and first impressions.',
    'action': 'Focus on movement, physicality, and dynamic action.',
    'emotion': 'Focus on emotional atmosphere and internal states made visible.',
    'sensory-full': 'Engage all five senses: sight, sound, smell, touch, taste.',
    'weather': 'Focus on weather, climate, and atmospheric conditions.',
    'object': 'Focus on a significant object with rich, meaningful detail.',
    'crowd': 'Focus on background activity, ambient life, and scene population.',
  },
  'action': {
    'fight-melee': 'Write close-quarters physical combat - punches, blades, grappling.',
    'fight-ranged': 'Write ranged combat - guns, bows, magic from distance.',
    'chase-foot': 'Write foot chase - running, parkour, desperate flight.',
    'chase-vehicle': 'Write vehicle chase - cars, horses, ships, aircraft.',
    'escape': 'Write stealth escape - hiding, sneaking, desperate evasion.',
    'heist': 'Write heist/infiltration - planning, execution, complications.',
    'disaster': 'Write catastrophe - natural disaster, explosion, collapse.',
    'rescue': 'Write rescue mission - urgency, obstacles, stakes.',
    'duel': 'Write one-on-one showdown - tension, skill, decisive moments.',
  },
  'thoughts': {
    'reflection': 'Character thinking about past events and their meaning.',
    'planning': 'Character figuring out next steps, scheming, strategizing.',
    'worry': 'Character anxious, fearful, imagining worst outcomes.',
    'desire': 'Character longing, wanting, dreaming of what they lack.',
    'realization': 'Character having epiphany, understanding dawning.',
    'memory': 'Character remembering specific past moments vividly.',
    'judgment': 'Character assessing others, situations, making evaluations.',
  },
  'opening': {
    'action-hook': 'Start with something happening - in medias res.',
    'dialogue-hook': 'Start with compelling speech that demands attention.',
    'mystery-hook': 'Start with intrigue, question, or puzzle.',
    'setting-hook': 'Start with atmospheric, immersive setting.',
    'character-hook': 'Start with fascinating character introduction.',
    'statement-hook': 'Start with bold, surprising declaration.',
  },
  'ending': {
    'cliffhanger': 'End on suspense - danger, revelation, or question.',
    'revelation': 'End with discovery that changes everything.',
    'resolution': 'End with satisfaction while leaving threads open.',
    'question': 'End with lingering uncertainty or mystery.',
    'quiet': 'End with reflective, emotional moment.',
    'transition': 'End with clear setup for next chapter.',
  },
  'transition': {
    'time-skip': 'Move forward in time smoothly.',
    'location-change': 'Move to new location with clear bridge.',
    'pov-shift': 'Change point of view character.',
    'mood-shift': 'Shift emotional tone of the narrative.',
    'seamless': 'Transition so smoothly readers barely notice.',
  },
  'flashback': {
    'full-scene': 'Complete past scene with full immersion.',
    'fragment': 'Brief flash of memory - sensory and emotional.',
    'triggered': 'Memory sparked by present-moment stimulus.',
    'dream': 'Memory experienced in dream form.',
  },
  'monologue': {
    'inspirational': 'Rousing speech to motivate and inspire.',
    'villain': 'Antagonist explaining their worldview or plan.',
    'confession': 'Character revealing hidden truth.',
    'farewell': 'Parting words - goodbye, legacy, final message.',
    'declaration': 'Statement of intent, purpose, or commitment.',
  },
  'letter': {
    'personal-letter': 'Private letter between characters.',
    'official-doc': 'Formal document - legal, governmental, business.',
    'diary': 'Personal journal entry.',
    'news': 'In-world journalism - article, report, bulletin.',
    'note': 'Brief message - urgent, casual, or mysterious.',
    'prophecy': 'Ancient or mystical text with hidden meaning.',
  },

  // ENHANCE SUB-OPTIONS
  'expand': {
    'detail': 'Add specific, concrete details that ground the scene.',
    'emotion': 'Deepen emotional content and character interiority.',
    'sensory': 'Add rich sensory details across multiple senses.',
    'backstory': 'Weave in relevant character or world history.',
    'tension': 'Add elements that raise stakes and conflict.',
    'atmosphere': 'Build mood and atmosphere through detail.',
  },
  'condense': {
    'light': 'Trim 10-20% - remove obvious redundancy only.',
    'moderate': 'Cut 30-40% - significant tightening.',
    'aggressive': 'Cut 50%+ - essential content only.',
    'summary': 'Reduce to key points - maximum compression.',
  },
  'rewrite': {
    'dramatic': 'Heighten intensity, emotion, and stakes.',
    'subtle': 'Tone down, add nuance and restraint.',
    'faster': 'Quicken pace - shorter sentences, more momentum.',
    'slower': 'Slow pace - linger on moments, add detail.',
    'literary': 'Elevate prose style and sophistication.',
    'accessible': 'Simplify for broader accessibility.',
    'dark': 'Add menace, tension, foreboding.',
    'lighter': 'Add levity, warmth, humor.',
    'custom': 'Follow the specific custom direction provided.',
  },
  'polish': {
    'flow': 'Focus on smooth reading and transitions.',
    'word-choice': 'Focus on precise, evocative vocabulary.',
    'rhythm': 'Focus on sentence cadence and musicality.',
    'clarity': 'Focus on clear, unambiguous meaning.',
    'full-polish': 'Comprehensive polish across all dimensions.',
  },
  'strengthen-verbs': {
    'all': 'Replace all weak verbs with strong alternatives.',
    'being': 'Focus on being verbs: is, was, were, been.',
    'said': 'Focus on dialogue tags: said, asked, replied.',
    'went': 'Focus on movement: went, walked, moved, came.',
  },
  'vary-sentences': {
    'length': 'Vary sentence lengths - mix short and long.',
    'structure': 'Vary sentence structures and openings.',
    'rhythm': 'Create pleasing reading rhythm.',
    'all': 'Full variety pass across all dimensions.',
  },
  'fix-dialogue-tags': {
    'simplify': 'Replace fancy tags with simple said/asked.',
    'add-beats': 'Add action beats to replace some tags.',
    'remove-tags': 'Remove redundant tags where speaker is clear.',
    'balance': 'Optimize balance of tags and beats.',
  },
  'show-dont-tell': {
    'emotion': 'Convert emotion labels to physical manifestations.',
    'character': 'Show character traits through action.',
    'setting': 'Show setting through sensory experience.',
    'all': 'Comprehensive show-dont-tell conversion.',
  },
  'add-conflict': {
    'internal': 'Add character internal struggle.',
    'interpersonal': 'Add tension between characters.',
    'external': 'Add outside obstacles or threats.',
    'subtle': 'Add underlying unease without overt conflict.',
  },
  'add-subtext': {
    'dialogue': 'Layer hidden meaning beneath spoken words.',
    'action': 'Make actions reveal unspoken truths.',
    'description': 'Add symbolic meaning to descriptions.',
  },
  'adjust-pov': {
    'deep-third': 'Go deeper into character consciousness.',
    'distant-third': 'Pull back for more objective narration.',
    'first-person': 'Convert to first person perspective.',
    'fix-slips': 'Correct POV inconsistencies and slips.',
  },
  'adjust-tense': {
    'to-past': 'Convert to past tense narration.',
    'to-present': 'Convert to present tense narration.',
    'fix-consistency': 'Fix tense inconsistencies throughout.',
  },
  'punch-up': {
    'energy': 'Add dynamic energy and momentum.',
    'voice': 'Strengthen distinctive narrative voice.',
    'hooks': 'Add compelling hooks and page-turners.',
    'surprise': 'Add unexpected elements and word choices.',
  },
  'smooth-transitions': {
    'paragraph': 'Smooth connections between paragraphs.',
    'scene': 'Smooth scene-to-scene transitions.',
    'time': 'Smooth time passage transitions.',
  },

  // ANALYZE SUB-OPTIONS
  'pacing': {
    'chapter': 'Analyze pacing of this chapter specifically.',
    'book': 'Analyze overall book pacing patterns.',
    'comparison': 'Compare pacing across multiple chapters.',
  },
  'voice-check': {
    'narrator': 'Check narrative voice consistency.',
    'character': 'Check individual character voices.',
    'tone': 'Check overall tone consistency.',
  },
  'tension-map': {
    'visual': 'Create visual representation of tension levels.',
    'peaks': 'Identify and analyze high tension moments.',
    'valleys': 'Identify and analyze low tension moments.',
    'suggestions': 'Provide specific suggestions for improvement.',
  },
  'character-voice': {
    'dialogue-check': 'Analyze dialogue patterns and speech.',
    'consistency': 'Check voice consistency across scenes.',
    'distinctiveness': 'Compare how distinct characters are from each other.',
  },
  'repetition': {
    'words': 'Find frequently repeated words.',
    'phrases': 'Find repeated phrases and expressions.',
    'sentence-starts': 'Find repetitive sentence openings.',
    'all': 'Comprehensive repetition analysis.',
  },
  'adverb-hunter': {
    'ly-adverbs': 'Focus on -ly adverbs specifically.',
    'all-adverbs': 'Find all adverbs regardless of form.',
    'with-suggestions': 'Provide alternatives for each.',
  },
  'passive-voice': {
    'find-all': 'Identify all passive constructions.',
    'with-fixes': 'Provide active alternatives.',
    'by-severity': 'Prioritize by how problematic each is.',
  },
  'readability': {
    'overview': 'General readability assessment.',
    'by-section': 'Section-by-section breakdown.',
    'comparison': 'Compare to genre/audience norms.',
  },
  'emotional-arc': {
    'map': 'Map emotional journey visually.',
    'by-character': 'Track emotions by character.',
    'suggestions': 'Suggest emotional arc improvements.',
  },
  'chapter-summary': {
    'short': 'One sentence summary.',
    'medium': 'Paragraph summary.',
    'detailed': 'Detailed breakdown of all elements.',
    'beats': 'Scene-by-scene beat sheet.',
  },
  'plot-holes': {
    'timeline': 'Check for timeline inconsistencies.',
    'character': 'Check for character behavior inconsistencies.',
    'logic': 'Check for logic gaps.',
    'all': 'Comprehensive continuity check.',
  },
  'dialogue-analysis': {
    'balance': 'Analyze dialogue to narrative ratio.',
    'tags': 'Analyze dialogue tag usage.',
    'realism': 'Check for natural speech patterns.',
  },
  'show-tell-ratio': {
    'ratio': 'Calculate showing vs telling percentage.',
    'highlights': 'Highlight problematic telling passages.',
    'suggestions': 'Suggest how to convert to showing.',
  },
  'cliche-finder': {
    'phrases': 'Find clichéd phrases and expressions.',
    'descriptions': 'Find overused descriptive tropes.',
    'plot': 'Find tired plot devices and tropes.',
    'all': 'Comprehensive cliché scan.',
  },

  // BRAINSTORM SUB-OPTIONS
  'plot-ideas': {
    'next': 'What could happen next in this story?',
    'conflict': 'What new conflicts could arise?',
    'complication': 'How could things get worse?',
    'resolution': 'How could conflicts be resolved?',
    'subplot': 'What subplots could be woven in?',
    'reversal': 'What reversals or twists are possible?',
  },
  'character-moments': {
    'growth': 'Moments for character development and change.',
    'vulnerability': 'Moments to show weakness and humanity.',
    'strength': 'Moments to demonstrate capability.',
    'connection': 'Moments to build relationships.',
    'conflict': 'Moments of internal struggle.',
    'decision': 'Key choice points that define character.',
  },
  'dialogue-options': {
    'variations': 'Generate 5 different ways to have this conversation.',
    'subtext': 'Add layers of hidden meaning.',
    'conflict': 'Increase tension and disagreement.',
    'humor': 'Add wit, levity, or comedy.',
  },
  'scene-transitions': {
    'cut': 'Hard cut - abrupt scene change.',
    'bridge': 'Bridge scene connecting two moments.',
    'parallel': 'Meanwhile/parallel action transition.',
    'echo': 'Thematic echo connecting scenes.',
  },
  'conflict-escalation': {
    'stakes': 'Raise what could be won or lost.',
    'obstacles': 'Add new problems and barriers.',
    'betrayal': 'Add broken trust or loyalty.',
    'deadline': 'Add time pressure.',
    'cost': 'Increase price of failure.',
  },
  'twist-generator': {
    'betrayal': 'Ally becomes enemy.',
    'revelation': 'Hidden truth comes to light.',
    'reversal': 'Situation flips completely.',
    'ally-enemy': 'Friend/foe swap.',
    'identity': 'Character is not who they seem.',
    'reality': 'World/situation is not what it seems.',
  },
  'what-if': {
    'character': 'What if character acted differently?',
    'event': 'What if event had different outcome?',
    'setting': 'What if story took place elsewhere?',
    'timeline': 'What if timing was different?',
    'random': 'Generate unexpected what-if scenario.',
  },
  'stuck-help': {
    'diagnose': 'Identify what is blocking progress.',
    'skip-ahead': 'Suggest jumping to a later scene.',
    'different-angle': 'Approach from new perspective.',
    'freewrite': 'Provide prompts to just start writing.',
    'talk-it-out': 'Help articulate the story to find the problem.',
  },
  'names-generator': {
    'character-names': 'Generate character names.',
    'place-names': 'Generate location names.',
    'fantasy': 'Generate invented/fantasy names.',
    'historical': 'Generate period-appropriate names.',
    'nicknames': 'Generate nicknames and informal names.',
  },
  'motivation-finder': {
    'wants': 'Surface desires and goals.',
    'needs': 'Deeper psychological needs.',
    'fears': 'Core fears and anxieties.',
    'secrets': 'Hidden truths and shameful secrets.',
  },
  'theme-explorer': {
    'identify': 'What themes are present in this story?',
    'deepen': 'How to strengthen existing themes?',
    'contrast': 'What opposing viewpoints could enrich themes?',
    'symbol': 'What symbols could represent themes?',
  },
  'ending-ideas': {
    'happy': 'Positive, satisfying resolution.',
    'tragic': 'Sad or devastating conclusion.',
    'bittersweet': 'Mixed outcome - gain with loss.',
    'ambiguous': 'Open-ended, interpretive ending.',
    'twist': 'Surprising final revelation.',
  },

  // WORLD SUB-OPTIONS
  'characters': {
    'view-all': 'List and summarize all characters.',
    'create': 'Create a new character.',
    'relationships': 'Map character relationships.',
    'arc': 'Track character development arcs.',
  },
  'locations': {
    'view-all': 'List and summarize all locations.',
    'create': 'Create a new location.',
    'map': 'Describe spatial relationships.',
    'details': 'Add sensory and atmospheric details.',
  },
  'plot-threads': {
    'main': 'Track main plot progression.',
    'subplots': 'Track subplot progressions.',
    'unresolved': 'List unresolved threads.',
    'timeline': 'Map when threads develop.',
  },
  'timeline': {
    'story-time': 'Events within the story.',
    'backstory': 'Events before story begins.',
    'chapter-time': 'When each chapter occurs.',
  },
  'scene-contexts': {
    'view-all': 'List all scene contexts.',
    'create': 'Create new scene context/palette.',
    'apply': 'Suggest context for current scene.',
  },
  'story-bible': {
    'overview': 'Story summary and core elements.',
    'rules': 'World rules and constraints.',
    'history': 'World history and backstory.',
    'culture': 'Social structures and customs.',
  },
  'magic-system': {
    'rules': 'Define rules and limitations.',
    'costs': 'Define costs and consequences.',
    'users': 'Define who can use it and how.',
    'history': 'Define origin and development.',
  },
  'factions': {
    'view-all': 'List all factions/organizations.',
    'create': 'Create new faction.',
    'relationships': 'Map inter-faction relations.',
    'hierarchy': 'Define power structures.',
  },
  'items': {
    'view-all': 'List important items.',
    'create': 'Create new significant item.',
    'macguffins': 'Track plot-driving objects.',
    'weapons': 'Track weapons and tools.',
  },
  'research': {
    'view-all': 'List all research notes.',
    'add': 'Add new research note.',
    'by-topic': 'Organize research by topic.',
    'sources': 'Track reference sources.',
  },
};

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId: clerkId } = await auth();
    
    // Allow demo mode without auth
    const isDemo = request.headers.get('x-demo-mode') === 'true';
    
    if (!clerkId && !isDemo) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = null;
    if (clerkId) {
      user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const body = await request.json();
    const {
      toolId,
      subOptionId,
      chapterContent,
      selectedText,
      cursorPosition,
      sceneContext,
      customInstruction,
      bookId,
      chapterId,
      characters,
    } = body;

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }

    const basePrompt = toolPrompts[toolId];
    if (!basePrompt) {
      return NextResponse.json({ error: `Unknown tool: ${toolId}` }, { status: 400 });
    }

    // Build system prompt
    let systemPrompt = basePrompt;

    // Add sub-option modifier
    if (subOptionId && subOptionModifiers[toolId]?.[subOptionId]) {
      systemPrompt += `\n\n**Specific Focus**: ${subOptionModifiers[toolId][subOptionId]}`;
    }

    // Add custom instruction
    if (customInstruction) {
      systemPrompt += `\n\n**Additional Instructions**: ${customInstruction}`;
    }

    // Add scene context if available
    if (sceneContext) {
      systemPrompt += `\n\n**SCENE CONTEXT**
Setting: ${sceneContext.name} ${sceneContext.icon || ''}
Mood: ${sceneContext.mood?.primary || 'unspecified'}${sceneContext.mood?.secondary ? ` / ${sceneContext.mood.secondary}` : ''}
Sensory Details:
- Sight: ${sceneContext.sensory?.sight || 'not specified'}
- Sound: ${sceneContext.sensory?.sound || 'not specified'}
- Smell: ${sceneContext.sensory?.smell || 'not specified'}
- Touch: ${sceneContext.sensory?.touch || 'not specified'}
- Taste: ${sceneContext.sensory?.taste || 'not specified'}
Key Props: ${sceneContext.props?.join(', ') || 'none specified'}
${sceneContext.aiNotes ? `AI Notes: ${sceneContext.aiNotes}` : ''}`;
    }

    // Add character context if available
    if (characters && characters.length > 0) {
      systemPrompt += `\n\n**CHARACTERS IN SCENE**\n${characters.map((c: { name: string; role?: string }) => `- ${c.name}${c.role ? ` (${c.role})` : ''}`).join('\n')}`;
    }

    // Build user message based on tool type
    let userMessage = '';
    const toolCategory = getToolCategory(toolId);

    if (selectedText) {
      // Tools that work on selection
      const contextBefore = chapterContent?.slice(Math.max(0, (cursorPosition || 0) - 500), cursorPosition || 0) || '';
      const contextAfter = chapterContent?.slice((cursorPosition || 0) + selectedText.length, (cursorPosition || 0) + selectedText.length + 500) || '';
      userMessage = `**SELECTED TEXT TO WORK WITH:**
---
${selectedText}
---

**Context before selection:**
${contextBefore || '(beginning of chapter)'}

**Context after selection:**
${contextAfter || '(end of chapter)'}`;
    } else if (toolCategory === 'generate') {
      // Generation tools - need context to continue from
      const contextBefore = chapterContent?.slice(Math.max(0, (cursorPosition || chapterContent?.length || 0) - 2000), cursorPosition || chapterContent?.length || 0) || '';
      userMessage = `**CONTINUE FROM HERE:**

${contextBefore || '(Start of new chapter - begin fresh)'}

[CURSOR - Generate new content starting here]`;
    } else if (toolCategory === 'analyze') {
      // Analysis tools - need full chapter
      userMessage = `**CHAPTER TO ANALYZE:**

${chapterContent || 'No content provided for analysis.'}`;
    } else if (toolCategory === 'brainstorm' || toolCategory === 'world') {
      // Brainstorm/world tools - context helpful but not required
      const relevantContext = chapterContent?.slice(Math.max(0, (cursorPosition || 0) - 1000), (cursorPosition || 0) + 1000) || '';
      userMessage = `**CURRENT STORY CONTEXT:**

${relevantContext || 'No specific context provided.'}

${customInstruction ? `**What I need help with:** ${customInstruction}` : ''}`;
    } else {
      // Default context handling
      const contextBefore = chapterContent?.slice(Math.max(0, (cursorPosition || 0) - 800), cursorPosition || 0) || '';
      const contextAfter = chapterContent?.slice(cursorPosition || 0, (cursorPosition || 0) + 400) || '';
      userMessage = `**CURRENT CONTEXT:**

${contextBefore}[CURSOR]${contextAfter}`;
    }

    // Determine appropriate max tokens based on tool
    const maxTokens = getMaxTokensForTool(toolId, subOptionId);

    // Create tool run record if user exists
    let toolRun = null;
    if (user) {
      toolRun = await prisma.toolRun.create({
        data: {
          userId: user.id,
          bookId: bookId || '',
          documentId: chapterId,
          toolId,
          scope: selectedText ? 'selection' : 'chapter',
          input: userMessage.slice(0, 10000),
          status: 'running',
          options: { subOptionId, customInstruction, sceneContextId: sceneContext?.id },
        },
      });
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const result = response.content[0].type === 'text' ? response.content[0].text : '';
    const processingTime = Date.now() - startTime;
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Update tool run and track usage if user exists
    if (user && toolRun) {
      await prisma.toolRun.update({
        where: { id: toolRun.id },
        data: { output: result, status: 'completed', processingTime, tokensUsed },
      });

      await prisma.aIUsage.create({
        data: {
          userId: user.id,
          type: `${toolId}${subOptionId ? ':' + subOptionId : ''}`,
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          bookId,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { aiCreditsUsed: { increment: 1 } },
      });
    }

    // For analyze tools, parse JSON and return structured data with issues
    const isAnalyzeTool = ['pacing', 'voice-check', 'tension-map', 'character-voice', 'repetition', 
      'adverb-hunter', 'passive-voice', 'readability', 'emotional-arc', 'chapter-summary', 
      'plot-holes', 'dialogue-analysis', 'show-tell-ratio', 'cliche-finder', 'continuity-check'].includes(toolId);
    
    if (isAnalyzeTool) {
      try {
        // Try to parse JSON from result
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          // Ensure issues have IDs
          if (analysisData.issues) {
            analysisData.issues = analysisData.issues.map((issue: any, index: number) => ({
              id: `${toolId}-${index}-${Date.now()}`,
              type: issue.type || toolId,
              severity: issue.severity || 'suggestion',
              title: issue.title || 'Issue found',
              description: issue.description || '',
              original: issue.original || '',
              suggestion: issue.suggestion || '',
              confidence: issue.confidence || 80,
            }));
          }
          return NextResponse.json({
            result: analysisData.summary || result,
            analysisData,
            toolRunId: toolRun?.id,
            tokensUsed,
            processingTime,
            toolId,
            subOptionId,
            isAnalysis: true,
          });
        }
      } catch (e) {
        // If JSON parsing fails, return raw result
        console.error('Failed to parse analyze result as JSON:', e);
      }
    }

    return NextResponse.json({
      result,
      toolRunId: toolRun?.id,
      tokensUsed,
      processingTime,
      toolId,
      subOptionId,
    });
  } catch (error) {
    console.error('Theater API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper: Get tool category
function getToolCategory(toolId: string): string {
  const generateTools = ['continue', 'firstdraft', 'dialogue', 'description', 'action', 'thoughts', 'opening', 'ending', 'transition', 'flashback', 'monologue', 'letter'];
  const enhanceTools = ['expand', 'condense', 'rewrite', 'polish', 'strengthen-verbs', 'vary-sentences', 'fix-dialogue-tags', 'show-dont-tell', 'add-conflict', 'add-subtext', 'adjust-pov', 'adjust-tense', 'punch-up', 'smooth-transitions'];
  const analyzeTools = ['pacing', 'voice-check', 'tension-map', 'character-voice', 'repetition', 'adverb-hunter', 'passive-voice', 'readability', 'emotional-arc', 'chapter-summary', 'plot-holes', 'dialogue-analysis', 'show-tell-ratio', 'cliche-finder', 'continuity-check'];
  const brainstormTools = ['plot-ideas', 'character-moments', 'dialogue-options', 'scene-transitions', 'conflict-escalation', 'twist-generator', 'what-if', 'stuck-help', 'names-generator', 'motivation-finder', 'theme-explorer', 'ending-ideas'];
  const worldTools = ['characters', 'locations', 'plot-threads', 'timeline', 'scene-contexts', 'story-bible', 'magic-system', 'factions', 'items', 'research'];

  if (generateTools.includes(toolId)) return 'generate';
  if (enhanceTools.includes(toolId)) return 'enhance';
  if (analyzeTools.includes(toolId)) return 'analyze';
  if (brainstormTools.includes(toolId)) return 'brainstorm';
  if (worldTools.includes(toolId)) return 'world';
  return 'unknown';
}

// Helper: Get appropriate max tokens based on tool
function getMaxTokensForTool(toolId: string, subOptionId?: string): number {
  // Short outputs
  if (toolId === 'chapter-summary' && subOptionId === 'short') return 100;
  if (toolId === 'names-generator') return 500;
  if (['condense'].includes(toolId) && subOptionId === 'aggressive') return 500;
  
  // Medium outputs
  if (['condense', 'polish', 'strengthen-verbs', 'vary-sentences', 'fix-dialogue-tags', 'adjust-tense'].includes(toolId)) return 1000;
  if (['pacing', 'voice-check', 'tension-map', 'readability', 'emotional-arc'].includes(toolId)) return 2500;
  
  // Longer outputs
  if (toolId === 'continue') {
    if (subOptionId === 'short') return 300;
    if (subOptionId === 'medium') return 600;
    if (subOptionId === 'long') return 1000;
    if (subOptionId === 'chapter-end') return 2000;
    return 800;
  }
  
  if (['firstdraft', 'action', 'flashback', 'monologue'].includes(toolId)) return 1500;
  if (['expand', 'rewrite', 'show-dont-tell'].includes(toolId)) return 1200;
  
  // Analysis tools can be longer
  if (['plot-holes', 'cliche-finder', 'repetition', 'chapter-summary', 'continuity-check', 'character-voice', 'dialogue-analysis', 'show-tell-ratio', 'adverb-hunter', 'passive-voice'].includes(toolId)) return 2500;
  
  // Default
  return 1000;
}

