import React, { useState } from 'react';
import { IODeviceItem, IODeviceType } from '../types/game';
import { IO_DEVICES_CATALOG } from '../data/hardwareData';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface IODeviceGameProps {
  onAwardXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const IODeviceGame: React.FC<IODeviceGameProps> = ({ onAwardXp, onUnlockBadge }) => {
  const [deck, setDeck] = useState<IODeviceItem[]>(() => [...IO_DEVICES_CATALOG].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    device: IODeviceItem;
    explanation: string;
  } | null>(null);

  const isCompleted = currentIndex >= deck.length;
  const currentItem = deck[currentIndex];

  const handleClassify = (chosenCategory: IODeviceType) => {
    if (!currentItem) return;

    const isCorrect = currentItem.category === chosenCategory;

    if (isCorrect) {
      sounds.playSuccess();
      const points = 100 + streak * 25;
      const nextScore = score + points;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);
      onAwardXp(points, `Correctly categorized ${currentItem.name}`);

      if (nextScore >= 1000) {
        onUnlockBadge('badge_io_detective');
      }

      setLastFeedback({
        correct: true,
        device: currentItem,
        explanation: `Correct! ${currentItem.name} is ${chosenCategory.toUpperCase()}. Signal flow: ${currentItem.signalDirection}.`,
      });
    } else {
      sounds.playError();
      setStreak(0);
      setLastFeedback({
        correct: false,
        device: currentItem,
        explanation: `Not quite. ${currentItem.name} is ${currentItem.category.toUpperCase()}, because signal flows: ${currentItem.signalDirection}.`,
      });
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    if (nextIndex >= deck.length) {
      confetti({ particleCount: 75, spread: 65 });
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setDeck([...IO_DEVICES_CATALOG].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setLastFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Interactive Peripheral Sorter</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Input vs Output vs Hybrid Device Arcade
          </h1>
          <p className="text-xs text-slate-400">
            Analyze hardware signal paths and sort peripherals into Input, Output, Hybrid (Bidirectional), or Internal Processing.
          </p>
        </div>

        {/* Score & Streak Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Total Score</div>
            <div className="text-base font-bold text-cyan-400 font-mono">{score} pts</div>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Streak</div>
            <div className="text-base font-bold text-yellow-400 font-mono">
              {streak > 0 ? `${streak}x 🔥` : '0x'}
            </div>
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Device Card to classify */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  Device {currentIndex + 1} of {deck.length}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Port: {currentItem.interfacePort}
                </span>
              </div>

              <div className="pt-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {currentItem.name}
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {currentItem.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <strong className="text-slate-200">Real-World Application: </strong>
                {currentItem.realWorldUse}
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200">
                <strong className="text-cyan-400">Signal Vector Hint: </strong>
                {currentItem.signalDirection}
              </div>
            </div>

            {/* Last Item Feedback Card */}
            {lastFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  lastFeedback.correct
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-800 text-rose-200'
                }`}
              >
                {lastFeedback.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{lastFeedback.explanation}</div>
                </div>
              </div>
            )}
          </div>

          {/* 4 Classification Buttons / Drop Targets */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Bucket */}
            <button
              onClick={() => handleClassify('input')}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between h-44 shadow-lg hover:shadow-cyan-500/10"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Input Device
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sends user actions, keystrokes, audio, or scan data inward to the PC.
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyan-400/80 font-semibold">
                User → Computer
              </div>
            </button>

            {/* Output Bucket */}
            <button
              onClick={() => handleClassify('output')}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-400 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between h-44 shadow-lg hover:shadow-emerald-500/10"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Output Device
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Presents processed calculations to eyes, ears, or physical paper.
                </p>
              </div>
              <div className="text-[11px] font-mono text-emerald-400/80 font-semibold">
                Computer → Senses
              </div>
            </button>

            {/* Hybrid Bucket */}
            <button
              onClick={() => handleClassify('hybrid')}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-400 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between h-44 shadow-lg hover:shadow-purple-500/10"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Hybrid (Dual I/O)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Combines bidirectional input and output in a single peripheral.
                </p>
              </div>
              <div className="text-[11px] font-mono text-purple-400/80 font-semibold">
                Bidirectional Flow
              </div>
            </button>

            {/* Processing / Storage */}
            <button
              onClick={() => handleClassify('processing_storage')}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between h-44 shadow-lg hover:shadow-amber-500/10"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Processing & Storage
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Internal core compute or flash storage, not an external human peripheral.
                </p>
              </div>
              <div className="text-[11px] font-mono text-amber-400/80 font-semibold">
                Internal Bus / Compute
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Completed Screen */
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Classification Run Completed!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              You tested your hardware peripheral knowledge across all input, output, hybrid, and processing devices.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{score}</div>
              <div className="text-xs text-slate-400">Total Points Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 font-mono">{streak}x</div>
              <div className="text-xs text-slate-400">Best Streak</div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again & Shuffle Devices</span>
          </button>
        </div>
      )}
    </div>
  );
};
