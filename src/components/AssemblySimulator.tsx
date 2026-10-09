import React, { useState } from 'react';
import { HardwarePart } from '../types/game';
import { INITIAL_PARTS } from '../data/hardwareData';
import { HardwareVisuals } from './HardwareVisuals';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Power,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AssemblySimulatorProps {
  onAwardXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const AssemblySimulator: React.FC<AssemblySimulatorProps> = ({
  onAwardXp,
  onUnlockBadge,
}) => {
  const [mode, setMode] = useState<'assemble' | 'disassemble'>('assemble');
  const [parts, setParts] = useState<HardwarePart[]>(INITIAL_PARTS);
  const [selectedPartId, setSelectedPartId] = useState<string>('motherboard');
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const [thermalStep, setThermalStep] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Check assembly completion
  const allInstalled = parts.every(p => p.installed);
  const allDisassembled = parts.every(p => !p.installed);

  // Current active step to install (lowest stepOrder not installed)
  const nextToInstall = parts
    .filter(p => !p.installed)
    .sort((a, b) => a.stepOrder - b.stepOrder)[0];

  // Teardown step: highest stepOrder currently installed
  const nextToTeardown = parts
    .filter(p => p.installed)
    .sort((a, b) => b.stepOrder - a.stepOrder)[0];

  const handleSelectMode = (newMode: 'assemble' | 'disassemble') => {
    sounds.playClick();
    setMode(newMode);
    setIsPoweredOn(false);
    setPostStatus(null);
    setAlertMessage(null);
    if (newMode === 'disassemble') {
      // Pre-install all parts for teardown challenge
      setParts(
        INITIAL_PARTS.map(p => ({
          ...p,
          installed: true,
          thermalApplied: true,
          screwedDown: true,
          latched: true,
        }))
      );
      setSelectedPartId('gpu');
    } else {
      // Fresh chassis for assembly
      setParts(INITIAL_PARTS);
      setSelectedPartId('motherboard');
    }
  };

  const handleInstallPart = (partId: string) => {
    const target = parts.find(p => p.id === partId);
    if (!target) return;

    // Check prerequisites
    if (nextToInstall && target.stepOrder > nextToInstall.stepOrder) {
      sounds.playError();
      setAlertMessage(
        `Installation Sequence Warning: You should install the ${nextToInstall.name} first before mounting the ${target.name}!`
      );
      return;
    }

    setAlertMessage(null);

    // Audio by component type
    if (partId === 'ram') {
      sounds.playRamSnap();
    } else if (partId === 'cooler' || partId === 'motherboard' || partId === 'gpu') {
      sounds.playScrew();
    } else if (partId === 'thermal_paste') {
      sounds.playClick(440, 0.1);
    } else {
      sounds.playClick();
    }

    setParts(prev =>
      prev.map(p => {
        if (p.id === partId) {
          return {
            ...p,
            installed: true,
            screwedDown: true,
            latched: true,
            thermalApplied: partId === 'thermal_paste' ? true : p.thermalApplied,
          };
        }
        return p;
      })
    );

    onAwardXp(50, `Installed ${target.name}`);

    // If installed thermal paste, set thermal state
    if (partId === 'thermal_paste') {
      setThermalStep(true);
    }

    // Auto-select next part
    const remaining = parts.filter(p => !p.installed && p.id !== partId);
    if (remaining.length > 0) {
      const nextOne = remaining.sort((a, b) => a.stepOrder - b.stepOrder)[0];
      setSelectedPartId(nextOne.id);
    }
  };

  const handleTeardownPart = (partId: string) => {
    const target = parts.find(p => p.id === partId);
    if (!target || !target.installed) return;

    if (isPoweredOn) {
      sounds.playError();
      setAlertMessage('SAFETY HAZARD! Never remove computer hardware while power is active! Shut down first.');
      return;
    }

    // Teardown order: reverse of assembly
    if (nextToTeardown && target.stepOrder < nextToTeardown.stepOrder) {
      sounds.playError();
      setAlertMessage(
        `Disassembly Sequence Warning: Safely remove the ${nextToTeardown.name} first before accessing the ${target.name}.`
      );
      return;
    }

    setAlertMessage(null);
    sounds.playScrew();

    setParts(prev =>
      prev.map(p => (p.id === partId ? { ...p, installed: false, thermalApplied: false } : p))
    );

    onAwardXp(50, `Safely removed ${target.name}`);

    // Check if full teardown achieved
    const stillInstalled = parts.filter(p => p.installed && p.id !== partId);
    if (stillInstalled.length === 0) {
      sounds.playSuccess();
      confetti({ particleCount: 70, spread: 60 });
      onUnlockBadge('badge_teardown_pro');
      onAwardXp(250, 'Mastered Complete PC Teardown!');
    }
  };

  const handlePowerTest = () => {
    if (isPoweredOn) {
      sounds.playClick(300, 0.1);
      setIsPoweredOn(false);
      setPostStatus('System powered down.');
      return;
    }

    // Check requirements for boot
    const missing: string[] = [];
    if (!parts.find(p => p.id === 'motherboard')?.installed) missing.push('Motherboard');
    if (!parts.find(p => p.id === 'cpu')?.installed) missing.push('CPU Processor');
    if (!parts.find(p => p.id === 'ram')?.installed) missing.push('System RAM (Memory)');
    if (!parts.find(p => p.id === 'psu')?.installed) missing.push('Power Supply Unit (PSU)');
    if (!parts.find(p => p.id === 'cooler')?.installed) missing.push('CPU Cooler');

    if (missing.length > 0) {
      sounds.playError();
      setPostStatus(`POST FAILED: Hardware missing: ${missing.join(', ')}. Check diagnostic LED indicators.`);
      return;
    }

    // Success boot!
    sounds.playPostBeep();
    setIsPoweredOn(true);
    setPostStatus(
      'POST 200 OK: RigCraft BIOS Initialized! 16-Core CPU @ 5.4GHz | 32GB DDR5 Dual-Channel | NVMe Gen4 Storage Ready | Discrete GPU Operational.'
    );

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onAwardXp(300, 'Successful First POST Boot Cycle!');
    onUnlockBadge('badge_master_builder');
  };

  const selectedPart = parts.find(p => p.id === selectedPartId) || parts[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Wrench className="w-4 h-4" />
            <span>Interactive Hardware Workshop</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {mode === 'assemble' ? 'PC Assembly Simulator' : 'Safe Teardown & Disassembly'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'assemble'
              ? 'Mount each component in precise engineering order, apply thermal paste, and initiate POST boot test.'
              : 'Safely remove each hardware component in reverse sequence adhering to electrical discharge protocols.'}
          </p>
        </div>

        {/* Functional Segmented Button for Mode */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => handleSelectMode('assemble')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'assemble'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Assembly Mode
          </button>
          <button
            onClick={() => handleSelectMode('disassemble')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'disassemble'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teardown Mode
          </button>
        </div>
      </div>

      {/* Safety / Alert Banner if any */}
      {alertMessage && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Main 2-Zone Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Live Visual PC Case & Motherboard Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <HardwareVisuals
            parts={parts}
            isPoweredOn={isPoweredOn}
            activePartId={selectedPartId}
            onPartClick={id => {
              sounds.playClick();
              setSelectedPartId(id);
            }}
            mode={mode}
          />

          {/* Power Control & Live POST Display */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handlePowerTest}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isPoweredOn
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={isPoweredOn ? 'Turn Power Off' : 'Power On Rig (POST Test)'}
              >
                <Power className="w-5 h-5" />
              </button>
              <div>
                <div className="text-xs font-semibold text-white">Chassis Power Switch</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {isPoweredOn ? 'STATUS: SYSTEM ONLINE' : 'STATUS: STANDBY'}
                </div>
              </div>
            </div>

            {/* Diagnostic Message */}
            <div className="flex-1 w-full text-xs font-mono p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              {postStatus || 'Standby: Install all parts and click Power Button to test.'}
            </div>
          </div>
        </div>

        {/* Right Zone: Step Sequence & Part Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Part Detail Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  Step {selectedPart.stepOrder} of {parts.length} · {selectedPart.shortCode}
                </div>
                <h3 className="text-lg font-bold text-white">{selectedPart.name}</h3>
              </div>
              <div
                className={`text-xs font-mono px-2 py-0.5 rounded ${
                  selectedPart.installed
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedPart.installed ? 'Installed' : 'Unmounted'}
              </div>
            </div>

            {/* Function description */}
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Role: </strong>
              {selectedPart.functionDesc}
            </div>

            {/* Hardware specifications */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
              <strong className="text-slate-200">Hardware Spec: </strong>
              {selectedPart.specs}
            </div>

            {/* Critical Caution Notice */}
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{selectedPart.caution}</span>
            </div>

            {/* Action button */}
            <div>
              {mode === 'assemble' ? (
                selectedPart.installed ? (
                  <div className="w-full py-2.5 px-4 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Component Successfully Mounted</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleInstallPart(selectedPart.id)}
                    className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                  >
                    <span>Mount {selectedPart.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )
              ) : selectedPart.installed ? (
                <button
                  onClick={() => handleTeardownPart(selectedPart.id)}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Safely Unmount & Remove</span>
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 text-xs font-mono flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span>Component Disassembled & Stored</span>
                </div>
              )}
            </div>
          </div>

          {/* Hardware Parts Sequence Tray */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{mode === 'assemble' ? 'Assembly Checklist' : 'Teardown Sequence'}</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {parts.filter(p => p.installed).length} / {parts.length} Mounted
              </span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {parts.map(p => {
                const isSelected = p.id === selectedPartId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedPartId(p.id);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-[11px] text-slate-500 w-5">
                        #{p.stepOrder}
                      </span>
                      <span className="font-medium truncate">{p.name}</span>
                    </div>

                    <div className="shrink-0">
                      {p.installed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
