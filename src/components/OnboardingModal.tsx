import React, { useState } from 'react';
import { LearnerProfile } from '../types/game';
import { User, ShieldCheck, Trophy, Sparkles, X } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LearnerProfile;
  onSaveProfile: (updated: LearnerProfile) => void;
  isInitial?: boolean;
}

const TITLES = [
  'Novice Tinkerer',
  'Hardware Apprentice',
  'Silicon Architect',
  'Master Rig Builder',
  'Systems Specialist',
];

const AVATARS = ['⚡', '🔧', '💻', '🚀', '🧠', '🛡️'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isInitial = false,
}) => {
  const [name, setName] = useState(profile.name || 'Alex Mercer');
  const [title, setTitle] = useState(profile.title || TITLES[0]);
  const [avatar, setAvatar] = useState(profile.avatar || AVATARS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    onSaveProfile({
      ...profile,
      name: name.trim() || 'Alex Mercer',
      title,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {!isInitial && (
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-3 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Learner Registration</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isInitial ? 'Begin Your Hardware Journey' : 'Technician Dossier'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Enter your name to personalize your workstation, official exam records, badges, and downloadable certificate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Learner Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kapil Narula"
                required
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium"
              />
              <User className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This exact name will be engraved onto your printable Certificate of Mastery and badges.
            </p>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Technician Crest
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(item => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    sounds.playClick();
                    setAvatar(item);
                  }}
                  className={`h-12 rounded-lg border text-xl flex items-center justify-center transition-all ${
                    avatar === item
                      ? 'bg-cyan-950/60 border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Title Rank Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Designation Title
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TITLES.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    sounds.playClick();
                    setTitle(t);
                  }}
                  className={`p-2.5 text-left rounded-lg border text-xs font-medium transition-all ${
                    title === t
                      ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Stats Overview if existing */}
          {!isInitial && (
            <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-base font-bold text-cyan-400 font-mono">{profile.xp}</div>
                <div className="text-[10px] text-slate-400 uppercase">XP Points</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-base font-bold text-yellow-400 font-mono">{profile.badges.length}</div>
                <div className="text-[10px] text-slate-400 uppercase">Badges Earned</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {profile.examScore !== null ? `${profile.examScore}%` : 'Pending'}
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Exam Score</div>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isInitial ? 'Enter RigCraft Simulation' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
