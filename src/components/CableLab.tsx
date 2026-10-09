import React, { useState } from 'react';
import { CableSlot } from '../types/game';
import { INITIAL_CABLES } from '../data/hardwareData';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Plug,
  Monitor,
  Cpu,
  Power,
  ShieldAlert,
} from 'lucide-react';

interface CableLabProps {
  onAwardXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const CableLab: React.FC<CableLabProps> = ({ onAwardXp, onUnlockBadge }) => {
  const [cables, setCables] = useState<CableSlot[]>(INITIAL_CABLES);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'external' | 'internal'>('all');
  const [warningTrapMessage, setWarningTrapMessage] = useState<string | null>(null);
  const [powerSwitchOn, setPowerSwitchOn] = useState<boolean>(false);

  const selectedCable = cables.find(c => c.id === selectedCableId);
  const pluggedCount = cables.filter(c => c.connected).length;
  const totalRequired = cables.filter(c => c.requiredForBoot).length;
  const pluggedRequired = cables.filter(c => c.requiredForBoot && c.connected).length;

  const handleSelectCable = (id: string) => {
    sounds.playClick();
    setSelectedCableId(id === selectedCableId ? null : id);
    setWarningTrapMessage(null);
  };

  const handleSocketClick = (socketId: string) => {
    // If learner clicked on Motherboard HDMI when GPU is present
    if (socketId === 'socket_mobo_hdmi_trap') {
      sounds.playError();
      setWarningTrapMessage(
        'CLASSIC BEGINNER PITFALL! A dedicated GPU is present! Plugging your monitor into the motherboard bypasses your RTX graphics card. Plug directly into the GPU ports at the bottom bracket.'
      );
      return;
    }

    if (!selectedCableId) {
      // Check if a cable is already connected to this socket, if so allow unplugging!
      const connectedCable = cables.find(c => c.pluggedSocketId === socketId);
      if (connectedCable) {
        sounds.playCableUnplug();
        setCables(prev =>
          prev.map(c =>
            c.id === connectedCable.id ? { ...c, connected: false, pluggedSocketId: undefined } : c
          )
        );
        onAwardXp(15, `Unplugged ${connectedCable.name}`);
      }
      return;
    }

    const cable = cables.find(c => c.id === selectedCableId);
    if (!cable) return;

    if (cable.correctSocketId === socketId) {
      sounds.playCablePlug();
      setWarningTrapMessage(null);

      const nextCables = cables.map(c =>
        c.id === cable.id ? { ...c, connected: true, pluggedSocketId: socketId } : c
      );
      setCables(nextCables);
      setSelectedCableId(null);
      onAwardXp(60, `Correctly wired ${cable.name}`);

      // Check if all wired
      const allDone = nextCables.filter(c => c.requiredForBoot).every(c => c.connected);
      if (allDone) {
        sounds.playSuccess();
        confetti({ particleCount: 70, spread: 60 });
        onUnlockBadge('badge_cable_wizard');
        onAwardXp(300, 'Mastered All Critical Cable Connections!');
      }
    } else {
      sounds.playError();
      setWarningTrapMessage(
        `Socket Mismatch! ${cable.name} requires ${cable.socketLocation}, not this port.`
      );
    }
  };

  const handleResetCables = () => {
    sounds.playClick();
    setCables(INITIAL_CABLES);
    setSelectedCableId(null);
    setWarningTrapMessage(null);
    setPowerSwitchOn(false);
  };

  const filteredCables =
    categoryFilter === 'all' ? cables : cables.filter(c => c.type === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Zap className="w-4 h-4" />
            <span>Interactive Cabling Laboratory</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            I/O Ports & Internal Wire Management
          </h1>
          <p className="text-xs text-slate-400">
            Plug each cable into its authentic physical connector. Beware the common GPU vs Motherboard display trap!
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setCategoryFilter('all');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Cables
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setCategoryFilter('external');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'external'
                ? 'bg-white text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rear I/O Panel
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setCategoryFilter('internal');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'internal'
                ? 'bg-white text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Internal Headers
          </button>
        </div>
      </div>

      {/* Warning / Beginner Trap Notification */}
      {warningTrapMessage && (
        <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{warningTrapMessage}</span>
        </div>
      )}

      {/* Main Grid: Left is Cable Drawer, Right is Realistic I/O & Internal Sockets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cable Selection Tray */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Cable Harness Tray
              </span>
              <button
                onClick={handleResetCables}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {selectedCableId
                ? 'Cable selected! Now click the matching socket on the right to plug it in.'
                : 'Click any cable below to pick it up, or click a plugged socket on the right to unplug it.'}
            </p>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredCables.map(cable => {
                const isSelected = cable.id === selectedCableId;
                return (
                  <button
                    key={cable.id}
                    onClick={() => handleSelectCable(cable.id)}
                    className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                        : cable.connected
                        ? 'bg-slate-950/80 border-emerald-800/80 text-emerald-300 hover:border-emerald-700'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{cable.name}</span>
                        {cable.requiredForBoot && (
                          <span className="text-[10px] font-mono text-cyan-400 uppercase">
                            · Required
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cable.deviceLabel}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Connector: {cable.connectorType}
                      </div>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {cable.connected ? (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Plugged</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-500">
                          {isSelected ? 'Active' : 'Pick Up'}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sockets Workspace (Rear Panel + Internal Headers) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Section 1: PC Rear I/O Panel (Motherboard + GPU + PSU) */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  Rear I/O Panel View
                </h3>
                <p className="text-[11px] text-slate-400">
                  Motherboard ports (top) vs Dedicated GPU ports (bottom) vs PSU power inlet.
                </p>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Boot Critical: {pluggedRequired} / {totalRequired}
              </div>
            </div>

            {/* Simulated PC Backplate Chassis Metal Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-4">
              {/* Zone A: Motherboard I/O Shield */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Motherboard Rear I/O Shield (Integrated Ports)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Upper Bracket</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Trap Socket: Motherboard Integrated Video */}
                  <button
                    onClick={() => handleSocketClick('socket_mobo_hdmi_trap')}
                    className="p-2.5 rounded-lg border text-center transition-all bg-rose-950/20 border-rose-900/60 hover:border-rose-500 text-rose-300"
                    title="Warning: Integrated HDMI port on motherboard"
                  >
                    <div className="text-[11px] font-bold">Mobo HDMI</div>
                    <div className="text-[9px] font-mono text-rose-400">⚠️ Integrated Trap</div>
                  </button>

                  {/* Mobo USB 3.2 Ports */}
                  <button
                    onClick={() => handleSocketClick('socket_mobo_usb')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      cables.find(c => c.correctSocketId === 'socket_mobo_usb')?.connected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">USB 3.2 Ports</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {cables.find(c => c.correctSocketId === 'socket_mobo_usb')?.connected
                        ? 'KB/Mouse OK'
                        : 'Blue Type-A'}
                    </div>
                  </button>

                  {/* 2.5G LAN Ethernet */}
                  <button
                    onClick={() => handleSocketClick('socket_mobo_lan')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      cables.find(c => c.correctSocketId === 'socket_mobo_lan')?.connected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">RJ45 LAN</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {cables.find(c => c.correctSocketId === 'socket_mobo_lan')?.connected
                        ? 'Connected'
                        : 'Gigabit Port'}
                    </div>
                  </button>

                  {/* 3.5mm Audio Jacks */}
                  <button
                    onClick={() => handleSocketClick('socket_mobo_audio')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      cables.find(c => c.correctSocketId === 'socket_mobo_audio')?.connected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Audio Out</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {cables.find(c => c.correctSocketId === 'socket_mobo_audio')?.connected
                        ? 'Headset OK'
                        : '3.5mm Jack'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Zone B: Discrete Graphics Card (GPU) Bracket */}
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/60">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Dedicated Graphics Card Bracket (RTX GPU)</span>
                  <span className="text-[10px] text-cyan-300 font-bold">Primary Video Out</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* GPU HDMI 2.1 */}
                  <button
                    onClick={() => handleSocketClick('socket_gpu_hdmi')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      cables.find(c => c.correctSocketId === 'socket_gpu_hdmi')?.connected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">GPU HDMI 2.1</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {cables.find(c => c.correctSocketId === 'socket_gpu_hdmi')?.connected
                        ? 'Display 1 OK'
                        : 'Primary Monitor'}
                    </div>
                  </button>

                  {/* GPU DisplayPort 1.4a */}
                  <button
                    onClick={() => handleSocketClick('socket_gpu_dp')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      cables.find(c => c.correctSocketId === 'socket_gpu_dp')?.connected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">GPU DP #1</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {cables.find(c => c.correctSocketId === 'socket_gpu_dp')?.connected
                        ? '240Hz DP OK'
                        : 'DisplayPort'}
                    </div>
                  </button>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-center opacity-50">
                    <div className="text-[11px] text-slate-500 font-bold">GPU DP #2</div>
                    <div className="text-[9px] font-mono text-slate-600">Auxiliary</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-center opacity-50">
                    <div className="text-[11px] text-slate-500 font-bold">GPU DP #3</div>
                    <div className="text-[9px] font-mono text-slate-600">Auxiliary</div>
                  </div>
                </div>
              </div>

              {/* Zone C: Power Supply AC Inlet (Bottom) */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">PSU AC Inlet & Rocker Switch</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    100V-240V 50/60Hz Mains Grounded Socket
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSocketClick('socket_psu_ac')}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      cables.find(c => c.correctSocketId === 'socket_psu_ac')?.connected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                    }`}
                  >
                    {cables.find(c => c.correctSocketId === 'socket_psu_ac')?.connected
                      ? 'IEC C13 Cord Plugged'
                      : 'Plug Main AC Cord'}
                  </button>

                  {/* Rocker Switch */}
                  <button
                    onClick={() => {
                      sounds.playClick(200, 0.08);
                      setPowerSwitchOn(!powerSwitchOn);
                    }}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                      powerSwitchOn
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {powerSwitchOn ? 'I (ON)' : 'O (OFF)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Chassis Internal Wiring Headers */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Internal Power & Control Headers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 24-Pin ATX Socket */}
              <button
                onClick={() => handleSocketClick('socket_int_atx24')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  cables.find(c => c.correctSocketId === 'socket_int_atx24')?.connected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>24-Pin ATX Power Header</span>
                  {cables.find(c => c.correctSocketId === 'socket_int_atx24')?.connected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Main Motherboard Logic & Bus Rail
                </div>
              </button>

              {/* 8-Pin CPU EPS Socket */}
              <button
                onClick={() => handleSocketClick('socket_int_cpu8')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  cables.find(c => c.correctSocketId === 'socket_int_cpu8')?.connected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>8-Pin CPU EPS Header</span>
                  {cables.find(c => c.correctSocketId === 'socket_int_cpu8')?.connected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Top-Left Motherboard CPU VRM Supply
                </div>
              </button>

              {/* 8-Pin PCIe GPU Socket */}
              <button
                onClick={() => handleSocketClick('socket_int_gpu_pcie')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  cables.find(c => c.correctSocketId === 'socket_int_gpu_pcie')?.connected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>8-Pin PCIe GPU Header</span>
                  {cables.find(c => c.correctSocketId === 'socket_int_gpu_pcie')?.connected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Top Edge of RTX Graphics Card
                </div>
              </button>

              {/* Front Panel Power Switch Jumper */}
              <button
                onClick={() => handleSocketClick('socket_int_fpanel')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  cables.find(c => c.correctSocketId === 'socket_int_fpanel')?.connected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Front Panel PWR_SW Header</span>
                  {cables.find(c => c.correctSocketId === 'socket_int_fpanel')?.connected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Connects Chassis Push-button to PS_ON
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
