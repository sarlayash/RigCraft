import React from 'react';
import { LearnerProfile, TabMode } from '../types/game';
import { sounds } from '../utils/soundEffects';
import {
  Wrench,
  Zap,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Trophy,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface MissionHubProps {
  profile: LearnerProfile;
  setActiveTab: (tab: TabMode) => void;
  onOpenProfile: () => void;
}

export const MissionHub: React.FC<MissionHubProps> = ({
  profile,
  setActiveTab,
  onOpenProfile,
}) => {
  const missions = [
    {
      id: 'assembly',
      tab: 'assembly' as TabMode,
      title: 'PC Assembly Workshop',
      tag: 'Hands-On Engineering',
      desc: 'Seat the CPU with Zero Insertion Force, apply thermal compound, mount the heatsink, and snap dual-channel DDR5 RAM into place.',
      xp: '+300 XP',
      icon: Cpu,
      color: 'from-cyan-500/20 to-blue-600/20',
      borderColor: 'border-cyan-500/40',
      actionText: 'Enter Workshop',
    },
    {
      id: 'cables',
      tab: 'cables' as TabMode,
      title: 'Wiring & Port Connection Lab',
      tag: 'Cables & Signal Integrity',
      desc: 'Wire 24-Pin ATX and PCIe power cables. Learn why plugging HDMI into the motherboard instead of the GPU is the classic beginner mistake.',
      xp: '+300 XP',
      icon: Zap,
      color: 'from-emerald-500/20 to-teal-600/20',
      borderColor: 'border-emerald-500/40',
      actionText: 'Launch Wiring Lab',
    },
    {
      id: 'io_devices',
      tab: 'io_devices' as TabMode,
      title: 'Input & Output Device Arcade',
      tag: 'Signal Direction & Classification',
      desc: 'Rapidly classify computer peripherals into Input, Output, Hybrid (Bidirectional), or Processing/Storage. Build combos and unlock achievements.',
      xp: '+250 XP',
      icon: Layers,
      color: 'from-purple-500/20 to-indigo-600/20',
      borderColor: 'border-purple-500/40',
      actionText: 'Play Sorter Game',
    },
    {
      id: 'quiz',
      tab: 'quiz' as TabMode,
      title: 'Certification Examination',
      tag: 'Accreditation',
      desc: 'Take the comprehensive 10-question hardware test. Score 80%+ to unlock your official high-resolution Certificate of Mastery and gold seal.',
      xp: '+500 XP',
      icon: Award,
      color: 'from-amber-500/20 to-yellow-600/20',
      borderColor: 'border-amber-500/40',
      actionText: 'Start Assessment',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="text-base">{profile.avatar}</span>
            <span className="uppercase tracking-wider">Technician Terminal · {profile.title}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to RigCraft, <span className="text-cyan-400">{profile.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your comprehensive interactive laboratory to assemble computers, perform safe electrical teardowns, wire rear I/O and internal power headers, master input/output classification, and earn verifiable certificates.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('assembly');
              }}
              className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <span>Begin Assembly Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onOpenProfile();
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Customize Profile
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Experience Points</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{profile.xp} XP</div>
          <div className="text-[10px] text-slate-500 mt-1">Level {Math.floor(profile.xp / 200) + 1} Architect</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Badges Earned</div>
          <div className="text-2xl font-bold text-yellow-400 font-mono mt-1">
            {profile.badges.length} / 6
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Downloadable PNGs</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Exam Credential</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {profile.examScore !== null ? `${profile.examScore}%` : 'Not Taken'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">80% Passing Mark</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Official Certificate</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {profile.examPassed ? 'Ready 🏅' : 'Locked'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">PNG & PDF Ready</div>
        </div>
      </div>

      {/* Core Interactive Missions Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Interactive Training Modules</h2>
          <p className="text-xs text-slate-400">
            Work through each hands-on simulator to build foundational and advanced computer systems expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.map(m => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`p-6 rounded-2xl bg-gradient-to-br ${m.color} bg-slate-900/90 border ${m.borderColor} shadow-xl flex flex-col justify-between gap-5 transition-all hover:scale-[1.01]`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {m.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{m.xp}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-white">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{m.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab(m.tab);
                    }}
                    className="py-2 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>{m.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Hardware Reference Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Golden Rules of PC Building & Safety</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <strong className="text-cyan-400 block mb-1">1. Standoffs First:</strong>
            Never screw a motherboard directly to bare case metal without standoffs, or solder contacts will short circuit and burn out traces.
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <strong className="text-emerald-400 block mb-1">2. Dedicated GPU Video:</strong>
            Always plug your monitor cable into the discrete graphics card outputs at the back, NOT the motherboard integrated port.
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <strong className="text-amber-400 block mb-1">3. Safe Teardown:</strong>
            Turn off power switch, unplug AC mains cord, and press power button once to drain leftover capacitor charges before touching parts.
          </div>
        </div>
      </div>
    </div>
  );
};
