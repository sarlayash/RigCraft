/**
 * Type definitions and data schemas for RigCraft Hardware Simulator
 */

export type TabMode = 'missions' | 'assembly' | 'cables' | 'io_devices' | 'quiz' | 'certificate';

export interface LearnerProfile {
  name: string;
  title: string;
  avatar: string;
  xp: number;
  level: number;
  completedMissions: string[];
  badges: string[];
  examScore: number | null;
  examPassed: boolean;
  createdAt: string;
}

export type ComponentCategory =
  | 'chassis'
  | 'motherboard'
  | 'cpu'
  | 'thermal_paste'
  | 'cooler'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'gpu';

export interface HardwarePart {
  id: string;
  name: string;
  shortCode: string;
  category: ComponentCategory;
  stepOrder: number;
  specs: string;
  functionDesc: string;
  caution: string;
  installed: boolean;
  thermalApplied?: boolean;
  screwedDown?: boolean;
  latched?: boolean;
}

export type CableCategory = 'internal' | 'external';

export interface CableSlot {
  id: string;
  name: string;
  type: CableCategory;
  connectorType: string;
  deviceLabel: string;
  socketLocation: string; // e.g. "GPU Output (Display)", "Motherboard Video (Disabled)", "PSU Main"
  isGpuTrap?: boolean; // True for Motherboard HDMI when GPU is present
  trapWarning?: string;
  requiredForBoot: boolean;
  connected: boolean;
  correctSocketId: string;
  pluggedSocketId?: string;
  explanation: string;
}

export type IODeviceType = 'input' | 'output' | 'hybrid' | 'processing_storage';

export interface IODeviceItem {
  id: string;
  name: string;
  category: IODeviceType;
  signalDirection: string;
  description: string;
  realWorldUse: string;
  interfacePort: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  unlocked: boolean;
}
