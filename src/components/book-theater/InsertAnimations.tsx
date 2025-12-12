'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { InsertAnimation, Confetti } from './hooks/useMicroInteractions';

// ============================================================================
// TEXT INSERTION POPUP
// ============================================================================

interface InsertPopupProps {
  animations: InsertAnimation[];
}

export function InsertPopup({ animations }: InsertPopupProps) {
  return (
    <>
      {animations.map(anim => (
        <div
          key={anim.id}
          className="fixed pointer-events-none z-[100]"
          style={{
            left: anim.position.x,
            top: anim.position.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className={cn(
            'px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium',
            'animate-in zoom-in-75 fade-in slide-in-from-bottom-2 duration-200',
            anim.type === 'insert' && 'bg-teal-500 text-white',
            anim.type === 'replace' && 'bg-blue-500 text-white',
            anim.type === 'generate' && 'bg-emerald-500 text-white'
          )}>
            <span className="flex items-center gap-1.5">
              {anim.type === 'insert' && '✨'}
              {anim.type === 'replace' && '🔄'}
              {anim.type === 'generate' && '✍️'}
              <span className="truncate max-w-[150px]">
                {anim.text.length > 20 
                  ? `+${anim.text.split(/\s+/).length} words`
                  : anim.text}
              </span>
            </span>
          </div>
          
          {/* Rising particles */}
          <div className="absolute inset-0 overflow-visible">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'absolute w-1.5 h-1.5 rounded-full',
                  anim.type === 'insert' && 'bg-teal-400',
                  anim.type === 'replace' && 'bg-blue-400',
                  anim.type === 'generate' && 'bg-emerald-400'
                )}
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  animation: `float-up 0.8s ease-out forwards`,
                  animationDelay: `${i * 50}ms`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>
      ))}
      
      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-40px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

// ============================================================================
// CONFETTI CELEBRATION
// ============================================================================

interface ConfettiOverlayProps {
  confetti: Confetti[];
  showSuccess: boolean;
}

export function ConfettiOverlay({ confetti, showSuccess }: ConfettiOverlayProps) {
  if (!showSuccess && confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Central success burst */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-emerald-500/20 animate-ping" />
        </div>
      )}

      {/* Confetti pieces */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            '--rotation': `${piece.rotation}deg`,
            '--color': piece.color,
          } as React.CSSProperties}
        >
          <div 
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            }}
          />
        </div>
      ))}

      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// TEXT GLOW HIGHLIGHT
// ============================================================================

interface TextHighlightProps {
  children: React.ReactNode;
  isActive: boolean;
  color?: 'teal' | 'emerald' | 'blue' | 'purple';
}

export function TextHighlight({ children, isActive, color = 'teal' }: TextHighlightProps) {
  const colorClasses = {
    teal: 'bg-teal-500/20 shadow-teal-500/30',
    emerald: 'bg-emerald-500/20 shadow-emerald-500/30',
    blue: 'bg-blue-500/20 shadow-blue-500/30',
    purple: 'bg-purple-500/20 shadow-purple-500/30',
  };

  return (
    <span className={cn(
      'relative transition-all duration-300',
      isActive && 'animate-pulse'
    )}>
      {isActive && (
        <span className={cn(
          'absolute inset-0 -mx-1 rounded',
          colorClasses[color],
          'shadow-lg animate-in fade-in zoom-in-95 duration-200'
        )} />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}

// ============================================================================
// WORD COUNT DELTA BADGE
// ============================================================================

interface WordCountDeltaProps {
  delta: number;
  className?: string;
  animate?: boolean;
}

export function WordCountDelta({ delta, className, animate = true }: WordCountDeltaProps) {
  if (delta === 0) return null;

  const isPositive = delta > 0;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      isPositive 
        ? 'bg-emerald-500/20 text-emerald-400' 
        : 'bg-amber-500/20 text-amber-400',
      animate && 'animate-in zoom-in-75 duration-200',
      className
    )}>
      {isPositive ? '+' : ''}{delta} words
    </span>
  );
}

// ============================================================================
// PULSE RING (for buttons after success)
// ============================================================================

interface PulseRingProps {
  isActive: boolean;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export function PulseRing({ isActive, color = 'teal', children, className }: PulseRingProps) {
  const colorClasses: Record<string, string> = {
    teal: 'ring-teal-500/50',
    emerald: 'ring-emerald-500/50',
    blue: 'ring-blue-500/50',
    purple: 'ring-purple-500/50',
    amber: 'ring-amber-500/50',
  };

  return (
    <div className={cn('relative', className)}>
      {isActive && (
        <span className={cn(
          'absolute inset-0 rounded-lg ring-4 animate-ping',
          colorClasses[color] || colorClasses.teal
        )} />
      )}
      {children}
    </div>
  );
}

// ============================================================================
// TYPING CURSOR
// ============================================================================

interface TypingCursorProps {
  isTyping: boolean;
  className?: string;
}

export function TypingCursor({ isTyping, className }: TypingCursorProps) {
  if (!isTyping) return null;

  return (
    <span className={cn(
      'inline-block w-0.5 h-5 bg-teal-400 animate-blink',
      className
    )}>
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </span>
  );
}

// ============================================================================
// SUCCESS CHECKMARK ANIMATION
// ============================================================================

interface SuccessCheckProps {
  show: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SuccessCheck({ show, size = 'md' }: SuccessCheckProps) {
  if (!show) return null;

  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const strokeSizes = {
    sm: 2,
    md: 2.5,
    lg: 3,
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizes[size],
      'animate-in zoom-in-50 duration-300'
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full"
      >
        {/* Circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#10b981"
          strokeWidth={strokeSizes[size]}
          fill="none"
          className="animate-draw-circle"
          style={{
            strokeDasharray: 63,
            strokeDashoffset: 63,
          }}
        />
        {/* Checkmark */}
        <path
          d="M7 13l3 3 7-7"
          stroke="#10b981"
          strokeWidth={strokeSizes[size]}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-draw-check"
          style={{
            strokeDasharray: 20,
            strokeDashoffset: 20,
          }}
        />
      </svg>
      
      <style jsx>{`
        @keyframes draw-circle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-circle {
          animation: draw-circle 0.4s ease-out forwards;
        }
        .animate-draw-check {
          animation: draw-check 0.3s ease-out 0.3s forwards;
        }
      `}</style>
    </div>
  );
}
