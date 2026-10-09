import React from 'react';
import { HardwarePart } from '../types/game';

interface HardwareVisualsProps {
  parts: HardwarePart[];
  isPoweredOn: boolean;
  activePartId?: string;
  onPartClick?: (partId: string) => void;
  mode?: 'assemble' | 'disassemble';
}

export const HardwareVisuals: React.FC<HardwareVisualsProps> = ({
  parts,
  isPoweredOn,
  activePartId,
  onPartClick,
}) => {
  const isInstalled = (id: string) => parts.find(p => p.id === id)?.installed ?? false;
  const isThermalApplied = parts.find(p => p.id === 'thermal_paste')?.thermalApplied ?? false;

  return (
    <div className="relative w-full aspect-4/3 max-h-[520px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 flex items-center justify-center select-none">
      {/* Background blueprint grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, #0f172a 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* PC Chassis Frame */}
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full max-h-[500px] object-contain drop-shadow-xl"
      >
        <defs>
          <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0b0f19" />
          </linearGradient>
          <linearGradient id="moboGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="gpuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="rgbFanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isPoweredOn ? "#06b6d4" : "#475569"} />
            <stop offset="50%" stopColor={isPoweredOn ? "#a855f7" : "#334155"} />
            <stop offset="100%" stopColor={isPoweredOn ? "#ec4899" : "#1e293b"} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Chassis Outer Shell */}
        <rect
          x="30"
          y="20"
          width="740"
          height="560"
          rx="12"
          fill="url(#chassisGrad)"
          stroke="#475569"
          strokeWidth="3"
        />

        {/* Chassis Standoff / Motherboard Bay */}
        <rect
          x="140"
          y="40"
          width="500"
          height="430"
          rx="6"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* PSU Shroud Chamber (Bottom) */}
        <rect
          x="40"
          y="480"
          width="720"
          height="90"
          rx="6"
          fill="#111827"
          stroke="#374151"
          strokeWidth="2"
        />
        <text x="60" y="525" fill="#64748b" fontSize="11" fontFamily="Space Mono, monospace" letterSpacing="2">
          PSU CHAMBER // ISOLATED THERMAL ZONE
        </text>

        {/* Standoff Brass Screws when Motherboard is not yet installed */}
        {!isInstalled('motherboard') && (
          <g>
            {[
              [160, 60], [390, 60], [620, 60],
              [160, 250], [390, 250], [620, 250],
              [160, 440], [390, 440], [620, 440],
            ].map(([sx, sy], i) => (
              <g key={i}>
                <circle cx={sx} cy={sy} r="6" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
                <circle cx={sx} cy={sy} r="2" fill="#713f12" />
              </g>
            ))}
            <text x="320" y="240" fill="#64748b" fontSize="13" fontFamily="Space Mono, monospace" textAnchor="middle">
              WAITING FOR MOTHERBOARD MOUNT
            </text>
          </g>
        )}

        {/* Motherboard PCB */}
        {isInstalled('motherboard') && (
          <g
            className="cursor-pointer transition-all"
            onClick={() => onPartClick?.('motherboard')}
          >
            <rect
              x="150"
              y="50"
              width="480"
              height="410"
              rx="6"
              fill="url(#moboGrad)"
              stroke={activePartId === 'motherboard' ? '#38bdf8' : '#047857'}
              strokeWidth="2"
            />
            {/* Printed circuit traces */}
            <path
              d="M170 120 H280 V180 H350 M170 300 H230 V350 H400 M450 70 V150 H520 M200 420 V380 H320"
              stroke="#059669"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            {/* Rear I/O Shield Metal Block */}
            <rect x="150" y="50" width="40" height="180" fill="#475569" stroke="#64748b" />
            <text x="162" y="145" fill="#cbd5e1" fontSize="9" transform="rotate(-90 162 145)" fontFamily="Space Mono">
              REAR I/O PORTS
            </text>

            {/* Motherboard VRM Heatsinks */}
            <rect x="200" y="60" width="130" height="30" fill="#1e293b" stroke="#334155" rx="2" />
            <rect x="195" y="95" width="30" height="120" fill="#1e293b" stroke="#334155" rx="2" />
            <text x="210" y="80" fill="#94a3b8" fontSize="8" fontFamily="Space Mono">VRM THERMAL ARMOR</text>

            {/* CPU Socket Area */}
            <rect
              x="250"
              y="110"
              width="110"
              height="110"
              rx="4"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeDasharray="4 2"
              strokeWidth="1.5"
            />

            {/* CPU Socket Golden Alignment Indicator */}
            <polygon points="252,112 264,112 252,124" fill="#eab308" />

            {!isInstalled('cpu') && (
              <text x="305" y="170" fill="#38bdf8" fontSize="10" fontFamily="Space Mono" textAnchor="middle">
                LGA SOCKET
              </text>
            )}

            {/* RAM DIMM Slots (4 Channels) */}
            {[0, 1, 2, 3].map(slotIdx => {
              const xPos = 390 + slotIdx * 20;
              const isChannelUsed = slotIdx === 1 || slotIdx === 3;
              return (
                <g key={slotIdx}>
                  <rect
                    x={xPos}
                    y="95"
                    width="12"
                    height="145"
                    rx="2"
                    fill={isChannelUsed ? '#1e293b' : '#0f172a'}
                    stroke="#334155"
                  />
                  {/* Notch in DIMM slot */}
                  <rect x={xPos} y="165" width="12" height="4" fill="#022c22" />
                </g>
              );
            })}
            <text x="425" y="85" fill="#94a3b8" fontSize="9" fontFamily="Space Mono" textAnchor="middle">
              DDR5 SLOTS (2 & 4)
            </text>

            {/* M.2 NVMe Slot (Between CPU and PCIe) */}
            <rect x="250" y="235" width="130" height="24" rx="2" fill="#1e293b" stroke="#334155" />
            <circle cx="370" cy="247" r="3" fill="#ca8a04" />
            {!isInstalled('storage') && (
              <text x="310" y="251" fill="#64748b" fontSize="8" fontFamily="Space Mono" textAnchor="middle">
                M.2 NVMe GEN 4
              </text>
            )}

            {/* Primary PCIe x16 Slot (Reinforced Steel) */}
            <rect
              x="210"
              y="275"
              width="240"
              height="16"
              rx="2"
              fill="#1e293b"
              stroke={isInstalled('gpu') ? '#0284c7' : '#94a3b8'}
              strokeWidth="1.5"
            />
            {/* PCIe Retention Latch */}
            <rect x="445" y="271" width="12" height="24" rx="2" fill={isInstalled('gpu') ? '#10b981' : '#64748b'} />
            <text x="220" y="287" fill="#cbd5e1" fontSize="8" fontFamily="Space Mono">PCIe 5.0 x16</text>

            {/* Secondary PCIe x4 Slot */}
            <rect x="210" y="360" width="160" height="12" rx="2" fill="#0f172a" stroke="#334155" />

            {/* 24-Pin ATX Power Header (Right Edge) */}
            <rect x="605" y="160" width="18" height="85" rx="2" fill="#0f172a" stroke="#eab308" />
            <text x="614" y="205" fill="#eab308" fontSize="7" transform="rotate(90 614 205)" fontFamily="Space Mono">24-PIN ATX</text>

            {/* Front Panel Header (Bottom Right) */}
            <rect x="580" y="430" width="35" height="15" rx="1" fill="#1e293b" stroke="#64748b" />
            <text x="597" y="441" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="Space Mono">F_PANEL</text>
          </g>
        )}

        {/* CPU Chip */}
        {isInstalled('cpu') && (
          <g
            className="cursor-pointer"
            onClick={() => onPartClick?.('cpu')}
          >
            <rect
              x="255"
              y="115"
              width="100"
              height="100"
              rx="3"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* Integrated Heat Spreader (IHS) Metal Lid */}
            <rect
              x="262"
              y="122"
              width="86"
              height="86"
              rx="2"
              fill="#94a3b8"
              stroke="#cbd5e1"
            />
            {/* Golden Alignment Corner */}
            <polygon points="255,115 267,115 255,127" fill="#eab308" />
            <text x="305" y="155" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="Space Mono" textAnchor="middle">
              16-CORE CPU
            </text>
            <text x="305" y="172" fill="#334155" fontSize="8" fontFamily="Space Mono" textAnchor="middle">
              5.4 GHz UNLOCKED
            </text>
            <text x="305" y="192" fill="#0f172a" fontSize="7" fontFamily="Space Mono" textAnchor="middle">
              SOCKET AM5 / LGA
            </text>

            {/* Thermal Paste Applied Indicator */}
            {isThermalApplied && !isInstalled('cooler') && (
              <g filter="url(#glow)">
                <circle cx="305" cy="165" r="14" fill="#a1a1aa" opacity="0.9" />
                <circle cx="305" cy="165" r="10" fill="#71717a" />
                <circle cx="300" cy="160" r="3" fill="#e4e4e7" opacity="0.8" />
                <text x="305" y="200" fill="#a1a1aa" fontSize="8" fontFamily="Space Mono" textAnchor="middle">
                  THERMAL COMPOUND APPLIED
                </text>
              </g>
            )}
          </g>
        )}

        {/* CPU Cooler (Direct Contact Tower Cooler with Fan) */}
        {isInstalled('cooler') && (
          <g
            className="cursor-pointer"
            onClick={() => onPartClick?.('cooler')}
          >
            {/* Aluminium Fin Stack */}
            <rect
              x="240"
              y="100"
              width="130"
              height="130"
              rx="6"
              fill="#1e293b"
              stroke={activePartId === 'cooler' ? '#38bdf8' : '#475569'}
              strokeWidth="2"
            />
            {/* Heatsink fin lines */}
            {[0, 1, 2, 3, 4, 5, 6].map(fin => (
              <line
                key={fin}
                x1="245"
                y1={115 + fin * 15}
                x2="365"
                y2={115 + fin * 15}
                stroke="#334155"
                strokeWidth="2"
              />
            ))}
            {/* 4 Copper Heatpipe Caps */}
            <circle cx="260" cy="110" r="4" fill="#ea580c" />
            <circle cx="280" cy="110" r="4" fill="#ea580c" />
            <circle cx="330" cy="110" r="4" fill="#ea580c" />
            <circle cx="350" cy="110" r="4" fill="#ea580c" />

            {/* Cooler Fan with RGB Ring */}
            <circle
              cx="305"
              cy="165"
              r="45"
              fill="#0f172a"
              stroke="url(#rgbFanGrad)"
              strokeWidth={isPoweredOn ? "4" : "2"}
              filter={isPoweredOn ? "url(#glow)" : undefined}
            />
            {/* Spinning fan blades */}
            <g
              transform="translate(305, 165)"
              className={isPoweredOn ? "animate-spin origin-center" : ""}
              style={{ animationDuration: '0.8s' }}
            >
              {[0, 60, 120, 180, 240, 300].map(angle => (
                <path
                  key={angle}
                  d="M0 0 L-6 -38 Q0 -42 6 -38 Z"
                  fill="#475569"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#38bdf8" />
              <text x="0" y="3" fill="#cbd5e1" fontSize="7" textAnchor="middle" fontFamily="Space Mono">PWM</text>
            </g>
          </g>
        )}

        {/* RAM Modules (Dual-Channel Sticks in Slots 2 and 4) */}
        {isInstalled('ram') && (
          <g
            className="cursor-pointer"
            onClick={() => onPartClick?.('ram')}
          >
            {[1, 3].map(slot => {
              const xPos = 390 + slot * 20;
              return (
                <g key={slot}>
                  <rect
                    x={xPos - 1}
                    y="92"
                    width="14"
                    height="150"
                    rx="2"
                    fill="#1e1b4b"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                  />
                  {/* Heat Spreader Ribs */}
                  <rect x={xPos + 1} y="110" width="10" height="40" fill="#312e81" rx="1" />
                  <rect x={xPos + 1} y="160" width="10" height="40" fill="#312e81" rx="1" />
                  {/* RGB Top Diffuser Light Bar */}
                  <rect
                    x={xPos}
                    y="93"
                    width="12"
                    height="8"
                    rx="1"
                    fill={isPoweredOn ? "#38bdf8" : "#94a3b8"}
                    filter={isPoweredOn ? "url(#glow)" : undefined}
                  />
                  {/* Retention clips locked down */}
                  <polygon points={`${xPos - 2},92 ${xPos + 14},92 ${xPos + 6},87`} fill="#10b981" />
                  <polygon points={`${xPos - 2},242 ${xPos + 14},242 ${xPos + 6},247`} fill="#10b981" />
                </g>
              );
            })}
            <text x="420" y="260" fill="#818cf8" fontSize="8" fontFamily="Space Mono" textAnchor="middle">
              32GB DDR5 CL30 (LOCKED)
            </text>
          </g>
        )}

        {/* M.2 NVMe SSD with Heatsink */}
        {isInstalled('storage') && (
          <g
            className="cursor-pointer"
            onClick={() => onPartClick?.('storage')}
          >
            <rect
              x="250"
              y="235"
              width="125"
              height="22"
              rx="2"
              fill="#18181b"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            {/* Heatshield texture */}
            <rect x="255" y="238" width="100" height="16" fill="#27272a" rx="1" />
            <circle cx="368" cy="246" r="3" fill="#ca8a04" stroke="#facc15" />
            <text x="300" y="249" fill="#facc15" fontSize="8" fontWeight="bold" fontFamily="Space Mono" textAnchor="middle">
              1TB PCIe 4.0 NVMe
            </text>
          </g>
        )}

        {/* Dedicated GPU (Triple-Fan High Performance RTX) */}
        {isInstalled('gpu') && (
          <g
            className="cursor-pointer"
            onClick={() => onPartClick?.('gpu')}
          >
            {/* GPU Backplate & Shroud */}
            <rect
              x="190"
              y="280"
              width="430"
              height="115"
              rx="6"
              fill="url(#gpuGrad)"
              stroke={activePartId === 'gpu' ? '#38bdf8' : '#0284c7'}
              strokeWidth="2"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
            />

            {/* GPU Rear Bracket (Secured to chassis with screws) */}
            <rect x="180" y="275" width="14" height="80" fill="#475569" stroke="#94a3b8" />
            <circle cx="187" cy="285" r="3" fill="#ca8a04" />
            <circle cx="187" cy="335" r="3" fill="#ca8a04" />

            {/* GPU Logo Banner with LED */}
            <rect x="210" y="286" width="120" height="18" rx="2" fill="#0f172a" />
            <text
              x="270"
              y="298"
              fill={isPoweredOn ? "#38bdf8" : "#94a3b8"}
              fontSize="9"
              fontWeight="bold"
              fontFamily="Space Mono"
              textAnchor="middle"
              filter={isPoweredOn ? "url(#glow)" : undefined}
            >
              GEFORCE RTX 16GB
            </text>

            {/* 3 Axial Cooling Fans */}
            {[260, 370, 480].map((fanX, fIdx) => (
              <g key={fIdx}>
                <circle
                  cx={fanX}
                  cy={345}
                  r="34"
                  fill="#0b0f19"
                  stroke={isPoweredOn ? "#06b6d4" : "#334155"}
                  strokeWidth="1.5"
                />
                <g
                  transform={`translate(${fanX}, 345)`}
                  className={isPoweredOn ? "animate-spin origin-center" : ""}
                  style={{ animationDuration: '0.6s' }}
                >
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                    <path
                      key={deg}
                      d="M0 0 L-4 -28 Q0 -32 4 -28 Z"
                      fill="#334155"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="10" fill="#1e293b" />
                </g>
              </g>
            ))}

            {/* Auxiliary 8-Pin PCIe Power Header (Top right) */}
            <rect x="560" y="278" width="40" height="12" rx="1" fill="#0f172a" stroke="#eab308" />
            <text x="580" y="287" fill="#eab308" fontSize="7" textAnchor="middle" fontFamily="Space Mono">8-PIN PCIe</text>
          </g>
        )}

        {/* Modular Power Supply Unit (PSU) */}
        {isInstalled('psu') && (
          <g
            className="cursor-pointer"
            onClick={() => onPartClick?.('psu')}
          >
            <rect
              x="50"
              y="490"
              width="240"
              height="72"
              rx="4"
              fill="#18181b"
              stroke={activePartId === 'psu' ? '#38bdf8' : '#eab308'}
              strokeWidth="2"
            />
            {/* PSU Label Badge */}
            <rect x="65" y="502" width="130" height="48" rx="2" fill="#27272a" />
            <text x="130" y="522" fill="#facc15" fontSize="11" fontWeight="bold" fontFamily="Space Mono" textAnchor="middle">
              750W 80+ GOLD
            </text>
            <text x="130" y="538" fill="#a1a1aa" fontSize="8" fontFamily="Space Mono" textAnchor="middle">
              MODULAR ACTIVE PFC
            </text>

            {/* Modular Cable Ports Block */}
            <rect x="240" y="500" width="40" height="52" rx="2" fill="#090d16" stroke="#3f3f46" />
            <circle cx="250" cy="512" r="3" fill="#eab308" />
            <circle cx="265" cy="512" r="3" fill="#eab308" />
            <circle cx="250" cy="528" r="3" fill="#06b6d4" />
            <circle cx="265" cy="528" r="3" fill="#06b6d4" />
            <circle cx="250" cy="542" r="3" fill="#3b82f6" />
            <circle cx="265" cy="542" r="3" fill="#3b82f6" />
          </g>
        )}

        {/* Case Intake Fans (Front Panel Right) */}
        <g>
          {[100, 240, 380].map((fanY, idx) => (
            <g key={idx}>
              <circle
                cx="710"
                cy={fanY}
                r="40"
                fill="#0f172a"
                stroke={isPoweredOn ? "#38bdf8" : "#334155"}
                strokeWidth={isPoweredOn ? "3" : "1.5"}
                filter={isPoweredOn ? "url(#glow)" : undefined}
              />
              <g
                transform={`translate(710, ${fanY})`}
                className={isPoweredOn ? "animate-spin origin-center" : ""}
                style={{ animationDuration: '0.9s' }}
              >
                {[0, 60, 120, 180, 240, 300].map(deg => (
                  <path
                    key={deg}
                    d="M0 0 L-4 -34 Q0 -38 4 -34 Z"
                    fill="#334155"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="10" fill="#1e293b" />
              </g>
            </g>
          ))}
          <text x="710" y="450" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="Space Mono">
            FRONT INTAKE (3x120mm)
          </text>
        </g>
      </svg>

      {/* Powered On HUD Indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isPoweredOn ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'
          }`}
        />
        <span className={isPoweredOn ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
          {isPoweredOn ? 'SYSTEM ACTIVE // POST 200 OK' : 'SYSTEM STANDBY (POWER OFF)'}
        </span>
      </div>
    </div>
  );
};
