import React from 'react';
import { TabMode, LearnerProfile } from '../types/game';
import { Volume2, VolumeX, User, Award } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderNavProps {
  activeTab: TabMode;
  setActiveTab: (tab: TabMode) => void;
  profile: LearnerProfile;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenProfile: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  profile,
  isMuted,
  setIsMuted,
  onOpenProfile,
}) => {
  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('missions');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-xs font-mono font-black text-black">
            RC
          </span>
          RigCraft
        </button>

        {/* Zone 2: Clean 5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('assembly');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'assembly' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            PC Assembly
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('cables');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cables' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Wiring & Cables
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('io_devices');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'io_devices' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            I/O Device Sorter
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('quiz');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'quiz' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Certification Exam
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('certificate');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'certificate' ? 'text-yellow-400 font-semibold' : 'hover:text-yellow-400'
            }`}
          >
            <Award className="w-4 h-4 text-yellow-500" />
            Certificates & Badges
          </button>
        </nav>

        {/* Zone 3: Profile action & audio control */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Learner Pill-free profile action */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-mono">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                {profile.name}
              </div>
              <div className="text-[11px] font-mono text-cyan-400/90 leading-tight">
                {profile.xp} XP
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
