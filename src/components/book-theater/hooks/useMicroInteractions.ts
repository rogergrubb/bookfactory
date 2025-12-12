'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type GenerationPhase = 
  | 'idle' 
  | 'thinking' 
  | 'writing' 
  | 'polishing' 
  | 'complete' 
  | 'error';

export interface GenerationProgress {
  phase: GenerationPhase;
  message: string;
  progress: number; // 0-100
  wordCount?: number;
}

export interface InsertAnimation {
  id: string;
  text: string;
  position: { x: number; y: number };
  type: 'insert' | 'replace' | 'generate';
}

// ============================================================================
// GENERATION PROGRESS HOOK
// ============================================================================

const phaseMessages: Record<GenerationPhase, string[]> = {
  idle: ['Ready'],
  thinking: [
    'Analyzing context...',
    'Understanding your story...',
    'Processing scene details...',
    'Reading between the lines...',
  ],
  writing: [
    'Crafting prose...',
    'Weaving words...',
    'Building sentences...',
    'Finding the right words...',
    'Composing narrative...',
  ],
  polishing: [
    'Adding final touches...',
    'Polishing prose...',
    'Refining language...',
    'Almost there...',
  ],
  complete: ['Done!', 'Complete!', 'Ready to insert!'],
  error: ['Something went wrong'],
};

export function useGenerationProgress() {
  const [progress, setProgress] = useState<GenerationProgress>({
    phase: 'idle',
    message: 'Ready',
    progress: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);

  const startGeneration = useCallback(() => {
    setProgress({ phase: 'thinking', message: phaseMessages.thinking[0], progress: 0 });
    messageIndexRef.current = 0;

    let currentProgress = 0;
    let currentPhase: GenerationPhase = 'thinking';

    intervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 8 + 2;
      
      // Phase transitions
      if (currentProgress >= 30 && currentPhase === 'thinking') {
        currentPhase = 'writing';
        messageIndexRef.current = 0;
      } else if (currentProgress >= 85 && currentPhase === 'writing') {
        currentPhase = 'polishing';
        messageIndexRef.current = 0;
      }

      // Slow down as we approach 95%
      if (currentProgress >= 90) {
        currentProgress = Math.min(currentProgress, 95);
      }

      // Cycle through messages
      const messages = phaseMessages[currentPhase];
      messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;

      setProgress({
        phase: currentPhase,
        message: messages[messageIndexRef.current],
        progress: Math.min(currentProgress, 95),
      });
    }, 400);
  }, []);

  const completeGeneration = useCallback((wordCount?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress({
      phase: 'complete',
      message: phaseMessages.complete[Math.floor(Math.random() * phaseMessages.complete.length)],
      progress: 100,
      wordCount,
    });

    // Reset after celebration
    setTimeout(() => {
      setProgress({ phase: 'idle', message: 'Ready', progress: 0 });
    }, 2000);
  }, []);

  const errorGeneration = useCallback((message?: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress({
      phase: 'error',
      message: message || 'Something went wrong',
      progress: 0,
    });
  }, []);

  const resetGeneration = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress({ phase: 'idle', message: 'Ready', progress: 0 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    progress,
    startGeneration,
    completeGeneration,
    errorGeneration,
    resetGeneration,
    isGenerating: progress.phase !== 'idle' && progress.phase !== 'complete' && progress.phase !== 'error',
  };
}

// ============================================================================
// INSERT ANIMATION HOOK
// ============================================================================

export function useInsertAnimation() {
  const [animations, setAnimations] = useState<InsertAnimation[]>([]);

  const triggerInsert = useCallback((
    text: string, 
    position: { x: number; y: number },
    type: 'insert' | 'replace' | 'generate' = 'insert'
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    setAnimations(prev => [...prev, { id, text, position, type }]);

    // Remove after animation completes
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, 1000);

    return id;
  }, []);

  return { animations, triggerInsert };
}

// ============================================================================
// SUCCESS CELEBRATION HOOK
// ============================================================================

export interface Confetti {
  id: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export function useSuccessCelebration() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const celebrate = useCallback((intensity: 'light' | 'medium' | 'burst' = 'medium') => {
    const colors = ['#14b8a6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const count = intensity === 'light' ? 8 : intensity === 'medium' ? 16 : 30;
    
    const newConfetti: Confetti[] = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
    }));

    setConfetti(newConfetti);
    setShowSuccess(true);

    setTimeout(() => {
      setConfetti([]);
      setShowSuccess(false);
    }, 1500);
  }, []);

  return { confetti, showSuccess, celebrate };
}

// ============================================================================
// TYPEWRITER EFFECT HOOK
// ============================================================================

export function useTypewriter(text: string, enabled: boolean = true, speed: number = 20) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  const skipToEnd = useCallback(() => {
    setDisplayText(text);
    setIsComplete(true);
  }, [text]);

  return { displayText, isComplete, skipToEnd };
}

// ============================================================================
// HAPTIC/SOUND FEEDBACK (visual only since we can't do real haptics)
// ============================================================================

export function useFeedback() {
  const [pulse, setPulse] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerSuccess = useCallback(() => {
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  }, []);

  const triggerError = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  return { pulse, shake, triggerSuccess, triggerError };
}

// ============================================================================
// WORD COUNT ANIMATION
// ============================================================================

export function useWordCountAnimation(targetCount: number, duration: number = 500) {
  const [displayCount, setDisplayCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startCountRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    startCountRef.current = displayCount;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.round(
        startCountRef.current + (targetCount - startCountRef.current) * eased
      );
      
      setDisplayCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetCount, duration]);

  return displayCount;
}
