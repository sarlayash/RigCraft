import React, { useState, useEffect } from 'react';
import { TabMode, LearnerProfile, BadgeItem } from './types/game';
import { GAME_BADGES } from './data/hardwareData';
import { HeaderNav } from './components/HeaderNav';
import { MissionHub } from './components/MissionHub';
import { AssemblySimulator } from './components/AssemblySimulator';
import { CableLab } from './components/CableLab';
import { IODeviceGame } from './components/IODeviceGame';
import { AssessmentQuiz } from './components/AssessmentQuiz';
import { BadgesAndCertificate } from './components/BadgesAndCertificate';
import { OnboardingModal } from './components/OnboardingModal';
import { sounds } from './utils/soundEffects';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'rigcraft_learner_profile_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabMode>('missions');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Initialize or load profile from localStorage
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      name: 'Kapil Narula',
      title: 'Silicon Architect',
      avatar: '⚡',
      xp: 150,
      level: 1,
      completedMissions: [],
      badges: ['badge_first_boot'],
      examScore: null,
      examPassed: false,
      createdAt: new Date().toISOString(),
    };
  });

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    return GAME_BADGES.map(b => ({
      ...b,
      unlocked: profile.badges.includes(b.id),
    }));
  });

  // Check if first time launch to show welcoming onboarding modal
  useEffect(() => {
    const visited = localStorage.getItem('rigcraft_visited');
    if (!visited) {
      setIsFirstLaunch(true);
      setIsOnboardingOpen(true);
      localStorage.setItem('rigcraft_visited', 'true');
    }
  }, []);

  // Save profile changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // storage quota or incognito
    }
  }, [profile]);

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(prev => (prev === message ? null : prev));
    }, 3500);
  };

  const handleAwardXp = (amount: number, reason: string) => {
    setProfile(prev => {
      const nextXp = prev.xp + amount;
      const nextLevel = Math.floor(nextXp / 200) + 1;
      return {
        ...prev,
        xp: nextXp,
        level: nextLevel,
      };
    });
    showToast(`+${amount} XP: ${reason}`);
  };

  const handleUnlockBadge = (badgeId: string) => {
    setBadges(prev =>
      prev.map(b => (b.id === badgeId ? { ...b, unlocked: true } : b))
    );

    setProfile(prev => {
      if (prev.badges.includes(badgeId)) return prev;
      return {
        ...prev,
        badges: [...prev.badges, badgeId],
      };
    });

    const targetBadge = GAME_BADGES.find(b => b.id === badgeId);
    if (targetBadge) {
      showToast(`🏆 Badge Unlocked: ${targetBadge.name} (${targetBadge.title})!`);
    }
  };

  const handleCompleteExam = (score: number, passed: boolean) => {
    setProfile(prev => ({
      ...prev,
      examScore: score,
      examPassed: passed,
    }));
  };

  const handleSaveProfile = (updated: LearnerProfile) => {
    setProfile(updated);
    showToast(`Profile updated for ${updated.name}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenProfile={() => setIsOnboardingOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'missions' && (
          <MissionHub
            profile={profile}
            setActiveTab={setActiveTab}
            onOpenProfile={() => setIsOnboardingOpen(true)}
          />
        )}

        {activeTab === 'assembly' && (
          <AssemblySimulator
            onAwardXp={handleAwardXp}
            onUnlockBadge={handleUnlockBadge}
          />
        )}

        {activeTab === 'cables' && (
          <CableLab
            onAwardXp={handleAwardXp}
            onUnlockBadge={handleUnlockBadge}
          />
        )}

        {activeTab === 'io_devices' && (
          <IODeviceGame
            onAwardXp={handleAwardXp}
            onUnlockBadge={handleUnlockBadge}
          />
        )}

        {activeTab === 'quiz' && (
          <AssessmentQuiz
            onCompleteExam={handleCompleteExam}
            onAwardXp={handleAwardXp}
            onUnlockBadge={handleUnlockBadge}
          />
        )}

        {activeTab === 'certificate' && (
          <BadgesAndCertificate profile={profile} badges={badges} />
        )}
      </main>

      {/* Minimal clean footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            RigCraft · Interactive Computer Hardware, Assembly & Cabling Simulation
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Student: {profile.name}</span>
            <span>·</span>
            <span>{profile.title}</span>
            <span>·</span>
            <span>{profile.xp} Total XP</span>
          </div>
        </div>
      </footer>

      {/* Onboarding / Profile Dossier Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          setIsFirstLaunch(false);
        }}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        isInitial={isFirstLaunch}
      />

      {/* Ephemeral Toast Notification for XP & Badges */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-3 rounded-xl bg-slate-900 border border-cyan-400/80 text-white shadow-2xl flex items-center gap-3 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastNotification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
