import React, { useState } from 'react';
import { QuizQuestion } from '../types/game';
import { ASSESSMENT_QUESTIONS } from '../data/hardwareData';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

interface AssessmentQuizProps {
  onCompleteExam: (score: number, passed: boolean) => void;
  onAwardXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({
  onCompleteExam,
  onAwardXp,
  onUnlockBadge,
}) => {
  const [questions] = useState<QuizQuestion[]>(ASSESSMENT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex];
  const userChoice = selectedAnswers[currentQ.id];

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedCurrent) return;
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleConfirmAnswer = () => {
    if (userChoice === undefined) return;
    setHasSubmittedCurrent(true);

    if (userChoice === currentQ.correctIndex) {
      sounds.playSuccess();
      onAwardXp(30, `Answered Question ${currentIndex + 1} correctly`);
    } else {
      sounds.playError();
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setHasSubmittedCurrent(false);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      const percentage = Math.round((correctCount / questions.length) * 100);
      const passed = percentage >= 80;

      setIsFinished(true);
      onCompleteExam(percentage, passed);

      if (passed) {
        sounds.playSuccess();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        onUnlockBadge('badge_certified_master');
        onAwardXp(500, 'Passed Official RigCraft Certification Exam!');
      } else {
        sounds.playError();
      }
    }
  };

  const handleRetake = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setSelectedAnswers({});
    setHasSubmittedCurrent(false);
    setIsFinished(false);
  };

  // Calculate stats
  let totalCorrect = 0;
  questions.forEach(q => {
    if (selectedAnswers[q.id] === q.correctIndex) totalCorrect++;
  });
  const scorePercent = Math.round((totalCorrect / questions.length) * 100);
  const isPassed = scorePercent >= 80;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Award className="w-4 h-4" />
            <span>Formal Knowledge Evaluation</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Comprehensive Hardware Assessment Exam
          </h1>
          <p className="text-xs text-slate-400">
            Pass with 80% or higher to earn the Certified Systems Engineer credential and unlock your verified Certificate of Mastery.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Passing Grade: <strong className="text-emerald-400">80% (8/10)</strong>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-cyan-400">{currentQ.category}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.question}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = userChoice === optIdx;
                let optionStyle =
                  'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                if (hasSubmittedCurrent) {
                  if (optIdx === currentQ.correctIndex) {
                    optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                  } else if (isSelected) {
                    optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  } else {
                    optionStyle = 'bg-slate-950/50 border-slate-850 text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyle =
                    'bg-cyan-950/50 border-cyan-400 ring-1 ring-cyan-400 text-white';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3.5 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-700 font-mono text-xs text-slate-400 flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed flex-1">{option}</span>

                    {hasSubmittedCurrent && optIdx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {hasSubmittedCurrent && isSelected && optIdx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Callout once confirmed */}
            {hasSubmittedCurrent && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Pedagogical Rationale:
                </div>
                <p className="leading-relaxed text-slate-400">{currentQ.explanation}</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end">
              {!hasSubmittedCurrent ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={userChoice === undefined}
                  className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/10"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/10"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'Next Question' : 'View Exam Results'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2 ${
              isPassed
                ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950 border-rose-500 text-rose-400'
            }`}
          >
            {isPassed ? <Trophy className="w-10 h-10" /> : <HelpCircle className="w-10 h-10" />}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isPassed ? 'Exam Passed With Honors!' : 'Assessment Incomplete'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isPassed
                ? 'Congratulations! You demonstrated rigorous knowledge across assembly, cabling, and hardware architecture.'
                : 'You scored below the 80% passing threshold. Review the assembly workshop and cabling labs, then retake the exam.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-cyan-400 font-mono">{scorePercent}%</div>
              <div className="text-xs text-slate-400">Final Exam Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white font-mono">
                {totalCorrect} / {questions.length}
              </div>
              <div className="text-xs text-slate-400">Correct Responses</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Examination</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
